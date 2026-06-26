"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, currentUser } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (currentUser?.role !== "admin") {
      router.replace("/profile");
    }
  }, [mounted, isAuthenticated, currentUser, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-800 border-t-green-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || currentUser?.role !== "admin") return null;

  return <>{children}</>;
}
