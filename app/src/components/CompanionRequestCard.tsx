import { StyleSheet, View } from 'react-native';
import type { Challenge } from '@/src/lib/types';
import { challengeDurationDays, formatDisplayDate } from '@/src/lib/challenge-display';
import { colors, spacing } from '@/src/theme';
import { AppText, Button, Card } from '@/src/ui';

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
    <Card borderAccent={colors.accent}>
      <AppText variant="caption" color={colors.textMuted}>
        INVITATION
      </AppText>
      <AppText variant="title" style={styles.name}>
        {challenge.name}
      </AppText>
      <AppText variant="body" color={colors.textSecondary}>
        From {challengerName}
      </AppText>
      <View style={styles.wagerBox}>
        <AppText variant="caption" color={colors.textMuted}>
          On the line
        </AppText>
        <AppText variant="bodyMedium" color={colors.wager}>
          {challenge.wager}
        </AppText>
      </View>
      <AppText variant="caption" color={colors.textMuted}>
        {formatDisplayDate(challenge.start_date)} → {formatDisplayDate(challenge.end_date)} ·{' '}
        {duration} days
      </AppText>
      <View style={styles.row}>
        <Button title="Accept" onPress={onAccept} style={styles.btn} />
        <Button title="Decline" onPress={onReject} variant="ghost" style={styles.btn} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  name: { marginTop: spacing[1], marginBottom: spacing[1] },
  wagerBox: {
    backgroundColor: colors.celebrationMuted,
    borderRadius: 12,
    padding: spacing[3],
    marginVertical: spacing[3],
  },
  row: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[4] },
  btn: { flex: 1 },
});
