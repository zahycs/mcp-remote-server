/**
 * Type declarations for React Native
 * 
 * This file provides type definitions for React Native components and APIs
 * used in the theme examples. This allows TypeScript to understand React Native
 * types without requiring the full React Native package to be installed.
 */

declare module 'react-native' {
  export interface TextStyle {
    fontFamily?: string;
    fontSize?: number;
    fontStyle?: 'normal' | 'italic';
    fontWeight?: string | number;
    letterSpacing?: number;
    lineHeight?: number;
    textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
    textDecorationLine?: 'none' | 'underline' | 'line-through' | 'underline line-through';
    textDecorationStyle?: 'solid' | 'double' | 'dotted' | 'dashed';
    textDecorationColor?: string;
    textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
    color?: string;
    includeFontPadding?: boolean;
    textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center';
    fontVariant?: string[];
    writingDirection?: 'auto' | 'ltr' | 'rtl';
  }

  export interface ViewStyle {
    backgroundColor?: string;
    borderBottomColor?: string;
    borderBottomEndRadius?: number;
    borderBottomLeftRadius?: number;
    borderBottomRightRadius?: number;
    borderBottomStartRadius?: number;
    borderBottomWidth?: number;
    borderColor?: string;
    borderEndColor?: string;
    borderEndWidth?: number;
    borderLeftColor?: string;
    borderLeftWidth?: number;
    borderRadius?: number;
    borderRightColor?: string;
    borderRightWidth?: number;
    borderStartColor?: string;
    borderStartWidth?: number;
    borderStyle?: 'solid' | 'dotted' | 'dashed';
    borderTopColor?: string;
    borderTopEndRadius?: number;
    borderTopLeftRadius?: number;
    borderTopRightRadius?: number;
    borderTopStartRadius?: number;
    borderTopWidth?: number;
    borderWidth?: number;
    opacity?: number;
    elevation?: number;
    shadowColor?: string;
    shadowOffset?: { width: number; height: number };
    shadowOpacity?: number;
    shadowRadius?: number;
  }

  export const Platform: {
    OS: 'ios' | 'android' | 'web';
    select: <T extends Record<string, any>>(obj: T) => T[keyof T];
  };
}
