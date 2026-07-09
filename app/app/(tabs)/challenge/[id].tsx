import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ChallengerProofPreview } from '@/src/components/ChallengerProofPreview';
import { ActivityFeed } from '@/src/components/ActivityFeed';
import { PendingProofVerification } from '@/src/components/PendingProofVerification';
import { ChallengeDetails } from '@/src/components/ChallengeDetails';
import { challengeDurationDays } from '@/src/lib/challenge-display';
import { deriveCardStatus } from '@/src/lib/card-status';
import { todayInTimezone } from '@/src/lib/challenge-time';
import { invokeChallengeAction } from '@/src/lib/challenge-actions';
import { pickAndUploadCheckIn, pickAndUploadWager } from '@/src/lib/upload';
import { supabase } from '@/src/lib/supabase';
import type { Challenge, DailyCheckIn } from '@/src/lib/types';
import { useAuth } from '@/src/context/AuthContext';
import { colors, spacing } from '@/src/theme';
import {
  AppText,
  Button,
  CelebrationOverlay,
  MediaUploadSheet,
  Snackbar,
} from '@/src/ui';

export default function ChallengeOverviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckIn | null>(null);
  const [pendingCheckIn, setPendingCheckIn] = useState<DailyCheckIn | null>(null);
  const [isCompanion, setIsCompanion] = useState(false);
  const [isChallenger, setIsChallenger] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkInDate, setCheckInDate] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [localPreviewUris, setLocalPreviewUris] = useState<string[]>([]);
  const [doneCount, setDoneCount] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationSeen, setCelebrationSeen] = useState(false);

  const load = useCallback(async () => {
    if (!id || !user) return;
    const { data: ch } = await supabase.from('challenges').select('*').eq('id', id).single();
    if (!ch) return;
    setChallenge(ch as Challenge);
    setIsChallenger(ch.challenger_id === user.id);

    const localToday = todayInTimezone(new Date(), ch.timezone);
    setCheckInDate(localToday);

    const { data: part } = await supabase
      .from('challenge_participations')
      .select('id')
      .eq('challenge_id', id)
      .eq('companion_user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
    setIsCompanion(!!part);

    const { data: ci } = await supabase
      .from('daily_check_ins')
      .select('*')
      .eq('challenge_id', id)
      .eq('check_in_date', localToday)
      .maybeSingle();
    setTodayCheckIn((ci as DailyCheckIn) ?? null);

    const { data: pending } = await supabase
      .from('daily_check_ins')
      .select('*')
      .eq('challenge_id', id)
      .eq('status', 'pending_validation')
      .order('check_in_date', { ascending: false })
      .limit(1)
      .maybeSingle();
    setPendingCheckIn((pending as DailyCheckIn) ?? null);

    const { data: doneRows } = await supabase
      .from('daily_check_ins')
      .select('id')
      .eq('challenge_id', id)
      .eq('status', 'done');
    setDoneCount(doneRows?.length ?? 0);
  }, [id, user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    if (!uploadSuccess) return;
    const timer = setTimeout(() => setUploadSuccess(false), 6000);
    return () => clearTimeout(timer);
  }, [uploadSuccess]);

  useEffect(() => {
    if (localPreviewUris.length === 0) return;
    const timer = setTimeout(() => setLocalPreviewUris([]), 30000);
    return () => clearTimeout(timer);
  }, [localPreviewUris]);

  useEffect(() => {
    if (!challenge || celebrationSeen) return;
    if (challenge.status === 'successful') {
      setShowCelebration(true);
      setCelebrationSeen(true);
    }
  }, [challenge, celebrationSeen]);

  if (!challenge) {
    return (
      <View style={styles.loading}>
        <AppText color={colors.textMuted}>Loading your goal…</AppText>
      </View>
    );
  }

  const cardStatus = deriveCardStatus({
    challenge,
    todayCheckIn,
    role: isChallenger ? 'challenger' : 'companion',
    hasPendingProof: !!pendingCheckIn || todayCheckIn?.status === 'pending_validation',
  });

  const totalDays = challengeDurationDays(challenge.start_date, challenge.end_date);

  const handleCheckIn = async () => {
    if (!checkInDate) return;
    setSheetOpen(false);
    setSubmitting(true);
    try {
      const result = await pickAndUploadCheckIn(challenge.id, checkInDate);
      if (!result.ok) {
        if (result.reason === 'cancelled') return;
        Alert.alert('Check-in failed', result.message ?? 'Could not submit proof.');
        return;
      }
      setLocalPreviewUris(result.previewUris);
      setUploadSuccess(true);
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSettleWager = async () => {
    setSubmitting(true);
    try {
      const result = await pickAndUploadWager(challenge.id);
      if (!result.ok) {
        if (result.reason === 'cancelled') return;
        Alert.alert('Upload failed', result.message ?? 'Could not submit settlement proof.');
        return;
      }
      await load();
      Alert.alert('Submitted', 'Settlement proof shared with your companions.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeave = () => {
    Alert.alert(
      'Step back from this challenge?',
      `${challenge.name} won't see you on their companion list anymore. They'll be notified.`,
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Step back',
          style: 'destructive',
          onPress: async () => {
            try {
              await invokeChallengeAction('leave_challenge', { challenge_id: challenge.id });
              router.back();
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
            }
          },
        },
      ],
    );
  };

  const approveWager = async () => {
    const { data: settlement } = await supabase
      .from('wager_settlements')
      .select('id')
      .eq('challenge_id', challenge.id)
      .maybeSingle();
    if (!settlement) {
      Alert.alert('Not yet', 'Your friend has not uploaded settlement proof yet.');
      return;
    }
    try {
      await invokeChallengeAction('approve_wager_settlement', {
        wager_settlement_id: settlement.id,
      });
      await load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    }
  };

  const openCheckIn = () => setSheetOpen(true);

  return (
    <View style={styles.wrap}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Stack.Screen
          options={{
            title: challenge.name,
            headerBackTitle: 'Back',
            headerTintColor: colors.primary,
          }}
        />
        <ChallengeDetails
          challenge={challenge}
          doneCount={doneCount}
          chipLabel={cardStatus.chipLabel}
          chipTone={cardStatus.chipTone}
        />

        <View style={styles.statusBar}>
          <AppText variant="bodyMedium">{cardStatus.label}</AppText>
          {totalDays > 0 ? (
            <AppText variant="caption" color={colors.textMuted}>
              Day {Math.min(doneCount + 1, totalDays)} of {totalDays}
            </AppText>
          ) : null}
        </View>

        <View style={styles.actions}>
          {isChallenger && cardStatus.ctaAction === 'check_in' && (
            <Button
              title={submitting ? 'Uploading…' : 'Check in'}
              onPress={openCheckIn}
              disabled={submitting}
              fullWidth
            />
          )}
          {isChallenger && cardStatus.ctaAction === 'settle_wager' && (
            <Button
              title={submitting ? 'Uploading…' : 'Settle up'}
              onPress={handleSettleWager}
              disabled={submitting}
              fullWidth
            />
          )}
          {isCompanion && challenge.status === 'failed' && (
            <Button title="Confirm settlement" onPress={approveWager} fullWidth />
          )}
          {isCompanion && challenge.status === 'active' && (
            <Button title="Step back" variant="ghost" onPress={handleLeave} fullWidth />
          )}
        </View>

        {isChallenger && todayCheckIn?.status === 'pending_validation' && (
          <ChallengerProofPreview
            dailyCheckInId={todayCheckIn.id}
            checkInDate={todayCheckIn.check_in_date}
            localPreviewUris={localPreviewUris}
            showSuccessBanner={uploadSuccess}
          />
        )}

        {isCompanion && pendingCheckIn && (
          <PendingProofVerification
            challengeId={challenge.id}
            dailyCheckInId={pendingCheckIn.id}
            checkInDate={pendingCheckIn.check_in_date}
            timezone={challenge.timezone}
            onResolved={load}
          />
        )}

        <View style={styles.feedSection}>
          <ActivityFeed
            challengeId={challenge.id}
            isCompanion={isCompanion}
            timezone={challenge.timezone}
            onProofDecision={load}
            hidePendingActions={isCompanion && !!pendingCheckIn}
          />
        </View>
      </ScrollView>

      <MediaUploadSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onUpload={handleCheckIn}
        loading={submitting}
      />
      <CelebrationOverlay
        visible={showCelebration}
        onDismiss={() => setShowCelebration(false)}
      />
      <Snackbar
        visible={uploadSuccess}
        message="Proof shared — your companions will take a look"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { paddingBottom: spacing[8] },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  statusBar: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.surfaceTint,
    gap: spacing[1],
  },
  actions: { paddingHorizontal: spacing[3], paddingTop: spacing[3], gap: spacing[2] },
  feedSection: { minHeight: 120, marginTop: spacing[2] },
});
