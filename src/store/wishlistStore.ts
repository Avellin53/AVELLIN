import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './cartStore';

interface WishlistState {
  savedItems: Product[];
  isSaved: (productId: string) => boolean;
  toggleSave: (product: Product) => boolean;
  removeFromSaved: (productId: string) => void;
  clearSaved: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      savedItems: [],
      isSaved: (productId: string) => {
        return (get().savedItems || []).some((item) => item.id === productId);
      },
      toggleSave: (product: Product) => {
        const current = get().savedItems || [];
        const exists = current.some((item) => item.id === product.id);
        if (exists) {
          set({ savedItems: current.filter((item) => item.id !== product.id) });
          return false;
        } else {
          set({ savedItems: [product, ...current] });
          return true;
        }
      },
      removeFromSaved: (productId: string) => {
        const current = get().savedItems || [];
        set({ savedItems: current.filter((item) => item.id !== productId) });
      },
      clearSaved: () => {
        set({ savedItems: [] });
      },
    }),
    {
      name: 'avellin_wishlist',
    }
  )
);
