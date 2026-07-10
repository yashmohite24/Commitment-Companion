import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CompanionChallengeCard } from '@/src/components/CompanionChallengeCard';
import { CompanionRequestCard } from '@/src/components/CompanionRequestCard';
import { useFocusData } from '@/src/hooks/useFocusData';
import { deriveCardStatus, isActiveChallenge } from '@/src/lib/card-status';
import { fetchCompanionTabData } from '@/src/lib/companion-tab-data';
import { invokeChallengeAction } from '@/src/lib/challenge-actions';
import type { Challenge } from '@/src/lib/types';
import { useAuth } from '@/src/context/AuthContext';
import { colors, spacing } from '@/src/theme';
import { AppText, EmptyState, Screen, ScreenHeader, SegmentedControl } from '@/src/ui';

type Filter = 'live' | 'past';

function challengeTotalDays(item: Challenge): number {
  return Math.max(
    1,
    Math.ceil(
      (new Date(item.end_date).getTime() - new Date(item.start_date).getTime()) / 86400000,
    ) + 1,
  );
}

export default function CompanionScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('live');
  const [refreshing, setRefreshing] = useState(false);

  const fetcher = useCallback(async () => {
    if (!user) {
      return {
        requests: [],
        challenges: [],
        challengerNames: {},
        checkIns: {},
        doneCounts: {},
      };
    }
    return fetchCompanionTabData(user.id);
  }, [user]);

  const { data, loading, refresh } = useFocusData(
    `companion:${user?.id ?? ''}`,
    fetcher,
    [user?.id],
  );

  const filteredChallenges = useMemo(() => {
    const all = data?.challenges ?? [];
    return all.filter((c) =>
      filter === 'live' ? isActiveChallenge(c.status) : !isActiveChallenge(c.status),
    );
  }, [data?.challenges, filter]);

  const requests = data?.requests ?? [];
  const challengerNames = data?.challengerNames ?? {};
  const checkIns = data?.checkIns ?? {};
  const doneCounts = data?.doneCounts ?? {};

  const respond = async (requestId: string, decision: 'accepted' | 'rejected') => {
    try {
      await invokeChallengeAction('respond_companion_request', { request_id: requestId, decision });
      await refresh();
    } catch (e) {
      Alert.alert("Something didn't go as planned", e instanceof Error ? e.message : 'Please try again');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const openChallenge = (id: string) => router.push(`/challenge/${id}`);

  const showEmpty = !loading && filteredChallenges.length === 0;

  const listHeader = (
    <>
      <ScreenHeader>
        <AppText variant="displayMedium">Companion</AppText>
        <AppText variant="body" color={colors.textSecondary}>
          Cheer them on. Keep them honest — kindly.
        </AppText>
      </ScreenHeader>

      <View style={styles.toolbar}>
        <SegmentedControl
          options={[
            { key: 'live', label: 'Active' },
            { key: 'past', label: 'Past' },
          ]}
          value={filter}
          onChange={(k) => setFilter(k as Filter)}
        />
      </View>

      {requests.length > 0 && (
        <View style={styles.section}>
          <AppText variant="title" style={styles.sectionTitle}>
            Invitations
          </AppText>
          {requests.map((r) => (
            <CompanionRequestCard
              key={r.id}
              challengerName={challengerNames[r.challenges.challenger_id] ?? 'A friend'}
              challenge={r.challenges}
              onAccept={() => respond(r.id, 'accepted')}
              onReject={() => respond(r.id, 'rejected')}
            />
          ))}
        </View>
      )}

      <AppText variant="title" style={styles.sectionTitle}>
        {filter === 'live' ? 'Ongoing' : 'Past challenges'}
      </AppText>
    </>
  );

  return (
    <Screen>
      {loading && !data ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredChallenges}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={listHeader}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            showEmpty ? (
              <EmptyState
                title={filter === 'live' ? 'No companion challenges yet' : 'No past challenges'}
                message={
                  filter === 'live'
                    ? 'When a friend invites you, it will show up here.'
                    : 'Challenges you supported will appear here when they wrap up.'
                }
              />
            ) : null
          }
          renderItem={({ item }) => {
            const totalDays = challengeTotalDays(item);
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
                challengerName={challengerNames[item.challenger_id] ?? 'A friend'}
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
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  toolbar: { marginBottom: spacing[3], minHeight: 48 },
  section: { marginBottom: spacing[2] },
  sectionTitle: { marginBottom: spacing[3] },
  list: { paddingBottom: spacing[8] },
  loader: { flex: 1, alignItems: 'center', paddingTop: spacing[10] },
});
