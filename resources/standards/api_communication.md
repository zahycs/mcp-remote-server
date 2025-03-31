# API Communication Standards

BluestoneApps follows these standards for API communication in React Native applications.

## Structure

### API Configuration and Utilities

We use a structured approach to API communication with the following key files:

```
src/
├── config/
│   ├── apiConfig.ts       # API endpoint definitions and configuration
│   └── environment.ts     # Environment-specific configuration
├── services/
    ├── apiService.ts      # Core API service with fetch methods
    ├── authService.ts     # Authentication-related API calls
    ├── userService.ts     # User-related API calls
    └── ...                # Other domain-specific services
```

## API Configuration

We define API endpoints and configuration in dedicated files:

```typescript
// src/config/environment.ts
export const environment = {
  server: 'api.example.com',
  isProduction: true,
  version: '1.0.0',
};

// src/config/apiConfig.ts
import { environment } from './environment';

export const API = {
  BASE_URL: `https://${environment.server}/`,
  ENDPOINTS: {
    LOGIN: 'auth/login',
    REGISTER: 'auth/register',
    USER_PROFILE: 'user/profile',
    MOBILE_API: 'wp-json/mobileapi/v1/',
    // Other endpoints
  },
  TIMEOUT: 30000,
};

// Optional: Define types for API responses
export interface ApiResponse<T> {
  status: string;
  message?: string;
  data?: T;
}
```

## API Service Implementation

We use a centralized API service with fetch-based methods:

```typescript
// src/services/apiService.ts
import { storageService } from './storageService';
import { environment } from '../config/environment';

const BASE_URL = `https://${environment.server}/`;
const MOBILE_API = `${BASE_URL}wp-json/mobileapi/v1/`;

interface ApiResponse {
  status: string;
  errormsg: string;
  error_code: string;
  data?: any;
}

class ApiService {
  async getData(endpoint: string) {
    try {
      console.log('Fetching from:', MOBILE_API + endpoint);
      const response = await fetch(MOBILE_API + endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  async sendData(endpoint: string, data: any) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const payload = {
      ...(typeof data === 'object' ? data : { value: data }),
      timezone,
    };

    try {
      const response = await fetch(MOBILE_API + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending data:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
```

## Domain-Specific Services

We create separate service files for different domains:

```typescript
// src/services/authService.ts
import { apiService } from './apiService';
import { storageService } from './storageService';

class AuthService {
  async login(email: string, password: string) {
    try {
      const response = await apiService.sendData('login', { email, password });
      
      if (response.status === 'ok' && response.token) {
        await storageService.set('userToken', response.token);
        await storageService.set('user', response.user);
        return response;
      }
      
      throw new Error(response.errormsg || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await storageService.remove('userToken');
      await storageService.remove('user');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
```

## Error Handling

We implement consistent error handling across all API calls:

1. Log errors for debugging
2. Use try/catch blocks for all async operations
3. Provide meaningful error messages
4. Handle specific error types appropriately

## Example Usage in Components

```typescript
// Example in a screen component
import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { authService } from '../services/authService';
import { Button } from '../components/Button';

const LoginScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      await authService.login(email, password);
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {/* Form fields */}
      <Button 
        title="Login" 
        onPress={() => handleLogin('user@example.com', 'password')} 
        loading={loading} 
      />
    </View>
  );
};
```

## Best Practices

1. Use TypeScript interfaces for request and response types
2. Implement proper error handling for all API calls
3. Store authentication tokens securely
4. Use environment-specific configuration
5. Log API calls and errors for debugging
6. Implement retry logic for important operations
7. Handle offline scenarios gracefully
