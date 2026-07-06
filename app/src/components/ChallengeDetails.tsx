import { StyleSheet, Text, View } from 'react-native';
import type { Challenge } from '@/src/lib/types';

export function ChallengeDetails({ challenge }: { challenge: Challenge }) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>{challenge.name}</Text>
      <Text style={styles.row}>Wager: {challenge.wager}</Text>
      <Text style={styles.row}>
        {challenge.start_date} → {challenge.end_date}
      </Text>
      <Text style={styles.row}>
        Daily deadline: {challenge.daily_deadline_time.slice(0, 5)}
      </Text>
      {challenge.lives_total > 0 && (
        <Text style={styles.row}>
          Lives: {challenge.lives_total - challenge.lives_consumed} remaining
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  row: { fontSize: 14, color: '#374151', marginBottom: 4 },
});
