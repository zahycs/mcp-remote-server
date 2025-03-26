# State Management Standards

## Overview

This document outlines the standards for state management in React Native applications at BluestoneApps. Proper state management is crucial for building maintainable and performant applications.

## React Hooks

### useState

Use `useState` for simple component-level state:

```typescript
const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Component logic
};
```

### useEffect

Use `useEffect` for side effects like data fetching, subscriptions, or manually changing the DOM:

```typescript
useEffect(() => {
  // This runs after every render
  
  return () => {
    // Cleanup function runs before component unmounts
    // or before the effect runs again
  };
}, [dependency1, dependency2]); // Only re-run if dependencies change
```

### useCallback

Use `useCallback` to memoize functions, especially when passing them as props to child components:

```typescript
const handleLogin = useCallback(async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    const response = await authService.login(email, password);
    if (response?.data?.loginInfo?.token) {
      navigation.replace('DrawerNavigator');
    }
  } catch (err) {
    setError('Login failed. Please check your credentials.');
  } finally {
    setIsLoading(false);
  }
}, [email, password, navigation]);
```

### useMemo

Use `useMemo` to memoize expensive calculations:

```typescript
const filteredItems = useMemo(() => {
  return items.filter(item => item.name.includes(searchTerm));
}, [items, searchTerm]);
```

### useRef

Use `useRef` for values that need to persist across renders without causing re-renders:

```typescript
const timerRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
  timerRef.current = setTimeout(() => {
    // Do something
  }, 1000);
  
  return () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };
}, []);
```

## Custom Hooks

Create custom hooks to encapsulate and reuse stateful logic:

```typescript
// useAppUpdate.ts
const useAppUpdate = (checkOnMount = true, updateCheckInterval = 60 * 60 * 1000) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  
  // Hook implementation
  
  return {
    loading,
    error,
    versionInfo,
    checkAppVersion,
    closeUpdateModal,
    goToUpdate,
    updateModalVisible,
  };
};
```

### Custom Hook Best Practices

1. Name hooks with the `use` prefix
2. Keep hooks focused on a specific concern
3. Return an object with named properties for better readability
4. Document the hook's purpose, parameters, and return values
5. Handle errors gracefully within the hook

## Context API

Use React Context for global state that needs to be accessed by many components:

```typescript
// AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  const login = async (email: string, password: string) => {
    // Implementation
  };
  
  const logout = () => {
    // Implementation
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### Context API Best Practices

1. Create a custom hook to access the context
2. Split contexts by domain (auth, theme, etc.)
3. Keep context providers high in the component tree
4. Avoid putting too much in a single context
5. Consider performance implications of context changes

## Local Storage

Use AsyncStorage for persisting data between app launches:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storing data
const storeData = async (key: string, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error storing data:', e);
  }
};

// Retrieving data
const getData = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error retrieving data:', e);
    return null;
  }
};
```

## State Management Decision Tree

1. **Component-specific state**: Use `useState`
2. **Shared state between few components**: Lift state up to common ancestor
3. **Complex component logic**: Create custom hooks
4. **Global app state**: Use Context API
5. **Persistent state**: Use AsyncStorage with one of the above
6. **Complex global state with many updates**: Consider Redux or MobX

## Performance Considerations

1. Avoid unnecessary re-renders by using memoization (`React.memo`, `useMemo`, `useCallback`)
2. Keep state as local as possible
3. Split context providers to minimize re-renders
4. Use the `key` prop correctly in lists
5. Consider using virtualized lists for large data sets
6. Batch state updates when possible
