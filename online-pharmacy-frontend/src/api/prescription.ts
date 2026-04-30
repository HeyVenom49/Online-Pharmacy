import apiClient from '../lib/apiClient';
import type { Prescription, PrescriptionStatus } from '../types';

export interface PrescriptionRequest {
  medicineId: number;
  image: File;
}

export const prescriptionApi = {
  upload: async (medicineId: number, file: File): Promise<Prescription> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('medicineId', medicineId.toString());

    const res = await apiClient.post('/prescriptions/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data || res.data;
  },

  getMyPrescriptions: async (): Promise<Prescription[]> => {
    const res = await apiClient.get('/prescriptions/my');
    const data = await res.data;
    return data.data || data || [];
  },

  getPending: async (): Promise<Prescription[]> => {
    const res = await apiClient.get('/prescriptions/pending');
    const data = await res.data;
    return data.data || data || [];
  },

  approve: async (id: number): Promise<void> => {
    await apiClient.put(`/internal/prescriptions/${id}/approve`);
  },

  reject: async (id: number, reason: string): Promise<void> => {
    await apiClient.put(`/internal/prescriptions/${id}/reject`, { reason });
  },
};
