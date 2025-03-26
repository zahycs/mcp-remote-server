/**
 * ApiService
 * 
 * A service for handling API requests with axios.
 * Includes request/response interceptors, error handling, and caching.
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { API_URL, API_TIMEOUT } from '../config/constants';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT || 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Simple cache implementation
class ApiCache {
  static async getCache(key) {
    try {
      const cachedData = await AsyncStorage.getItem(`api_cache_${key}`);
      if (cachedData) {
        const { data, expiry } = JSON.parse(cachedData);
        if (expiry > Date.now()) {
          return data;
        }
        // Cache expired, remove it
        await AsyncStorage.removeItem(`api_cache_${key}`);
      }
      return null;
    } catch (error) {
      console.warn('Cache retrieval error:', error);
      return null;
    }
  }

  static async setCache(key, data, ttl = 5 * 60 * 1000) { // Default 5 minutes TTL
    try {
      const cacheData = {
        data,
        expiry: Date.now() + ttl,
      };
      await AsyncStorage.setItem(`api_cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Cache storage error:', error);
    }
  }

  static async clearCache(keyPattern = '') {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.startsWith('api_cache_') && 
        (keyPattern === '' || key.includes(keyPattern))
      );
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }
}

// Request queue for offline support
class RequestQueue {
  static queue = [];
  static isProcessing = false;

  static async addToQueue(request) {
    try {
      // Add request to queue
      this.queue.push(request);
      
      // Save queue to AsyncStorage
      await AsyncStorage.setItem('api_request_queue', JSON.stringify(this.queue));
      
      console.log(`Request added to queue. Queue length: ${this.queue.length}`);
    } catch (error) {
      console.error('Error adding request to queue:', error);
    }
  }

  static async loadQueue() {
    try {
      const queueData = await AsyncStorage.getItem('api_request_queue');
      if (queueData) {
        this.queue = JSON.parse(queueData);
        console.log(`Loaded ${this.queue.length} requests from queue`);
      }
    } catch (error) {
      console.error('Error loading request queue:', error);
      this.queue = [];
    }
  }

  static async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    // Check for internet connection
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) return;
    
    this.isProcessing = true;
    
    console.log(`Processing ${this.queue.length} requests in queue`);
    
    while (this.queue.length > 0) {
      const request = this.queue.shift();
      
      try {
        // Skip the interceptors to avoid infinite loop
        console.log(`Processing queued ${request.method} request to ${request.url}`);
        await axios({
          ...request,
          _skipInterceptors: true,
        });
      } catch (error) {
        console.error(`Error processing queued request: ${error}`);
        // If it's a server error, requeue the request
        if (error.response && error.response.status >= 500) {
          this.queue.unshift(request);
          break;
        }
      }
      
      // Update the stored queue
      await AsyncStorage.setItem('api_request_queue', JSON.stringify(this.queue));
    }
    
    this.isProcessing = false;
  }
}

// Load the queue when the app starts
RequestQueue.loadQueue();

// Set up network change listener for processing the queue
NetInfo.addEventListener(state => {
  if (state.isConnected) {
    RequestQueue.processQueue();
  }
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Skip interceptors if specified
    if (config._skipInterceptors) {
      return config;
    }
    
    // Check for internet connection
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected && config.method !== 'get') {
      // Queue non-GET requests for later processing
      const request = {
        url: config.url,
        method: config.method,
        data: config.data,
        headers: config.headers,
      };
      
      await RequestQueue.addToQueue(request);
      
      // Reject the promise to prevent the request from being sent
      return Promise.reject(new Error('No internet connection. Request queued.'));
    }
    
    // Add auth token if available
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Error retrieving auth token:', error);
    }
    
    // Log requests in development
    if (__DEV__) {
      console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, config.data || '');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (__DEV__) {
      console.log('API Response:', response.config.url, response.status);
    }
    
    return response;
  },
  async (error) => {
    // Handle response errors
    const originalRequest = error.config;
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject(error);
    }
    
    // Log errors in development
    if (__DEV__) {
      console.error('API Error:', originalRequest.url, error.response?.status, error.response?.data);
    }
    
    // Handle 401 Unauthorized - Token expired
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          const { token, refresh_token } = response.data;
          
          // Store the new tokens
          await AsyncStorage.setItem('auth_token', token);
          await AsyncStorage.setItem('refresh_token', refresh_token);
          
          // Update the header and retry
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Clear auth data and redirect to login
        await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
        
        // This should be handled by the app's navigation/auth system
        // Example: navigationService.navigateAndReset('Login');
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * ApiService provides methods to interact with the API
 */
