import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  variant?: {
    size?: string;
    color?: string;
  };
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const TAX_RATE = 0.08; // 8% tax

// Derive computed values from items — always consistent, never stale
export function getCartTotals(items: CartItem[]) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = subtotal + tax;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, tax, total, itemCount };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        const items = get().items;
        const existingItemIndex = items.findIndex(
          item =>
            item.productId === newItem.productId &&
            JSON.stringify(item.variant) === JSON.stringify(newItem.variant)
        );

        let updatedItems: CartItem[];

        if (existingItemIndex > -1) {
          // Item exists, update quantity
          updatedItems = items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
              : item
          );
        } else {
          // New item, add to cart
          updatedItems = [
            ...items,
            {
              ...newItem,
              quantity: newItem.quantity || 1,
            } as CartItem,
          ];
        }

        set({ items: updatedItems });
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter(item => item.id !== itemId) });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set({
          items: get().items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () =>
        set({ items: [] }),

      toggleCart: () =>
        set(state => ({ isOpen: !state.isOpen })),

      openCart: () =>
        set({ isOpen: true }),

      closeCart: () =>
        set({ isOpen: false }),
    }),
    {
      name: 'iron-pets-cart',
      storage: createJSONStorage(() => {
        // Return a no-op storage during SSR
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);
