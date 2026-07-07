import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { invokeChallengeAction } from '@/src/lib/challenge-actions';
import { formatDisplayDateTime } from '@/src/lib/challenge-display';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/context/AuthContext';

interface FeedItem {
  id: string;
  type: 'proof' | 'log' | 'system';
  message: string;
  createdAt: string;
  proofId?: string;
  outcome?: string;
}

interface Props {
  challengeId: string;
  isCompanion: boolean;
}

export function ActivityFeed({ challengeId, isCompanion }: Props) {
  const { user } = useAuth();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: logs } = await supabase
      .from('check_in_logs')
      .select('id, message, outcome, created_at')
      .eq('challenge_id', challengeId)
      .order('created_at', { ascending: false });

    const { data: systems } = await supabase
      .from('system_messages')
      .select('id, message, created_at')
      .eq('challenge_id', challengeId)
      .order('created_at', { ascending: false });

    const { data: checkIns } = await supabase
      .from('daily_check_ins')
      .select('id')
      .eq('challenge_id', challengeId);

    const checkInIds = (checkIns ?? []).map((c) => c.id);
    let proofs: { id: string; submitted_at: string; storage_paths: string[] }[] = [];
    if (checkInIds.length > 0) {
      const { data } = await supabase
        .from('proof_of_work')
        .select('id, submitted_at, storage_paths, daily_check_in_id')
        .in('daily_check_in_id', checkInIds)
        .is('media_deleted_at', null)
        .order('submitted_at', { ascending: false });
      proofs = data ?? [];
    }

    const merged: FeedItem[] = [
      ...(proofs.map((p) => ({
        id: p.id,
        type: 'proof' as const,
        message: `Proof submitted (${p.storage_paths.length} file(s))`,
        createdAt: p.submitted_at,
        proofId: p.id,
      }))),
      ...(logs ?? []).map((l) => ({
        id: l.id,
        type: 'log' as const,
        message: l.message,
        createdAt: l.created_at,
        outcome: l.outcome,
      })),
      ...(systems ?? []).map((s) => ({
        id: s.id,
        type: 'system' as const,
        message: s.message,
        createdAt: s.created_at,
      })),
    ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    setItems(merged);
    setLoading(false);
  }, [challengeId]);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (proofId: string, decision: 'accepted' | 'rejected') => {
    try {
      await invokeChallengeAction('approve_proof', { proof_id: proofId, decision });
      await load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    }
  };

  if (loading) return <ActivityIndicator style={{ margin: 24 }} />;

  return (
    <ScrollView style={styles.feed}>
      {items.length === 0 && (
        <Text style={styles.empty}>No activity yet.</Text>
      )}
      {items.map((item) => (
        <View key={`${item.type}-${item.id}`} style={styles.item}>
          <Text style={styles.time}>{formatDisplayDateTime(item.createdAt)}</Text>
          <Text style={styles.msg}>{item.message}</Text>
          {item.type === 'proof' && isCompanion && item.proofId && (
            <View style={styles.actions}>
              <Pressable
                style={[styles.btn, styles.accept]}
                onPress={() => approve(item.proofId!, 'accepted')}>
                <Text style={styles.btnText}>Accept</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.reject]}
                onPress={() => approve(item.proofId!, 'rejected')}>
                <Text style={styles.btnText}>Reject</Text>
              </Pressable>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  feed: { flex: 1, padding: 16 },
  empty: { color: '#6b7280', textAlign: 'center', marginTop: 24 },
  item: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  time: { fontSize: 11, color: '#9ca3af' },
  msg: { fontSize: 14, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  btn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  accept: { backgroundColor: '#15803d' },
  reject: { backgroundColor: '#b91c1c' },
  btnText: { color: '#fff', fontWeight: '600' },
});
