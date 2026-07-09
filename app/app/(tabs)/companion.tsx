import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { CompanionChallengeCard } from '@/src/components/CompanionChallengeCard';
import { CompanionRequestCard } from '@/src/components/CompanionRequestCard';
import { deriveCardStatus, isActiveChallenge } from '@/src/lib/card-status';
import { formatProfileName } from '@/src/lib/challenge-display';
import { indexTodayCheckIns, todayDatesByChallenge } from '@/src/lib/challenge-time';
import { invokeChallengeAction } from '@/src/lib/challenge-actions';
import { supabase } from '@/src/lib/supabase';
import type { Challenge, DailyCheckIn } from '@/src/lib/types';
import { useAuth } from '@/src/context/AuthContext';
import { colors, spacing } from '@/src/theme';
import { AppText, EmptyState, Screen, ScreenHeader, SegmentedControl } from '@/src/ui';

type Filter = 'live' | 'past';

interface CompanionRequest {
  id: string;
  challenge_id: string;
  challenges: Challenge | Challenge[] | null;
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

export default function CompanionScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('live');
  const [requests, setRequests] = useState<Array<CompanionRequest & { challenges: Challenge }>>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengerNames, setChallengerNames] = useState<Record<string, string>>({});
  const [checkIns, setCheckIns] = useState<Record<string, DailyCheckIn>>({});
  const [doneCounts, setDoneCounts] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;

    const { data: reqData } = await supabase
      .from('companion_requests')
      .select('id, challenge_id, challenges(*)')
      .eq('companion_user_id', user.id)
      .eq('status', 'pending');
    const reqList = (reqData ?? [])
      .map((row) => {
        const challenge = unwrapChallenge(row.challenges as Challenge | Challenge[] | null);
        if (!challenge) return null;
        return { ...row, challenges: challenge };
      })
      .filter(Boolean) as Array<CompanionRequest & { challenges: Challenge }>;
    setRequests(reqList);

    const { data: parts } = await supabase
      .from('challenge_participations')
      .select('challenge_id, challenges(*)')
      .eq('companion_user_id', user.id)
      .eq('status', 'active');

    const chList = (parts ?? [])
      .map((p) => unwrapChallenge(p.challenges as Challenge | Challenge[] | null))
      .filter((c): c is Challenge => c != null)
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

    const dateByChallenge = todayDatesByChallenge(chList);
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

  const respond = async (requestId: string, decision: 'accepted' | 'rejected') => {
    try {
      await invokeChallengeAction('respond_companion_request', { request_id: requestId, decision });
      await load();
    } catch (e) {
      Alert.alert("Something didn't go as planned", e instanceof Error ? e.message : 'Please try again');
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
      <ScreenHeader>
        <AppText variant="displayMedium">Supporting your people</AppText>
        <AppText variant="body" color={colors.textSecondary}>
          Cheer them on. Keep them honest — kindly.
        </AppText>
      </ScreenHeader>

      <View style={styles.toolbar}>
        <SegmentedControl
          options={[
            { key: 'live', label: 'Active' },
            { key: 'past', label: 'Your journey' },
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
    <Screen style={styles.screen}>
      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={listHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title={filter === 'live' ? 'No companion challenges yet' : 'No past challenges'}
            message={
              filter === 'live'
                ? 'When a friend invites you, it will show up here.'
                : 'Challenges you supported will appear here when they wrap up.'
            }
          />
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  toolbar: { paddingHorizontal: spacing[4], marginBottom: spacing[3] },
  section: { paddingHorizontal: spacing[4], marginBottom: spacing[2] },
  sectionTitle: { marginBottom: spacing[3], paddingHorizontal: spacing[4] },
  list: { paddingHorizontal: spacing[4], paddingBottom: spacing[8] },
});
