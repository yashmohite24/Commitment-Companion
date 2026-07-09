import { StyleSheet, View } from 'react-native';
import type { Challenge } from '@/src/lib/types';
import { formatDisplayDate } from '@/src/lib/challenge-display';
import { cardBorderAccent, progressPercent, type CardStatus } from '@/src/lib/card-status';
import { colors, spacing } from '@/src/theme';
import {
  AppText,
  Button,
  Card,
  LivesIndicator,
  ProgressTrail,
  StatusChip,
} from '@/src/ui';

interface Props {
  challenge: Challenge;
  cardStatus: CardStatus;
  doneCount: number;
  totalDays: number;
  currentDay?: number;
  onPress: () => void;
  onCta?: () => void;
}

export function ChallengeCard({
  challenge,
  cardStatus,
  doneCount,
  totalDays,
  currentDay,
  onPress,
  onCta,
}: Props) {
  const pct = progressPercent(doneCount, totalDays);
  const day = currentDay ?? Math.min(doneCount + 1, totalDays);
  const dayLabel = `Day ${day} of ${totalDays}`;

  return (
    <Card onPress={onPress} borderAccent={cardBorderAccent(cardStatus.chipTone)}>
      <View style={styles.header}>
        <AppText variant="title" style={styles.name}>
          {challenge.name}
        </AppText>
        <StatusChip label={cardStatus.chipLabel} tone={cardStatus.chipTone} />
      </View>
      <AppText variant="caption" color={colors.textMuted} style={styles.meta}>
        {formatDisplayDate(challenge.start_date)} → {formatDisplayDate(challenge.end_date)}
      </AppText>
      <ProgressTrail percent={pct} dayLabel={dayLabel} />
      {challenge.lives_total > 0 ? (
        <LivesIndicator
          total={challenge.lives_total}
          consumed={challenge.lives_consumed}
        />
      ) : null}
      {cardStatus.cta && onCta ? (
        <Button
          title={cardStatus.cta}
          onPress={onCta}
          fullWidth
          style={styles.cta}
          variant={cardStatus.ctaAction === 'settle_wager' ? 'soft' : 'primary'}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  name: { flex: 1 },
  meta: { marginBottom: spacing[3] },
  cta: { marginTop: spacing[4] },
});
