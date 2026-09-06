import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProductVideoStore {
  videos: Record<string, string>;
  setVideo: (productId: string, url: string) => void;
  removeVideo: (productId: string) => void;
}

export const useProductVideoStore = create<ProductVideoStore>()(
  persist(
    (set) => ({
      videos: {},

      setVideo: (productId, url) =>
        set((state) => ({ videos: { ...state.videos, [productId]: url } })),

      removeVideo: (productId) =>
        set((state) => {
          const videos = { ...state.videos };
          delete videos[productId];
          return { videos };
        }),
    }),
    { name: "ifashion-product-videos" }
  )
);
