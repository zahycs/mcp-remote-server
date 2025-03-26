# Component Design Standards

## Overview

This document outlines the standards for designing and implementing React Native components at BluestoneApps. Following these standards ensures that components are reusable, maintainable, and perform well.

## Component Structure

### Functional Components

Use functional components with hooks rather than class components:

```typescript
// ✅ Preferred
const MyComponent: React.FC<MyComponentProps> = ({ prop1, prop2 }) => {
  // Component logic
  return (/* JSX */);
};

// ❌ Avoid
class MyComponent extends React.Component<MyComponentProps> {
  render() {
    return (/* JSX */);
  }
}
```

### Props Interface Declaration

Define props interface above the component:

```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  loading?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ /* props */ }) => {
  // Component implementation
};
```

### Default Props

Handle default values through destructuring with defaults:

```typescript
const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  loading = false,  // Default value
  disabled = false, // Default value
}) => {
  // Implementation
};
```

### Component Organization

Structure components in this order:
1. Imports
2. Interfaces/Types
3. Component declaration
4. Hooks (useState, useEffect, etc.)
5. Helper functions
6. Return statement with JSX
7. Styles
8. Export statement

## Styling Approach

### StyleSheet API

Use React Native's StyleSheet API for performance benefits:

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  text: {
    fontSize: 16,
    color: colors.text,
  },
});
```

### Style Composition

Combine styles with array notation for dynamic styling:

```typescript
<TouchableOpacity
  style={[
    styles.button,
    style,  // Props style overrides
    disabled && styles.disabledButton,  // Conditional styles
  ]}
>
```

### Theme Variables

Use theme constants for colors and spacing to maintain consistency:

```typescript
import { colors } from '../../theme/colors';

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    // Other styles
  },
});
```

### Separate Style Files

For complex components, move styles to a separate file:

```typescript
// LoginScreen.tsx
import styles from './Styles';

// Styles.ts
import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export default StyleSheet.create({
  // Styles here
});
```

## Component Best Practices

### Single Responsibility

Keep components focused on a specific functionality. If a component is doing too much, consider breaking it down into smaller components.

### Component Size

Prefer smaller, more focused components over large ones. This improves readability, testability, and reusability.

### Reusability

Design components to be reusable and configurable through props. Avoid hardcoding values that could be passed as props.

### Conditional Rendering

Use conditional rendering for different component states:

```typescript
{loading ? (
  <ActivityIndicator color="#fff" />
) : (
  <Text style={[styles.text, textStyle]}>{title}</Text>
)}
```

### Event Handling

Pass event handlers from parent to child through props. Keep event handlers close to the component that manages the related state.

### Memoization

Use React.memo for pure components to prevent unnecessary renders:

```typescript
export default React.memo(MyComponent);
```

### Error Handling

Implement error boundaries for component error isolation:

```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <MyComponent />
</ErrorBoundary>
```

### Accessibility

Include proper accessibility props:

```typescript
<TouchableOpacity
  accessibilityLabel={`${title} button`}
  accessibilityRole="button"
  accessibilityHint={`Triggers ${title} action`}
  testID="my-button"
  // Other props
>
```

## Example Component

Here's a complete example of a button component following our standards:

```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  loading = false,
  disabled = false,
  testID = 'button',
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        style,
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityLabel={`${title} button`}
      accessibilityRole="button"
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
```
