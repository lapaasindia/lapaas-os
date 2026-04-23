const API_BASE_URL = 'http://localhost:3000/api/v1';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

interface UserResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

class ApiService {
  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeader(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Request failed');
      }

      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An error occurred',
      };
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<UserResponse>> {
    return this.request<UserResponse>('/auth/me', {
      method: 'GET',
    });
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ accessToken: string; expiresIn: number }>> {
    return this.request<{ accessToken: string; expiresIn: number }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request<{ status: string }>('/health', {
      method: 'GET',
    });
  }
}

export const apiService = new ApiService();
export type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, UserResponse };
