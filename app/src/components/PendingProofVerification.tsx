import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ProofImageViewer } from '@/src/components/ProofImageViewer';
import { colors } from '@/src/theme';
import { invokeChallengeAction } from '@/src/lib/challenge-actions';
import { formatDisplayDate } from '@/src/lib/challenge-display';
import { signedProofUrlsByProofId, shouldRenderAsImage } from '@/src/lib/proof-media';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/context/AuthContext';

interface Props {
  challengeId: string;
  dailyCheckInId: string;
  checkInDate: string;
  onResolved?: () => void;
}

const mediaWidth = Math.min(Dimensions.get('window').width - 56, 360);

export function PendingProofVerification({
  dailyCheckInId,
  checkInDate,
  onResolved,
}: Props) {
  const { user } = useAuth();
  const [proofId, setProofId] = useState<string | null>(null);
  const [storagePaths, setStoragePaths] = useState<string[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userDecision, setUserDecision] = useState<'accepted' | 'rejected' | null>(null);
  const [fullscreenUri, setFullscreenUri] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setUrlError(null);
    setImageErrors({});

    const { data: proof } = await supabase
      .from('proof_of_work')
      .select('id, storage_paths')
      .eq('daily_check_in_id', dailyCheckInId)
      .is('media_deleted_at', null)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!proof) {
      setProofId(null);
      setStoragePaths([]);
      setMediaUrls([]);
      setLoading(false);
      return;
    }

    setProofId(proof.id);
    setStoragePaths(proof.storage_paths ?? []);

    const { data: vote } = await supabase
      .from('approvals')
      .select('decision')
      .eq('proof_of_work_id', proof.id)
      .eq('companion_user_id', user.id)
      .maybeSingle();

    setUserDecision(
      vote?.decision === 'accepted' || vote?.decision === 'rejected' ? vote.decision : null,
    );

    const { urlsByProofId, error } = await signedProofUrlsByProofId([proof.id], {
      [proof.id]: proof.storage_paths ?? [],
    });

    setMediaUrls(urlsByProofId[proof.id] ?? []);
    if (!urlsByProofId[proof.id]?.length && error) {
      setUrlError(error);
    }

    setLoading(false);
  }, [dailyCheckInId, user]);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (decision: 'accepted' | 'rejected') => {
    if (!proofId || submitting) return;
    setSubmitting(true);
    setUserDecision(decision);
    try {
      await invokeChallengeAction('approve_proof', { proof_id: proofId, decision });
      onResolved?.();
      await load();
    } catch (e) {
      setUserDecision(null);
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to record decision');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Loading proof to verify…</Text>
      </View>
    );
  }

  if (!proofId) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Verification required</Text>
        <Text style={styles.meta}>
          Check-in day {formatDisplayDate(checkInDate)} — waiting for challenger proof.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Verify proof of work</Text>
      <Text style={styles.meta}>
        Check-in day {formatDisplayDate(checkInDate)} · Tap image for fullscreen
      </Text>

      <View style={styles.mediaRow}>
        {mediaUrls.length > 0 ? (
          mediaUrls.map((url, idx) => {
            const path = storagePaths[idx] ?? '';
            if (!shouldRenderAsImage(path)) return null;
            return (
              <Pressable key={`${proofId}-${idx}`} onPress={() => setFullscreenUri(url)}>
                <Image
                  source={{ uri: url }}
                  style={[styles.mediaImage, imageErrors[idx] && styles.mediaImageError]}
                  resizeMode="cover"
                  onError={() => setImageErrors((prev) => ({ ...prev, [idx]: true }))}
                />
                {imageErrors[idx] ? (
                  <Text style={styles.imageErrorText}>Preview failed — tap to open fullscreen</Text>
                ) : null}
              </Pressable>
            );
          })
        ) : (
          <View style={styles.previewErrorBox}>
            <Text style={styles.previewError}>
              {urlError ?? 'Preview unavailable.'}
            </Text>
            <Pressable style={styles.retryBtn} onPress={load}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}
      </View>

      {userDecision ? (
        <Text style={styles.voted}>
          You {userDecision === 'accepted' ? 'accepted' : 'rejected'} this proof
        </Text>
      ) : (
        <View style={styles.actions}>
          <Pressable
            style={[styles.btn, styles.accept, submitting && styles.btnDisabled]}
            disabled={submitting}
            onPress={() => decide('accepted')}>
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}>Accept</Text>
            )}
          </Pressable>
          <Pressable
            style={[styles.btn, styles.reject, submitting && styles.btnDisabled]}
            disabled={submitting}
            onPress={() => decide('rejected')}>
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={[styles.btnText, { color: colors.gentleAlert }]}>Try again</Text>
            )}
          </Pressable>
        </View>
      )}

      <ProofImageViewer uri={fullscreenUri} onClose={() => setFullscreenUri(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 12,
    padding: 14,
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  title: { fontSize: 17, fontWeight: '700', color: '#92400e' },
  meta: { fontSize: 13, color: '#b45309', marginTop: 4, marginBottom: 12 },
  loadingText: { marginTop: 8, fontSize: 13, color: '#6b7280', textAlign: 'center' },
  mediaRow: { gap: 10 },
  mediaImage: {
    width: mediaWidth,
    height: Math.round(mediaWidth * 0.72),
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  mediaImageError: { opacity: 0.4 },
  imageErrorText: { fontSize: 11, color: '#b45309', marginTop: 4 },
  previewErrorBox: { alignItems: 'flex-start', gap: 8 },
  previewError: { fontSize: 13, color: '#b45309' },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fef3c7',
    borderRadius: 6,
  },
  retryText: { color: '#92400e', fontWeight: '600', fontSize: 13 },
  voted: { fontSize: 14, color: '#374151', marginTop: 12, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.7 },
  accept: { backgroundColor: '#15803d' },
  reject: { backgroundColor: colors.gentleAlertMuted, borderWidth: 1.5, borderColor: colors.gentleAlert },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
