import { create } from 'zustand';
import type { Medicine, MedicineDetail, Category, MedicineSearchFilters } from '../types';
import catalogApi from '../api/catalog';

interface ProductState {
  medicines: Medicine[];
  categories: Category[];
  selectedProduct: MedicineDetail | null;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  filters: MedicineSearchFilters;
  loading: boolean;
  error: string | null;
  fetchMedicines: (page?: number) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchProductById: (id: number) => Promise<void>;
  searchMedicines: (filters: MedicineSearchFilters, page?: number) => Promise<void>;
  setFilters: (filters: Partial<MedicineSearchFilters>) => void;
  clearFilters: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
  medicines: [],
  categories: [],
  selectedProduct: null,
  pagination: {
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  },
  filters: {},
  loading: false,
  error: null,

    fetchMedicines: async (page = 0) => {
        set({ loading: true, error: null });
        try {
            const response = await catalogApi.getMedicines(page, 20);
            const medicinesList = response.data ?? [];
            const paginationData = response.pagination ?? {};
            set({
                medicines: medicinesList,
                pagination: {
                    page: paginationData.page ?? page,
                    size: paginationData.size ?? 20,
                    totalElements: paginationData.totalElements ?? medicinesList.length,
                    totalPages: paginationData.totalPages ?? 1,
                },
                loading: false,
            });
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            set({
                error: err.response?.data?.message || 'Failed to fetch medicines',
                loading: false,
            });
        }
    },

  fetchCategories: async () => {
    try {
      const categories = await catalogApi.getCategories();
      set({ categories: categories || [] });
    } catch (error) {
      set({ categories: [] });
    }
  },

  fetchProductById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const product = await catalogApi.getMedicineById(id);
      set({ selectedProduct: product, loading: false });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to fetch product',
        loading: false,
      });
    }
  },

  searchMedicines: async (filters: MedicineSearchFilters, page = 0) => {
    set({ loading: true, error: null });
    try {
      const response = await catalogApi.searchMedicines(filters, page, 20);
      const medicinesList = response.data || [];
      const paginationData = response.pagination || {};
      set({
        medicines: medicinesList,
        pagination: {
          page: paginationData.page ?? page,
          size: paginationData.size ?? 20,
          totalElements: paginationData.totalElements ?? medicinesList.length,
          totalPages: paginationData.totalPages ?? 1,
        },
        loading: false,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Failed to search medicines',
        loading: false,
      });
    }
  },

  setFilters: (filters: Partial<MedicineSearchFilters>) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  clearFilters: () => {
    set({ filters: {} });
  },
}));