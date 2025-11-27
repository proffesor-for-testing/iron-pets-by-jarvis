import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface OrderFilters {
  page?: number;
  limit?: number;
  status?: 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export function useOrders(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/orders?${params.toString()}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    },
    enabled: !!orderId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useOrderTracking(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId, 'tracking'],
    queryFn: async () => {
      const response = await api.get(`/orders/${orderId}/tracking`);
      return response.data;
    },
    enabled: !!orderId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useOrderInvoice(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId, 'invoice'],
    queryFn: async () => {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });
      return response.data;
    },
    enabled: false, // Only fetch when explicitly requested
  });
}
