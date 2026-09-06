"use client";

import { useOrders } from "@/lib/useOrders";
import { useProducts } from "@/lib/useProducts";
import { useUsers } from "@/lib/useUsers";
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
  const { orders: sampleOrders } = useOrders();
  const { products } = useProducts();
  const { users } = useUsers();

  const totalRevenue = sampleOrders.filter(o => o.status !== "cancelled" && o.status !== "refunded").reduce((s, o) => s + o.total, 0);
  const totalOrders = sampleOrders.length;
  const totalUsers = users.filter(u => u.role === "user").length;
  const totalProducts = products.length;
  const pendingOrders = sampleOrders.filter(o => o.status === "pending").length;
  const lowStockProducts = products.filter(p => !p.inStock).length;

  const recentOrders = [...sampleOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const monthlyRevenue = [
    { month: "Jan", value: 280000 },
    { month: "Feb", value: 420000 },
    { month: "Mar", value: 310000 },
    { month: "Apr", value: 550000 },
    { month: "May", value: 480000 },
    { month: "Jun", value: totalRevenue },
  ];
  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.value));

  const topProducts = [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5);

  const stats = [
    { label: "Total Revenue", value: formatPrice(totalRevenue), icon: TrendingUp, color: "bg-green-500", change: "+18.2%", up: true },
    { label: "Total Orders", value: totalOrders, icon: ShoppingBag, color: "bg-blue-500", change: "+12.5%", up: true },
    { label: "Total Users", value: totalUsers, icon: Users, color: "bg-purple-500", change: "+8.3%", up: true },
    { label: "Products", value: totalProducts, icon: Package, color: "bg-orange-500", change: "+5 this month", up: true },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back, Admin. Here&apos;s what&apos;s happening.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-xl px-4 py-2">
          <Clock size={14} />
          <span>{new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
      </div>

      {/* Alerts */}
      {(pendingOrders > 0 || lowStockProducts > 0) && (
        <div className="flex flex-wrap gap-3">
          {pendingOrders > 0 && (
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2.5 rounded-xl text-sm font-medium">
              <AlertTriangle size={15} className="text-yellow-500" />
              {pendingOrders} order{pendingOrders > 1 ? "s" : ""} awaiting confirmation
              <Link href="/admin/orders" className="underline ml-1">View</Link>
            </div>
          )}
          {lowStockProducts > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm font-medium">
              <AlertTriangle size={15} className="text-red-500" />
              {lowStockProducts} product{lowStockProducts > 1 ? "s" : ""} out of stock
              <Link href="/admin/products" className="underline ml-1">Fix</Link>
            </div>
          )}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map(({ label, value, icon: Icon, color, change, up }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
                <Icon size={18} className="text-white" />
              </div>
              <span className={`text-xs font-semibold flex items-center gap-0.5 ${up ? "text-green-600" : "text-red-500"}`}>
                <ArrowUpRight size={12} />
                {change}
              </span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Revenue Overview</h3>
              <p className="text-sm text-gray-500 mt-0.5">Monthly revenue for 2025</p>
            </div>
            <span className="text-xs bg-green-50 text-green-700 font-semibold px-3 py-1 rounded-full">This Year</span>
          </div>
          <div className="flex items-end gap-3 h-40">
            {monthlyRevenue.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500 font-medium">{formatPrice(m.value).replace("₦", "").replace(",000", "k")}</span>
                <div
                  className="w-full bg-linear-to-t from-green-600 to-green-400 rounded-t-lg transition-all hover:from-green-700 hover:to-green-500 cursor-pointer"
                  style={{ height: `${(m.value / maxRevenue) * 100}%`, minHeight: "8px" }}
                />
                <span className="text-xs text-gray-500 font-medium">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order status breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-5">Order Status</h3>
          <div className="space-y-3">
            {(["delivered", "shipped", "processing", "pending", "cancelled"] as const).map((status) => {
              const count = sampleOrders.filter(o => o.status === status).length;
              const pct = Math.round((count / sampleOrders.length) * 100);
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
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm text-green-700 hover:text-green-800 font-semibold flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
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
                <Link href="/admin/orders" className="text-green-600 hover:text-green-800">
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Top Products</h3>
            <Link href="/admin/products" className="text-sm text-green-700 font-semibold flex items-center gap-1">
              All <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <span className="w-5 text-xs text-gray-400 font-bold">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.reviewCount} reviews</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{formatPrice(p.price)}</p>
                  <div className="flex items-center gap-0.5 justify-end">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-xs text-gray-500">{p.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
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
