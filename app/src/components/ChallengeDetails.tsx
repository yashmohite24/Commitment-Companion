import { StyleSheet, View } from 'react-native';
import type { Challenge } from '@/src/lib/types';
import { challengeDurationDays, formatDisplayDate } from '@/src/lib/challenge-display';
import { progressPercent } from '@/src/lib/card-status';
import { colors, spacing } from '@/src/theme';
import {
  AppText,
  Card,
  LivesIndicator,
  ProgressTrail,
  StatusChip,
  type ChipTone,
} from '@/src/ui';

interface Props {
  challenge: Challenge;
  doneCount?: number;
  chipLabel?: string;
  chipTone?: ChipTone;
}

export function ChallengeDetails({
  challenge,
  doneCount = 0,
  chipLabel,
  chipTone = 'default',
}: Props) {
  const totalDays = challengeDurationDays(challenge.start_date, challenge.end_date);
  const pct = progressPercent(doneCount, totalDays);
  const currentDay = Math.min(doneCount + 1, totalDays);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <AppText variant="title" style={styles.name}>
          {challenge.name}
        </AppText>
        {chipLabel ? <StatusChip label={chipLabel} tone={chipTone} /> : null}
      </View>
      <AppText variant="caption" color={colors.textMuted} style={styles.meta}>
        {formatDisplayDate(challenge.start_date)} → {formatDisplayDate(challenge.end_date)}
      </AppText>
      <AppText variant="body" color={colors.textSecondary} style={styles.wager}>
        {challenge.wager}
      </AppText>
      {totalDays > 0 ? (
        <ProgressTrail
          percent={pct}
          dayLabel={`Day ${currentDay} of ${totalDays}`}
        />
      ) : null}
      <LivesIndicator
        total={challenge.lives_total}
        consumed={challenge.lives_consumed}
      />
      <AppText variant="caption" color={colors.textMuted} style={styles.deadline}>
        Daily deadline {challenge.daily_deadline_time.slice(0, 5)}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { margin: spacing[3], marginBottom: spacing[2] },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  name: { flex: 1 },
  meta: { marginBottom: spacing[1] },
  wager: { marginBottom: spacing[2] },
  deadline: { marginTop: spacing[2] },
});
