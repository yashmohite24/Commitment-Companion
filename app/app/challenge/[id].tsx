import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityFeed } from '@/src/components/ActivityFeed';
import { ChallengeDetails } from '@/src/components/ChallengeDetails';
import { deriveCardStatus } from '@/src/lib/card-status';
import { invokeChallengeAction } from '@/src/lib/challenge-actions';
import { pickAndUploadCheckIn, pickAndUploadWager } from '@/src/lib/upload';
import { supabase } from '@/src/lib/supabase';
import type { Challenge, DailyCheckIn } from '@/src/lib/types';
import { useAuth } from '@/src/context/AuthContext';

export default function ChallengeOverviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckIn | null>(null);
  const [isCompanion, setIsCompanion] = useState(false);
  const [isChallenger, setIsChallenger] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const load = useCallback(async () => {
    if (!id || !user) return;
    const { data: ch } = await supabase.from('challenges').select('*').eq('id', id).single();
    if (!ch) return;
    setChallenge(ch as Challenge);
    setIsChallenger(ch.challenger_id === user.id);

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
      .eq('check_in_date', today)
      .maybeSingle();
    setTodayCheckIn((ci as DailyCheckIn) ?? null);
  }, [id, user, today]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!challenge) {
    return <Text style={{ padding: 16 }}>Loading...</Text>;
  }

  const cardStatus = deriveCardStatus({
    challenge,
    todayCheckIn,
    role: isChallenger ? 'challenger' : 'companion',
    hasPendingProof: todayCheckIn?.status === 'pending_validation',
  });

  const handleCheckIn = async () => {
    try {
      await pickAndUploadCheckIn(challenge.id, today);
      await load();
      Alert.alert('Submitted', 'Proof of work submitted for verification.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Upload failed');
    }
  };

  const handleSettleWager = async () => {
    try {
      await pickAndUploadWager(challenge.id);
      await load();
      Alert.alert('Submitted', 'Wager settlement proof submitted.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Upload failed');
    }
  };

  const handleLeave = () => {
    Alert.alert('Leave challenge?', 'You will no longer see this challenge.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
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
    ]);
  };

  const approveWager = async () => {
    const { data: settlement } = await supabase
      .from('wager_settlements')
      .select('id')
      .eq('challenge_id', challenge.id)
      .maybeSingle();
    if (!settlement) {
      Alert.alert('No settlement', 'Challenger has not uploaded settlement proof yet.');
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

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: challenge.name }} />
      <ChallengeDetails challenge={challenge} />
      <Text style={styles.status}>{cardStatus.label}</Text>

      {isChallenger && cardStatus.ctaAction === 'check_in' && (
        <Pressable style={styles.action} onPress={handleCheckIn}>
          <Text style={styles.actionText}>Check In</Text>
        </Pressable>
      )}
      {isChallenger && cardStatus.ctaAction === 'settle_wager' && (
        <Pressable style={styles.action} onPress={handleSettleWager}>
          <Text style={styles.actionText}>Settle Wager</Text>
        </Pressable>
      )}
      {isCompanion && challenge.status === 'failed' && (
        <Pressable style={styles.action} onPress={approveWager}>
          <Text style={styles.actionText}>Approve Wager Settlement</Text>
        </Pressable>
      )}
      {isCompanion && challenge.status === 'active' && (
        <Pressable style={[styles.action, styles.leave]} onPress={handleLeave}>
          <Text style={styles.actionText}>Leave Challenge</Text>
        </Pressable>
      )}

      <ActivityFeed challengeId={challenge.id} isCompanion={isCompanion} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  status: { padding: 12, fontWeight: '500', backgroundColor: '#fff' },
  action: {
    margin: 12,
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  leave: { backgroundColor: '#6b7280' },
  actionText: { color: '#fff', fontWeight: '600' },
});
