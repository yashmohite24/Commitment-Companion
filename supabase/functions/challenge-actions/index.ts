import {
  canApproveProof,
  canSubmitCheckIn,
  nextSequenceNumber,
  resolveProofIfComplete,
  validateApprovalDecision,
} from "../_shared/domain/check-in.ts";
import { activateChallengeIfReady } from "../_shared/domain/activate.ts";
import {
  validateCreateChallenge,
  shouldMarkChallengeSuccessful,
} from "../_shared/domain/challenge.ts";
import { todayInTimezone } from "../_shared/time.ts";
import type { Challenge, DailyCheckIn } from "../_shared/types.ts";
import { MAX_MEDIA_BYTES } from "../_shared/types.ts";
import {
  createServiceClient,
  corsPreflight,
  deleteStoragePaths,
  errorResponse,
  getUserIdFromRequest,
  jsonResponse,
  PROOF_BUCKET,
  WAGER_BUCKET,
} from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsPreflight();
  if (req.method !== "POST") return errorResponse("Method not allowed", 405);

  const userId = await getUserIdFromRequest(req);
  if (!userId) return errorResponse("Unauthorized", 401);

  let body: { action: string; payload?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON body");
  }

  const supabase = createServiceClient();

  try {
    switch (body.action) {
      case "create_challenge":
        return await handleCreateChallenge(supabase, userId, body.payload ?? {});
      case "respond_companion_request":
        return await handleRespondCompanionRequest(supabase, userId, body.payload ?? {});
      case "prepare_check_in_upload":
        return await handlePrepareCheckInUpload(supabase, userId, body.payload ?? {});
      case "submit_check_in":
        return await handleSubmitCheckIn(supabase, userId, body.payload ?? {});
      case "approve_proof":
        return await handleApproveProof(supabase, userId, body.payload ?? {});
      case "leave_challenge":
        return await handleLeaveChallenge(supabase, userId, body.payload ?? {});
      case "prepare_wager_upload":
        return await handlePrepareWagerUpload(supabase, userId, body.payload ?? {});
      case "submit_wager_settlement":
        return await handleSubmitWagerSettlement(supabase, userId, body.payload ?? {});
      case "approve_wager_settlement":
        return await handleApproveWagerSettlement(supabase, userId, body.payload ?? {});
      default:
        return errorResponse(`Unknown action: ${body.action}`);
    }
  } catch (e) {
    console.error(e);
    return errorResponse(e instanceof Error ? e.message : "Internal error", 500);
  }
});

async function handleCreateChallenge(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  payload: Record<string, unknown>,
) {
  const companionIds = (payload.companion_user_ids as string[]) ?? [];
  const { count } = await supabase
    .from("challenges")
    .select("id", { count: "exact", head: true })
    .eq("challenger_id", userId)
    .in("status", ["draft", "active", "failed"]);

  const { data: existing } = await supabase
    .from("challenges")
    .select("name")
    .eq("challenger_id", userId)
    .in("status", ["draft", "active", "failed"]);

  const validation = validateCreateChallenge({
    name: String(payload.name ?? ""),
    start_date: String(payload.start_date ?? ""),
    end_date: String(payload.end_date ?? ""),
    daily_deadline_time: String(payload.daily_deadline_time ?? "23:59:00"),
    timezone: String(payload.timezone ?? "UTC"),
    wager: String(payload.wager ?? ""),
    lives_total: Number(payload.lives_total ?? 0),
    companion_user_ids: companionIds,
    activeChallengeCount: count ?? 0,
    existingActiveNames: (existing ?? []).map((r) => r.name),
  });
  if (!validation.ok) return errorResponse(validation.error!);

  const { data: challenge, error } = await supabase
    .from("challenges")
    .insert({
      challenger_id: userId,
      name: payload.name,
      start_date: payload.start_date,
      end_date: payload.end_date,
      daily_deadline_time: payload.daily_deadline_time ?? "23:59:00",
      timezone: payload.timezone ?? "UTC",
      wager: payload.wager,
      lives_total: payload.lives_total ?? 0,
      status: "draft",
    })
    .select()
    .single();
  if (error) return errorResponse(error.message, 500);

  const requests = companionIds.map((cid) => ({
    challenge_id: challenge.id,
    companion_user_id: cid,
  }));
  const { error: reqErr } = await supabase.from("companion_requests").insert(requests);
  if (reqErr) return errorResponse(reqErr.message, 500);

  return jsonResponse({ challenge, companion_requests_created: companionIds.length });
}

