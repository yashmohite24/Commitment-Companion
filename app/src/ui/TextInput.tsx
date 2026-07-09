import {
  StyleSheet,
  TextInput as RNTextInput,
  View,
  type TextInputProps as RNProps,
} from 'react-native';
import { colors, radius, spacing } from '@/src/theme';
import { AppText } from './AppText';

interface Props extends RNProps {
  label?: string;
  error?: string;
  hint?: string;
}

export function TextInput({ label, error, hint, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      {label ? (
        <AppText variant="label" color={colors.textMuted} style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <RNTextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...rest}
      />
      {error ? (
        <AppText variant="caption" color={colors.gentleAlert} style={styles.error}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color={colors.textMuted} style={styles.hint}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing[3] },
  label: { marginBottom: spacing[1] },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  inputError: { borderColor: colors.gentleAlert },
  error: { marginTop: spacing[1] },
  hint: { marginTop: spacing[1] },
});
