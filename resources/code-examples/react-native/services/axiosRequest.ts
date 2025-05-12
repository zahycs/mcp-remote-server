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

// Request interceptor
axiosRequest.interceptors.request.use(
  async (config) => {
    console.log('Making request to:', config.url);
    console.log('Request data:', config.data);
    console.log('Request headers:', config.headers);
    console.log('Request method:', config.method);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosRequest.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosRequest;
