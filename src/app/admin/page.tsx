"use client";

import { useAdminStats } from "@/lib/useAdminStats";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  TrendingUp, ShoppingBag, Users, Package, ArrowUpRight, Clock,
  AlertTriangle, CheckCircle2, Truck, XCircle, RefreshCw,
} from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

const statusIcon: Record<string, React.ReactNode> = {
  pending: <Clock size={14} className="text-yellow-500" />,
  processing: <RefreshCw size={14} className="text-blue-500" />,
  shipped: <Truck size={14} className="text-purple-500" />,
  delivered: <CheckCircle2 size={14} className="text-green-500" />,
  cancelled: <XCircle size={14} className="text-red-500" />,
};

export default function AdminDashboard() {
  const { stats: data, loading, error } = useAdminStats();

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
      </div>
    );
  }
  if (!data) {
    return <div className="p-8 text-red-600">{error || "No data"}</div>;
  }

  const { totals, monthlyRevenue, topProducts, lowStock } = data;
  const recentOrders = data.recentOrders.slice(0, 5);
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.value), 1);

  const stats = [
    { label: "Total Revenue", value: formatPrice(totals.revenue), icon: TrendingUp, color: "bg-green-500", note: "excl. cancelled & refunded" },
    { label: "Total Orders", value: totals.orders, icon: ShoppingBag, color: "bg-blue-500", note: `${totals.pending} pending` },
    { label: "Customers", value: totals.customers, icon: Users, color: "bg-purple-500", note: "registered accounts" },
    { label: "Products", value: totals.products, icon: Package, color: "bg-orange-500", note: `${totals.activeProducts} live` },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Live figures from your store.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-xl px-4 py-2">
          <Clock size={14} />
          <span>{new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
      </div>

      {(totals.pending > 0 || lowStock.length > 0) && (
        <div className="flex flex-wrap gap-3">
          {totals.pending > 0 && (
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2.5 rounded-xl text-sm font-medium">
              <AlertTriangle size={15} className="text-yellow-500" />
              {totals.pending} order{totals.pending > 1 ? "s" : ""} awaiting confirmation
              <Link href="/admin/orders?status=pending" className="underline ml-1">View</Link>
            </div>
          )}
          {lowStock.length > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm font-medium">
              <AlertTriangle size={15} className="text-red-500" />
              {lowStock.length} product{lowStock.length > 1 ? "s" : ""} low or out of stock
              <Link href="/admin/products" className="underline ml-1">Restock</Link>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map(({ label, value, icon: Icon, color, note }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
                <Icon size={18} className="text-white" />
              </div>
              <span className="text-xs font-medium text-gray-400 text-right">{note}</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Revenue Overview</h3>
              <p className="text-sm text-gray-500 mt-0.5">Revenue for the last 6 months</p>
            </div>
            <span className="text-xs bg-green-50 text-green-700 font-semibold px-3 py-1 rounded-full">Last 6 months</span>
          </div>
          <div className="flex items-end gap-3 h-40">
            {monthlyRevenue.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
                <span className="text-xs text-gray-500 font-medium">{m.value >= 1000 ? `${Math.round(m.value / 1000)}k` : m.value}</span>
                <div
                  className="w-full bg-linear-to-t from-green-600 to-green-400 rounded-t-lg transition-all hover:from-green-700 hover:to-green-500"
                  style={{ height: `${(m.value / maxRevenue) * 80}%`, minHeight: "6px" }}
                />
                <span className="text-xs text-gray-500 font-medium">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-5">Order Status</h3>
          <div className="space-y-3">
            {(["delivered", "shipped", "processing", "pending", "cancelled"] as const).map((status) => {
              const count = data.statusCounts[status] ?? 0;
              const pct = totals.orders ? Math.round((count / totals.orders) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {statusIcon[status]}
                      <span className="text-sm text-gray-700 capitalize font-medium">{status}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        status === "delivered" ? "bg-green-500" :
                        status === "shipped" ? "bg-purple-500" :
                        status === "processing" ? "bg-blue-500" :
                        status === "pending" ? "bg-yellow-500" : "bg-red-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm text-green-700 hover:text-green-800 font-semibold flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.length === 0 && <p className="px-6 py-8 text-sm text-gray-400 text-center">No orders yet.</p>}
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm truncate">{order.customerName}</p>
                  <p className="text-xs text-gray-400 font-mono">{order.id}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColors[order.status]}`}>
                  {order.status}
                </span>
                <p className="font-bold text-gray-900 text-sm">{formatPrice(order.total)}</p>
                <p className="text-xs text-gray-400 hidden sm:block">{formatDate(order.createdAt)}</p>
                <Link href={`/admin/orders?q=${order.id}`} className="text-green-600 hover:text-green-800">
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Top Selling Products</h3>
            <Link href="/admin/products" className="text-sm text-green-700 font-semibold flex items-center gap-1">
              All <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {topProducts.length === 0 && <p className="px-5 py-8 text-sm text-gray-400 text-center">No sales yet.</p>}
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <span className="w-5 text-xs text-gray-400 font-bold">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.units} sold</p>
                </div>
                <p className="text-sm font-bold text-gray-900">{formatPrice(p.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Add Product", href: "/admin/products", color: "bg-green-600 hover:bg-green-700", icon: Package },
          { label: "Manage Orders", href: "/admin/orders", color: "bg-blue-600 hover:bg-blue-700", icon: ShoppingBag },
          { label: "Add User", href: "/admin/users", color: "bg-purple-600 hover:bg-purple-700", icon: Users },
          { label: "Settings", href: "/admin/settings", color: "bg-gray-700 hover:bg-gray-800", icon: Package },
        ].map(({ label, href, color, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className={`${color} text-white rounded-xl p-4 flex items-center gap-3 font-semibold text-sm transition-colors shadow-sm`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
