import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChallengeCard } from '@/src/components/ChallengeCard';
import { ChallengerEmptyState } from '@/src/components/ChallengerEmptyState';
import { useFocusData } from '@/src/hooks/useFocusData';
import { deriveCardStatus, isActiveChallenge } from '@/src/lib/card-status';
import { fetchChallengesTabData } from '@/src/lib/challenges-tab-data';
import type { Challenge } from '@/src/lib/types';
import { useAuth } from '@/src/context/AuthContext';
import { colors, spacing } from '@/src/theme';
import { AppText, Button, Screen, ScreenHeader, SegmentedControl } from '@/src/ui';

type Filter = 'active' | 'past';

function challengeTotalDays(item: Challenge): number {
  return Math.max(
    1,
    Math.ceil(
      (new Date(item.end_date).getTime() - new Date(item.start_date).getTime()) / 86400000,
    ) + 1,
  );
}

export default function ChallengesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('active');
  const [refreshing, setRefreshing] = useState(false);

  const fetcher = useCallback(async () => {
    if (!user) return { challenges: [], checkIns: {}, doneCounts: {} };
    return fetchChallengesTabData(user.id);
  }, [user]);

  const { data, loading, refresh } = useFocusData(
    `challenges:${user?.id ?? ''}`,
    fetcher,
    [user?.id],
  );

  const filteredChallenges = useMemo(() => {
    const all = data?.challenges ?? [];
    return all.filter((c) =>
      filter === 'active' ? isActiveChallenge(c.status) : !isActiveChallenge(c.status),
    );
  }, [data?.challenges, filter]);

  const checkIns = data?.checkIns ?? {};
  const doneCounts = data?.doneCounts ?? {};

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const showEmpty = !loading && filteredChallenges.length === 0;

  return (
    <Screen>
      <ScreenHeader>
        <AppText variant="displayMedium" style={styles.headline}>
          Your goals
        </AppText>
        <AppText variant="body" color={colors.textSecondary}>
          Big goals. Small steps. Show up daily.
        </AppText>
      </ScreenHeader>

      <View style={styles.toolbar}>
        <View style={styles.segment}>
          <SegmentedControl
            options={[
              { key: 'active', label: 'Active' },
              { key: 'past', label: 'Past' },
            ]}
            value={filter}
            onChange={(k) => setFilter(k as Filter)}
          />
        </View>
        <Button
          title="New"
          variant="secondary"
          onPress={() => router.push('/challenge/create')}
          style={styles.newBtn}
        />
      </View>

      {loading && filteredChallenges.length === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredChallenges}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          contentContainerStyle={[
            styles.list,
            showEmpty && styles.listEmpty,
          ]}
          ListEmptyComponent={
            showEmpty ? (
              <ChallengerEmptyState
                variant={filter === 'active' ? 'active' : 'past'}
                onCreateGoal={
                  filter === 'active' ? () => router.push('/challenge/create') : undefined
                }
              />
            ) : null
          }
          renderItem={({ item }) => {
            const totalDays = challengeTotalDays(item);
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
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headline: { marginBottom: spacing[1] },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
    minHeight: 48,
  },
  segment: { flex: 1 },
  newBtn: { minHeight: 40, paddingHorizontal: spacing[4], flexShrink: 0 },
  list: { paddingBottom: spacing[8] },
  listEmpty: { flexGrow: 1, justifyContent: 'center' },
  loader: { flex: 1, alignItems: 'center', paddingTop: spacing[10] },
});
