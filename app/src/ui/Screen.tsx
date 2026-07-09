import { StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, layout, spacing } from '@/src/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Screen({ children, style }: Props) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
});

export function ScreenHeader({ children }: { children: React.ReactNode }) {
  return <View style={headerStyles.wrap}>{children}</View>;
}

const headerStyles = StyleSheet.create({
  wrap: {
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
  },
});
