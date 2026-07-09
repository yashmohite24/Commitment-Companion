import { TextStyle } from 'react-native';

export const fontFamily = {
  display: 'Manrope_700Bold',
  displayExtra: 'Manrope_800ExtraBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
} as const;

export const textStyles = {
  displayLarge: {
    fontFamily: fontFamily.displayExtra,
    fontSize: fontSize['3xl'],
    lineHeight: 40 * 1.25,
    color: undefined as string | undefined,
  },
  displayMedium: {
    fontFamily: fontFamily.display,
    fontSize: fontSize['2xl'],
    lineHeight: 32 * 1.25,
  },
  heading: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.xl,
    lineHeight: 24 * 1.3,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.lg,
    lineHeight: 20 * 1.4,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    lineHeight: 16 * 1.5,
  },
  bodyMedium: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.base,
    lineHeight: 16 * 1.5,
  },
  caption: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    lineHeight: 14 * 1.5,
  },
  label: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.sm,
    lineHeight: 14 * 1.4,
  },
  chip: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: fontSize.xs,
    lineHeight: 12 * 1.4,
  },
} as const satisfies Record<string, TextStyle>;
