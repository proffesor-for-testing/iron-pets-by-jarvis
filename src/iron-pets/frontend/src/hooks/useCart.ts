import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCartStore, CartItem } from '@/store/cart';

// Hook to get cart state directly from store
export function useCart() {
  const items = useCartStore((state) => state.items);
  const itemCount = useCartStore((state) => state.itemCount);
  const subtotal = useCartStore((state) => state.subtotal);
  const tax = useCartStore((state) => state.tax);
  const total = useCartStore((state) => state.total);
  const isOpen = useCartStore((state) => state.isOpen);

  // Free shipping for orders over $50
  const shipping = subtotal >= 50 ? 0 : 5.99;

  return {
    data: {
      items,
      itemCount,
      subtotal,
      tax,
      shipping,
      discount: 0, // Discounts applied via promo codes
      total: total + shipping,
    },
    isOpen,
    isLoading: false,
    isError: false,
  };
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  return useMutation({
    mutationFn: async (data: {
      productId: string;
      name?: string;
      price?: number;
      imageUrl?: string;
      variantId?: string;
      quantity: number;
    }) => {
      // Create cart item from data
      const item: Omit<CartItem, 'quantity'> & { quantity?: number } = {
        id: `${data.productId}-${Date.now()}`,
        productId: data.productId,
        name: data.name || 'Product',
        price: data.price || 0,
        imageUrl: data.imageUrl,
        quantity: data.quantity,
      };
      addItem(item);
      return item;
    },
    onSuccess: () => {
      openCart();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  return useMutation({
    mutationFn: async (data: { itemId: string; quantity: number }) => {
      updateQuantity(data.itemId, data.quantity);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const removeItem = useCartStore((state) => state.removeItem);

  return useMutation({
    mutationFn: async (itemId: string) => {
      removeItem(itemId);
      return itemId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((state) => state.clearCart);

  return useMutation({
    mutationFn: async () => {
      clearCart();
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useApplyPromoCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_code: string) => {
      // Promo code functionality would be handled server-side
      // For now, just return success
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

// Cart UI state hooks
export function useCartOpen() {
  const isOpen = useCartStore((state) => state.isOpen);
  const openCart = useCartStore((state) => state.openCart);
  const closeCart = useCartStore((state) => state.closeCart);
  const toggleCart = useCartStore((state) => state.toggleCart);

  return { isOpen, openCart, closeCart, toggleCart };
}
