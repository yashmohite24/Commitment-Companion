import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/src/theme';
import { AppText } from './AppText';

export type ChipTone = 'pending' | 'review' | 'done' | 'missed' | 'alert' | 'success' | 'default';

interface Props {
  label: string;
  tone?: ChipTone;
  icon?: string;
}

const toneMap: Record<ChipTone, { bg: string; fg: string }> = {
  pending: { bg: colors.celebrationMuted, fg: colors.textSecondary },
  review: { bg: colors.companionMuted, fg: colors.textSecondary },
  done: { bg: colors.successMuted, fg: colors.primary },
  missed: { bg: colors.gentleAlertMuted, fg: colors.gentleAlert },
  alert: { bg: colors.gentleAlertMuted, fg: colors.gentleAlert },
  success: { bg: colors.celebrationMuted, fg: colors.textSecondary },
  default: { bg: colors.surfaceTint, fg: colors.textSecondary },
};

export function StatusChip({ label, tone = 'default', icon }: Props) {
  const t = toneMap[tone];
  return (
    <View style={[styles.chip, { backgroundColor: t.bg }]}>
      {icon ? <AppText variant="chip" style={{ marginRight: 4 }}>{icon}</AppText> : null}
      <AppText variant="chip" color={t.fg}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1] + 2,
    borderRadius: radius.full,
  },
});

interface SegmentedProps {
  options: { key: string; label: string }[];
  value: string;
  onChange: (key: string) => void;
}

export function SegmentedControl({ options, value, onChange }: SegmentedProps) {
  return (
    <View style={segStyles.segmented}>
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            style={[segStyles.segItem, active && segStyles.segActive]}
            onPress={() => onChange(opt.key)}>
            <AppText
              variant="label"
              color={active ? colors.primary : colors.textMuted}>
              {opt.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const segStyles = StyleSheet.create({
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceTint,
    borderRadius: radius.full,
    padding: 4,
    flex: 1,
  },
  segItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[2] + 2,
    borderRadius: radius.full,
  },
  segActive: {
    backgroundColor: colors.surface,
    shadowColor: '#2C2820',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
});
