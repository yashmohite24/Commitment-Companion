import { useCallback, useEffect, useRef, useState } from 'react';
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
import { invokeChallengeAction } from '@/src/lib/challenge-actions';
import { formatDisplayDate, formatDisplayDateTime } from '@/src/lib/challenge-display';
import { signedProofUrlsByProofId, shouldRenderAsImage } from '@/src/lib/proof-media';
import { supabase } from '@/src/lib/supabase';
import type { DailyCheckInStatus } from '@/src/lib/types';
import { useAuth } from '@/src/context/AuthContext';

interface FeedItem {
  id: string;
  type: 'proof' | 'log' | 'system';
  message: string;
  createdAt: string;
  proofId?: string;
  outcome?: string;
  mediaUrls?: string[];
  storagePaths?: string[];
  checkInDate?: string;
  checkInStatus?: DailyCheckInStatus;
  approvalCount?: number;
  totalCompanions?: number;
  userDecision?: 'accepted' | 'rejected' | null;
  canVerify?: boolean;
  isPendingHighlight?: boolean;
}

interface LoadOptions {
  silent?: boolean;
}

interface ApproveProofResult {
  ok: boolean;
  pending?: boolean;
  resolved?: boolean;
  check_in_status?: DailyCheckInStatus;
}

interface Props {
  challengeId: string;
  isCompanion: boolean;
  timezone?: string;
  onProofDecision?: () => void;
  /** Hide inline verify actions when shown in PendingProofVerification card */
  hidePendingActions?: boolean;
}

const mediaWidth = Math.min(Dimensions.get('window').width - 72, 280);

