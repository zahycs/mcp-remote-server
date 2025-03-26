/**
 * Application color palette
 * 
 * This file defines all colors used throughout the application.
 * Always use these color constants instead of hardcoded values.
 */
export const colors = {
  // Primary colors
  primary: '#ff0000',
  secondary: '#6032FF',
  tertiary: '#29243F',
  
  // Status colors
  success: '#23AD51',
  warning: '#EF7F18',
  danger: '#E02D47',
  
  // Grayscale
  white: '#FFFFFF',
  light: '#EEF1F7',
  medium: '#747D8B',
  dark: '#2D3035',
  black: '#070707',
  
  // Text colors
  textPrimary: '#2D3035',
  textSecondary: '#747D8B',
  textTertiary: '#A9B1BC',
  textInverse: '#FFFFFF',
  link: '#412DA5',
  
  // UI-specific colors
  headerBg: '#29243F',
  headerFont: '#FFFFFF',
  footerBg: '#FFFFFF',
  footerFont: '#747D8B',
  
  // Component-specific colors
  buttonPrimary: '#412DA5',
  buttonSecondary: '#6032FF',
  inputBorder: '#EEF1F7',
  inputText: '#2D3035',
  inputPlaceholder: '#747D8B',
  
  // Transparent colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  transparent: 'transparent',
} as const;

// Type for color keys, useful for TypeScript autocompletion
export type ColorKey = keyof typeof colors;

/**
 * Get a color with optional opacity
 * @param color The color key from the colors object
 * @param opacity Optional opacity value between 0 and 1
 * @returns The color with applied opacity if specified
 */
export const getColor = (color: ColorKey, opacity?: number): string => {
  const baseColor = colors[color];
  
  if (opacity === undefined || opacity === 1) {
    return baseColor;
  }
  
  // Handle hex colors
  if (baseColor.startsWith('#')) {
    // Convert hex to rgba
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // Handle existing rgba colors
  if (baseColor.startsWith('rgba')) {
    return baseColor.replace(/[\d.]+\)$/g, `${opacity})`);
  }
  
  // Handle rgb colors
  if (baseColor.startsWith('rgb')) {
    return baseColor.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
  }
  
  return baseColor;
};

export default colors;
