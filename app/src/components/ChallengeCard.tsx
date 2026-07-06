import { StyleSheet, Text, View } from 'react-native';
import type { Challenge } from '@/src/lib/types';
import { progressPercent } from '@/src/lib/card-status';
import type { CardStatus } from '@/src/lib/card-status';

interface Props {
  challenge: Challenge;
  cardStatus: CardStatus;
  doneCount: number;
  totalDays: number;
  onPress: () => void;
  onCta?: () => void;
}

export function ChallengeCard({
  challenge,
  cardStatus,
  doneCount,
  totalDays,
  onPress,
  onCta,
}: Props) {
  const pct = progressPercent(doneCount, totalDays);
  const livesLabel =
    challenge.lives_total > 0
      ? `${challenge.lives_total - challenge.lives_consumed}/${challenge.lives_total} lives`
      : null;

  return (
    <View style={styles.card}>
      <Text style={styles.name} onPress={onPress}>
        {challenge.name}
      </Text>
      <Text style={styles.meta}>{challenge.start_date} → {challenge.end_date}</Text>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.pct}>{pct}% complete</Text>
      {livesLabel && <Text style={styles.lives}>{livesLabel}</Text>}
      <Text style={[styles.status, toneStyle(cardStatus.tone)]}>{cardStatus.label}</Text>
      {cardStatus.cta && onCta && (
        <Text style={styles.cta} onPress={onCta}>
          {cardStatus.cta}
        </Text>
      )}
    </View>
  );
}

function toneStyle(tone: CardStatus['tone']) {
  switch (tone) {
    case 'success':
      return { color: '#15803d' };
    case 'warning':
      return { color: '#b45309' };
    case 'error':
      return { color: '#b91c1c' };
    default:
      return { color: '#374151' };
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  name: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  meta: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  barBg: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: '#2563eb' },
  pct: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  lives: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  status: { fontSize: 14, marginTop: 8, fontWeight: '500' },
  cta: {
    marginTop: 10,
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 15,
  },
});
