import apiClient from '../lib/apiClient';
import type {
  ApiResponse,
  Order,
  CheckoutRequest,
  PaymentRequest,
} from '../types';

export const ordersApi = {
  checkout: async (data: CheckoutRequest): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>('/orders/checkout/start', data);
    return response.data.data;
  },

  initiatePayment: async (orderId: number, data: PaymentRequest): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>(`/orders/checkout/payment?orderId=${orderId}`, data);
    return response.data.data;
  },

  confirmPayment: async (orderId: number, transactionId: string): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>(`/orders/checkout/confirm?orderId=${orderId}&transactionId=${transactionId}`);
    return response.data.data;
  },

  getOrders: async (): Promise<any[]> => {
    const response = await apiClient.get<any>('/orders');
    console.log('Orders API response:', response.data);
    // Handle both ApiPaginatedResponse and ApiResponse formats
    const data = response.data?.data;
    if (Array.isArray(data)) return data;
    if (data?.content) return data.content; // Paginated response
    return [];
  },

  getOrderById: async (orderId: number): Promise<any> => {
    const response = await apiClient.get<any>(`/orders/${orderId}`);
    console.log('Order detail API response:', response.data);
    return response.data?.data || response.data;
  },

  cancelOrder: async (orderId: number): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>(`/orders/${orderId}/cancel`);
    return response.data.data;
  },
};

export default ordersApi;