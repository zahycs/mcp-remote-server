# Component Design Standards

BluestoneApps follows these standards for designing React Native components.

## Component Structure

### Flat Component Organization

We use a flat component organization structure with all reusable components placed directly in the components directory:

```
src/
└── components/
    ├── Button.tsx
    ├── ErrorBoundary.tsx
    ├── LoadingSpinner.tsx
    └── UpdateModal.tsx
```

Screen-specific components may be placed within their respective screen directories when they are not meant to be reused across the application.

## Component Implementation

### Functional Components with TypeScript

We use functional components with TypeScript interfaces for props:

```typescript
// src/components/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  loading?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  loading = false,
  disabled = false,
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
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
});
```

### Inline Styles

For simpler components, we define styles within the same file using StyleSheet.create(). For more complex components or screens, we may use a separate Styles.ts file in the same directory.

```typescript
// Example of styles in a separate file (for a screen component)
// src/screens/PostLogin/BluestoneAppsAI/Styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  // Other styles...
});
```

## Component Best Practices

### 1. Props and TypeScript Interfaces

- Use TypeScript interfaces for prop typing
- Provide default values for optional props
- Use optional chaining and nullish coalescing for safer prop access

```typescript
// Example of proper TypeScript interface usage
interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = '#007AFF',
  text,
}) => {
  // Component implementation
};
```

### 2. Error Handling

- Implement error boundaries to catch and handle component errors
- Use try/catch blocks for error handling in async operations
- Provide meaningful feedback to users when errors occur

```typescript
// Example of an error boundary component
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Component error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
        </View>
      );
    }
    return this.props.children;
  }
}
```

### 3. State Management

- Use useState and useEffect hooks for component-level state
- Extract complex state logic into custom hooks
- Use AsyncStorage for persistent data storage
- Consider context API for state that needs to be shared across components

### 4. Performance Considerations

- Memoize expensive calculations with useMemo
- Use useCallback for event handlers passed to child components
- Implement proper list rendering with FlatList or SectionList
- Avoid unnecessary re-renders by using React.memo when appropriate

### 5. Accessibility

- Provide accessible labels for interactive elements
- Ensure sufficient color contrast
- Support dynamic text sizes
- Test with screen readers
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
