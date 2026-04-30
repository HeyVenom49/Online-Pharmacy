import apiClient from '../lib/apiClient';
import type {
  ApiResponse,
  Category,
  Medicine,
  MedicineDetail,
  MedicineSearchFilters,
} from '../types';

type PaginatedMedicinesResponse = {
  data: Medicine[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first?: boolean;
    last?: boolean;
  };
};

export const catalogApi = {
    getMedicines: async (
        page = 0,
        size = 20
    ): Promise<{ data: { data: Medicine[], pagination: any } }> => {
        console.log('Calling GET /catalog/medicines with params:', { page, size });
        const response = await apiClient.get<any>('/catalog/medicines', {
            params: { page, size },
        });
        console.log('Response from /catalog/medicines:', response.data);
        return response;
    },

    searchMedicines: async (
        filters: MedicineSearchFilters,
        page = 0,
        size = 20
    ): Promise<PaginatedMedicinesResponse> => {
        console.log('Calling GET /catalog/medicines/search with params:', { ...filters, page, size });
        const response = await apiClient.get('/catalog/medicines/search', {
            params: { ...filters, page, size },
        });
        console.log('Response from /catalog/medicines/search:', response.data);
        const envelope = response.data as ApiResponse<unknown>;
        const inner = envelope.data;
        let data: Medicine[] = [];
        let pagination = {
            page,
            size,
            totalElements: 0,
            totalPages: 0,
        };
        if (Array.isArray(inner)) {
            data = inner as Medicine[];
        } else if (inner && typeof inner === 'object') {
            const blob = inner as { data?: Medicine[]; pagination?: typeof pagination };
            data = blob.data ?? [];
            pagination = blob.pagination ?? pagination;
        }
        return { data, pagination };
    },

    getMedicineById: async (id: number): Promise<MedicineDetail> => {
        console.log('Calling GET /catalog/medicines/${id}');
        const response = await apiClient.get<ApiResponse<MedicineDetail>>(`/catalog/medicines/${id}`);
        console.log('Response from /catalog/medicines/${id}:', response.data);
        return response.data.data;
    },

    getCategories: async (): Promise<Category[]> => {
        console.log('Calling GET /catalog/categories');
        const response = await apiClient.get<any>('/catalog/categories');
        console.log('Response from /catalog/categories:', response.data);
        return response.data?.data || [];
    },
};

export default catalogApi;