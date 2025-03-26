# React Native Theme System

This directory contains the TypeScript theme files for React Native applications. The theme system provides a consistent design language across the application.

## Standards

- All theme files are written in TypeScript (.ts) for better type safety and developer experience
- Theme files export both the values and TypeScript types for proper type checking
- The theme system is modular and composable, with separate files for different aspects of the design system

## Files

- `colors.ts` - Color palette definitions and utility functions
- `typography.ts` - Typography styles, font families, sizes, and text styles
- `theme.ts` - Main theme configuration that combines all theme elements

## Usage

Import the theme elements in your components:

```tsx
import { colors } from './theme/colors';
import typography from './theme/typography';
import theme from './theme/theme';

// Using colors
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  text: {
    ...typography.body,
    color: colors.textPrimary,
  },
  button: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
});
```

## Type Support

The theme files export TypeScript types to provide autocompletion and type checking:

```tsx
import { ColorKey } from './theme/colors';
import { TypographyStyleKey } from './theme/typography';
import { SpacingKey, BorderRadiusKey } from './theme/theme';

// Type-safe usage
const color: ColorKey = 'primary';
const textStyle: TypographyStyleKey = 'body';
const spacing: SpacingKey = 'md';
```

## Extending the Theme

When extending the theme, follow these guidelines:

1. Add new values to the appropriate theme file
2. Ensure all values are properly typed
3. Use consistent naming conventions
4. Document any complex values or usage patterns
5. Update the theme.ts file if necessary to expose new theme elements

## Migration from JavaScript

This theme system has been migrated from JavaScript to TypeScript. All theme files now use the `.ts` extension and include proper type definitions.
