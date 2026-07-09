import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/src/theme';
import { AppText } from './AppText';
import { Button } from './Button';

interface Props {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <AppText style={styles.emoji}>🌱</AppText>
      <AppText variant="title" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="body" color={colors.textSecondary} style={styles.message}>
        {message}
      </AppText>
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} style={styles.btn} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: spacing[10],
    paddingHorizontal: spacing[6],
  },
  emoji: { fontSize: 48, marginBottom: spacing[4] },
  title: { textAlign: 'center', marginBottom: spacing[2] },
  message: { textAlign: 'center', marginBottom: spacing[6] },
  btn: { minWidth: 200 },
});
