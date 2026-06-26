import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "admin" | "user";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  state?: string;
  createdAt: string;
  lastLogin?: string;
  status: "active" | "suspended";
  totalOrders?: number;
  totalSpent?: number;
}

interface AuthStore {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  updateProfile: (data: Partial<AuthUser>) => void;
}

// All accounts with hashed-style passwords (plain for demo)
export const ACCOUNTS: Array<AuthUser & { password: string }> = [
  {
    id: "usr-admin-001",
    name: "NaijaFashion Admin",
    email: "admin@naijafashion.ng",
    password: "Admin@2025",
    role: "admin",
    phone: "+234 801 000 0001",
    address: "15 Bode Thomas Street, Surulere",
    state: "Lagos",
    createdAt: "2024-01-01",
    lastLogin: "2025-06-25",
    status: "active",
    totalOrders: 0,
    totalSpent: 0,
  },
  {
    id: "usr-002",
    name: "Adaeze Okonkwo",
    email: "ada@naijafashion.ng",
    password: "Ada@2025",
    role: "user",
    phone: "+234 802 111 2222",
    address: "22 Allen Avenue, Ikeja",
    state: "Lagos",
    createdAt: "2024-03-15",
    lastLogin: "2025-06-20",
    status: "active",
    totalOrders: 8,
    totalSpent: 245000,
  },
  {
    id: "usr-003",
    name: "Emeka Nwosu",
    email: "emeka@naijafashion.ng",
    password: "Emeka@2025",
    role: "user",
    phone: "+234 803 222 3333",
    address: "5 Wuse Zone 6",
    state: "FCT - Abuja",
    createdAt: "2024-05-20",
    lastLogin: "2025-06-18",
    status: "active",
    totalOrders: 5,
    totalSpent: 182000,
  },
  {
    id: "usr-004",
    name: "Fatima Bello",
    email: "fatima@naijafashion.ng",
    password: "Fatima@2025",
    role: "user",
    phone: "+234 804 333 4444",
    address: "10 Bompai Road",
    state: "Kano",
    createdAt: "2024-07-10",
    lastLogin: "2025-06-22",
    status: "active",
    totalOrders: 3,
    totalSpent: 98500,
  },
  {
    id: "usr-005",
    name: "Chukwuemeka Eze",
    email: "chukwu@naijafashion.ng",
    password: "Chukwu@2025",
    role: "user",
    phone: "+234 805 444 5555",
    address: "8 Oguta Road, Onitsha",
    state: "Anambra",
    createdAt: "2024-09-01",
    lastLogin: "2025-06-10",
    status: "suspended",
    totalOrders: 1,
    totalSpent: 35000,
  },
];

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,

      login: (email, password) => {
        const account = ACCOUNTS.find(
          (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
        );
        if (!account) return { success: false, message: "Invalid email or password" };
        if (account.status === "suspended")
          return { success: false, message: "Your account has been suspended. Contact support." };

        const { password: _, ...user } = account;
        set({ currentUser: { ...user, lastLogin: new Date().toISOString().split("T")[0] }, isAuthenticated: true });
        return { success: true, message: "Login successful" };
      },

      logout: () => set({ currentUser: null, isAuthenticated: false }),

      updateProfile: (data) =>
        set((state) => ({
          currentUser: state.currentUser ? { ...state.currentUser, ...data } : null,
        })),
    }),
    { name: "naijafashion-auth" }
  )
);
