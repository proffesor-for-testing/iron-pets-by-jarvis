import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.post(`/orders/${orderId}/cancel`);
      return response.data;
    },
    onSuccess: (_data, orderId) => {
      // Invalidate the specific order and orders list
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useReorderItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.post(`/orders/${orderId}/reorder`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate cart as items have been added
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
