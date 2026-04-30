import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserPrefsState {
  wishlistIds: number[];
  recentMedicineIds: number[];
  addToWishlist: (medicineId: number) => void;
  removeFromWishlist: (medicineId: number) => void;
  toggleWishlist: (medicineId: number) => void;
  isWishlisted: (medicineId: number) => boolean;
  addRecentlyViewed: (medicineId: number) => void;
}

export const useUserPrefsStore = create<UserPrefsState>()(
  persist(
    (set, get) => ({
      wishlistIds: [],
      recentMedicineIds: [],

      addToWishlist: (medicineId: number) => {
        set((state) => ({
          wishlistIds: state.wishlistIds.includes(medicineId)
            ? state.wishlistIds
            : [medicineId, ...state.wishlistIds],
        }));
      },

      removeFromWishlist: (medicineId: number) => {
        set((state) => ({
          wishlistIds: state.wishlistIds.filter((id) => id !== medicineId),
        }));
      },

      toggleWishlist: (medicineId: number) => {
        const exists = get().wishlistIds.includes(medicineId);
        if (exists) {
          get().removeFromWishlist(medicineId);
        } else {
          get().addToWishlist(medicineId);
        }
      },

      isWishlisted: (medicineId: number) => get().wishlistIds.includes(medicineId),

      addRecentlyViewed: (medicineId: number) => {
        set((state) => {
          const withoutCurrent = state.recentMedicineIds.filter((id) => id !== medicineId);
          return {
            recentMedicineIds: [medicineId, ...withoutCurrent].slice(0, 12),
          };
        });
      },
    }),
    {
      name: 'user-prefs-storage',
      partialize: (state) => ({
        wishlistIds: state.wishlistIds,
        recentMedicineIds: state.recentMedicineIds,
      }),
    }
  )
);