export function ActivityFeed({
  challengeId,
  isCompanion,
  timezone,
  onProofDecision,
  hidePendingActions = false,
}: Props) {
  const { user } = useAuth();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [fullscreenUri, setFullscreenUri] = useState<string | null>(null);
  const [submittingProofId, setSubmittingProofId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const mediaUrlCache = useRef<Record<string, string[]>>({});

  const load = useCallback(
    async (options?: LoadOptions) => {
      if (!user) return;
      if (!options?.silent) setLoading(true);
      setUrlError(null);

      const [
        { data: logs },
        { data: systems },
        { data: checkIns },
        { count: companionCount },
      ] = await Promise.all([
        supabase
          .from('check_in_logs')
          .select('id, message, outcome, created_at')
          .eq('challenge_id', challengeId)
          .order('created_at', { ascending: false }),
        supabase
          .from('system_messages')
          .select('id, message, created_at')
          .eq('challenge_id', challengeId)
          .order('created_at', { ascending: false }),
        supabase
          .from('daily_check_ins')
          .select('id, check_in_date, status')
          .eq('challenge_id', challengeId),
        supabase
          .from('challenge_participations')
          .select('id', { count: 'exact', head: true })
          .eq('challenge_id', challengeId)
          .eq('status', 'active'),
      ]);

      const checkInById = new Map(
        (checkIns ?? []).map((c) => [
          c.id,
          c as { id: string; check_in_date: string; status: DailyCheckInStatus },
        ]),
      );
      const checkInIds = [...checkInById.keys()];
      const totalCompanions = companionCount ?? 0;

      let proofItems: FeedItem[] = [];
      if (checkInIds.length > 0) {
        const { data: proofs } = await supabase
          .from('proof_of_work')
          .select('id, submitted_at, storage_paths, daily_check_in_id')
          .in('daily_check_in_id', checkInIds)
          .is('media_deleted_at', null)
          .order('submitted_at', { ascending: false });

        const proofIds = (proofs ?? []).map((p) => p.id);
        const approvalsByProof = new Map<
          string,
          { companion_user_id: string; decision: string }[]
        >();

        if (proofIds.length > 0) {
          const { data: approvals } = await supabase
            .from('approvals')
            .select('proof_of_work_id, companion_user_id, decision')
            .in('proof_of_work_id', proofIds);

          for (const row of approvals ?? []) {
            const list = approvalsByProof.get(row.proof_of_work_id) ?? [];
            list.push(row);
            approvalsByProof.set(row.proof_of_work_id, list);
          }
        }

        const storagePathsByProofId: Record<string, string[]> = {};

        proofItems = (proofs ?? []).map((p) => {
          const checkIn = checkInById.get(p.daily_check_in_id);
          const checkInStatus = checkIn?.status;
          const approvals = approvalsByProof.get(p.id) ?? [];
          const approvalCount = approvals.length;
          const userVote = approvals.find((a) => a.companion_user_id === user.id);
          const userDecision =
            userVote?.decision === 'accepted' || userVote?.decision === 'rejected'
              ? userVote.decision
              : null;
          const showActions =
            isCompanion &&
            checkInStatus === 'pending_validation' &&
            !userDecision &&
            !hidePendingActions;

          storagePathsByProofId[p.id] = p.storage_paths ?? [];

          return {
            id: p.id,
            type: 'proof' as const,
            message: `Proof submitted (${p.storage_paths.length} file(s))`,
            createdAt: p.submitted_at,
            proofId: p.id,
            mediaUrls: mediaUrlCache.current[p.id] ?? [],
            storagePaths: p.storage_paths,
            checkInDate: checkIn?.check_in_date,
            checkInStatus,
            approvalCount,
            totalCompanions,
            userDecision,
            canVerify: showActions,
            isPendingHighlight: checkInStatus === 'pending_validation',
          };
        });

        const missingProofIds = proofItems
          .filter((p) => !(mediaUrlCache.current[p.id]?.length > 0))
          .map((p) => p.id);

        if (missingProofIds.length > 0) {
          const { urlsByProofId, error } = await signedProofUrlsByProofId(
            missingProofIds,
            Object.fromEntries(
              missingProofIds.map((id) => [id, storagePathsByProofId[id] ?? []]),
            ),
          );

          if (error && Object.keys(urlsByProofId).length === 0) {
            setUrlError(error);
          }

          mediaUrlCache.current = { ...mediaUrlCache.current, ...urlsByProofId };
        }

        proofItems = proofItems.map((p) => ({
          ...p,
          mediaUrls: mediaUrlCache.current[p.id] ?? p.mediaUrls ?? [],
        }));
      }

      const otherItems: FeedItem[] = [
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
      ];

      const merged = [...proofItems, ...otherItems].sort((a, b) => {
        if (a.isPendingHighlight && !b.isPendingHighlight) return -1;
        if (!a.isPendingHighlight && b.isPendingHighlight) return 1;
        return b.createdAt.localeCompare(a.createdAt);
      });

      setItems(merged);
      if (merged.some((i) => i.isPendingHighlight)) {
        setExpanded(true);
      }
      if (!options?.silent) setLoading(false);
    },
    [challengeId, hidePendingActions, isCompanion, user],
  );

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (proofId: string, decision: 'accepted' | 'rejected') => {
    if (submittingProofId) return;

    setSubmittingProofId(proofId);
    setItems((prev) =>
      prev.map((item) => {
        if (item.proofId !== proofId) return item;
        const alreadyVoted = !!item.userDecision;
        return {
          ...item,
          userDecision: decision,
          canVerify: false,
          approvalCount: alreadyVoted ? item.approvalCount : (item.approvalCount ?? 0) + 1,
          isPendingHighlight: false,
        };
      }),
    );

    try {
      const result = await invokeChallengeAction<ApproveProofResult>('approve_proof', {
        proof_id: proofId,
        decision,
      });

      if (result.resolved) {
        delete mediaUrlCache.current[proofId];
        onProofDecision?.();
      }

      await load({ silent: true });
    } catch (e) {
      await load({ silent: true });
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    } finally {
      setSubmittingProofId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.feed}>
        <View style={styles.header}>
          <Text style={styles.feedTitle}>Activity</Text>
        </View>
        <ActivityIndicator style={styles.loader} />
      </View>
    );
  }

  const countLabel =
    items.length === 0
      ? 'No entries'
      : items.length === 1
        ? '1 entry'
        : `${items.length} entries`;

  return (
    <View style={styles.feed}>
      <Pressable
        style={styles.header}
        onPress={() => setExpanded((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`Activity, ${countLabel}. ${expanded ? 'Collapse' : 'Expand'}`}>
        <Text style={styles.feedTitle}>Activity</Text>
        <View style={styles.headerRight}>
          <Text style={styles.countLabel}>{countLabel}</Text>
          <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </Pressable>

      {expanded && (
        <View style={styles.feedBody}>
          {urlError ? <Text style={styles.urlError}>{urlError}</Text> : null}
          {items.length === 0 && <Text style={styles.empty}>No activity yet.</Text>}
          {items.map((item) => (
            <View
              key={`${item.type}-${item.id}`}
              style={[styles.item, item.isPendingHighlight && styles.itemPending]}>
              <Text style={styles.time}>{formatDisplayDateTime(item.createdAt, timezone)}</Text>
              <Text style={styles.msg}>{item.message}</Text>
              {item.checkInDate && (
                <Text style={styles.meta}>
                  Check-in day: {formatDisplayDate(item.checkInDate)}
                  {item.checkInStatus === 'pending_validation' ? ' · Pending verification' : ''}
                </Text>
              )}
              {item.type === 'proof' && item.totalCompanions != null && item.totalCompanions > 0 && (
                <Text style={styles.meta}>
                  Responses: {item.approvalCount ?? 0}/{item.totalCompanions}
                </Text>
              )}
              {item.type === 'proof' && (item.storagePaths?.length ?? 0) > 0 && (
                <View style={styles.mediaRow}>
                  {item.mediaUrls && item.mediaUrls.length > 0 ? (
                    item.mediaUrls.map((url, idx) => {
                      const path = item.storagePaths?.[idx] ?? '';
                      if (shouldRenderAsImage(path)) {
                        return (
                          <Pressable key={`${item.id}-${idx}`} onPress={() => setFullscreenUri(url)}>
                            <Image
                              source={{ uri: url }}
                              style={styles.mediaImage}
                              resizeMode="cover"
                            />
                          </Pressable>
                        );
                      }
                      return null;
                    })
                  ) : (
                    <View>
                      <Text style={styles.previewError}>
                        Preview unavailable.{urlError ? ` ${urlError}` : ''}
                      </Text>
                      <Pressable style={styles.retryBtn} onPress={() => load()}>
                        <Text style={styles.retryText}>Retry preview</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}
              {item.type === 'proof' && item.userDecision && (
                <Text style={styles.voted}>
                  You {item.userDecision === 'accepted' ? 'accepted' : 'rejected'} this proof
                </Text>
              )}
              {item.type === 'proof' && item.canVerify && item.proofId && (
                <View style={styles.actions}>
                  <Pressable
                    style={[
                      styles.btn,
                      styles.accept,
                      submittingProofId === item.proofId && styles.btnDisabled,
                    ]}
                    disabled={submittingProofId === item.proofId}
                    onPress={() => approve(item.proofId!, 'accepted')}>
                    {submittingProofId === item.proofId ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.btnText}>Accept</Text>
                    )}
                  </Pressable>
                  <Pressable
                    style={[
                      styles.btn,
                      styles.reject,
                      submittingProofId === item.proofId && styles.btnDisabled,
                    ]}
                    disabled={submittingProofId === item.proofId}
                    onPress={() => approve(item.proofId!, 'rejected')}>
                    {submittingProofId === item.proofId ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.btnText}>Reject</Text>
                    )}
                  </Pressable>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
      <ProofImageViewer uri={fullscreenUri} onClose={() => setFullscreenUri(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  feed: {
    marginHorizontal: 12,
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  feedTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  countLabel: { fontSize: 13, color: '#6b7280' },
  chevron: { fontSize: 12, color: '#6b7280' },
  feedBody: { padding: 12, paddingTop: 4 },
  urlError: { fontSize: 12, color: '#b45309', marginBottom: 8 },
  loader: { margin: 16 },
  empty: { color: '#6b7280', textAlign: 'center', marginTop: 8 },
  item: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemPending: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  time: { fontSize: 11, color: '#9ca3af' },
  msg: { fontSize: 14, marginTop: 4, fontWeight: '500' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  mediaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  mediaImage: {
    width: mediaWidth,
    height: Math.round(mediaWidth * 0.72),
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  previewError: { fontSize: 12, color: '#b45309', marginTop: 8 },
  retryBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fef3c7',
    borderRadius: 6,
  },
  retryText: { fontSize: 12, color: '#92400e', fontWeight: '600' },
  voted: { fontSize: 13, color: '#374151', marginTop: 8, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  btn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, flex: 1, alignItems: 'center' },
  btnDisabled: { opacity: 0.7 },
  accept: { backgroundColor: '#15803d' },
  reject: { backgroundColor: '#b91c1c' },
  btnText: { color: '#fff', fontWeight: '600' },
});
