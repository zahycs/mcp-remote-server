/**
 * Main theme configuration file
 * 
 * This file exports the complete theme object that combines all theme elements:
 * colors, typography, spacing, etc.
 */

import { colors } from './colors';
import { typography, typeScale } from './typography';
import { ViewStyle } from 'react-native';

// Spacing system in pixels
const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// Border radius values
const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999, // For circular elements
} as const;

// Shadow styles
interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

const shadows: Record<string, ShadowStyle> = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};

// Z-index values for stacking elements
const zIndex = {
  background: -1,
  default: 0,
  headerContent: 5,
  header: 10,
  modal: 20,
  toast: 30,
  tooltip: 40,
  overlay: 50,
} as const;

// Opacity values
const opacity = {
  none: 0,
  light: 0.2,
  medium: 0.5,
  high: 0.8,
  full: 1,
} as const;

// Layout constants
const layout = {
  screenPadding: spacing.md,
  headerHeight: 56,
  tabBarHeight: 64,
  maxContentWidth: 680, // Maximum width for content on large screens
} as const;

// Animation timing constants
const animation = {
  durationShort: 150,
  durationMedium: 300,
  durationLong: 500,
  easingDefault: 'ease',
  easingAccelerate: 'ease-in',
  easingDecelerate: 'ease-out',
} as const;

// Screen size breakpoints
const breakpoints = {
  xs: 0,     // Extra small devices
  sm: 375,   // Small devices (phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (laptops/desktops)
  xl: 1280,  // Extra large devices (large desktops)
} as const;

// Export the complete theme object
const theme = {
  colors,
  typography,
  typeScale,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  opacity,
  layout,
  animation,
  breakpoints,
} as const;

export type Theme = typeof theme;
export type SpacingKey = keyof typeof spacing;
export type BorderRadiusKey = keyof typeof borderRadius;
export type ShadowKey = keyof typeof shadows;
export type ZIndexKey = keyof typeof zIndex;
export type OpacityKey = keyof typeof opacity;
export type BreakpointKey = keyof typeof breakpoints;

export default theme;
