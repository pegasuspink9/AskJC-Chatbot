
import { ApiResponse, ApiError } from "./types";
import { getBaseUrl } from "./config";

class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = getBaseUrl();
    this.timeout = 30000;
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      };

      if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          success: false,
          message: `HTTP Error ${response.status}`,
        }));
        throw new Error(errorData.message || `HTTP Error ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success === false) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('API Error:', error);
      throw error;
    }
  }

  // Chat-specific methods
  async sendChatQuery(queryText: string): Promise<string> {
    try {
      const response = await this.makeRequest<ApiResponse>(
        '/query/',
        'POST',
        { query_text: queryText }
      );

      return response.data.chatbotResponse;
    } catch (error) {
      console.error('Chat API error:', error);
      throw error;
    }
  }

  // Add more API methods here as needed
  // async getUserProfile(userId: string): Promise<UserProfile> {
  //   return this.makeRequest(`/users/${userId}`, 'GET');
  // }
  
  // async updateUserProfile(userId: string, data: any): Promise<void> {
  //   return this.makeRequest(`/users/${userId}`, 'PUT', data);
  // }
}

// Create and export singleton instance
export const apiService = new ApiService();