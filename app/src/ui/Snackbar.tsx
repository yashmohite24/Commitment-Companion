import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/src/theme';
import { AppText } from './AppText';

interface Props {
  message: string;
  visible: boolean;
}

export function Snackbar({ message, visible }: Props) {
  if (!visible) return null;
  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        <AppText variant="bodyMedium" color={colors.textInverse}>
          {message}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    bottom: spacing[6],
    zIndex: 100,
  },
  bar: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    shadowColor: '#2C2820',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
});
