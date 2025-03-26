# API Communication Standards

## Overview

This document outlines the standards for API communication in React Native applications at BluestoneApps. Proper API communication is essential for reliable data fetching, error handling, and user experience.

## Axios Configuration

We use Axios as our HTTP client for API requests. The base configuration should be set up in a centralized file:

```typescript
// src/helper/axiosRequest.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from './config';

const axiosRequest = axios.create({
  baseURL: API.BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json'
  },
  transformRequest: [(data, headers) => {
    // Don't transform FormData
    if (data instanceof FormData) {
      return data;
    }
    
    // For regular objects, transform to form-urlencoded
    if (data && typeof data === 'object') {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      return Object.entries(data)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');
    }
    return data;
  }]
});

export default axiosRequest;
```

## Request Interceptors

Use request interceptors to add authentication tokens, logging, or other common request modifications:

```typescript
// Request interceptor
axiosRequest.interceptors.request.use(
  async (config) => {
    // Add auth token to headers
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request details in development
    if (__DEV__) {
      console.log('Making request to:', config.url);
      console.log('Request data:', config.data);
      console.log('Request headers:', config.headers);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

## Response Interceptors

Use response interceptors for common response handling, such as error processing, token refresh, or logging:

```typescript
// Response interceptor
axiosRequest.interceptors.response.use(
  (response) => {
    // Log response in development
    if (__DEV__) {
      console.log('API Response:', response.data);
    }
    return response;
  },
  async (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      // Attempt to refresh token
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          const refreshResponse = await axios.post(
            `${API.BASE_URL}/refresh-token`,
            { refreshToken }
          );
          
          if (refreshResponse.data.token) {
            // Save new tokens
            await AsyncStorage.setItem('auth_token', refreshResponse.data.token);
            await AsyncStorage.setItem('refresh_token', refreshResponse.data.refreshToken);
            
            // Retry the original request
            const originalRequest = error.config;
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
            return axios(originalRequest);
          }
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        // This would typically use a navigation service or event emitter
        // to communicate with the app's navigation
        console.error('Token refresh failed');
      }
    }
    
    // Log error details in development
    if (__DEV__) {
      console.error('API Error:', error.response?.data || error.message);
    }
    
    return Promise.reject(error);
  }
);
```

## API Configuration

Define API endpoints in a centralized configuration file:

```typescript
// src/helper/config.ts
import { environment } from '../config/environment';

interface APIEndpoints {
  LOGIN: string;
  GET_PROFILE: string;
  UPDATE_PROFILE: string;
  // Other endpoints
}

interface APIConfig {
  BASE_URL: string;
  ENDPOINTS: APIEndpoints;
}

export const API: APIConfig = {
  BASE_URL: environment.baseURL,
  ENDPOINTS: {
    LOGIN: 'wp-json/jwt-auth/v1/token',
    GET_PROFILE: 'wp-json/mobileapi/v1/getProfile',
    UPDATE_PROFILE: 'wp-json/mobileapi/v1/updateProfile',
    // Other endpoints
  }
};
```

## Service Layer

Create service modules for related API calls:

```typescript
// src/helper/authService.ts
import axiosRequest from './axiosRequest';
import { API } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginResponse {
  data: {
    loginInfo: {
      token: string;
      user: {
        id: number;
        name: string;
        email: string;
      };
    };
  };
}

