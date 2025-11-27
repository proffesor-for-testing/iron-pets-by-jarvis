import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function usePets() {
  return useQuery({
    queryKey: ['pets'],
    queryFn: async () => {
      const response = await api.get('/pets');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePet(petId: string) {
  return useQuery({
    queryKey: ['pet', petId],
    queryFn: async () => {
      const response = await api.get(`/pets/${petId}`);
      return response.data;
    },
    enabled: !!petId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      type: 'dog' | 'cat' | 'bird' | 'fish' | 'reptile' | 'small-animal' | 'other';
      breed?: string;
      age?: number;
      weight?: number;
      gender?: 'male' | 'female';
      photo?: string;
      specialNeeds?: string[];
      dietaryRestrictions?: string[];
    }) => {
      const response = await api.post('/pets', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });
}

export function useUpdatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.patch(`/pets/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      queryClient.invalidateQueries({ queryKey: ['pet', variables.id] });
    },
  });
}

export function useDeletePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (petId: string) => {
      const response = await api.delete(`/pets/${petId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });
}

export function usePetRecommendations(petId: string) {
  return useQuery({
    queryKey: ['pet', petId, 'recommendations'],
    queryFn: async () => {
      const response = await api.get(`/pets/${petId}/recommendations`);
      return response.data;
    },
    enabled: !!petId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
