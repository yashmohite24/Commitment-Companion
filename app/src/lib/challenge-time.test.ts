import { describe, expect, it } from 'vitest';
import { indexTodayCheckIns, todayDatesByChallenge, todayInTimezone } from './challenge-time';
import type { DailyCheckIn } from './types';

describe('todayInTimezone', () => {
  it('uses challenge timezone, not UTC', () => {
    // 2026-07-07 20:00 UTC = 2026-07-08 01:30 Asia/Kolkata
    const instant = new Date('2026-07-07T20:00:00.000Z');
    expect(todayInTimezone(instant, 'UTC')).toBe('2026-07-07');
    expect(todayInTimezone(instant, 'Asia/Kolkata')).toBe('2026-07-08');
  });
});

describe('indexTodayCheckIns', () => {
  it('picks the row matching each challenge local day', () => {
    const rows = [
      { id: 'a', challenge_id: 'c1', check_in_date: '2026-07-07', status: 'missed' },
      { id: 'b', challenge_id: 'c1', check_in_date: '2026-07-08', status: 'pending' },
    ] as DailyCheckIn[];
    const dates = todayDatesByChallenge([
      { id: 'c1', timezone: 'Asia/Kolkata' },
    ], new Date('2026-07-07T20:00:00.000Z'));
    const map = indexTodayCheckIns(rows, dates);
    expect(map.c1.check_in_date).toBe('2026-07-08');
    expect(map.c1.status).toBe('pending');
  });
});
