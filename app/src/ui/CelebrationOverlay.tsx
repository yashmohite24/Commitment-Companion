import { Modal, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/src/theme';
import { AppText } from './AppText';
import { Button } from './Button';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  subtitle?: string;
}

export function CelebrationOverlay({
  visible,
  onDismiss,
  title = 'You showed up!',
  subtitle = 'Goal complete — your consistency paid off.',
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <AppText style={styles.emoji}>✨</AppText>
          <AppText variant="displayMedium" style={styles.title}>
            {title}
          </AppText>
          <AppText variant="body" color={colors.textSecondary} style={styles.sub}>
            {subtitle}
          </AppText>
          <Button title="Celebrate" onPress={onDismiss} fullWidth style={styles.btn} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing[6],
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.celebrationMuted,
  },
  emoji: { fontSize: 48, marginBottom: spacing[3] },
  title: { textAlign: 'center', marginBottom: spacing[2] },
  sub: { textAlign: 'center', lineHeight: 22, marginBottom: spacing[5] },
  btn: { backgroundColor: colors.celebration },
});
