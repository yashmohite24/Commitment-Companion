import { activateChallengeIfReady } from "../_shared/domain/activate.ts";
import { processOverdueCheckIn } from "../_shared/domain/check-in.ts";
import {
  shouldFailDraft,
  shouldMarkChallengeSuccessful,
} from "../_shared/domain/challenge.ts";
import { todayInTimezone } from "../_shared/time.ts";
import type { Challenge, DailyCheckIn } from "../_shared/types.ts";
import { REMINDER_HOURS_BEFORE } from "../_shared/types.ts";
import { pushToUsers } from "../_shared/push.ts";
import {
  createServiceClient,
  corsPreflight,
  errorResponse,
  jsonResponse,
  verifyCronSecret,
} from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsPreflight();

  if (req.method !== "POST") return errorResponse("Method not allowed", 405);

  if (!verifyCronSecret(req)) {
    return errorResponse("Unauthorized", 401);
  }

  const supabase = createServiceClient();
  const now = new Date();
  const results = {
    overdue_processed: 0,
    provisional_advanced: 0,
    lives_consumed: 0,
    challenges_failed: 0,
    reminders_sent: 0,
    drafts_failed: 0,
    challenges_activated: 0,
    challenges_successful: 0,
  };

  try {
    // 1. Expire companion requests & fail drafts with no acceptances
    const { data: draftChallenges } = await supabase
      .from("challenges")
      .select("*")
      .eq("status", "draft");

    for (const ch of draftChallenges ?? []) {
      const { count: accepted } = await supabase
        .from("companion_requests")
        .select("id", { count: "exact", head: true })
        .eq("challenge_id", ch.id)
        .eq("status", "accepted");

      if (
        shouldFailDraft(
          accepted ?? 0,
          now,
          ch.start_date,
          ch.timezone,
        )
      ) {
        await supabase
          .from("companion_requests")
          .update({ status: "expired" })
          .eq("challenge_id", ch.id)
          .eq("status", "pending");

        await supabase
          .from("challenges")
          .update({
            draft_message:
              "Challenge couldn't be created since no companions accepted the request",
          })
          .eq("id", ch.id);

        results.drafts_failed++;
      }
    }

    // 2. Activate drafts that gained acceptances (start date reached)
    for (const ch of draftChallenges ?? []) {
      const activated = await activateChallengeIfReady(supabase, ch.id);
      if (activated) results.challenges_activated++;
    }

    // 3. Process overdue check-ins for active challenges
    const { data: overdueCheckIns } = await supabase
      .from("daily_check_ins")
      .select("*, challenges(*)")
      .in("status", ["pending", "pending_validation"])
      .lte("deadline_at", now.toISOString());

    for (const row of overdueCheckIns ?? []) {
      const challenge = row.challenges as Challenge;
      const checkIn = row as DailyCheckIn;
      if (challenge.status !== "active") continue;

      const { data: latestProof } = await supabase
        .from("proof_of_work")
        .select("id")
        .eq("daily_check_in_id", checkIn.id)
        .is("media_deleted_at", null)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let allActed = true;
      if (latestProof) {
        const { data: companions } = await supabase
          .from("challenge_participations")
          .select("companion_user_id")
          .eq("challenge_id", challenge.id)
          .eq("status", "active");
        const companionIds = (companions ?? []).map((c) => c.companion_user_id);
        const { data: approvals } = await supabase
          .from("approvals")
          .select("companion_user_id")
          .eq("proof_of_work_id", latestProof.id);
        allActed = companionIds.every((id) =>
          (approvals ?? []).some((a) => a.companion_user_id === id)
        );
      }

      const outcome = processOverdueCheckIn({
        challenge,
        checkIn,
        now,
        hasPendingProof: !!latestProof,
        allCompanionsActedOnPendingProof: allActed,
      });

      if (outcome.action === "none") continue;
      results.overdue_processed++;

      if (outcome.action === "consume_life") {
        await supabase
          .from("daily_check_ins")
          .update({ status: "missed" })
          .eq("id", checkIn.id);
        await supabase
          .from("challenges")
          .update({ lives_consumed: outcome.livesConsumed })
          .eq("id", challenge.id);
        results.lives_consumed++;
      }

      if (outcome.action === "fail_challenge") {
        if (outcome.newCheckInStatus) {
          await supabase
            .from("daily_check_ins")
            .update({ status: outcome.newCheckInStatus })
            .eq("id", checkIn.id);
        }
        await supabase
          .from("challenges")
          .update({ status: "failed" })
          .eq("id", challenge.id);
        await supabase.from("system_messages").insert({
          challenge_id: challenge.id,
          message: "Challenge failed.",
          message_type: "challenge_failed",
        });
        results.challenges_failed++;
      }

      if (outcome.action === "provisional_advance") {
        await supabase
          .from("daily_check_ins")
          .update({ provisionally_advanced: true })
          .eq("id", checkIn.id);
        results.provisional_advanced++;
      }
    }

    // 4. Deadline reminders (~1 hour before)
    const reminderBefore = new Date(now.getTime() + REMINDER_HOURS_BEFORE * 3600_000);
    const { data: reminderCandidates } = await supabase
      .from("daily_check_ins")
      .select("*, challenges(*)")
      .eq("status", "pending")
      .eq("deadline_reminder_sent", false)
      .lte("deadline_at", reminderBefore.toISOString())
      .gt("deadline_at", now.toISOString());

    for (const row of reminderCandidates ?? []) {
      await supabase
        .from("daily_check_ins")
        .update({ deadline_reminder_sent: true })
        .eq("id", row.id);
      results.reminders_sent++;

      const challenge = row.challenges as Challenge;
      await pushToUsers(
        supabase,
        [challenge.challenger_id],
        "Check-in deadline approaching",
        "You have about 1 hour left to submit today's proof of work.",
        { challenge_id: challenge.id },
      );
    }

    // 5. Mark successful challenges
    const { data: activeChallenges } = await supabase
      .from("challenges")
      .select("*")
      .eq("status", "active");

    for (const ch of activeChallenges ?? []) {
      const { data: checkIns } = await supabase
        .from("daily_check_ins")
        .select("status")
        .eq("challenge_id", ch.id);
      const today = todayInTimezone(now, ch.timezone);
      if (
        shouldMarkChallengeSuccessful({
          challenge: ch as Challenge,
          checkIns: checkIns ?? [],
          today,
        })
      ) {
        await supabase.from("challenges").update({ status: "successful" }).eq("id", ch.id);
        results.challenges_successful++;
      }
    }

    return jsonResponse({ ok: true, results, ran_at: now.toISOString() });
  } catch (e) {
    console.error(e);
    return errorResponse(e instanceof Error ? e.message : "Internal error", 500);
  }
});
