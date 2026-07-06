import type {
  Challenge,
  ChallengeStatus,
  DailyCheckIn,
  DailyCheckInStatus,
  ViewerRole,
} from './types';

export interface CardStatus {
  label: string;
  cta: string | null;
  ctaAction:
    | 'check_in'
    | 'view'
    | 'settle_wager'
    | 'verify'
    | 'edit_draft'
    | null;
  tone: 'default' | 'warning' | 'success' | 'error';
}

function isPastDeadline(now: Date, deadlineAt: string): boolean {
  return now.getTime() > new Date(deadlineAt).getTime();
}

export function deriveCardStatus(input: {
  challenge: Pick<
    Challenge,
    'status' | 'lives_total' | 'lives_consumed' | 'draft_message'
  >;
  todayCheckIn: DailyCheckIn | null;
  role: ViewerRole;
  now?: Date;
  hasPendingProof?: boolean;
}): CardStatus {
  const { challenge, todayCheckIn, role } = input;
  const now = input.now ?? new Date();
  const status = challenge.status;

  if (status === 'draft') {
    return {
      label: challenge.draft_message ?? 'Awaiting companions',
      cta: role === 'challenger' ? 'Edit draft' : null,
      ctaAction: role === 'challenger' ? 'edit_draft' : null,
      tone: 'warning',
    };
  }

  if (status === 'successful') {
    return { label: 'Challenge Successful', cta: 'View', ctaAction: 'view', tone: 'success' };
  }

  if (status === 'closed') {
    return { label: 'Challenge Closed', cta: 'View', ctaAction: 'view', tone: 'default' };
  }

  if (status === 'failed') {
    return {
      label: 'Challenge Failed — Settle Wager',
      cta: role === 'challenger' ? 'Settle Wager' : 'Verify settlement',
      ctaAction: role === 'challenger' ? 'settle_wager' : 'verify',
      tone: 'error',
    };
  }

  // active
  const checkIn = todayCheckIn;
  if (!checkIn) {
    return { label: 'Active', cta: 'View', ctaAction: 'view', tone: 'default' };
  }

  const checkStatus = checkIn.status as DailyCheckInStatus;

  if (role === 'companion') {
    if (checkStatus === 'pending_validation' || input.hasPendingProof) {
      return {
        label: 'Pending Verification',
        cta: 'Verify',
        ctaAction: 'verify',
        tone: 'warning',
      };
    }
    return { label: 'Check-in Pending', cta: 'View', ctaAction: 'view', tone: 'default' };
  }

  // challenger
  if (checkStatus === 'pending') {
    const inMakeup = checkIn.makeup_deadline_at &&
      now.getTime() <= new Date(checkIn.makeup_deadline_at).getTime();
    const canSubmit = !isPastDeadline(now, checkIn.deadline_at) || inMakeup;
    if (canSubmit) {
      return {
        label: checkIn.provisionally_advanced
          ? 'Makeup check-in required'
          : 'Check-in Pending',
        cta: 'Check In',
        ctaAction: 'check_in',
        tone: 'warning',
      };
    }
    return { label: 'Deadline passed', cta: 'View', ctaAction: 'view', tone: 'error' };
  }

  if (checkStatus === 'pending_validation') {
    return {
      label: 'Pending Validation',
      cta: 'View',
      ctaAction: 'view',
      tone: 'warning',
    };
  }

  if (checkStatus === 'done') {
    return { label: 'Check-in Done', cta: 'View', ctaAction: 'view', tone: 'success' };
  }

  if (checkStatus === 'missed') {
    const livesLeft = challenge.lives_total - challenge.lives_consumed;
    return {
      label: livesLeft > 0 ? `Missed (life used, ${livesLeft} left)` : 'Missed',
      cta: 'View',
      ctaAction: 'view',
      tone: 'error',
    };
  }

  return { label: 'Active', cta: 'View', ctaAction: 'view', tone: 'default' };
}

export function isActiveChallenge(status: ChallengeStatus): boolean {
  return status === 'draft' || status === 'active' || status === 'failed';
}

export function progressPercent(doneCount: number, totalDays: number): number {
  if (totalDays <= 0) return 0;
  return Math.round((doneCount / totalDays) * 100);
}
