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

/** Backend uses ApiPaginatedResponse: { data: T[], pagination: { ... } } — not Spring Page inside data. */
function parsePaginatedMedicines(
  body: unknown,
  fallbacks: { page: number; size: number }
): PaginatedMedicinesResponse {
  const b = body as {
    data?: unknown;
    pagination?: PaginatedMedicinesResponse['pagination'];
  };
  const raw = b.data;
  let list: Medicine[] = [];
  if (Array.isArray(raw)) {
    list = raw as Medicine[];
  } else if (raw && typeof raw === 'object' && 'content' in raw) {
    list = ((raw as PageResponse<Medicine>).content ?? []) as Medicine[];
  }
  const p = b.pagination;
  return {
    data: list,
    pagination: {
      page: p?.page ?? fallbacks.page,
      size: p?.size ?? fallbacks.size,
      totalElements: p?.totalElements ?? list.length,
      totalPages: p?.totalPages ?? 0,
      first: p?.first,
      last: p?.last,
    },
  };
}

export const catalogApi = {
    getMedicines: async (
        page = 0,
        size = 20
    ): Promise<PaginatedMedicinesResponse> => {
        const response = await apiClient.get('/catalog/medicines', {
            params: { page, size },
        });
        return parsePaginatedMedicines(response.data, { page, size });
    },

    searchMedicines: async (
        filters: MedicineSearchFilters,
        page = 0,
        size = 20
    ): Promise<PaginatedMedicinesResponse> => {
        const response = await apiClient.get('/catalog/medicines/search', {
            params: { ...filters, page, size },
        });
        return parsePaginatedMedicines(response.data, { page, size });
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