export const authService = {
  /**
   * Authenticate user with email and password
   * @param email User email
   * @param password User password
   * @returns Promise with login response
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await axiosRequest.post(API.ENDPOINTS.LOGIN, {
        email,
        password,
      });
      
      // Store auth token
      if (response.data?.loginInfo?.token) {
        await AsyncStorage.setItem('auth_token', response.data.loginInfo.token);
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  /**
   * Log out the current user
   */
  logout: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('refresh_token');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  /**
   * Check if user is authenticated
   * @returns Promise resolving to boolean indicating auth status
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return !!token;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  },
};
```

## Error Handling

Implement consistent error handling for API requests:

```typescript
// Example of using a service with error handling
const handleLogin = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    const response = await authService.login(email, password);
    if (response?.data?.loginInfo?.token) {
      navigation.replace('DrawerNavigator');
    } else {
      setError('Invalid response from server');
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      // Handle specific HTTP errors
      if (err.response) {
        switch (err.response.status) {
          case 401:
            setError('Invalid credentials');
            break;
          case 429:
            setError('Too many attempts. Please try again later');
            break;
          default:
            setError(`Server error: ${err.response.data?.message || 'Unknown error'}`);
        }
      } else if (err.request) {
        // Request was made but no response received
        setError('Network error. Please check your connection');
      } else {
        setError('An error occurred. Please try again');
      }
    } else {
      // Handle non-Axios errors
      setError('An unexpected error occurred');
    }
  } finally {
    setIsLoading(false);
  }
};
```

## Caching Strategy

Implement a caching strategy for API responses:

```typescript
// Simple cache implementation
const apiCache = {
  cache: new Map<string, { data: any; timestamp: number }>(),
  
  /**
   * Get cached data if it exists and is not expired
   * @param key Cache key
   * @param maxAge Maximum age in milliseconds
   * @returns Cached data or null if expired/not found
   */
  get: (key: string, maxAge: number = 5 * 60 * 1000): any | null => {
    const cached = apiCache.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > maxAge) {
      // Cache expired
      apiCache.cache.delete(key);
      return null;
    }
    
    return cached.data;
  },
  
  /**
   * Store data in cache
   * @param key Cache key
   * @param data Data to cache
   */
  set: (key: string, data: any): void => {
    apiCache.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  },
  
  /**
   * Clear a specific cache entry
   * @param key Cache key
   */
  invalidate: (key: string): void => {
    apiCache.cache.delete(key);
  },
  
  /**
   * Clear all cache entries
   */
  clear: (): void => {
    apiCache.cache.clear();
  },
};

// Example usage in a service
const getProfile = async (userId: number, forceRefresh = false): Promise<UserProfile> => {
  const cacheKey = `profile_${userId}`;
  
  // Check cache first if not forcing refresh
  if (!forceRefresh) {
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }
  
  // Fetch fresh data
  const response = await axiosRequest.get(`${API.ENDPOINTS.GET_PROFILE}/${userId}`);
  
  // Cache the response
  apiCache.set(cacheKey, response.data);
  
  return response.data;
};
```

## Offline Support

For applications that need to work offline, implement a request queue:

```typescript
// Simple request queue for offline support
const requestQueue = {
  queue: [] as Array<{
    url: string;
    method: string;
    data: any;
    headers: Record<string, string>;
  }>,
  
  /**
   * Add request to queue
   */
  add: (request: { url: string; method: string; data: any; headers: Record<string, string> }): void => {
    requestQueue.queue.push(request);
    // Persist queue to AsyncStorage
    AsyncStorage.setItem('request_queue', JSON.stringify(requestQueue.queue));
  },
  
  /**
   * Process queued requests
   */
  process: async (): Promise<void> => {
    if (requestQueue.queue.length === 0) return;
    
    // Process each request in order
    const queue = [...requestQueue.queue];
    requestQueue.queue = [];
    
    for (const request of queue) {
      try {
        await axiosRequest({
          url: request.url,
          method: request.method,
          data: request.data,
          headers: request.headers,
        });
      } catch (error) {
        // If request fails, add it back to the queue
        requestQueue.queue.push(request);
      }
    }
    
    // Update persisted queue
    AsyncStorage.setItem('request_queue', JSON.stringify(requestQueue.queue));
  },
  
  /**
   * Load persisted queue from storage
   */
  load: async (): Promise<void> => {
    const queueData = await AsyncStorage.getItem('request_queue');
    if (queueData) {
      requestQueue.queue = JSON.parse(queueData);
    }
  },
};
```

## Best Practices

1. **Centralize API configuration**: Keep all API endpoints and configuration in one place
2. **Use service layers**: Group related API calls into service modules
3. **Handle errors consistently**: Implement a standard approach to error handling
4. **Implement caching**: Cache responses to improve performance and reduce server load
5. **Add request/response logging**: Log API activity in development for debugging
6. **Use interceptors**: Centralize common request/response handling
7. **Consider offline support**: Implement request queuing for offline-first applications
8. **Secure sensitive data**: Never store sensitive data like passwords in plain text
9. **Use TypeScript**: Define interfaces for request and response data
10. **Document API services**: Add JSDoc comments to describe parameters and return values
