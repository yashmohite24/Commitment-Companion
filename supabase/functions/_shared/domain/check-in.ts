import type {
  Approval,
  ApprovalDecision,
  Challenge,
  CheckInLogOutcome,
  DailyCheckIn,
  DailyCheckInStatus,
} from "../types.ts";
import {
  CHECK_IN_LOG_REJECTED,
  CHECK_IN_LOG_VERIFIED,
  MAKEUP_HOURS,
} from "../types.ts";
import { addHours, isAfterDeadline, isBeforeDeadline } from "../time.ts";

export interface SubmitCheckInInput {
  challenge: Challenge;
  checkIn: DailyCheckIn;
  now: Date;
}

export interface SubmitCheckInResult {
  ok: boolean;
  error?: string;
  newStatus?: DailyCheckInStatus;
}

/** Transition: pending → pending_validation */
export function canSubmitCheckIn(input: SubmitCheckInInput): SubmitCheckInResult {
  const { challenge, checkIn, now } = input;

  if (challenge.status !== "active") {
    return { ok: false, error: "Challenge is not active" };
  }
  if (checkIn.status !== "pending") {
    return { ok: false, error: "Check-in is not awaiting submission" };
  }
  if (now.toISOString().slice(0, 10) > challenge.end_date) {
    return { ok: false, error: "Challenge has ended" };
  }

  const withinDeadline = isBeforeDeadline(now, checkIn.deadline_at);
  const withinMakeup = checkIn.makeup_deadline_at &&
    isBeforeDeadline(now, checkIn.makeup_deadline_at);

  if (!withinDeadline && !withinMakeup) {
    return { ok: false, error: "Check-in deadline has passed" };
  }

  return { ok: true, newStatus: "pending_validation" };
}

export interface ApprovalResolution {
  allActed: boolean;
  anyRejected: boolean;
  allAccepted: boolean;
  activeCompanionIds: string[];
}

export function evaluateApprovals(
  approvals: Approval[],
  activeCompanionIds: string[],
): ApprovalResolution {
  const acted = approvals.filter((a) =>
    activeCompanionIds.includes(a.companion_user_id)
  );
  const allActed = activeCompanionIds.every((id) =>
    acted.some((a) => a.companion_user_id === id)
  );
  const anyRejected = acted.some((a) => a.decision === "rejected");
  const allAccepted = allActed &&
    acted.length === activeCompanionIds.length &&
    acted.every((a) => a.decision === "accepted");

  return { allActed, anyRejected, allAccepted, activeCompanionIds };
}

export interface ResolveProofInput {
  challenge: Challenge;
  checkIn: DailyCheckIn;
  approvals: Approval[];
  activeCompanionIds: string[];
  now: Date;
}

export interface ResolveProofResult {
  resolved: boolean;
  outcome?: CheckInLogOutcome;
  logMessage?: string;
  newCheckInStatus?: DailyCheckInStatus;
  makeupDeadlineAt?: string | null;
  deleteMedia: boolean;
}

/**
 * After a companion acts — if all active companions have acted, resolve proof.
 * Per PRD + Architecture: media deleted when all have acted; outcome accepted or rejected.
 */
export function resolveProofIfComplete(
  input: ResolveProofInput,
): ResolveProofResult {
  const { checkIn, approvals, activeCompanionIds, now } = input;
  const eval_ = evaluateApprovals(approvals, activeCompanionIds);

  if (!eval_.allActed) {
    return { resolved: false, deleteMedia: false };
  }

  if (eval_.allAccepted) {
    return {
      resolved: true,
      outcome: "verified",
      logMessage: CHECK_IN_LOG_VERIFIED,
      newCheckInStatus: "done",
      deleteMedia: true,
    };
  }

  // Rejected (at least one rejection)
  const beforeDeadline = isBeforeDeadline(now, checkIn.deadline_at);
  if (beforeDeadline) {
    return {
      resolved: true,
      outcome: "rejected",
      logMessage: CHECK_IN_LOG_REJECTED,
      newCheckInStatus: "pending",
      deleteMedia: true,
    };
  }

  // Post-deadline rejection → 24h makeup window (PRD Pooja scenario)
  return {
    resolved: true,
    outcome: "rejected",
    logMessage: CHECK_IN_LOG_REJECTED,
    newCheckInStatus: "pending",
    makeupDeadlineAt: addHours(now.toISOString(), MAKEUP_HOURS),
    deleteMedia: true,
  };
}

export interface MissDeadlineInput {
  challenge: Challenge;
  checkIn: DailyCheckIn;
  now: Date;
  hasPendingProof: boolean;
  allCompanionsActedOnPendingProof: boolean;
}

export interface MissDeadlineResult {
  action:
    | "none"
    | "consume_life"
    | "fail_challenge"
    | "provisional_advance";
  newCheckInStatus?: DailyCheckInStatus;
  newChallengeStatus?: Challenge["status"];
  livesConsumed?: number;
  provisionallyAdvanced?: boolean;
}

/**
 * Scheduled job: handle overdue check-in.
 * - pending + no proof → life or fail
 * - pending_validation + not all approved → provisional advance
 */
export function processOverdueCheckIn(
  input: MissDeadlineInput,
): MissDeadlineResult {
  const { challenge, checkIn, now, hasPendingProof, allCompanionsActedOnPendingProof } =
    input;

  if (challenge.status !== "active") return { action: "none" };
  if (checkIn.status === "done" || checkIn.status === "missed") {
    return { action: "none" };
  }

  const pastDeadline = isAfterDeadline(now, checkIn.deadline_at);
  if (!pastDeadline) return { action: "none" };

  if (checkIn.status === "pending") {
    const inMakeup = checkIn.makeup_deadline_at &&
      isBeforeDeadline(now, checkIn.makeup_deadline_at);
    if (inMakeup) return { action: "none" };

    const livesRemaining = challenge.lives_total - challenge.lives_consumed;
    if (livesRemaining > 0) {
      return {
        action: "consume_life",
        newCheckInStatus: "missed",
        livesConsumed: challenge.lives_consumed + 1,
      };
    }
    return {
      action: "fail_challenge",
      newCheckInStatus: "missed",
      newChallengeStatus: "failed",
    };
  }

  if (checkIn.status === "pending_validation") {
    if (allCompanionsActedOnPendingProof) return { action: "none" };
    if (!checkIn.provisionally_advanced) {
      return {
        action: "provisional_advance",
        provisionallyAdvanced: true,
      };
    }
  }

  return { action: "none" };
}

export function remainingLives(challenge: Challenge): number {
  return challenge.lives_total - challenge.lives_consumed;
}

export function canApproveProof(
  checkIn: DailyCheckIn,
  now: Date,
): { ok: boolean; error?: string } {
  if (checkIn.status !== "pending_validation") {
    return { ok: false, error: "No proof awaiting verification" };
  }
  // Companions can verify after deadline (special case transition 5)
  return { ok: true };
}

export function nextSequenceNumber(existingCount: number): number {
  return existingCount + 1;
}

export function validateApprovalDecision(
  decision: string,
): decision is ApprovalDecision {
  return decision === "accepted" || decision === "rejected";
}
