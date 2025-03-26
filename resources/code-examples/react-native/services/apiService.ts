import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../helper/config';

/**
 * API response interface
 */
interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

/**
 * API error interface
 */
interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * API service for handling HTTP requests
 */
class ApiService {
  private api: AxiosInstance;
  private tokenRefreshPromise: Promise<string> | null = null;

  constructor() {
    // Create axios instance with default config
    this.api = axios.create({
      baseURL: API.BASE_URL,
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Setup request interceptor
    this.api.interceptors.request.use(
      this.handleRequest,
      this.handleRequestError
    );

    // Setup response interceptor
    this.api.interceptors.response.use(
      this.handleResponse,
      this.handleResponseError
    );
  }

  /**
   * Handle request interceptor
   */
  private handleRequest = async (config: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
    // Get auth token from storage
    const token = await AsyncStorage.getItem('auth_token');
    
    // Add auth token to headers if available
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    
    // Log request in development
    if (__DEV__) {
      console.log('API Request:', {
        url: config.url,
        method: config.method,
        data: config.data,
      });
    }
    
    return config;
  };

  /**
   * Handle request error interceptor
   */
  private handleRequestError = (error: any): Promise<never> => {
    console.error('API Request Error:', error);
    return Promise.reject(this.formatError(error));
  };

  /**
   * Handle response interceptor
   */
  private handleResponse = (response: AxiosResponse): AxiosResponse => {
    // Log response in development
    if (__DEV__) {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    
    return response;
  };

  /**
   * Handle response error interceptor
   */
  private handleResponseError = async (error: any): Promise<any> => {
    // Extract response and request from error
    const { response, config } = error;
    
    // Handle 401 Unauthorized (token expired)
    if (response?.status === 401 && config) {
      return this.handleTokenRefresh(config);
    }
    
    // Log error in development
    if (__DEV__) {
      console.error('API Response Error:', {
        url: config?.url,
        status: response?.status,
        data: response?.data,
      });
    }
    
    return Promise.reject(this.formatError(error));
  };

  /**
   * Handle token refresh and retry original request
   */
  private handleTokenRefresh = async (config: AxiosRequestConfig): Promise<any> => {
    try {
      // If there's already a refresh in progress, wait for it
      if (this.tokenRefreshPromise) {
        const newToken = await this.tokenRefreshPromise;
        
        // Update request config with new token
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${newToken}`,
        };
        
        // Retry the original request
        return this.api(config);
      }
      
      // Start new token refresh
      this.tokenRefreshPromise = this.refreshToken();
      
      // Wait for token refresh
      const newToken = await this.tokenRefreshPromise;
      
      // Update request config with new token
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${newToken}`,
      };
      
      // Retry the original request
      return this.api(config);
    } catch (refreshError) {
      // Token refresh failed, redirect to login
      this.handleAuthError();
      return Promise.reject(this.formatError(refreshError));
    } finally {
      // Reset token refresh promise
      this.tokenRefreshPromise = null;
    }
  };

  /**
   * Refresh authentication token
   */
  private refreshToken = async (): Promise<string> => {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      // Make token refresh request
      const response = await axios.post<ApiResponse<{ token: string; refreshToken: string }>>(
        `${API.BASE_URL}/refresh-token`,
        { refreshToken }
      );
      
      if (response.data.success && response.data.data.token) {
        // Save new tokens
        const newToken = response.data.data.token;
        const newRefreshToken = response.data.data.refreshToken;
        
        await AsyncStorage.setItem('auth_token', newToken);
        await AsyncStorage.setItem('refresh_token', newRefreshToken);
        
        return newToken;
      }
      
      throw new Error('Token refresh failed');
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  };

  /**
   * Handle authentication error (logout user)
   */
  private handleAuthError = async (): Promise<void> => {
    try {
      // Clear auth tokens
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('refresh_token');
      
      // Emit auth error event for app to handle
      // This could be implemented with EventEmitter or a state management solution
      // For example: EventEmitter.emit('AUTH_ERROR');
    } catch (error) {
      console.error('Error handling auth error:', error);
    }
  };

  /**
   * Format error response
   */
  private formatError = (error: any): ApiError => {
    const { response } = error;
    
    if (response?.data?.message) {
      return {
        message: response.data.message,
        code: response.data.code,
        status: response.status,
      };
    }
    
    if (error.message) {
      if (error.message === 'Network Error') {
        return {
          message: 'Network error. Please check your internet connection.',
          code: 'NETWORK_ERROR',
        };
      }
      
      if (error.message.includes('timeout')) {
        return {
          message: 'Request timed out. Please try again.',
          code: 'TIMEOUT_ERROR',
        };
      }
      
      return {
        message: error.message,
        code: error.code,
      };
    }
    
    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    };
  };

  /**
   * Make a GET request
   */
  public get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await this.api.get<ApiResponse<T>>(url, config);
      return response.data.data;
    } catch (error) {
      throw this.formatError(error);
    }
  };

  /**
   * Make a POST request
   */
  public post = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await this.api.post<ApiResponse<T>>(url, data, config);
      return response.data.data;
    } catch (error) {
      throw this.formatError(error);
    }
  };

  /**
   * Make a PUT request
   */
  public put = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await this.api.put<ApiResponse<T>>(url, data, config);
      return response.data.data;
    } catch (error) {
      throw this.formatError(error);
    }
  };

  /**
   * Make a DELETE request
   */
  public delete = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await this.api.delete<ApiResponse<T>>(url, config);
      return response.data.data;
    } catch (error) {
      throw this.formatError(error);
    }
  };
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
