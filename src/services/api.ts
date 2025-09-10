import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

interface RegisterData {
  email: string;
  username: string;
  displayName: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  createdAt: string;
  preferences?: any;
  userStats?: any;
  learningPath?: any;
  streakData?: any;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  isNewUser?: boolean; // For tracking registration vs login
}

interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  retries?: number;
  retryDelay?: number;
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: string) => void;
    reject: (error: any) => void;
  }> = [];

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const requestConfig = config as RequestConfig;
        // Skip auth for certain endpoints
        if (!requestConfig.skipAuth) {
          const token = this.getAuthToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue the request while refreshing
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.client(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAuthToken();
            this.processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.clearAuthData();
            // Redirect to login or emit auth error event
            window.dispatchEvent(new CustomEvent('auth:logout'));
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token!);
      }
    });
    
    this.failedQueue = [];
  }

  private getAuthToken(): string | null {
    try {
      const authData = localStorage.getItem('chess-academy-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.token || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  private async refreshAuthToken(): Promise<string> {
    const refreshToken = Cookies.get('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.client.post('/api/auth/refresh', {}, { skipAuth: true } as RequestConfig);
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

    // Update stored tokens
    if (newRefreshToken) {
      Cookies.set('refreshToken', newRefreshToken, { 
        secure: window.location.protocol === 'https:',
        sameSite: 'lax',
        expires: 7
      });
    }

    // Update auth store
    const authData = JSON.parse(localStorage.getItem('chess-academy-auth') || '{}');
    if (authData.state) {
      authData.state.token = accessToken;
      if (newRefreshToken) {
        authData.state.refreshToken = newRefreshToken;
      }
      authData.state.lastAuthCheck = Date.now();
      localStorage.setItem('chess-academy-auth', JSON.stringify(authData));
    }

    return accessToken;
  }

  private clearAuthData() {
    localStorage.removeItem('chess-academy-auth');
    Cookies.remove('refreshToken');
    sessionStorage.removeItem('oauth_state');
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { retries = 3, retryDelay = 1000, ...axiosConfig } = config;
    
    let lastError: any;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response: AxiosResponse<ApiResponse<T>> = await this.client({
          url: endpoint,
          ...axiosConfig,
        });
        
        return response.data;
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on client errors (4xx) except 401, 408, 429
        const status = error.response?.status;
        const retryableStatuses = [401, 408, 429, 500, 502, 503, 504];
        
        if (attempt === retries || (status && status < 500 && !retryableStatuses.includes(status))) {
          break;
        }
        
        // Exponential backoff with jitter
        const delay = retryDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Format error for consistent handling
    const errorMessage = this.formatError(lastError);
    throw new Error(errorMessage);
  }

  private formatError(error: any): string {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      
      if (data?.message) {
        return data.message;
      }
      
      // Default status messages
      const statusMessages: Record<number, string> = {
        400: 'Bad request. Please check your input.',
        401: 'Authentication required. Please log in.',
        403: 'Access denied. You do not have permission.',
        404: 'Resource not found.',
        409: 'Conflict. Resource already exists.',
        422: 'Invalid data provided.',
        429: 'Too many requests. Please try again later.',
        500: 'Server error. Please try again later.',
        502: 'Service unavailable. Please try again later.',
        503: 'Service temporarily unavailable.',
        504: 'Request timeout. Please try again.',
      };
      
      return statusMessages[status] || `Server error (${status})`;
    } else if (error.request) {
      // Network error
      return 'Network error. Please check your connection.';
    } else {
      // Other error
      return error.message || 'An unexpected error occurred.';
    }
  }

  // Authentication endpoints
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      data,
      skipAuth: true,
    });
  }

  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      data,
      skipAuth: true,
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken(): Promise<ApiResponse<{ accessToken: string; refreshToken?: string }>> {
    return this.request<{ accessToken: string; refreshToken?: string }>('/api/auth/refresh', {
      method: 'POST',
      skipAuth: true,
    });
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/api/auth/profile');
  }

  async handleGoogleCallback(code: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/api/auth/google/callback', {
      method: 'POST',
      data: { code },
      skipAuth: true,
    });
  }

  async deleteAccount(): Promise<ApiResponse> {
    return this.request('/api/auth/delete-account', {
      method: 'DELETE',
    });
  }

  // User endpoints
  async getUserProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/api/users/profile');
  }

  async updateUserProfile(data: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/api/users/profile', {
      method: 'PUT',
      data,
    });
  }

  async getUserStats(): Promise<ApiResponse> {
    return this.request('/api/users/stats');
  }

  async getUserProgress(): Promise<ApiResponse> {
    return this.request('/api/users/progress');
  }

  // Health check endpoint
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/api/health', {
      method: 'GET',
      skipAuth: true,
      retries: 1,
      timeout: 5000,
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export type { User, RegisterData, LoginData, AuthResponse, ApiResponse };