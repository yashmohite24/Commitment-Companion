import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ProofImageViewer } from '@/src/components/ProofImageViewer';
import { formatDisplayDate } from '@/src/lib/challenge-display';
import { signedProofUrlsByProofId } from '@/src/lib/proof-media';
import { supabase } from '@/src/lib/supabase';

interface Props {
  dailyCheckInId: string;
  checkInDate: string;
  localPreviewUris?: string[];
  showSuccessBanner?: boolean;
}

const mediaWidth = Math.min(Dimensions.get('window').width - 56, 360);

export function ChallengerProofPreview({
  dailyCheckInId,
  checkInDate,
  localPreviewUris = [],
  showSuccessBanner = false,
}: Props) {
  const [mediaUrls, setMediaUrls] = useState<string[]>(localPreviewUris);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [loading, setLoading] = useState(localPreviewUris.length === 0);
  const [fullscreenUri, setFullscreenUri] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (localPreviewUris.length > 0) {
      setMediaUrls(localPreviewUris);
      setLoading(false);
      return;
    }

    setLoading(true);
    setUrlError(null);

    const { data: proof } = await supabase
      .from('proof_of_work')
      .select('id, storage_paths')
      .eq('daily_check_in_id', dailyCheckInId)
      .is('media_deleted_at', null)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!proof) {
      setMediaUrls([]);
      setLoading(false);
      return;
    }

    const paths = proof.storage_paths ?? [];
    const { urlsByProofId, error } = await signedProofUrlsByProofId(
      [proof.id],
      { [proof.id]: paths },
    );

    setMediaUrls(urlsByProofId[proof.id] ?? []);
    setUrlError(error ?? (urlsByProofId[proof.id]?.length ? null : 'Preview unavailable'));
    setLoading(false);
  }, [dailyCheckInId, localPreviewUris]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator />
      </View>
    );
  }

  if (mediaUrls.length === 0 && !showSuccessBanner) return null;

  return (
    <View style={styles.card}>
      {showSuccessBanner ? (
        <Text style={styles.successBanner}>Upload Successful</Text>
      ) : null}
      <Text style={styles.title}>Your proof of work</Text>
      <Text style={styles.subtitle}>
        Check-in day {formatDisplayDate(checkInDate)} · Pending companion verification
      </Text>

      {mediaUrls.length > 0 ? (
        <View style={styles.mediaRow}>
          {mediaUrls.map((url, idx) => (
            <Pressable key={`${url}-${idx}`} onPress={() => setFullscreenUri(url)}>
              <Image
                source={{ uri: url }}
                style={styles.mediaImage}
                resizeMode="cover"
              />
            </Pressable>
          ))}
        </View>
      ) : urlError ? (
        <View>
          <Text style={styles.previewError}>{urlError}</Text>
          <Pressable style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Retry preview</Text>
          </Pressable>
        </View>
      ) : null}

      {mediaUrls.length > 0 && (
        <Text style={styles.hint}>Tap image for fullscreen</Text>
      )}

      <ProofImageViewer uri={fullscreenUri} onClose={() => setFullscreenUri(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 12,
    padding: 14,
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  successBanner: {
    fontSize: 15,
    fontWeight: '700',
    color: '#15803d',
    marginBottom: 8,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#14532d' },
  subtitle: { fontSize: 13, color: '#166534', marginTop: 4, marginBottom: 10 },
  mediaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mediaImage: {
    width: mediaWidth,
    height: Math.round(mediaWidth * 0.72),
    borderRadius: 8,
    backgroundColor: '#dcfce7',
  },
  previewError: { fontSize: 12, color: '#b45309' },
  retryBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fef3c7',
    borderRadius: 6,
  },
  retryText: { fontSize: 12, color: '#92400e', fontWeight: '600' },
  hint: { fontSize: 12, color: '#166534', marginTop: 8, fontStyle: 'italic' },
});
