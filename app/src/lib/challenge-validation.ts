/** Client-side challenge form validation (mirrors server rules where possible). */

import { todayInTimezone } from './challenge-time';

export const MAX_ACTIVE_CHALLENGES = 5;
export const MAX_COMPANIONS = 10;
export const MIN_CHALLENGE_DAYS = 7;

export type ChallengeFieldErrors = Partial<
  Record<'name' | 'start_date' | 'end_date' | 'wager' | 'lives' | 'companions', string>
>;

function dateRangeInclusive(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(`${start}T12:00:00Z`);
  const last = new Date(`${end}T12:00:00Z`);
  while (cur <= last) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return dates;
}

export function challengeDurationDays(start: string, end: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) return 0;
  return dateRangeInclusive(start, end).length;
}

export function maxLivesAllowed(durationDays: number): number {
  return Math.max(0, Math.floor(durationDays / 2) - 1);
}

export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function validateChallengeForm(
  input: {
    name: string;
    start_date: string;
    end_date: string;
    wager: string;
    lives_total: number;
    companionCount: number;
  },
  timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone,
): { ok: boolean; errors: ChallengeFieldErrors } {
  const errors: ChallengeFieldErrors = {};

  const name = input.name.trim();
  if (name.length === 0 || name.length > 200) {
    errors.name = 'Challenge name must be 1–200 characters';
  }

  const wager = input.wager.trim();
  if (wager.length === 0 || wager.length > 300) {
    errors.wager = 'Wager must be 1–300 characters';
  }

  if (!isValidDateString(input.start_date)) {
    errors.start_date = 'Enter start date as DD-MM-YYYY';
  } else {
    const today = todayInTimezone(new Date(), timezone);
    if (input.start_date < today) {
      errors.start_date = 'Start date must be today or later';
    }
  }

  if (!isValidDateString(input.end_date)) {
    errors.end_date = 'Enter end date as DD-MM-YYYY';
  } else if (isValidDateString(input.start_date)) {
    const duration = challengeDurationDays(input.start_date, input.end_date);
    if (duration < MIN_CHALLENGE_DAYS) {
      errors.end_date = `Challenge must be at least ${MIN_CHALLENGE_DAYS} days`;
    }
  }

  if (input.lives_total < 0) {
    errors.lives = 'Lives cannot be negative';
  } else if (isValidDateString(input.start_date) && isValidDateString(input.end_date)) {
    const duration = challengeDurationDays(input.start_date, input.end_date);
    if (duration >= MIN_CHALLENGE_DAYS && input.lives_total > maxLivesAllowed(duration)) {
      errors.lives = `Maximum ${maxLivesAllowed(duration)} lives for this duration`;
    }
  }

  if (input.companionCount === 0) {
    errors.companions = 'Add at least one companion';
  } else if (input.companionCount > MAX_COMPANIONS) {
    errors.companions = `Maximum ${MAX_COMPANIONS} companions`;
  }

  return { ok: Object.keys(errors).length === 0, errors };
}