async function handleRespondCompanionRequest(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  payload: Record<string, unknown>,
) {
  const requestId = String(payload.request_id ?? "");
  const decision = String(payload.decision ?? "");
  if (decision !== "accepted" && decision !== "rejected") {
    return errorResponse("decision must be accepted or rejected");
  }

  const { data: request } = await supabase
    .from("companion_requests")
    .select("*, challenges(*)")
    .eq("id", requestId)
    .eq("companion_user_id", userId)
    .eq("status", "pending")
    .single();
  if (!request) return errorResponse("Request not found", 404);

  await supabase
    .from("companion_requests")
    .update({ status: decision, responded_at: new Date().toISOString() })
    .eq("id", requestId);

  if (decision === "accepted") {
    await activateChallengeIfReady(supabase, request.challenge_id);
  }

  return jsonResponse({ ok: true, decision });
}

async function loadChallengeContext(
  supabase: ReturnType<typeof createServiceClient>,
  challengeId: string,
  checkInDate: string,
) {
  const { data: challenge } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", challengeId)
    .single();
  if (!challenge) return null;

  const { data: checkIn } = await supabase
    .from("daily_check_ins")
    .select("*")
    .eq("challenge_id", challengeId)
    .eq("check_in_date", checkInDate)
    .single();

  return { challenge: challenge as Challenge, checkIn: checkIn as DailyCheckIn | null };
}

async function handlePrepareCheckInUpload(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  payload: Record<string, unknown>,
) {
  const challengeId = String(payload.challenge_id ?? "");
  const checkInDate = String(payload.check_in_date ?? "");

  const ctx = await loadChallengeContext(supabase, challengeId, checkInDate);
  if (!ctx?.checkIn) return errorResponse("Check-in day not found", 404);
  if (ctx.challenge.challenger_id !== userId) {
    return errorResponse("Only challenger can submit check-in", 403);
  }

  const result = canSubmitCheckIn({
    challenge: ctx.challenge,
    checkIn: ctx.checkIn,
    now: new Date(),
  });
  if (!result.ok) return errorResponse(result.error!);

  const storagePath = `${challengeId}/${checkInDate}/${crypto.randomUUID()}`;
  const { data, error } = await supabase.storage
    .from(PROOF_BUCKET)
    .createSignedUploadUrl(storagePath);
  if (error) return errorResponse(error.message, 500);

  return jsonResponse({
    storage_path: storagePath,
    signed_upload_url: data.signedUrl,
    token: data.token,
    expires_in: 3600,
  });
}

async function handleSubmitCheckIn(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  payload: Record<string, unknown>,
) {
  const challengeId = String(payload.challenge_id ?? "");
  const checkInDate = String(payload.check_in_date ?? "");
  const storagePaths = (payload.storage_paths as string[]) ?? [];
  const mediaSize = Number(payload.media_size_bytes ?? 0);

  if (storagePaths.length === 0) return errorResponse("storage_paths required");
  if (mediaSize <= 0 || mediaSize > MAX_MEDIA_BYTES) {
    return errorResponse("media_size_bytes must be 1–20971520");
  }

  const ctx = await loadChallengeContext(supabase, challengeId, checkInDate);
  if (!ctx?.checkIn) return errorResponse("Check-in day not found", 404);
  if (ctx.challenge.challenger_id !== userId) {
    return errorResponse("Only challenger can submit check-in", 403);
  }

  const result = canSubmitCheckIn({
    challenge: ctx.challenge,
    checkIn: ctx.checkIn,
    now: new Date(),
  });
  if (!result.ok) return errorResponse(result.error!);

  const { count } = await supabase
    .from("proof_of_work")
    .select("id", { count: "exact", head: true })
    .eq("daily_check_in_id", ctx.checkIn.id);

  const { data: proof, error: proofErr } = await supabase
    .from("proof_of_work")
    .insert({
      daily_check_in_id: ctx.checkIn.id,
      challenger_id: userId,
      storage_paths: storagePaths,
      media_size_bytes: mediaSize,
      sequence_number: nextSequenceNumber(count ?? 0),
    })
    .select()
    .single();
  if (proofErr) return errorResponse(proofErr.message, 500);

  await supabase
    .from("daily_check_ins")
    .update({ status: "pending_validation" })
    .eq("id", ctx.checkIn.id);

  return jsonResponse({ proof, check_in_status: "pending_validation" });
}

