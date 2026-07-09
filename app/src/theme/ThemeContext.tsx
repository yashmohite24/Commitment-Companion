import { createContext, useContext, type ReactNode } from 'react';
import { colors, type Colors } from './colors';
import { spacing, radius, layout } from './spacing';
import { fontFamily, fontSize, textStyles } from './typography';
import { motion } from './motion';

export interface Theme {
  colors: Colors;
  spacing: typeof spacing;
  radius: typeof radius;
  layout: typeof layout;
  fontFamily: typeof fontFamily;
  fontSize: typeof fontSize;
  textStyles: typeof textStyles;
  motion: typeof motion;
}

const theme: Theme = {
  colors,
  spacing,
  radius,
  layout,
  fontFamily,
  fontSize,
  textStyles,
  motion,
};

const ThemeContext = createContext<Theme>(theme);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
