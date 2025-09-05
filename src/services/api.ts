const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
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
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // For cookies (refresh token)
      ...options,
    };

    // Add authorization header if token exists
    const token = localStorage.getItem('chess-academy-auth');
    if (token) {
      const authData = JSON.parse(token);
      if (authData.state?.token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${authData.state.token}`,
        };
      }
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Network error');
    }
  }

  // Authentication endpoints
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
    return this.request<{ accessToken: string }>('/api/auth/refresh', {
      method: 'POST',
    });
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/api/auth/profile');
  }

  // User endpoints
  async getUserProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/api/users/profile');
  }

  async updateUserProfile(data: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserStats(): Promise<ApiResponse> {
    return this.request('/api/users/stats');
  }

  async getUserProgress(): Promise<ApiResponse> {
    return this.request('/api/users/progress');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export type { User, RegisterData, LoginData, AuthResponse, ApiResponse };