const ApiService = {
  /**
   * Make a GET request
   * @param {string} url - The endpoint URL
   * @param {Object} params - URL parameters
   * @param {Object} options - Request options
   * @param {boolean} options.withCache - Whether to use cache
   * @param {number} options.cacheTTL - Cache time-to-live in milliseconds
   * @returns {Promise<any>} - Response data
   */
  async get(url, params = {}, options = {}) {
    const { withCache = false, cacheTTL = 5 * 60 * 1000, ...configOptions } = options;
    
    // Generate cache key if caching is enabled
    const cacheKey = withCache ? `${url}_${JSON.stringify(params)}` : null;
    
    // Try to get data from cache first
    if (withCache) {
      const cachedData = await ApiCache.getCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }
    
    try {
      const response = await api.get(url, { params, ...configOptions });
      
      // Store in cache if needed
      if (withCache && response.data) {
        await ApiCache.setCache(cacheKey, response.data, cacheTTL);
      }
      
      return response.data;
    } catch (error) {
      // For GET requests, check if we're offline and have cached data
      if (!error.response && withCache) {
        const cachedData = await ApiCache.getCache(cacheKey);
        if (cachedData) {
          console.log('Returning stale cache due to network error');
          return cachedData;
        }
      }
      
      throw error;
    }
  },
  
  /**
   * Make a POST request
   * @param {string} url - The endpoint URL
   * @param {Object} data - Request body
   * @param {Object} options - Request options
   * @returns {Promise<any>} - Response data
   */
  async post(url, data = {}, options = {}) {
    const response = await api.post(url, data, options);
    return response.data;
  },
  
  /**
   * Make a PUT request
   * @param {string} url - The endpoint URL
   * @param {Object} data - Request body
   * @param {Object} options - Request options
   * @returns {Promise<any>} - Response data
   */
  async put(url, data = {}, options = {}) {
    const response = await api.put(url, data, options);
    return response.data;
  },
  
  /**
   * Make a PATCH request
   * @param {string} url - The endpoint URL
   * @param {Object} data - Request body
   * @param {Object} options - Request options
   * @returns {Promise<any>} - Response data
   */
  async patch(url, data = {}, options = {}) {
    const response = await api.patch(url, data, options);
    return response.data;
  },
  
  /**
   * Make a DELETE request
   * @param {string} url - The endpoint URL
   * @param {Object} options - Request options
   * @returns {Promise<any>} - Response data
   */
  async delete(url, options = {}) {
    const response = await api.delete(url, options);
    return response.data;
  },
  
  /**
   * Upload a file
   * @param {string} url - The endpoint URL
   * @param {Object} formData - FormData object with files
   * @param {Object} options - Request options
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<any>} - Response data
   */
  async upload(url, formData, options = {}, onProgress = null) {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...options,
    };
    
    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      };
    }
    
    const response = await api.post(url, formData, config);
    return response.data;
  },
  
  /**
   * Clear API cache
   * @param {string} keyPattern - Optional pattern to match cache keys
   * @returns {Promise<void>}
   */
  async clearCache(keyPattern = '') {
    await ApiCache.clearCache(keyPattern);
  },
  
  /**
   * Process the offline request queue
   * @returns {Promise<void>}
   */
  async processQueue() {
    await RequestQueue.processQueue();
  },
  
  /**
   * Set the auth token for API requests
   * @param {string} token - The authentication token
   * @returns {Promise<void>}
   */
  async setAuthToken(token) {
    await AsyncStorage.setItem('auth_token', token);
  },
  
  /**
   * Clear the auth token
   * @returns {Promise<void>}
   */
  async clearAuthToken() {
    await AsyncStorage.removeItem('auth_token');
  },
  
  /**
   * Get the base API instance for advanced usage
   * @returns {AxiosInstance}
   */
  getInstance() {
    return api;
  },
};

export default ApiService;
