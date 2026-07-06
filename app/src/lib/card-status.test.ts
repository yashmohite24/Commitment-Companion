import { describe, expect, it } from 'vitest';
import { deriveCardStatus, progressPercent } from './card-status';
import type { Challenge, DailyCheckIn } from './types';

const baseChallenge: Pick<
  Challenge,
  'status' | 'lives_total' | 'lives_consumed' | 'draft_message'
> = {
  status: 'active',
  lives_total: 3,
  lives_consumed: 0,
  draft_message: null,
};

const baseCheckIn: DailyCheckIn = {
  id: '1',
  challenge_id: 'c1',
  check_in_date: '2026-07-15',
  status: 'pending',
  deadline_at: '2026-07-15T23:59:00Z',
  makeup_deadline_at: null,
  provisionally_advanced: false,
};

describe('deriveCardStatus', () => {
  it('challenger pending day shows Check In', () => {
    const r = deriveCardStatus({
      challenge: baseChallenge,
      todayCheckIn: baseCheckIn,
      role: 'challenger',
      now: new Date('2026-07-15T12:00:00Z'),
    });
    expect(r.ctaAction).toBe('check_in');
  });

  it('companion pending_validation shows Verify', () => {
    const r = deriveCardStatus({
      challenge: baseChallenge,
      todayCheckIn: { ...baseCheckIn, status: 'pending_validation' },
      role: 'companion',
      hasPendingProof: true,
    });
    expect(r.ctaAction).toBe('verify');
  });

  it('failed challenge shows settle wager for challenger', () => {
    const r = deriveCardStatus({
      challenge: { ...baseChallenge, status: 'failed' },
      todayCheckIn: null,
      role: 'challenger',
    });
    expect(r.ctaAction).toBe('settle_wager');
  });
});

describe('progressPercent', () => {
  it('matches PRD formula', () => {
    expect(progressPercent(6, 30)).toBe(20);
  });
});
