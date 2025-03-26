# Component Design Standards

BluestoneApps follows these standards for designing React Native components.

## Component Structure

### Atomic Design Principles

We use the atomic design methodology to organize components:

- **Atoms**: Smallest, indivisible components (Button, Input, Icon)
- **Molecules**: Groups of atoms that work together (Form Field, Search Bar)
- **Organisms**: Complex components composed of molecules (Header, Footer, Form)
- **Templates**: Page-level component layouts without content
- **Pages/Screens**: Specific instances of templates with real content

### File Organization

```
src/
└── components/
    ├── atoms/
    │   ├── Button/
    │   │   ├── Button.tsx
    │   │   ├── Button.styles.ts
    │   │   └── index.ts
    │   └── ...
    ├── molecules/
    │   ├── FormField/
    │   │   ├── FormField.tsx
    │   │   ├── FormField.styles.ts
    │   │   └── index.ts
    │   └── ...
    └── organisms/
        ├── Header/
        │   ├── Header.tsx
        │   ├── Header.styles.ts
        │   └── index.ts
        └── ...
```

## Component Implementation

### Functional Components with TypeScript

```typescript
// src/components/atoms/Button/Button.tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { styles } from './Button.styles';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
```

### Separated Styles

```typescript
// src/components/atoms/Button/Button.styles.ts
import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

export const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  text: {
    ...typography.button,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});
```

### Index Export File

```typescript
// src/components/atoms/Button/index.ts
export * from './Button';
```

## Component Best Practices

### 1. Props and PropTypes

- Use TypeScript interfaces for prop typing
- Provide default values for optional props
- Document props with JSDoc comments

### 2. Component Composition

- Prefer composition over inheritance
- Use React Children pattern for flexible components
- Design components to be reused and extended

```typescript
// Example of component composition
const Card = ({ children, header }) => (
  <View style={styles.card}>
    {header && <View style={styles.header}>{header}</View>}
    <View style={styles.content}>{children}</View>
  </View>
);
```

### 3. State Management

- Keep component state minimal and focused
- Lift state up when multiple components need access
- Use context for deeply nested component trees
- Consider using custom hooks for complex state logic

### 4. Performance Optimization

- Use React.memo() for pure components
- Implement useCallback() for event handlers
- Utilize useMemo() for expensive calculations
- Employ virtualized lists for long scrolling lists

```typescript
// Performance optimized component
import React, { useCallback, memo } from 'react';

const ListItem = memo(({ item, onSelect }) => {
  const handlePress = useCallback(() => {
    onSelect(item.id);
  }, [item.id, onSelect]);

  return (
    <TouchableOpacity onPress={handlePress}>
      <Text>{item.title}</Text>
    </TouchableOpacity>
  );
});
```

### 5. Accessibility

- Implement proper accessibility props
- Test with screen readers
- Support different text sizes
- Ensure adequate color contrast

### 6. Testing

- Write unit tests for component logic
- Use snapshot testing for UI consistency
- Test user interactions

## Component Documentation

Document components with JSDoc comments:

```typescript
/**
 * Primary button component for user actions.
 * 
 * @example
 * <Button 
 *   title="Sign Up" 
 *   onPress={handleSignUp} 
 *   variant="primary" 
 * />
 */
export const Button: React.FC<ButtonProps> = (/* ... */) => {
  // ...
};
```
