import { formatProfileName } from '@/src/lib/challenge-display';
import { indexTodayCheckIns, todayDatesByChallenge } from '@/src/lib/challenge-time';
import { supabase } from '@/src/lib/supabase';
import type { Challenge, DailyCheckIn } from '@/src/lib/types';

export interface CompanionRequestRow {
  id: string;
  challenge_id: string;
  challenges: Challenge;
}

export interface CompanionTabData {
  requests: CompanionRequestRow[];
  challenges: Challenge[];
  challengerNames: Record<string, string>;
  checkIns: Record<string, DailyCheckIn>;
  doneCounts: Record<string, number>;
}

function unwrapChallenge(
  value: Challenge | Challenge[] | null | undefined,
): Challenge | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

async function loadProfileNames(userIds: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(userIds.filter(Boolean))];
  if (!unique.length) return {};

  const map: Record<string, string> = {};

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    'get_challenge_participant_profiles',
    { p_user_ids: unique },
  );
  if (!rpcError && rpcData?.length) {
    for (const row of rpcData) map[row.id] = formatProfileName(row);
  }

  const missing = unique.filter((id) => !map[id]);
  if (missing.length > 0) {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, display_name')
      .in('id', missing);
    if (profileError) {
      console.warn('loadProfileNames failed:', profileError.message);
    }
    for (const row of profileData ?? []) {
      map[row.id] = formatProfileName(row);
    }
  }

  return map;
}

export async function fetchCompanionTabData(userId: string): Promise<CompanionTabData> {
  const [reqResult, partsResult] = await Promise.all([
    supabase
      .from('companion_requests')
      .select('id, challenge_id, challenges(*)')
      .eq('companion_user_id', userId)
      .eq('status', 'pending'),
    supabase
      .from('challenge_participations')
      .select('challenge_id, challenges(*)')
      .eq('companion_user_id', userId)
      .eq('status', 'active'),
  ]);

  const requests = (reqResult.data ?? [])
    .map((row) => {
      const challenge = unwrapChallenge(row.challenges as Challenge | Challenge[] | null);
      if (!challenge) return null;
      return { ...row, challenges: challenge };
    })
    .filter(Boolean) as CompanionRequestRow[];

  const challenges = (partsResult.data ?? [])
    .map((p) => unwrapChallenge(p.challenges as Challenge | Challenge[] | null))
    .filter((c): c is Challenge => c != null);

  const nameIds = [
    ...requests.map((r) => r.challenges.challenger_id),
    ...challenges.map((c) => c.challenger_id),
  ];

  const ids = challenges.map((c) => c.id);
  if (ids.length === 0) {
    const challengerNames = await loadProfileNames(nameIds);
    return { requests, challenges, challengerNames, checkIns: {}, doneCounts: {} };
  }

  const dateByChallenge = todayDatesByChallenge(challenges);
  const uniqueDates = [...new Set(dateByChallenge.values())];

  const [challengerNames, todayResult, doneResult] = await Promise.all([
    loadProfileNames(nameIds),
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

  return { requests, challenges, challengerNames, checkIns, doneCounts };
}
