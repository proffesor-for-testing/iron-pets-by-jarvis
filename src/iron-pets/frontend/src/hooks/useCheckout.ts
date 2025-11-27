import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCartStore } from '@/store/cart';

export function useShippingRates(zipCode?: string) {
  const items = useCartStore((state) => state.items);

  return useQuery({
    queryKey: ['shipping-rates', zipCode, items.length],
    queryFn: async () => {
      const response = await api.post('/checkout/shipping-rates', {
        items: items.map(item => ({ productId: item.productId, quantity: item.quantity })),
        zipCode,
      });
      return response.data;
    },
    enabled: !!zipCode && items.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreatePaymentIntent() {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal);

  return useMutation({
    mutationFn: async (data: {
      shipping: Record<string, unknown>;
      shippingMethod: string;
    }) => {
      const response = await api.post('/checkout/payment-intent', {
        items: items.map(item => ({ productId: item.productId, quantity: item.quantity, price: item.price })),
        subtotal,
        ...data,
      });
      return response.data;
    },
  });
}

export function useCreatePayment() {
  return useMutation({
    mutationFn: async (data: {
      paymentMethodId: string;
      billingAddress: Record<string, unknown>;
    }) => {
      const response = await api.post('/checkout/payment', data);
      return response.data;
    },
  });
}

export function useConfirmOrder() {
  const queryClient = useQueryClient();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal);
  const clearCart = useCartStore((state) => state.clearCart);

  return useMutation({
    mutationFn: async (data: {
      shipping: Record<string, unknown>;
      payment: Record<string, unknown>;
    }) => {
      const response = await api.post('/checkout/confirm', {
        items: items.map(item => ({ productId: item.productId, quantity: item.quantity, price: item.price })),
        subtotal,
        ...data,
      });
      return response.data;
    },
    onSuccess: () => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useValidateAddress() {
  return useMutation({
    mutationFn: async (address: {
      address1: string;
      address2?: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    }) => {
      const response = await api.post('/checkout/validate-address', address);
      return response.data;
    },
  });
}

export function useApplyGiftCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const response = await api.post(`/checkout/gift-card`, {
        code,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