async function getActiveCompanionIds(
  supabase: ReturnType<typeof createServiceClient>,
  challengeId: string,
): Promise<string[]> {
  const { data } = await supabase
    .from("challenge_participations")
    .select("companion_user_id")
    .eq("challenge_id", challengeId)
    .eq("status", "active");
  return (data ?? []).map((r) => r.companion_user_id);
}

async function handleApproveProof(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  payload: Record<string, unknown>,
) {
  const proofId = String(payload.proof_id ?? "");
  const decision = String(payload.decision ?? "");
  if (!validateApprovalDecision(decision)) {
    return errorResponse("decision must be accepted or rejected");
  }

  const { data: proof } = await supabase
    .from("proof_of_work")
    .select("*, daily_check_ins(*, challenges(*))")
    .eq("id", proofId)
    .is("media_deleted_at", null)
    .single();
  if (!proof) return errorResponse("Proof not found", 404);

  const checkIn = proof.daily_check_ins as DailyCheckIn & {
    challenges: Challenge;
  };
  const challenge = checkIn.challenges;

  const companionIds = await getActiveCompanionIds(supabase, challenge.id);
  if (!companionIds.includes(userId)) {
    return errorResponse("Not an active companion", 403);
  }

  const approveCheck = canApproveProof(checkIn, new Date());
  if (!approveCheck.ok) return errorResponse(approveCheck.error!);

  const { error: insErr } = await supabase.from("approvals").insert({
    proof_of_work_id: proofId,
    companion_user_id: userId,
    decision,
  });
  if (insErr) {
    if (insErr.code === "23505") return errorResponse("Already approved this proof");
    return errorResponse(insErr.message, 500);
  }

  const { data: approvals } = await supabase
    .from("approvals")
    .select("companion_user_id, decision")
    .eq("proof_of_work_id", proofId);

  const resolution = resolveProofIfComplete({
    challenge,
    checkIn,
    approvals: (approvals ?? []).map((a) => ({
      companion_user_id: a.companion_user_id,
      decision: a.decision,
    })),
    activeCompanionIds: companionIds,
    now: new Date(),
  });

  if (!resolution.resolved) {
    return jsonResponse({ ok: true, pending: true });
  }

  await deleteStoragePaths(supabase, PROOF_BUCKET, proof.storage_paths);

  await supabase
    .from("proof_of_work")
    .update({
      media_deleted_at: new Date().toISOString(),
      resolution_outcome: resolution.outcome,
    })
    .eq("id", proofId);

  await supabase.from("check_in_logs").insert({
    challenge_id: challenge.id,
    daily_check_in_id: checkIn.id,
    message: resolution.logMessage!,
    outcome: resolution.outcome!,
  });

  const checkInUpdate: Record<string, unknown> = {
    status: resolution.newCheckInStatus,
  };
  if (resolution.makeupDeadlineAt !== undefined) {
    checkInUpdate.makeup_deadline_at = resolution.makeupDeadlineAt;
  }
  await supabase.from("daily_check_ins").update(checkInUpdate).eq("id", checkIn.id);

  await maybeMarkChallengeSuccessful(supabase, challenge.id);

  return jsonResponse({
    ok: true,
    resolved: true,
    outcome: resolution.outcome,
    check_in_status: resolution.newCheckInStatus,
  });
}

