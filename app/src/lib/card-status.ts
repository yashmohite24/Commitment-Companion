import type {
  Challenge,
  ChallengeStatus,
  DailyCheckIn,
  DailyCheckInStatus,
  ViewerRole,
} from './types';

export interface CardStatus {
  label: string;
  chipLabel: string;
  cta: string | null;
  ctaAction:
    | 'check_in'
    | 'view'
    | 'settle_wager'
    | 'verify'
    | 'edit_draft'
    | null;
  tone: 'default' | 'warning' | 'success' | 'error';
  chipTone: 'pending' | 'review' | 'done' | 'missed' | 'alert' | 'success' | 'default';
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
      label: challenge.draft_message ?? 'Waiting for your companions',
      chipLabel: 'Draft',
      cta: role === 'challenger' ? 'Edit challenge' : null,
      ctaAction: role === 'challenger' ? 'edit_draft' : null,
      tone: 'warning',
      chipTone: 'pending',
    };
  }

  if (status === 'successful') {
    return {
      label: 'Goal complete — you showed up',
      chipLabel: 'Complete',
      cta: 'View',
      ctaAction: 'view',
      tone: 'success',
      chipTone: 'success',
    };
  }

  if (status === 'closed') {
    return {
      label: 'All wrapped up',
      chipLabel: 'Wrapped up',
      cta: 'View',
      ctaAction: 'view',
      tone: 'default',
      chipTone: 'default',
    };
  }

  if (status === 'failed') {
    return {
      label: "This challenge didn't go your way",
      chipLabel: 'Missed goal',
      cta: role === 'challenger' ? 'Settle up' : 'Confirm settlement',
      ctaAction: role === 'challenger' ? 'settle_wager' : 'verify',
      tone: 'error',
      chipTone: 'alert',
    };
  }

  const checkIn = todayCheckIn;
  if (!checkIn) {
    return {
      label: 'Active',
      chipLabel: 'Active',
      cta: 'View',
      ctaAction: 'view',
      tone: 'default',
      chipTone: 'default',
    };
  }

  const checkStatus = checkIn.status as DailyCheckInStatus;

  if (role === 'companion') {
    if (checkStatus === 'pending_validation' || input.hasPendingProof) {
      return {
        label: 'Your turn to review',
        chipLabel: 'Review',
        cta: 'Verify',
        ctaAction: 'verify',
        tone: 'warning',
        chipTone: 'review',
      };
    }
    return {
      label: "Waiting for today's proof",
      chipLabel: 'Waiting',
      cta: 'View',
      ctaAction: 'view',
      tone: 'default',
      chipTone: 'pending',
    };
  }

  if (checkStatus === 'pending') {
    const inMakeup = checkIn.makeup_deadline_at &&
      now.getTime() <= new Date(checkIn.makeup_deadline_at).getTime();
    const canSubmit = !isPastDeadline(now, checkIn.deadline_at) || inMakeup;
    if (canSubmit) {
      return {
        label: checkIn.provisionally_advanced
          ? 'Catch-up check-in needed'
          : "Ready for today's check-in",
        chipLabel: checkIn.provisionally_advanced ? 'Catch up' : 'Check in',
        cta: 'Check In',
        ctaAction: 'check_in',
        tone: 'warning',
        chipTone: 'pending',
      };
    }
    return {
      label: "Today's window closed",
      chipLabel: 'Closed',
      cta: 'View',
      ctaAction: 'view',
      tone: 'error',
      chipTone: 'alert',
    };
  }

  if (checkStatus === 'pending_validation') {
    return {
      label: 'Companions are reviewing',
      chipLabel: 'In review',
      cta: 'View',
      ctaAction: 'view',
      tone: 'warning',
      chipTone: 'review',
    };
  }

  if (checkStatus === 'done') {
    return {
      label: 'You showed up today',
      chipLabel: 'Showed up',
      cta: 'View',
      ctaAction: 'view',
      tone: 'success',
      chipTone: 'done',
    };
  }

  if (checkStatus === 'missed') {
    const livesLeft = challenge.lives_total - challenge.lives_consumed;
    return {
      label: livesLeft > 0 ? 'Life happened — one save used' : 'Missed',
      chipLabel: livesLeft > 0 ? 'Save used' : 'Missed',
      cta: 'View',
      ctaAction: 'view',
      tone: 'error',
      chipTone: 'missed',
    };
  }

  return {
    label: 'Active',
    chipLabel: 'Active',
    cta: 'View',
    ctaAction: 'view',
    tone: 'default',
    chipTone: 'default',
  };
}

export function isActiveChallenge(status: ChallengeStatus): boolean {
  return status === 'draft' || status === 'active' || status === 'failed';
}

export function progressPercent(doneCount: number, totalDays: number): number {
  if (totalDays <= 0) return 0;
  return Math.round((doneCount / totalDays) * 100);
}

export function cardBorderAccent(chipTone: CardStatus['chipTone']): string | undefined {
  switch (chipTone) {
    case 'done':
      return '#A8D5BA';
    case 'review':
      return '#49B7A5';
    case 'alert':
    case 'missed':
      return '#E8927C';
    case 'success':
      return '#E8B84A';
    default:
      return '#3D6B54';
  }
}
