import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { colors, layout, radius, spacing } from '@/src/theme';
import { AppText } from './AppText';

type Variant = 'primary' | 'secondary' | 'ghost' | 'soft' | 'danger';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  style,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <AppText
        variant="bodyMedium"
        color={
          variant === 'primary' || variant === 'danger'
            ? colors.textInverse
            : colors.primary
        }
        style={variant === 'soft' ? { color: colors.gentleAlert } : undefined}>
        {title}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.minTouchTarget,
    paddingHorizontal: spacing[6],
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { alignSelf: 'stretch' },
  pressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.45 },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primary },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: { backgroundColor: 'transparent' },
  soft: { backgroundColor: colors.gentleAlertMuted },
  danger: { backgroundColor: colors.logout },
});
