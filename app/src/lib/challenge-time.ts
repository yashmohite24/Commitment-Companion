import type { Challenge, DailyCheckIn } from './types';

/** Calendar date YYYY-MM-DD in an IANA timezone (matches server `todayInTimezone`). */
export function todayInTimezone(now: Date, timezone: string): string {
  return now.toLocaleDateString('en-CA', { timeZone: timezone });
}

export function todayDatesByChallenge(
  challenges: Pick<Challenge, 'id' | 'timezone'>[],
  now: Date = new Date(),
): Map<string, string> {
  const map = new Map<string, string>();
  for (const c of challenges) {
    map.set(c.id, todayInTimezone(now, c.timezone));
  }
  return map;
}

/** Index check-in rows keyed by challenge, matching each challenge's local calendar day. */
export function indexTodayCheckIns(
  rows: DailyCheckIn[],
  dateByChallenge: Map<string, string>,
): Record<string, DailyCheckIn> {
  const map: Record<string, DailyCheckIn> = {};
  for (const row of rows) {
    if (row.check_in_date === dateByChallenge.get(row.challenge_id)) {
      map[row.challenge_id] = row;
    }
  }
  return map;
}