async function maybeMarkChallengeSuccessful(
  supabase: ReturnType<typeof createServiceClient>,
  challengeId: string,
) {
  const { data: challenge } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", challengeId)
    .single();
  if (!challenge || challenge.status !== "active") return;

  const { data: checkIns } = await supabase
    .from("daily_check_ins")
    .select("status")
    .eq("challenge_id", challengeId);

  const today = todayInTimezone(new Date(), challenge.timezone);
  if (
    shouldMarkChallengeSuccessful({
      challenge: challenge as Challenge,
      checkIns: checkIns ?? [],
      today,
    })
  ) {
    await supabase.from("challenges").update({ status: "successful" }).eq("id", challengeId);
    await supabase.from("system_messages").insert({
      challenge_id: challengeId,
      message: "Challenge completed successfully!",
      message_type: "challenge_successful",
    });
  }
}

async function handleLeaveChallenge(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  payload: Record<string, unknown>,
) {
  const challengeId = String(payload.challenge_id ?? "");

  const { data: others } = await supabase
    .from("challenge_participations")
    .select("id")
    .eq("challenge_id", challengeId)
    .eq("status", "active")
    .neq("companion_user_id", userId);

  if ((others?.length ?? 0) < 1) {
    return errorResponse(
      "At least one companion required to continue challenge. Thus, you cannot leave the challenge.",
    );
  }

  const { data: participation } = await supabase
    .from("challenge_participations")
    .select("id")
    .eq("challenge_id", challengeId)
    .eq("companion_user_id", userId)
    .eq("status", "active")
    .single();
  if (!participation) return errorResponse("Not an active companion", 404);

  await supabase
    .from("challenge_participations")
    .update({ status: "left", left_at: new Date().toISOString() })
    .eq("id", participation.id);

  // Void departing companion's pending approvals; recalculate quorum (assumptions.md #7)
  await voidCompanionApprovalsAndResolve(supabase, challengeId, userId);

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .single();

  await supabase.from("system_messages").insert({
    challenge_id: challengeId,
    message: `${profile?.display_name ?? "A companion"} left the challenge.`,
    message_type: "companion_left",
  });

  return jsonResponse({ ok: true });
}

/** Remove a departed companion's votes and resolve proofs if quorum is now complete. */
async function voidCompanionApprovalsAndResolve(
  supabase: ReturnType<typeof createServiceClient>,
  challengeId: string,
  departedUserId: string,
) {
  const { data: pendingCheckIns } = await supabase
    .from("daily_check_ins")
    .select("*")
    .eq("challenge_id", challengeId)
    .eq("status", "pending_validation");

  for (const checkIn of pendingCheckIns ?? []) {
    const { data: proof } = await supabase
      .from("proof_of_work")
      .select("*")
      .eq("daily_check_in_id", checkIn.id)
      .is("media_deleted_at", null)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!proof) continue;

    await supabase
      .from("approvals")
      .delete()
      .eq("proof_of_work_id", proof.id)
      .eq("companion_user_id", departedUserId);

    const { data: challenge } = await supabase
      .from("challenges")
      .select("*")
      .eq("id", challengeId)
      .single();
    if (!challenge) continue;

    const companionIds = await getActiveCompanionIds(supabase, challengeId);
    const { data: approvals } = await supabase
      .from("approvals")
      .select("companion_user_id, decision")
      .eq("proof_of_work_id", proof.id);

    const resolution = resolveProofIfComplete({
      challenge: challenge as Challenge,
      checkIn: checkIn as DailyCheckIn,
      approvals: (approvals ?? []).map((a) => ({
        companion_user_id: a.companion_user_id,
        decision: a.decision,
      })),
      activeCompanionIds: companionIds,
      now: new Date(),
    });

    if (!resolution.resolved) continue;

    await deleteStoragePaths(supabase, PROOF_BUCKET, proof.storage_paths);
    await supabase
      .from("proof_of_work")
      .update({
        media_deleted_at: new Date().toISOString(),
        resolution_outcome: resolution.outcome,
      })
      .eq("id", proof.id);

    await supabase.from("check_in_logs").insert({
      challenge_id: challengeId,
      daily_check_in_id: checkIn.id,
      message: resolution.logMessage!,
      outcome: resolution.outcome!,
    });

    const checkInUpdate: Record<string, unknown> = {
      status: resolution.newCheckInStatus,
    };
    if (resolution.makeupDeadlineAt !== undefined) {
      checkInUpdate.makeup_deadline_at = resolution.makeupDeadlineAt;
    }
    await supabase.from("daily_check_ins").update(checkInUpdate).eq("id", checkIn.id);
    await maybeMarkChallengeSuccessful(supabase, challengeId);
  }
}

