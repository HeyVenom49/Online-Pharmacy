import { create } from 'zustand';
import type { Cart, CartItem, AddToCartRequest } from '../types';
import cartApi from '../api/cart';

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (data: AddToCartRequest) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  loading: false,
  error: null,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const cart = await cartApi.getCart();
      set({ cart, loading: false });
    } catch (error) {
      set({ loading: false, cart: null });
    }
  },

  addToCart: async (data: AddToCartRequest) => {
    set({ loading: true, error: null });
    try {
      const cart = await cartApi.addToCart(data);
      set({ cart, loading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to add item',
        loading: false,
      });
      throw error;
    }
  },

  updateItem: async (itemId: number, quantity: number) => {
    set({ loading: true });
    try {
      const cart = await cartApi.updateCartItem(itemId, quantity);
      set({ cart, loading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to update item',
        loading: false,
      });
    }
  },

  removeFromCart: async (itemId: number) => {
    set({ loading: true });
    try {
      const cart = await cartApi.removeFromCart(itemId);
      set({ cart, loading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to remove item',
        loading: false,
      });
    }
  },

  clearCart: async () => {
    set({ loading: true });
    try {
      await cartApi.clearCart();
      set({ cart: null, loading: false });
    } catch (error: unknown) {
      set({ loading: false });
    }
  },
}));