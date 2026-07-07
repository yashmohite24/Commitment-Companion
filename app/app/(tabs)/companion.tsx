import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { CompanionChallengeCard } from '@/src/components/CompanionChallengeCard';
import { CompanionRequestCard } from '@/src/components/CompanionRequestCard';
import { deriveCardStatus, isActiveChallenge } from '@/src/lib/card-status';
import { formatProfileName } from '@/src/lib/challenge-display';
import { invokeChallengeAction } from '@/src/lib/challenge-actions';
import { supabase } from '@/src/lib/supabase';
import type { Challenge, DailyCheckIn } from '@/src/lib/types';
import { useAuth } from '@/src/context/AuthContext';

type Filter = 'live' | 'past';

interface CompanionRequest {
  id: string;
  challenge_id: string;
  challenges: Challenge;
}

async function loadProfileNames(userIds: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(userIds.filter(Boolean))];
  if (!unique.length) return {};
  const { data } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, display_name')
    .in('id', unique);
  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    map[row.id] = formatProfileName(row);
  }
  return map;
}

export default function CompanionScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('live');
  const [requests, setRequests] = useState<CompanionRequest[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengerNames, setChallengerNames] = useState<Record<string, string>>({});
  const [checkIns, setCheckIns] = useState<Record<string, DailyCheckIn>>({});
  const [doneCounts, setDoneCounts] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const load = useCallback(async () => {
    if (!user) return;

    const { data: reqData } = await supabase
      .from('companion_requests')
      .select('id, challenge_id, challenges(*)')
      .eq('companion_user_id', user.id)
      .eq('status', 'pending');
    const reqList = (reqData ?? []) as CompanionRequest[];
    setRequests(reqList);

    const { data: parts } = await supabase
      .from('challenge_participations')
      .select('challenge_id, challenges(*)')
      .eq('companion_user_id', user.id)
      .eq('status', 'active');

    const chList = (parts ?? [])
      .map((p) => p.challenges as Challenge)
      .filter(Boolean)
      .filter((c) =>
        filter === 'live' ? isActiveChallenge(c.status) : !isActiveChallenge(c.status),
      );
    setChallenges(chList);

    const nameIds = [
      ...reqList.map((r) => r.challenges?.challenger_id),
      ...chList.map((c) => c.challenger_id),
    ];
    setChallengerNames(await loadProfileNames(nameIds));

    const ids = chList.map((c) => c.id);
    if (ids.length === 0) {
      setCheckIns({});
      setDoneCounts({});
      return;
    }

    const { data: todayRows } = await supabase
      .from('daily_check_ins')
      .select('*')
      .in('challenge_id', ids)
      .eq('check_in_date', today);
    const map: Record<string, DailyCheckIn> = {};
    for (const row of todayRows ?? []) map[row.challenge_id] = row as DailyCheckIn;
    setCheckIns(map);

    const { data: allCheckIns } = await supabase
      .from('daily_check_ins')
      .select('challenge_id, status')
      .in('challenge_id', ids);
    const counts: Record<string, number> = {};
    for (const id of ids) counts[id] = 0;
    for (const ci of allCheckIns ?? []) {
      if (ci.status === 'done') counts[ci.challenge_id] = (counts[ci.challenge_id] ?? 0) + 1;
    }
    setDoneCounts(counts);
  }, [user, filter, today]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const respond = async (requestId: string, decision: 'accepted' | 'rejected') => {
    try {
      await invokeChallengeAction('respond_companion_request', { request_id: requestId, decision });
      await load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const openChallenge = (id: string) => router.push(`/challenge/${id}`);

  const listHeader = (
    <>
      <View style={styles.filters}>
        {(['live', 'past'] as Filter[]).map((f) => (
          <Pressable
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => setFilter(f)}>
            <Text style={filter === f ? styles.chipTextActive : styles.chipText}>
              {f === 'live' ? 'Live' : 'Past'}
            </Text>
          </Pressable>
        ))}
      </View>

      {requests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Companion Requests</Text>
          {requests.map((r) => (
            <CompanionRequestCard
              key={r.id}
              challengerName={
                challengerNames[r.challenges.challenger_id] ?? 'Unknown'
              }
              challenge={r.challenges}
              onAccept={() => respond(r.id, 'accepted')}
              onReject={() => respond(r.id, 'rejected')}
            />
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>
        {filter === 'live' ? 'Ongoing Challenges' : 'Past Challenges'}
      </Text>
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={listHeader}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No {filter} companion challenges.</Text>
        }
        renderItem={({ item }) => {
          const totalDays = Math.max(
            1,
            Math.ceil(
              (new Date(item.end_date).getTime() - new Date(item.start_date).getTime()) /
                86400000,
            ) + 1,
          );
          const todayCheckIn = checkIns[item.id] ?? null;
          const cardStatus = deriveCardStatus({
            challenge: item,
            todayCheckIn,
            role: 'companion',
            hasPendingProof: todayCheckIn?.status === 'pending_validation',
          });
          return (
            <CompanionChallengeCard
              challenge={item}
              challengerName={challengerNames[item.challenger_id] ?? 'Unknown'}
              cardStatus={cardStatus}
              todayCheckIn={todayCheckIn}
              doneCount={doneCounts[item.id] ?? 0}
              totalDays={totalDays}
              onPress={() => openChallenge(item.id)}
              onCta={() => openChallenge(item.id)}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  filters: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
  },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { color: '#374151' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  section: { paddingHorizontal: 12, marginBottom: 8 },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  list: { paddingHorizontal: 12, paddingBottom: 24 },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 24 },
});
