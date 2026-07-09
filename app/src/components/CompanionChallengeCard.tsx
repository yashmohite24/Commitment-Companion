import { StyleSheet, View } from 'react-native';
import type { Challenge, DailyCheckIn } from '@/src/lib/types';
import {
  cardBorderAccent,
  progressPercent,
  type CardStatus,
} from '@/src/lib/card-status';
import { formatTimeLeft } from '@/src/lib/challenge-display';
import { colors, spacing } from '@/src/theme';
import {
  AppText,
  Button,
  Card,
  ProgressTrail,
  StatusChip,
} from '@/src/ui';

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
    <Card onPress={onPress} borderAccent={cardBorderAccent(cardStatus.chipTone)}>
      <AppText variant="caption" color={colors.companion} style={styles.challenger}>
        {challengerName}
      </AppText>
      <View style={styles.header}>
        <AppText variant="title">{challenge.name}</AppText>
        <StatusChip label={cardStatus.chipLabel} tone={cardStatus.chipTone} />
      </View>
      <ProgressTrail percent={pct} />
      {timeLeft ? (
        <AppText variant="caption" color={colors.wager} style={styles.timeLeft}>
          Time to review: {timeLeft}
        </AppText>
      ) : null}
      {cardStatus.cta && onCta ? (
        <Button title={cardStatus.cta} onPress={onCta} fullWidth style={styles.cta} />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  challenger: { marginBottom: spacing[1], fontWeight: '600' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  timeLeft: { marginTop: spacing[2], fontWeight: '500' },
  cta: { marginTop: spacing[4] },
});
