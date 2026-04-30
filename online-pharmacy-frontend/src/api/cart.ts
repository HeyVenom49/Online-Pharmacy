import apiClient from '../lib/apiClient';
import type {
  ApiResponse,
  Cart,
  AddToCartRequest,
} from '../types';

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const response = await apiClient.get<ApiResponse<Cart>>('/orders/cart');
    return response.data.data;
  },

  addToCart: async (data: AddToCartRequest): Promise<Cart> => {
    const response = await apiClient.post<ApiResponse<Cart>>('/orders/cart/items', data);
    return response.data.data;
  },

  updateCartItem: async (itemId: number, quantity: number): Promise<Cart> => {
    const response = await apiClient.put<ApiResponse<Cart>>(`/orders/cart/items/${itemId}?quantity=${quantity}`);
    return response.data.data;
  },

  removeFromCart: async (itemId: number): Promise<Cart> => {
    const response = await apiClient.delete<ApiResponse<Cart>>(`/orders/cart/items/${itemId}`);
    return response.data.data;
  },

  clearCart: async (): Promise<void> => {
    await apiClient.delete('/orders/cart');
  },
};

export default cartApi;