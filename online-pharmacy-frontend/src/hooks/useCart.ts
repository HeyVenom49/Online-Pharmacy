import { useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/cart';
import type { Cart, AddToCartRequest } from '../types';

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const data = await cartApi.getCart();
      setCart(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (data: AddToCartRequest) => {
    try {
      setError('');
      const updatedCart = await cartApi.addToCart(data);
      setCart(updatedCart);
      return updatedCart;
    } catch (err: any) {
      setError(err.message || 'Failed to add to cart');
      throw err;
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      setError('');
      const updatedCart = await cartApi.updateCartItem(itemId, quantity);
      setCart(updatedCart);
      return updatedCart;
    } catch (err: any) {
      setError(err.message || 'Failed to update quantity');
      throw err;
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      setError('');
      const updatedCart = await cartApi.removeFromCart(itemId);
      setCart(updatedCart);
      return updatedCart;
    } catch (err: any) {
      setError(err.message || 'Failed to remove item');
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      setError('');
      await cartApi.clearCart();
      setCart(null);
    } catch (err: any) {
      setError(err.message || 'Failed to clear cart');
      throw err;
    }
  };

  const getItemCount = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  };

  return {
    cart,
    loading,
    error,
    refetch: fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    itemCount: getItemCount(),
    total: getTotal(),
  };
}