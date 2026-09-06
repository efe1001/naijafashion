import { create } from "zustand";

export interface StoreInfo {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  freeDeliveryThreshold: string;
  deliveryFee: string;
}

export interface NotificationPrefs {
  newOrder: boolean;
  orderShipped: boolean;
  lowStock: boolean;
  newUser: boolean;
  paymentFailed: boolean;
}

export interface PaymentSettings {
  monnifyApiKey: string;
  monnifyContractCode: string;
  enableCard: boolean;
  enableTransfer: boolean;
  enableUssd: boolean;
  enablePhoneNumber: boolean;
}

interface SettingsPayload {
  whatsappNumber?: string;
  storeInfo?: StoreInfo;
  notifications?: NotificationPrefs;
  payment?: PaymentSettings;
}

interface SettingsStore extends Required<SettingsPayload> {
  loaded: boolean;
  fetchSettings: () => Promise<void>;
  saveSettings: (data: SettingsPayload) => Promise<boolean>;
}

const DEFAULT_STORE_INFO: StoreInfo = {
  name: "iFashion",
  tagline: "Nigeria's Premier Fashion Store",
  email: "hello@ifashion.ng",
  phone: "+234 801 234 5678",
  address: "15 Bode Thomas Street, Surulere, Lagos",
  currency: "NGN",
  freeDeliveryThreshold: "50000",
  deliveryFee: "3500",
};

const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  newOrder: true, orderShipped: true, lowStock: true, newUser: false, paymentFailed: true,
};

const DEFAULT_PAYMENT: PaymentSettings = {
  monnifyApiKey: "MK_TEST_SMRU9ZUSV7",
  monnifyContractCode: "6594730824",
  enableCard: true, enableTransfer: true, enableUssd: true, enablePhoneNumber: true,
};

export const useSettingsStore = create<SettingsStore>()((set) => ({
  whatsappNumber: "+2348012345678",
  storeInfo: DEFAULT_STORE_INFO,
  notifications: DEFAULT_NOTIFICATIONS,
  payment: DEFAULT_PAYMENT,
  loaded: false,

  fetchSettings: async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      set({
        whatsappNumber: data.whatsappNumber ?? "+2348012345678",
        storeInfo: { ...DEFAULT_STORE_INFO, ...data.storeInfo },
        notifications: { ...DEFAULT_NOTIFICATIONS, ...data.notifications },
        payment: { ...DEFAULT_PAYMENT, ...data.payment },
        loaded: true,
      });
    } catch {
      set({ loaded: true });
    }
  },

  saveSettings: async (payload) => {
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return false;
    const data = await res.json();
    set({
      whatsappNumber: data.whatsappNumber,
      storeInfo: { ...DEFAULT_STORE_INFO, ...data.storeInfo },
      notifications: { ...DEFAULT_NOTIFICATIONS, ...data.notifications },
      payment: { ...DEFAULT_PAYMENT, ...data.payment },
    });
    return true;
  },
}));
