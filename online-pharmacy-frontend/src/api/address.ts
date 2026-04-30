import apiClient from '../lib/apiClient';
import type { Address, AddressRequest } from '../types';

export const addressApi = {
  getAddresses: async (): Promise<Address[]> => {
    const res = await apiClient.get('/addresses');
    const data = await res.data;
    return data.data || data || [];
  },

  addAddress: async (request: AddressRequest): Promise<Address> => {
    const res = await apiClient.post('/addresses', request);
    return res.data.data || res.data;
  },

  updateAddress: async (id: number, request: AddressRequest): Promise<Address> => {
    const res = await apiClient.put(`/addresses/${id}`, request);
    return res.data.data || res.data;
  },

  deleteAddress: async (id: number): Promise<void> => {
    await apiClient.delete(`/addresses/${id}`);
  },

  setDefault: async (id: number): Promise<void> => {
    await apiClient.put(`/addresses/${id}/default`);
  },
};
