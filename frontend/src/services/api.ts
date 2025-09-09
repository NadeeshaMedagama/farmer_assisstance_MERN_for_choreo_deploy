import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  User, 
  Crop, 
  WeatherData, 
  MarketData, 
  ForumThread, 
  Notification,
  ApiResponse,
  CreateCropRequest,
  CreateThreadRequest,
  AdminStats,
  SystemHealth,
  AdminAnalytics,
  SystemSettings
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('🌐 API: Making login request to:', this.api.defaults.baseURL + '/auth/login');
    console.log('🌐 API: Request data:', credentials);
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', credentials);
      console.log('🌐 API: Response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🌐 API: Request failed:', error);
      console.error('🌐 API: Error response:', error.response?.data);
      console.error('🌐 API: Error status:', error.response?.status);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<{ success: boolean; user: User }> = await this.api.get('/auth/me');
    return response.data.user;
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<{ success: boolean; user: User }> = await this.api.put('/auth/me', userData);
    return response.data.user;
  }

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(password: string, token: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.post('/auth/reset-password', { password, token });
    return response.data;
  }

  // Crop endpoints
  async getCrops(): Promise<Crop[]> {
    const response: AxiosResponse<{ success: boolean; data: Crop[] }> = await this.api.get('/crops');
    return response.data.data || [];
  }

  async createCrop(cropData: CreateCropRequest): Promise<Crop> {
    const response: AxiosResponse<{ success: boolean; data: Crop }> = await this.api.post('/crops', cropData);
    return response.data.data!;
  }

  async updateCrop(id: string, cropData: Partial<Crop>): Promise<Crop> {
    const response: AxiosResponse<{ success: boolean; data: Crop }> = await this.api.put(`/crops/${id}`, cropData);
    return response.data.data!;
  }

  async deleteCrop(id: string): Promise<void> {
    await this.api.delete(`/crops/${id}`);
  }

  // Weather endpoints
  async getCurrentWeather(lat?: number, lon?: number): Promise<WeatherData> {
    const response: AxiosResponse<{ success: boolean; data: WeatherData }> = await this.api.get('/weather', {
      params: lat != null && lon != null ? { lat, lon } : undefined,
    });
    return response.data.data!;
  }

  async getHistoricalWeather(lat?: number, lon?: number): Promise<WeatherData[]> {
    const response: AxiosResponse<{ success: boolean; data: WeatherData[] }> = await this.api.get('/weather/historical', {
      params: lat != null && lon != null ? { lat, lon } : undefined,
    });
    return response.data.data || [];
  }

  async getWeatherStats(lat?: number, lon?: number): Promise<any> {
    const response: AxiosResponse<{ success: boolean; data: any }> = await this.api.get('/weather/stats', {
      params: lat != null && lon != null ? { lat, lon } : undefined,
    });
    return response.data.data;
  }

  // Market endpoints
  async getMarketData(): Promise<MarketData[]> {
    const response: AxiosResponse<{ success: boolean; data: MarketData[] }> = await this.api.get('/market');
    return response.data.data || [];
  }

  async getExternalMarketData(): Promise<MarketData[]> {
    const response: AxiosResponse<{ success: boolean; data: MarketData[] }> = await this.api.get('/market/external');
    return response.data.data || [];
  }

  // Forum endpoints
  async getForumThreads(): Promise<ForumThread[]> {
    const response: AxiosResponse<{ success: boolean; data: ForumThread[] }> = await this.api.get('/forum');
    return response.data.data || [];
  }

  async getForumThread(id: string): Promise<ForumThread> {
    const response: AxiosResponse<{ success: boolean; data: ForumThread }> = await this.api.get(`/forum/${id}`);
    return response.data.data!;
  }

  async createForumThread(threadData: CreateThreadRequest): Promise<ForumThread> {
    const response: AxiosResponse<{ success: boolean; data: ForumThread }> = await this.api.post('/forum', threadData);
    return response.data.data!;
  }

  async replyToThread(threadId: string, content: string): Promise<ForumThread> {
    const response: AxiosResponse<{ success: boolean; data: ForumThread }> = await this.api.post(`/forum/${threadId}/replies`, { content });
    return response.data.data!;
  }

  // Notification endpoints
  async getNotifications(): Promise<Notification[]> {
    const response: AxiosResponse<{ success: boolean; data: Notification[] }> = await this.api.get('/notifications');
    return response.data.data || [];
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.api.put(`/notifications/${id}/read`);
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.api.put('/notifications/read-all');
  }

  // Admin endpoints
  async getAdminStats(): Promise<AdminStats> {
    const response: AxiosResponse<{ success: boolean; data: AdminStats }> = await this.api.get('/admin/stats');
    return response.data.data!;
  }

  async getSystemHealth(): Promise<SystemHealth> {
    const response: AxiosResponse<{ success: boolean; data: SystemHealth }> = await this.api.get('/admin/health');
    return response.data.data!;
  }

  async getAdminAnalytics(timeRange?: string): Promise<AdminAnalytics> {
    const response: AxiosResponse<{ success: boolean; data: AdminAnalytics }> = await this.api.get('/admin/analytics', {
      params: timeRange ? { timeRange } : undefined,
    });
    return response.data.data!;
  }

  async getAllUsers(): Promise<User[]> {
    const response: AxiosResponse<{ success: boolean; data: User[] }> = await this.api.get('/admin/users');
    return response.data.data || [];
  }

  async updateUserRole(userId: string, role: 'farmer' | 'expert' | 'admin'): Promise<User> {
    const response: AxiosResponse<{ success: boolean; data: User }> = await this.api.put(`/admin/users/${userId}/role`, { role });
    return response.data.data!;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.api.delete(`/admin/users/${userId}`);
  }

  async getSystemSettings(): Promise<SystemSettings> {
    const response: AxiosResponse<{ success: boolean; data: SystemSettings }> = await this.api.get('/admin/settings');
    return response.data.data!;
  }

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const response: AxiosResponse<{ success: boolean; data: SystemSettings }> = await this.api.put('/admin/settings', settings);
    return response.data.data!;
  }

  async getSecurityLogs(): Promise<any[]> {
    const response: AxiosResponse<{ success: boolean; data: any[] }> = await this.api.get('/admin/security/logs');
    return response.data.data || [];
  }

  async moderateForumThread(threadId: string, action: 'approve' | 'reject' | 'delete'): Promise<void> {
    await this.api.put(`/admin/forum/${threadId}/moderate`, { action });
  }
}

export const apiService = new ApiService();
export default apiService;


