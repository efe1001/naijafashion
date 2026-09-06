import { create } from "zustand";
import { Product } from "@/types";

interface ToggleResult {
  success: boolean;
  requiresAuth: boolean;
}

interface WishlistStore {
  items: Product[];
  loaded: boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (product: Product) => Promise<ToggleResult>;
  isWishlisted: (id: string) => boolean;
  clear: () => void;
  clearWishlist: () => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>()((set, get) => ({
  items: [],
  loaded: false,

  fetchWishlist: async () => {
    try {
      const res = await fetch("/api/wishlist");
      const data = await res.json();
      set({ items: data.products ?? [], loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  toggleWishlist: async (product) => {
    const exists = get().items.some((item) => item.id === product.id);
    const res = await fetch(
      exists ? `/api/wishlist?productId=${encodeURIComponent(product.id)}` : "/api/wishlist",
      exists
        ? { method: "DELETE" }
        : {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product.id }),
          }
    );

    if (res.status === 401) return { success: false, requiresAuth: true };
    if (!res.ok) return { success: false, requiresAuth: false };

    set((state) => ({
      items: exists ? state.items.filter((item) => item.id !== product.id) : [...state.items, product],
    }));
    return { success: true, requiresAuth: false };
  },

  isWishlisted: (id) => get().items.some((item) => item.id === id),

  clear: () => set({ items: [], loaded: false }),

  clearWishlist: async () => {
    await fetch("/api/wishlist", { method: "DELETE" });
    set({ items: [] });
  },
}));
