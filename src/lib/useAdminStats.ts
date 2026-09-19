"use client";

import { useCallback, useEffect, useState } from "react";
import type { ApiOrder } from "@/lib/order";

export interface AdminStats {
  totals: {
    revenue: number;
    orders: number;
    pending: number;
    customers: number;
    products: number;
    activeProducts: number;
    avgOrderValue: number;
  };
  monthlyRevenue: { month: string; value: number }[];
  statusCounts: Record<string, number>;
  paymentMethods: { method: string; count: number; revenue: number }[];
  revenueByCategory: { category: string; revenue: number }[];
  topProducts: { id: string; name: string; image: string; units: number; revenue: number }[];
  recentOrders: ApiOrder[];
  newUsers: { id: string; name: string; email: string; created_at: string }[];
  recentReviews: { id: string; rating: number; comment: string; user_name: string; created_at: string; product_name: string; product_id: string }[];
  lowStock: { id: string; name: string; stock: number }[];
  lowStockLimit: number;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Could not load statistics");
      setStats(await res.json());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load statistics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { stats, loading, error, refetch };
}
