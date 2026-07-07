import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Challenge, DailyCheckIn } from '@/src/lib/types';
import { progressPercent, type CardStatus } from '@/src/lib/card-status';
import { formatTimeLeft } from '@/src/lib/challenge-display';

interface Props {
  challenge: Challenge;
  challengerName: string;
  cardStatus: CardStatus;
  todayCheckIn: DailyCheckIn | null;
  doneCount: number;
  totalDays: number;
  onPress: () => void;
  onCta?: () => void;
}

export function CompanionChallengeCard({
  challenge,
  challengerName,
  cardStatus,
  todayCheckIn,
  doneCount,
  totalDays,
  onPress,
  onCta,
}: Props) {
  const pct = progressPercent(doneCount, totalDays);
  const needsVerify =
    todayCheckIn?.status === 'pending_validation' && todayCheckIn.deadline_at;
  const timeLeft = needsVerify ? formatTimeLeft(todayCheckIn!.deadline_at) : null;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.name}>{challenge.name}</Text>
      </View>
      <Text style={styles.challenger}>Challenger: {challengerName}</Text>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.pct}>{pct}% complete</Text>
      <Text style={[styles.status, toneStyle(cardStatus.tone)]}>{cardStatus.label}</Text>
      {timeLeft && (
        <Text style={styles.timeLeft}>Time left to verify: {timeLeft}</Text>
      )}
      {cardStatus.cta && onCta && (
        <Pressable onPress={onCta}>
          <Text style={styles.cta}>{cardStatus.cta}</Text>
        </Pressable>
      )}
    </Pressable>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: 18, fontWeight: '600', flex: 1 },
  challenger: { fontSize: 13, color: '#6b7280', marginTop: 4, marginBottom: 8 },
  barBg: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: '#2563eb' },
  pct: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  status: { fontSize: 14, marginTop: 8, fontWeight: '500' },
  timeLeft: { fontSize: 12, color: '#b45309', marginTop: 4, fontWeight: '500' },
  cta: {
    marginTop: 10,
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 15,
  },
});
