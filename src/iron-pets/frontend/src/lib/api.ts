import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@store/auth';
import { mockProducts, mockCategories, mockUser, mockOrders, mockPets } from './mock-data';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Mock API responses for demo mode
const mockApiResponse = (url: string, method: string, data?: unknown): unknown => {
  // Products
  if (url.includes('/products') && method === 'GET') {
    const slugMatch = url.match(/\/products\/([^/?]+)/);
    if (slugMatch) {
      const product = mockProducts.find(p => p.slug === slugMatch[1] || p.id === slugMatch[1]);
      return product || null;
    }
    return { products: mockProducts, total: mockProducts.length, page: 1, pageSize: 12 };
  }

  // Search
  if (url.includes('/search') && method === 'GET') {
    return { products: mockProducts, total: mockProducts.length };
  }

  // Categories
  if (url.includes('/categories') && method === 'GET') {
    const slugMatch = url.match(/\/categories\/([^/?]+)/);
    if (slugMatch) {
      const category = mockCategories.find(c => c.slug === slugMatch[1]);
      const categoryProducts = mockProducts.filter(p => p.category?.slug === slugMatch[1]);
      return { category, products: categoryProducts, total: categoryProducts.length };
    }
    return { categories: mockCategories };
  }

  // Auth
  if (url.includes('/auth/login') && method === 'POST') {
    return { user: mockUser, token: 'demo-token-12345', refreshToken: 'demo-refresh-token' };
  }
  if (url.includes('/auth/register') && method === 'POST') {
    return { user: mockUser, token: 'demo-token-12345', refreshToken: 'demo-refresh-token' };
  }
  if (url.includes('/auth/me') && method === 'GET') {
    return mockUser;
  }
  if (url.includes('/auth/logout') && method === 'POST') {
    return { success: true };
  }

  // Orders
  if (url.includes('/orders') && method === 'GET') {
    const orderIdMatch = url.match(/\/orders\/([^/?]+)/);
    if (orderIdMatch) {
      return mockOrders.find(o => o.id === orderIdMatch[1]) || mockOrders[0];
    }
    return { orders: mockOrders, total: mockOrders.length };
  }

  // Pets
  if (url.includes('/pets') && method === 'GET') {
    return mockPets;
  }
  if (url.includes('/pets') && method === 'POST') {
    return { id: `pet-${Date.now()}`, ...(data as object) };
  }

  // Checkout
  if (url.includes('/checkout/shipping-rates') && method === 'POST') {
    return {
      rates: [
        { id: 'standard', name: 'Standard Shipping', price: 5.99, estimatedDays: '5-7' },
        { id: 'express', name: 'Express Shipping', price: 12.99, estimatedDays: '2-3' },
        { id: 'overnight', name: 'Overnight Shipping', price: 24.99, estimatedDays: '1' },
      ],
    };
  }
  if (url.includes('/checkout/payment-intent') && method === 'POST') {
    return { clientSecret: 'demo_secret_12345' };
  }
  if (url.includes('/checkout/confirm') && method === 'POST') {
    return {
      id: `order-${Date.now()}`,
      orderNumber: `IP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      status: 'processing',
    };
  }
  if (url.includes('/checkout/validate-address') && method === 'POST') {
    return { valid: true, normalized: data };
  }
  if (url.includes('/checkout/gift-card') && method === 'POST') {
    return { valid: true, amount: 25.00 };
  }

  // Default response
  return { success: true };
};

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: !DEMO_MODE,
});

// Demo mode interceptor - intercept all requests and return mock data
if (DEMO_MODE) {
  api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Create a mock response
      const mockData = mockApiResponse(config.url || '', config.method?.toUpperCase() || 'GET', config.data);

      // Throw a custom error that we'll catch to return mock data
      const error = new Error('DEMO_MODE') as Error & { mockData: unknown; config: InternalAxiosRequestConfig };
      error.mockData = mockData;
      error.config = config;
      throw error;
    }
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.message === 'DEMO_MODE') {
        // Return mock data as if it were a real response
        return Promise.resolve({
          data: error.mockData,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
        });
      }
      return Promise.reject(error);
    }
  );
} else {
  // Normal mode - add auth token
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = useAuthStore.getState().token;

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for handling errors
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      // Handle 401 Unauthorized
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh the token
          const refreshToken = useAuthStore.getState().refreshToken;

          if (refreshToken) {
            const response = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken,
            });

            const { token: newToken } = response.data;

            // Update token in store
            useAuthStore.getState().setToken(newToken);

            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }

            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          useAuthStore.getState().logout();

          // Redirect to login if on client side
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }

          return Promise.reject(refreshError);
        }
      }

      // Handle other errors
      const errorMessage = error.response?.data
        ? (error.response.data as { message?: string }).message || 'An error occurred'
        : error.message || 'Network error';

      console.error('API Error:', {
        status: error.response?.status,
        message: errorMessage,
        url: error.config?.url,
      });

      return Promise.reject(error);
    }
  );
}

// API helper functions
export const apiClient = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    api.get<T>(url, config).then(res => res.data),

  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.post<T>(url, data, config).then(res => res.data),

  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.put<T>(url, data, config).then(res => res.data),

  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.patch<T>(url, data, config).then(res => res.data),

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    api.delete<T>(url, config).then(res => res.data),
};

export default api;
