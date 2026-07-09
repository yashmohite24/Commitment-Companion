/**
 * Design tokens sourced from Docs/design/tokens.json.
 * Semantic colors are resolved here for runtime use in React Native.
 */
import raw from './tokens.json';

export const tokenMeta = raw.meta;

export const tokenPrimitives = raw.color.primitive;

export const tokenSpacing = raw.spacing as Record<string, number>;

export const tokenRadius = raw.radius as Record<string, number>;

export const tokenTypography = {
  fontFamily: raw.fontFamily,
  fontSize: raw.fontSize,
  fontWeight: raw.fontWeight,
  lineHeight: raw.lineHeight,
};

export const tokenMotion = raw.motion;
