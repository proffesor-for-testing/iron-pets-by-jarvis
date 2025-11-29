import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async (password: string) => {
      const response = await api.delete('/user/account', {
        data: { password },
      });
      return response.data;
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });
}

export function useExportData() {
  return useMutation({
    mutationFn: async () => {
      const response = await api.get('/user/export', {
        responseType: 'blob',
      });
      return response.data;
    },
  });
}
