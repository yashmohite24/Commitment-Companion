import { indexTodayCheckIns, todayDatesByChallenge } from '@/src/lib/challenge-time';
import { supabase } from '@/src/lib/supabase';
import type { Challenge, DailyCheckIn } from '@/src/lib/types';

export interface ChallengesTabData {
  challenges: Challenge[];
  checkIns: Record<string, DailyCheckIn>;
  doneCounts: Record<string, number>;
}

export async function fetchChallengesTabData(userId: string): Promise<ChallengesTabData> {
  const { data } = await supabase
    .from('challenges')
    .select('*')
    .eq('challenger_id', userId)
    .order('created_at', { ascending: false });

  const challenges = (data ?? []) as Challenge[];
  const ids = challenges.map((c) => c.id);

  if (ids.length === 0) {
    return { challenges, checkIns: {}, doneCounts: {} };
  }

  const dateByChallenge = todayDatesByChallenge(challenges);
  const uniqueDates = [...new Set(dateByChallenge.values())];

  const [todayResult, doneResult] = await Promise.all([
    supabase
      .from('daily_check_ins')
      .select('*')
      .in('challenge_id', ids)
      .in('check_in_date', uniqueDates),
    supabase
      .from('daily_check_ins')
      .select('challenge_id')
      .in('challenge_id', ids)
      .eq('status', 'done'),
  ]);

  const checkIns = indexTodayCheckIns(
    (todayResult.data ?? []) as DailyCheckIn[],
    dateByChallenge,
  );

  const doneCounts: Record<string, number> = {};
  for (const id of ids) doneCounts[id] = 0;
  for (const row of doneResult.data ?? []) {
    doneCounts[row.challenge_id] = (doneCounts[row.challenge_id] ?? 0) + 1;
  }

  return { challenges, checkIns, doneCounts };
}
