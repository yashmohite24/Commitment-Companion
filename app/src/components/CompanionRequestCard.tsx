import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Challenge } from '@/src/lib/types';
import { challengeDurationDays } from '@/src/lib/challenge-display';

interface Props {
  challengerName: string;
  challenge: Challenge;
  onAccept: () => void;
  onReject: () => void;
}

export function CompanionRequestCard({
  challengerName,
  challenge,
  onAccept,
  onReject,
}: Props) {
  const duration = challengeDurationDays(challenge.start_date, challenge.end_date);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Challenger</Text>
      <Text style={styles.value}>{challengerName}</Text>
      <Text style={styles.label}>Challenge</Text>
      <Text style={styles.value}>{challenge.name}</Text>
      <Text style={styles.label}>Wager</Text>
      <Text style={styles.value}>{challenge.wager}</Text>
      <Text style={styles.meta}>
        {challenge.start_date} → {challenge.end_date} · {duration} days
      </Text>
      <View style={styles.row}>
        <Pressable style={styles.accept} onPress={onAccept}>
          <Text style={styles.btnText}>Accept</Text>
        </Pressable>
        <Pressable style={styles.reject} onPress={onReject}>
          <Text style={styles.btnText}>Reject</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  label: { fontSize: 11, color: '#9ca3af', marginTop: 6, textTransform: 'uppercase' },
  value: { fontSize: 15, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 8 },
  row: { flexDirection: 'row', gap: 8, marginTop: 12 },
  accept: {
    backgroundColor: '#15803d',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  reject: {
    backgroundColor: '#b91c1c',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '600' },
});
