import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - categories don't change often
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      const response = await api.get(`/categories/${slug}`);
      return response.data;
    },
    enabled: !!slug,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useCategoryProducts(slug: string, filters: any = {}) {
  return useQuery({
    queryKey: ['category', slug, 'products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.sort) params.append('sort', filters.sort);

      const response = await api.get(`/categories/${slug}/products?${params.toString()}`);
      return response.data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategoryTree() {
  return useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: async () => {
      const response = await api.get('/categories/tree');
      return response.data;
    },
    staleTime: 30 * 60 * 1000,
  });
}
