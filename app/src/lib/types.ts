export type ChallengeStatus =
  | 'draft'
  | 'active'
  | 'successful'
  | 'failed'
  | 'closed';

export type DailyCheckInStatus =
  | 'pending'
  | 'pending_validation'
  | 'done'
  | 'missed';

export type ViewerRole = 'challenger' | 'companion';

export interface Challenge {
  id: string;
  challenger_id: string;
  name: string;
  start_date: string;
  end_date: string;
  daily_deadline_time: string;
  timezone: string;
  wager: string;
  lives_total: number;
  lives_consumed: number;
  status: ChallengeStatus;
  draft_message: string | null;
}

export interface DailyCheckIn {
  id: string;
  challenge_id: string;
  check_in_date: string;
  status: DailyCheckInStatus;
  deadline_at: string;
  makeup_deadline_at: string | null;
  provisionally_advanced: boolean;
}

export interface ProfileStats {
  consistent_since: number;
  longest_streak: number;
  wager_settlement_ratio: number;
  challenges_created: number;
  challenges_completed: number;
  wagers_realized: number;
}

export const MAX_MEDIA_BYTES = 20 * 1024 * 1024;
