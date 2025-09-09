export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'farmer' | 'expert' | 'admin';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
}

export interface Crop {
  _id: string;
  name: string;
  type: string;
  plantingDate: string;
  harvestDate?: string;
  status: 'planted' | 'growing' | 'harvested';
  location: string;
  notes?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CropFormData {
  name: string;
  type: string;
  plantingDate: string;
  expectedHarvestDate: string;
  area: number;
  unit: 'acres' | 'hectares' | 'square_meters';
  status: 'planted' | 'growing' | 'harvested';
  location?: string;
  notes?: string;
}

// Minimal payload required by backend to create a crop
export interface CreateCropRequest {
  name: string;
  type: 'vegetable' | 'fruit' | 'grain' | 'legume' | 'herb' | 'spice' | 'other';
  plantingDate: string; // ISO date string
  expectedHarvestDate: string; // ISO date string
  area: number;
  unit?: 'acres' | 'hectares' | 'square_meters';
  status?: 'planted' | 'growing' | 'flowering' | 'fruiting' | 'harvested' | 'failed';
  notes?: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  description: string;
  location: string;
  timestamp: string;
}

export interface MarketData {
  _id: string;
  cropName: string;
  price: number;
  unit: string;
  location: string;
  date: string;
  source: string;
}

export interface ForumThread {
  _id: string;
  title: string;
  content: string;
  category: 'general' | 'crop_management' | 'pest_control' | 'soil_health' | 'weather' | 'market_prices' | 'equipment' | 'organic_farming' | 'irrigation' | 'fertilizers' | 'harvesting' | 'storage' | 'other';
  author: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  replies: ForumReply[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateThreadRequest {
  title: string;
  content: string;
  category: ForumThread['category'];
}

export interface ForumReply {
  _id: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  userId: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Admin-specific types
export interface AdminStats {
  totalUsers: number;
  totalCrops: number;
  totalForumThreads: number;
  totalMarketEntries: number;
  newUsersThisMonth: number;
  activeUsers: number;
}

export interface SystemHealth {
  apiStatus: 'healthy' | 'warning' | 'error';
  databaseStatus: 'healthy' | 'warning' | 'error';
  lastBackup: string;
  uptime: string;
}

export interface AdminAnalytics {
  userGrowth: {
    total: number;
    monthly: number;
    weekly: number;
  };
  platformUsage: {
    totalCrops: number;
    totalForumPosts: number;
    totalMarketEntries: number;
    weatherRequests: number;
  };
  engagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionTime: string;
  };
  revenue: {
    totalRevenue: number;
    monthlyRevenue: number;
    growthRate: number;
  };
}

export interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    emailVerificationRequired: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    adminNotifications: boolean;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    twoFactorAuth: boolean;
    ipWhitelist: string[];
  };
  integrations: {
    weatherApiKey: string;
    marketDataApiKey: string;
    emailService: string;
    smsService: string;
  };
}


