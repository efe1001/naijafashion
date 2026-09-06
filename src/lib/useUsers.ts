"use client";

import { useCallback, useEffect, useState } from "react";
import { SafeUser } from "@/lib/user";

export interface AdminUser extends SafeUser {
  totalOrders: number;
  totalSpent: number;
}

export function useUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) {
        setUsers([]);
        return;
      }
      const data = await res.json();
      setUsers(data.users ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { users, loading, refetch };
}
