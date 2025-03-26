/**
 * Typography styles for the application
 * 
 * This file defines all typography styles used throughout the app.
 * It establishes a consistent type system with predefined text styles.
 */

import { Platform, TextStyle } from 'react-native';
import { colors } from './colors';

// Font family definitions
const fontFamily = {
  // Primary font
  regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
  medium: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
  semiBold: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
  bold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
  
  // Monospace font for code or technical content
  mono: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
} as const;

// Font size scale (in pixels)
const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  xxxxl: 32,
  display: 40,
  jumbo: 48,
} as const;

// Line height scale (multiplier of font size)
const lineHeightMultiplier = {
  tight: 1.2,    // For headings
  normal: 1.4,   // For body text
  relaxed: 1.6,  // For readable paragraphs
} as const;

// Calculate line heights based on font sizes
const lineHeight = {
  xs: Math.round(fontSize.xs * lineHeightMultiplier.normal),
  sm: Math.round(fontSize.sm * lineHeightMultiplier.normal),
  md: Math.round(fontSize.md * lineHeightMultiplier.normal),
  lg: Math.round(fontSize.lg * lineHeightMultiplier.normal),
  xl: Math.round(fontSize.xl * lineHeightMultiplier.normal),
  xxl: Math.round(fontSize.xxl * lineHeightMultiplier.tight),
  xxxl: Math.round(fontSize.xxxl * lineHeightMultiplier.tight),
  xxxxl: Math.round(fontSize.xxxxl * lineHeightMultiplier.tight),
  display: Math.round(fontSize.display * lineHeightMultiplier.tight),
  jumbo: Math.round(fontSize.jumbo * lineHeightMultiplier.tight),
} as const;

// Font weight definitions
const fontWeight = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
} as const;

// Letter spacing (tracking)
const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  extraWide: 1,
} as const;

// Text transform options
const textTransform = {
  none: 'none',
  capitalize: 'capitalize',
  uppercase: 'uppercase',
  lowercase: 'lowercase',
} as const;

// Predefined typography styles
export const typography: Record<string, TextStyle> = {
  // Headings
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxxl,
    lineHeight: lineHeight.xxxxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxl,
    lineHeight: lineHeight.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    lineHeight: lineHeight.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: letterSpacing.tight,
  },
  h4: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    fontWeight: fontWeight.semiBold,
    color: colors.textPrimary,
    letterSpacing: letterSpacing.normal,
  },
  h5: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    fontWeight: fontWeight.semiBold,
    color: colors.textPrimary,
    letterSpacing: letterSpacing.normal,
  },
  h6: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    letterSpacing: letterSpacing.normal,
  },
  
  // Body text
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    fontWeight: fontWeight.regular,
    color: colors.textPrimary,
    letterSpacing: letterSpacing.normal,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    fontWeight: fontWeight.regular,
    color: colors.textPrimary,
    letterSpacing: letterSpacing.normal,
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    letterSpacing: letterSpacing.normal,
  },
  
  // Special text styles
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    letterSpacing: letterSpacing.normal,
  },
  button: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.wide,
    textTransform: textTransform.none,
  },
  buttonSmall: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.wide,
    textTransform: textTransform.none,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    letterSpacing: letterSpacing.wide,
  },
  link: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    fontWeight: fontWeight.regular,
    color: colors.link,
    letterSpacing: letterSpacing.normal,
  },
  
  // Display and special cases
  display: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.display,
    lineHeight: lineHeight.display,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: letterSpacing.tight,
  },
  jumbo: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.jumbo,
    lineHeight: lineHeight.jumbo,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: letterSpacing.tight,
  },
  
  // Utility styles
  uppercase: {
    textTransform: textTransform.uppercase,
  },
  capitalize: {
    textTransform: textTransform.capitalize,
  },
  
  // Form elements
  input: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    fontWeight: fontWeight.regular,
    color: colors.textPrimary,
  },
  
  // Code/monospace
  code: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    lineHeight: Math.round(fontSize.sm * 1.5),
    fontWeight: fontWeight.regular,
    color: colors.textPrimary,
    letterSpacing: letterSpacing.tight,
  },
};

// Export raw values for custom use cases
export const typeScale = {
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  letterSpacing,
  textTransform,
} as const;

export type FontFamilyKey = keyof typeof fontFamily;
export type FontSizeKey = keyof typeof fontSize;
export type LineHeightKey = keyof typeof lineHeight;
export type FontWeightKey = keyof typeof fontWeight;
export type LetterSpacingKey = keyof typeof letterSpacing;
export type TextTransformKey = keyof typeof textTransform;
export type TypographyStyleKey = keyof typeof typography;

export default typography;
