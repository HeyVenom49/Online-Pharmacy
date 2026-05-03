import apiClient from '../lib/apiClient';
import type {
  ApiResponse,
  PageResponse,
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
    ): Promise<PaginatedMedicinesResponse> => {
        const response = await apiClient.get<ApiResponse<PageResponse<Medicine>>>('/catalog/medicines', {
            params: { page, size },
        });
        const pageData = response.data.data;
        return {
            data: pageData.content,
            pagination: {
                page: pageData.number,
                size: pageData.size,
                totalElements: pageData.totalElements,
                totalPages: pageData.totalPages,
                first: pageData.first,
                last: pageData.last,
            },
        };
    },

    searchMedicines: async (
        filters: MedicineSearchFilters,
        page = 0,
        size = 20
    ): Promise<PaginatedMedicinesResponse> => {
        const response = await apiClient.get('/catalog/medicines/search', {
            params: { ...filters, page, size },
        });
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
        const response = await apiClient.get<ApiResponse<MedicineDetail>>(`/catalog/medicines/${id}`);
        return response.data.data;
    },

    getCategories: async (): Promise<Category[]> => {
        const response = await apiClient.get<ApiResponse<Category[]>>('/catalog/categories');
        return response.data?.data || [];
    },
};

export default catalogApi;