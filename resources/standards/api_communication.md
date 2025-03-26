# API Communication Standards

BluestoneApps follows these standards for API communication in React Native applications.

## Structure

### API Service Layer

We use a dedicated API service layer to separate API concerns from UI logic:

```
src/
└── api/
    ├── client.js           # Base axios/fetch configuration
    ├── endpoints.js        # API endpoint definitions
    ├── interceptors.js     # Request/response interceptors
    └── services/           # API service modules by domain
        ├── authService.js
        ├── userService.js
        └── ...
```

## Client Configuration

We use Axios as our HTTP client with the following configuration:

```javascript
// src/api/client.js
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { getAuthToken } from '../services/authService';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error statuses
    if (error.response && error.response.status === 401) {
      // Handle unauthorized (e.g., logout user)
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

## API Services

Each domain has its own service file:

```javascript
// src/api/services/userService.js
import apiClient from '../client';
import { USER_ENDPOINTS } from '../endpoints';

export const userService = {
  getProfile: async () => {
    const response = await apiClient.get(USER_ENDPOINTS.PROFILE);
    return response.data;
  },
  
  updateProfile: async (userData) => {
    const response = await apiClient.put(USER_ENDPOINTS.PROFILE, userData);
    return response.data;
  },
  
  // Other user-related API methods
};
```

## Error Handling

We implement consistent error handling patterns:

```javascript
// Usage in components or hooks
const fetchUserData = async () => {
  try {
    setLoading(true);
    const data = await userService.getProfile();
    setUserData(data);
  } catch (error) {
    // Use a dedicated error handler service
    errorHandlerService.handleError(error);
  } finally {
    setLoading(false);
  }
};
```

## Offline Support

For apps requiring offline support:

1. Use a request queue system for operations when offline
2. Implement sync logic when connectivity is restored
3. Use optimistic updates for better UX

## API Response Caching

We use a caching strategy for appropriate endpoints:

```javascript
import { cacheService } from '../services/cacheService';

export const getArticles = async (forceRefresh = false) => {
  const cacheKey = 'articles';
  
  // Return cached data if available and not forcing refresh
  if (!forceRefresh) {
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) return cachedData;
  }
  
  // Fetch fresh data
  const response = await apiClient.get(CONTENT_ENDPOINTS.ARTICLES);
  
  // Update cache
  await cacheService.set(cacheKey, response.data, 60); // Cache for 60 minutes
  
  return response.data;
};
```

## Authentication

We use JWT tokens with secure storage:

1. Store tokens in secure storage (e.g., react-native-keychain)
2. Implement token refresh logic
3. Handle expired tokens appropriately
