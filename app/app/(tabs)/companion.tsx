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
import { ChallengeCard } from '@/src/components/ChallengeCard';
import { deriveCardStatus, isActiveChallenge } from '@/src/lib/card-status';
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

export default function CompanionScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('live');
  const [requests, setRequests] = useState<CompanionRequest[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
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
    setRequests((reqData ?? []) as CompanionRequest[]);

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

  return (
    <View style={styles.container}>
      {requests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Companion Requests</Text>
          {requests.map((r) => (
            <View key={r.id} style={styles.reqCard}>
              <Text style={styles.reqName}>{r.challenges.name}</Text>
              <Text style={styles.reqMeta}>Wager: {r.challenges.wager}</Text>
              <View style={styles.row}>
                <Pressable style={styles.accept} onPress={() => respond(r.id, 'accepted')}>
                  <Text style={styles.btnText}>Accept</Text>
                </Pressable>
                <Pressable style={styles.reject} onPress={() => respond(r.id, 'rejected')}>
                  <Text style={styles.btnText}>Reject</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

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

      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No {filter} companion challenges.</Text>}
        renderItem={({ item }) => {
          const totalDays = Math.max(
            1,
            Math.ceil(
              (new Date(item.end_date).getTime() - new Date(item.start_date).getTime()) /
                86400000,
            ) + 1,
          );
          const cardStatus = deriveCardStatus({
            challenge: item,
            todayCheckIn: checkIns[item.id] ?? null,
            role: 'companion',
            hasPendingProof: checkIns[item.id]?.status === 'pending_validation',
          });
          return (
            <ChallengeCard
              challenge={item}
              cardStatus={cardStatus}
              doneCount={doneCounts[item.id] ?? 0}
              totalDays={totalDays}
              onPress={() => router.push(`/challenge/${item.id}`)}
              onCta={() => router.push(`/challenge/${item.id}`)}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  section: { padding: 12, backgroundColor: '#fff', marginBottom: 8 },
  sectionTitle: { fontWeight: '700', fontSize: 16, marginBottom: 8 },
  reqCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  reqName: { fontWeight: '600', fontSize: 16 },
  reqMeta: { color: '#6b7280', marginVertical: 4 },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  accept: { backgroundColor: '#15803d', padding: 8, borderRadius: 6, flex: 1, alignItems: 'center' },
  reject: { backgroundColor: '#b91c1c', padding: 8, borderRadius: 6, flex: 1, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
  filters: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: '#fff' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#e5e7eb' },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { color: '#374151' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  list: { padding: 12 },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 24 },
});
