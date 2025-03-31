# State Management Standards

BluestoneApps follows these standards for state management in React Native applications.

## State Management Strategy

We use a pragmatic approach to state management with a focus on simplicity and maintainability:

1. **Local Component State**: For UI state that doesn't need to be shared
2. **Custom Hooks**: For reusable state logic
3. **AsyncStorage**: For persistent data
4. **Context API**: For state shared across components (when necessary)

## Local Component State

Use React's `useState` and `useEffect` hooks for component-local state:

```typescript
// Simple state with useState
const [isLoading, setIsLoading] = useState<boolean>(false);
const [data, setData] = useState<DataType | null>(null);

// Side effects with useEffect
useEffect(() => {
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const result = await apiService.getData();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  fetchData();
}, []);
```

### When to use local state:

- Form input values
- UI states like open/closed, visible/hidden
- Component-specific data loading states
- Temporary data that doesn't need persistence

## Custom Hooks

Extract reusable state logic into custom hooks:

```typescript
// src/hooks/useAppUpdate.ts
import { useState, useCallback, useEffect } from 'react';
import UpdateService from '../services/UpdateService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface VersionInfo {
  latestVersion: string;
  minimumVersion: string;
  releaseNotes?: string;
}

const useAppUpdate = (checkOnMount = true, updateCheckInterval = 60 * 60 * 1000) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  
  // Check for updates
  const checkForUpdates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const info = await UpdateService.checkForUpdates();
      setVersionInfo(info);
      
      // Show update modal if needed
      if (info && UpdateService.isUpdateRequired(info)) {
        setUpdateModalVisible(true);
      }
      
      // Store last check time
      await AsyncStorage.setItem('last_update_check', Date.now().toString());
      
      return info;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Check for updates on mount if enabled
  useEffect(() => {
    if (checkOnMount) {
      checkForUpdates();
    }
  }, [checkOnMount, checkForUpdates]);
  
  // Return state and functions
  return {
    loading,
    error,
    versionInfo,
    updateModalVisible,
    setUpdateModalVisible,
    checkForUpdates,
  };
};

export default useAppUpdate;
```

### When to use custom hooks:

- Reusable state logic across multiple components
- Complex state management with multiple related states
- API communication patterns
- Feature-specific logic that combines multiple React hooks

## AsyncStorage for Persistence

Use AsyncStorage for persisting data across app sessions:

```typescript
// Example in authService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await axiosRequest.post<LoginResponse>(
        API.ENDPOINTS.LOGIN,
        { email, password }
      );

      if (response?.loginInfo?.token) {
        // Store authentication data
        await AsyncStorage.setItem('userToken', response.loginInfo.token);
        await AsyncStorage.setItem('userData', JSON.stringify({ loginInfo: response.loginInfo }));
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Remove stored data
      await AsyncStorage.multiRemove(['userToken', 'userData', 'rememberMe']);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
  
  async isLoggedIn(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return token !== null;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }
}

export default new AuthService();
```

### When to use AsyncStorage:

- Authentication tokens
- User preferences
- App configuration
- Cached data that should persist between app launches
- Form data that should be saved if the app closes

## Context API (When Needed)

For cases where state needs to be shared across multiple components, use the Context API:

```typescript
// src/navigation/NavigationContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface NavigationContextType {
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
  previousScreen: string | null;
  navigateBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<string>('Home');
  const [previousScreen, setPreviousScreen] = useState<string | null>(null);
  
  const handleSetCurrentScreen = (screen: string) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
  };
  
  const navigateBack = () => {
    if (previousScreen) {
      setCurrentScreen(previousScreen);
      setPreviousScreen(null);
    }
  };
  
  return (
    <NavigationContext.Provider 
      value={{ 
        currentScreen, 
        setCurrentScreen: handleSetCurrentScreen,
        previousScreen,
        navigateBack
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
```

### When to use Context API:

- Theme information
- Authentication state (when needed across many components)
- Navigation state
- Localization data
- Application-wide preferences

## Best Practices

1. **Keep state as local as possible** - Only lift state up when necessary
2. **Use TypeScript** - Define proper interfaces for all state
3. **Implement proper error handling** - Always handle errors in async operations
4. **Separate concerns** - Keep UI state separate from data state
5. **Optimize performance** - Use memoization techniques like `useMemo` and `useCallback`
6. **Consistent patterns** - Use similar patterns across the application
7. **Minimize state** - Only track what's necessary in state
8. **Document state management** - Add comments explaining complex state logic

const selectUsers = (state) => state.users.data;
const selectCurrentUserId = (state) => state.auth.user?.id;

export const selectCurrentUser = createSelector(
  [selectUsers, selectCurrentUserId],
  (users, currentUserId) => {
    if (!users || !currentUserId) return null;
    return users.find(user => user.id === currentUserId);
  }
);

export const selectActiveUsers = createSelector(
  [selectUsers],
  (users) => users.filter(user => user.isActive)
);
```

## Persistence

For persisting state across app restarts:

```javascript
// src/store/index.js
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'userPreferences'], // only these reducers will be persisted
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
```

## State Management Best Practices

1. **Single Source of Truth**: Store overlapping data in only one place
2. **Immutable Updates**: Always use immutable patterns for updating state
3. **Normalize Complex Data**: Use normalized state structure for relational data
4. **Minimal State**: Only store essential application state
5. **Separate UI State**: Keep UI state separate from domain/data state
6. **Smart/Dumb Components**: Use container/presentational pattern
7. **Consistent Pattern**: Choose specific patterns for specific state needs
8. **Avoid Prop Drilling**: Use Context or Redux instead of passing props deeply
