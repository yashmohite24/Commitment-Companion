import { StyleSheet, View } from 'react-native';
import { colors, radius } from '@/src/theme';
import { AppText } from './AppText';

interface Props {
  percent: number;
  dayLabel?: string;
}

export function ProgressTrail({ percent, dayLabel }: Props) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <View>
      {dayLabel ? (
        <AppText variant="caption" color={colors.textMuted} style={styles.dayLabel}>
          {dayLabel}
        </AppText>
      ) : null}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamped}%` }]} />
      </View>
      <AppText variant="caption" color={colors.textMuted} style={styles.pct}>
        {clamped}% along the way
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  dayLabel: { marginBottom: 6 },
  track: {
    height: 8,
    backgroundColor: colors.surfaceTint,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  pct: { marginTop: 4 },
});
