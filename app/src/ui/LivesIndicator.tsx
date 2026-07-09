import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/src/theme';
import { AppText } from './AppText';

interface Props {
  total: number;
  consumed: number;
}

export function LivesIndicator({ total, consumed }: Props) {
  if (total <= 0) return null;
  const remaining = total - consumed;
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => {
        const available = i < remaining;
        return (
          <AppText
            key={i}
            style={[styles.leaf, !available && styles.leafUsed]}>
            🍃
          </AppText>
        );
      })}
      <AppText variant="caption" color={colors.textMuted} style={styles.label}>
        {remaining} {remaining === 1 ? 'save' : 'saves'} left
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginTop: spacing[2], gap: 2 },
  leaf: { fontSize: 14, opacity: 1 },
  leafUsed: { opacity: 0.35 },
  label: { marginLeft: spacing[2] },
});
