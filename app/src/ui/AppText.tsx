import { Text, type TextProps, type TextStyle } from 'react-native';
import { colors, textStyles } from '@/src/theme';

type Variant = keyof typeof textStyles;

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
  children: React.ReactNode;
}

export function AppText({
  variant = 'body',
  color = colors.textPrimary,
  style,
  children,
  ...rest
}: Props) {
  const base = textStyles[variant] as TextStyle;
  return (
    <Text style={[base, { color }, style]} {...rest}>
      {children}
    </Text>
  );
}
