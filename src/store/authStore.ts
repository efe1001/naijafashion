import { create } from "zustand";
import { useWishlistStore } from "@/store/wishlistStore";

export type UserRole = "admin" | "user";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  state?: string;
  createdAt: string;
  lastLogin?: string | null;
  status: "active" | "suspended";
  totalOrders?: number;
  totalSpent?: number;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  state?: string;
}

interface AuthStore {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  fetchMe: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: RegisterPayload) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: { name: string; phone: string; address: string; state: string }) => Promise<{ success: boolean; message: string }>;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  currentUser: null,
  isAuthenticated: false,
  hydrated: false,

  fetchMe: async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      set({ currentUser: data.user ?? null, isAuthenticated: !!data.user, hydrated: true });
      if (data.user) useWishlistStore.getState().fetchWishlist();
    } catch {
      set({ currentUser: null, isAuthenticated: false, hydrated: true });
    }
  },

  login: async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.error || "Login failed" };
    set({ currentUser: data.user, isAuthenticated: true });
    useWishlistStore.getState().fetchWishlist();
    return { success: true, message: "Login successful" };
  },

  register: async (payload) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.error || "Registration failed" };
    set({ currentUser: data.user, isAuthenticated: true });
    return { success: true, message: "Account created" };
  },

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({ currentUser: null, isAuthenticated: false });
    useWishlistStore.getState().clear();
  },

  updateProfile: async (data) => {
    const res = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) return { success: false, message: result.error || "Update failed" };
    set({ currentUser: result.user });
    return { success: true, message: "Profile updated" };
  },
}));
