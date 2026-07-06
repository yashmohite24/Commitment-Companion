import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { ChallengeCard } from '@/src/components/ChallengeCard';
import { deriveCardStatus, isActiveChallenge } from '@/src/lib/card-status';
import { supabase } from '@/src/lib/supabase';
import type { Challenge, DailyCheckIn } from '@/src/lib/types';
import { useAuth } from '@/src/context/AuthContext';

type Filter = 'active' | 'past';

export default function ChallengesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('active');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [checkIns, setCheckIns] = useState<Record<string, DailyCheckIn>>({});
  const [doneCounts, setDoneCounts] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('challenges')
      .select('*')
      .eq('challenger_id', user.id)
      .order('created_at', { ascending: false });
    const all = (data ?? []) as Challenge[];
    const filtered = all.filter((c) =>
      filter === 'active' ? isActiveChallenge(c.status) : !isActiveChallenge(c.status),
    );
    setChallenges(filtered);

    const ids = filtered.map((c) => c.id);
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
    for (const row of todayRows ?? []) {
      map[row.challenge_id] = row as DailyCheckIn;
    }
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

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        {(['active', 'past'] as Filter[]).map((f) => (
          <Pressable
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => setFilter(f)}>
            <Text style={filter === f ? styles.chipTextActive : styles.chipText}>
              {f === 'active' ? 'Active' : 'Past'}
            </Text>
          </Pressable>
        ))}
        <Link href="/challenge/create" asChild>
          <Pressable style={styles.createBtn}>
            <Text style={styles.createText}>+ New</Text>
          </Pressable>
        </Link>
      </View>

      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No {filter} challenges yet.</Text>
        }
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
            role: 'challenger',
          });
          return (
            <ChallengeCard
              challenge={item}
              cardStatus={cardStatus}
              doneCount={doneCounts[item.id] ?? 0}
              totalDays={totalDays}
              onPress={() => router.push(`/challenge/${item.id}`)}
              onCta={() => {
                if (cardStatus.ctaAction === 'edit_draft') {
                  router.push(`/challenge/create?id=${item.id}`);
                } else {
                  router.push(`/challenge/${item.id}`);
                }
              }}
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
    alignItems: 'center',
    padding: 12,
    gap: 8,
    backgroundColor: '#fff',
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
  createBtn: { marginLeft: 'auto', paddingHorizontal: 12, paddingVertical: 6 },
  createText: { color: '#2563eb', fontWeight: '700' },
  list: { padding: 12 },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 40 },
});
