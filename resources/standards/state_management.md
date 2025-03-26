# State Management Standards

BluestoneApps follows these standards for state management in React Native applications.

## State Management Strategy

We use a tiered approach to state management:

1. **Local Component State**: For UI state that doesn't need to be shared
2. **Context API**: For state shared across a subtree of components
3. **Redux Toolkit**: For global application state

## Local Component State

Use React's `useState` and `useReducer` hooks for component-local state:

```javascript
// Simple state with useState
const [isLoading, setIsLoading] = useState(false);

// Complex state with useReducer
const [state, dispatch] = useReducer(reducer, initialState);
```

### When to use local state:

- Form input values
- UI states like open/closed, visible/hidden
- Temporary data that doesn't need persistence
- Component-specific flags and counters

## Context API

Use Context for state that needs to be accessed by multiple components in a specific part of your component tree:

```javascript
// src/contexts/ThemeContext.js
import React, { createContext, useContext, useState } from 'react';
import { lightTheme, darkTheme } from '../theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };
  
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

### When to use Context:

- Theme information
- User preferences
- Authentication state
- Localization data
- States needed by multiple components in a specific section

## Redux Toolkit

For global application state, we use Redux Toolkit to simplify Redux development:

### Store Setup

```javascript
// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['your/non-serializable-action'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Custom Hooks for Redux

```typescript
// src/store/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Use throughout your app instead of plain useDispatch and useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### Redux Slices

```javascript
// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../api/services/authService';

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to login';
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
```

### When to use Redux Toolkit:

- Global application state
- Data shared across many components
- Complex state logic with many actions
- When you need time-travel debugging
- For persistent state across app sessions

## Selectors

Use memoized selectors for derived state:

```javascript
// src/store/selectors/userSelectors.js
import { createSelector } from '@reduxjs/toolkit';

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
