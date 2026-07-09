import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ChallengeCard } from '@/src/components/ChallengeCard';
import { deriveCardStatus, isActiveChallenge } from '@/src/lib/card-status';
import { indexTodayCheckIns, todayDatesByChallenge } from '@/src/lib/challenge-time';
import { supabase } from '@/src/lib/supabase';
import type { Challenge, DailyCheckIn } from '@/src/lib/types';
import { useAuth } from '@/src/context/AuthContext';
import { colors, spacing } from '@/src/theme';
import { AppText, Button, EmptyState, Screen, ScreenHeader, SegmentedControl } from '@/src/ui';

type Filter = 'active' | 'past';

export default function ChallengesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('active');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [checkIns, setCheckIns] = useState<Record<string, DailyCheckIn>>({});
  const [doneCounts, setDoneCounts] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);

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

    const dateByChallenge = todayDatesByChallenge(filtered);
    const uniqueDates = [...new Set(dateByChallenge.values())];

    const { data: todayRows } = await supabase
      .from('daily_check_ins')
      .select('*')
      .in('challenge_id', ids)
      .in('check_in_date', uniqueDates);

    setCheckIns(indexTodayCheckIns((todayRows ?? []) as DailyCheckIn[], dateByChallenge));

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
  }, [user, filter]);

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
    <Screen style={styles.screen}>
      <ScreenHeader>
        <AppText variant="displayMedium" style={styles.headline}>
          Your goals
        </AppText>
        <AppText variant="body" color={colors.textSecondary}>
          Big goals. Small steps. Show up daily.
        </AppText>
      </ScreenHeader>

      <View style={styles.toolbar}>
        <SegmentedControl
          options={[
            { key: 'active', label: 'Active' },
            { key: 'past', label: 'Your journey' },
          ]}
          value={filter}
          onChange={(k) => setFilter(k as Filter)}
        />
        <Button
          title="+ New"
          variant="ghost"
          onPress={() => router.push('/challenge/create')}
          style={styles.newBtn}
        />
      </View>

      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          filter === 'active' ? (
            <EmptyState
              title="Your next big goal starts here"
              message="Pick something that matters. Show up daily — invite people who believe in you."
              actionLabel="Start a goal"
              onAction={() => router.push('/challenge/create')}
            />
          ) : (
            <EmptyState
              title="No past goals yet"
              message="When you complete a goal, it will live here."
            />
          )
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
              currentDay={(doneCounts[item.id] ?? 0) + 1}
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  headline: { marginBottom: spacing[1] },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  newBtn: { minHeight: 40, paddingHorizontal: spacing[3] },
  list: { paddingHorizontal: spacing[4], paddingBottom: spacing[8] },
});
