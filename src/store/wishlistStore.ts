import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types";

interface WishlistStore {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  removeItem: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      toggleWishlist: (product) => {
        const items = get().items;
        const exists = items.some((item) => item.id === product.id);
        set({
          items: exists
            ? items.filter((item) => item.id !== product.id)
            : [...items, product],
        });
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      isWishlisted: (id) => get().items.some((item) => item.id === id),

      clearWishlist: () => set({ items: [] }),
    }),
    { name: "ifashion-wishlist" }
  )
);
