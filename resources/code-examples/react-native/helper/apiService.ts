import { storageService } from './storageService';
import { environment } from '../config/environment';

const BASE_URL = `https://${environment.server}/`;
const MOBILE_API = `${BASE_URL}wp-json/mobileapi/v1/`;

interface ApiResponse {
  status: string;
  errormsg: string;
  error_code: string;
  categories: Array<{
    category_id: number;
    category_name: string;
    posts: Array<{
      post_id: number;
      post_title: string;
      post_content: string;
      post_date: string;
      featured_image?: string;
    }>;
  }>;
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

  async fetchAndStorePosts() {
    try {
      const response = await this.getData('getPostsByCategories') as ApiResponse;
      console.log('API Response:', response);
      
      if (response?.status === 'ok' && response?.categories) {
        await storageService.set('posts', response.categories);
        return response.categories;
      }
      return null;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
