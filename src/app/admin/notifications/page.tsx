"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Package, Users, ShoppingCart, AlertTriangle, Star } from "lucide-react";
import { useAdminStats } from "@/lib/useAdminStats";
import { formatPrice } from "@/lib/utils";

const READ_KEY = "ifashion_admin_notifications_read_at";

const typeColor: Record<string, string> = {
  order: "bg-blue-100 text-blue-600",
  user: "bg-purple-100 text-purple-600",
  alert: "bg-yellow-100 text-yellow-600",
  review: "bg-green-100 text-green-600",
};

interface Notice {
  id: string;
  type: keyof typeof typeColor;
  icon: React.ElementType;
  title: string;
  message: string;
  at: string;
  href: string;
}

function toDate(value: string) {
  return new Date(value.includes("T") ? value : value.replace(" ", "T") + "Z");
}

function timeAgo(value: string) {
  const diff = Date.now() - toDate(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function NotificationsPage() {
  const { stats, loading } = useAdminStats();
  const [readAt, setReadAt] = useState(0);

  useEffect(() => {
    try {
      setReadAt(Number(localStorage.getItem(READ_KEY)) || 0);
    } catch {
      setReadAt(0);
    }
  }, []);

  const notices = useMemo<Notice[]>(() => {
    if (!stats) return [];
    const list: Notice[] = [
      ...stats.recentOrders.map((o) => ({
        id: `order-${o.id}`,
        type: "order" as const,
        icon: ShoppingCart,
        title: `New order ${o.id}`,
        message: `${o.customerName} ordered ${formatPrice(o.total)} (${o.status})`,
        at: o.createdAt,
        href: `/admin/orders?q=${o.id}`,
      })),
      ...stats.newUsers.map((u) => ({
        id: `user-${u.id}`,
        type: "user" as const,
        icon: Users,
        title: "New customer registered",
        message: `${u.name} (${u.email})`,
        at: u.created_at,
        href: "/admin/users",
      })),
      ...stats.recentReviews.map((r) => ({
        id: `review-${r.id}`,
        type: "review" as const,
        icon: Star,
        title: `${r.rating}★ review on ${r.product_name}`,
        message: r.comment ? `${r.user_name}: ${r.comment}` : `${r.user_name} left a rating`,
        at: r.created_at,
        href: `/product/${r.product_id}`,
      })),
      ...stats.lowStock.map((p) => ({
        id: `stock-${p.id}-${p.stock}`,
        type: "alert" as const,
        icon: p.stock === 0 ? AlertTriangle : Package,
        title: p.stock === 0 ? "Out of stock" : "Low stock",
        message: p.stock === 0 ? `${p.name} is sold out` : `${p.name} has only ${p.stock} left`,
        at: new Date().toISOString(),
        href: "/admin/products",
      })),
    ];
    return list.sort((a, b) => toDate(b.at).getTime() - toDate(a.at).getTime());
  }, [stats]);

  const isUnread = (n: Notice) => n.type === "alert" || toDate(n.at).getTime() > readAt;
  const unread = notices.filter(isUnread).length;

  const markAllRead = () => {
    const now = Date.now();
    setReadAt(now);
    try {
      localStorage.setItem(READ_KEY, String(now));
    } catch {
      // ignore
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Bell size={24} />
            Notifications
            {unread > 0 && <span className="text-sm bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">{unread}</span>}
          </h1>
          <p className="text-gray-500 text-sm">New orders, customers, reviews and stock alerts from your store</p>
        </div>
        {notices.some((n) => n.type !== "alert" && isUnread(n)) && (
          <button onClick={markAllRead} className="flex items-center gap-2 text-sm text-green-700 font-semibold hover:text-green-800">
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
        {loading && <p className="p-8 text-center text-sm text-gray-400">Loading...</p>}
        {!loading && notices.length === 0 && <p className="p-8 text-center text-sm text-gray-400">Nothing new yet.</p>}
        {notices.map((n) => {
          const Icon = n.icon;
          const unreadNow = isUnread(n);
          return (
            <Link
              key={n.id}
              href={n.href}
              className={`flex items-start gap-4 p-5 transition-colors hover:bg-gray-50 ${unreadNow ? "bg-green-50/30" : ""}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeColor[n.type]}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold ${unreadNow ? "text-gray-900" : "text-gray-700"}`}>{n.title}</p>
                  {unreadNow && <span className="w-2 h-2 bg-green-500 rounded-full shrink-0" />}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                {n.type !== "alert" && <p className="text-xs text-gray-400 mt-1">{timeAgo(n.at)}</p>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
