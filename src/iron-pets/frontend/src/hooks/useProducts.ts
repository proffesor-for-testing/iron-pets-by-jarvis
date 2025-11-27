import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  petType?: string;
  sort?: string;
}

interface SearchFilters extends ProductFilters {
  query: string;
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.petType) params.append('petType', filters.petType);
      if (filters.sort) params.append('sort', filters.sort);

      const response = await api.get(`/products?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const response = await api.get(`/products/${slug}`);
      return response.data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchProducts(filters: SearchFilters) {
  return useQuery({
    queryKey: ['products', 'search', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      params.append('q', filters.query);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.petType) params.append('petType', filters.petType);
      if (filters.sort) params.append('sort', filters.sort);

      const response = await api.get(`/products/search?${params.toString()}`);
      return response.data;
    },
    enabled: !!filters.query,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const response = await api.get('/products/featured');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useRelatedProducts(productId: string, _categoryId?: string) {
  return useQuery({
    queryKey: ['products', 'related', productId],
    queryFn: async () => {
      const response = await api.get(`/products/${productId}/related`);
      return response.data;
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
}