async function handlePrepareWagerUpload(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  payload: Record<string, unknown>,
) {
  const challengeId = String(payload.challenge_id ?? "");
  const { data: challenge } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", challengeId)
    .eq("challenger_id", userId)
    .eq("status", "failed")
    .single();
  if (!challenge) return errorResponse("Failed challenge not found", 404);

  const storagePath = `${challengeId}/wager/${crypto.randomUUID()}`;
  const { data, error } = await supabase.storage
    .from(WAGER_BUCKET)
    .createSignedUploadUrl(storagePath);
  if (error) return errorResponse(error.message, 500);

  return jsonResponse({
    storage_path: storagePath,
    signed_upload_url: data.signedUrl,
    token: data.token,
  });
}

async function handleSubmitWagerSettlement(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  payload: Record<string, unknown>,
) {
  const challengeId = String(payload.challenge_id ?? "");
  const storagePaths = (payload.storage_paths as string[]) ?? [];
  const mediaSize = Number(payload.media_size_bytes ?? 0);

  const { data: challenge } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", challengeId)
    .eq("challenger_id", userId)
    .eq("status", "failed")
    .single();
  if (!challenge) return errorResponse("Failed challenge not found", 404);

  const { data, error } = await supabase
    .from("wager_settlements")
    .upsert({
      challenge_id: challengeId,
      challenger_id: userId,
      storage_paths: storagePaths,
      media_size_bytes: mediaSize,
      submitted_at: new Date().toISOString(),
    }, { onConflict: "challenge_id" })
    .select()
    .single();
  if (error) return errorResponse(error.message, 500);

  return jsonResponse({ wager_settlement: data });
}

async function handleApproveWagerSettlement(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  payload: Record<string, unknown>,
) {
  const settlementId = String(payload.wager_settlement_id ?? "");
  const { data: settlement } = await supabase
    .from("wager_settlements")
    .select("*, challenges(*)")
    .eq("id", settlementId)
    .single();
  if (!settlement) return errorResponse("Settlement not found", 404);

  const challengeId = settlement.challenge_id;
  const companionIds = await getActiveCompanionIds(supabase, challengeId);
  if (!companionIds.includes(userId)) {
    return errorResponse("Not an active companion", 403);
  }

  const { error: approvalErr } = await supabase.from("wager_settlement_approvals").insert({
    wager_settlement_id: settlementId,
    companion_user_id: userId,
    decision: "accepted",
  });
  if (approvalErr) {
    if (approvalErr.code === "23505") {
      return errorResponse("Already approved this settlement");
    }
    return errorResponse(approvalErr.message, 500);
  }

  const { count: approvalCount } = await supabase
    .from("wager_settlement_approvals")
    .select("id", { count: "exact", head: true })
    .eq("wager_settlement_id", settlementId);

  if ((approvalCount ?? 0) >= companionIds.length) {
    await supabase.from("challenges").update({ status: "closed" }).eq("id", challengeId);
    return jsonResponse({ ok: true, challenge_status: "closed" });
  }

  return jsonResponse({ ok: true, pending: true });
}
