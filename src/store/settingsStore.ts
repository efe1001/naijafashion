import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  whatsappNumber: string;
  setWhatsappNumber: (whatsappNumber: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      whatsappNumber: "+2348012345678",
      setWhatsappNumber: (whatsappNumber) => set({ whatsappNumber }),
    }),
    { name: "ifashion-settings" }
  )
);
