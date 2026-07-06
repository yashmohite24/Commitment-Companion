/** Shared domain types — mirror PostgreSQL enums */

export type ChallengeStatus =
  | "draft"
  | "active"
  | "successful"
  | "failed"
  | "closed";

export type DailyCheckInStatus =
  | "pending"
  | "pending_validation"
  | "done"
  | "missed";

export type ApprovalDecision = "accepted" | "rejected";

export type CheckInLogOutcome = "verified" | "rejected";

export interface Challenge {
  id: string;
  challenger_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;
  daily_deadline_time: string; // HH:MM:SS
  timezone: string;
  lives_total: number;
  lives_consumed: number;
  status: ChallengeStatus;
}

export interface DailyCheckIn {
  id: string;
  challenge_id: string;
  check_in_date: string;
  status: DailyCheckInStatus;
  deadline_at: string; // ISO
  makeup_deadline_at: string | null;
  provisionally_advanced: boolean;
}

export interface ProofOfWork {
  id: string;
  daily_check_in_id: string;
  sequence_number: number;
  media_deleted_at: string | null;
  resolution_outcome: CheckInLogOutcome | null;
}

export interface Approval {
  companion_user_id: string;
  decision: ApprovalDecision;
}

export const MAX_MEDIA_BYTES = 20 * 1024 * 1024;
export const MAX_ACTIVE_CHALLENGES = 5;
export const MAX_COMPANIONS = 10;
export const MIN_CHALLENGE_DAYS = 7;
export const COMPANION_ACCEPTANCE_HOURS = 24;
export const MAKEUP_HOURS = 24;
export const REMINDER_HOURS_BEFORE = 1;

export const CHECK_IN_LOG_VERIFIED =
  "Check In Verified [Media Automatically deleted]";
export const CHECK_IN_LOG_REJECTED =
  "Check In Rejected [Media Automatically deleted]";
