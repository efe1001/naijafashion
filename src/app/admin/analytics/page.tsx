"use client";

import { useAdminStats } from "@/lib/useAdminStats";
import { useUsers } from "@/lib/useUsers";
import { formatPrice } from "@/lib/utils";

function methodLabel(method: string) {
  if (method === "unknown") return "Not recorded";
  if (method.startsWith("paystack-")) return `Paystack · ${method.slice(9).replace(/_/g, " ")}`;
  return method.replace(/_/g, " ").toLowerCase();
}

export default function AnalyticsPage() {
  const { stats, loading, error } = useAdminStats();
  const { users } = useUsers();

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
      </div>
    );
  }
  if (!stats) return <div className="p-8 text-red-600">{error || "No data"}</div>;

  const { totals, revenueByCategory, paymentMethods } = stats;
  const maxCatRev = Math.max(...revenueByCategory.map((c) => c.revenue), 1);
  const totalPaidOrders = paymentMethods.reduce((s, m) => s + m.count, 0);

  const topCustomers = users
    .filter((u) => u.role === "user" && u.totalOrders > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 8);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm">Store performance from real orders</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: formatPrice(totals.revenue), sub: "All time, excl. cancelled & refunded" },
          { label: "Avg Order Value", value: formatPrice(totals.avgOrderValue), sub: `from ${totals.orders} orders` },
          { label: "Customers", value: String(totals.customers), sub: "Registered accounts" },
          { label: "Pending Orders", value: String(totals.pending), sub: "Waiting to be processed" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-sm font-semibold text-gray-700 mt-1">{label}</p>
            <p className="text-xs text-gray-400">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-5">Revenue by Category</h3>
          {revenueByCategory.length === 0 ? (
            <p className="text-sm text-gray-400">No sales yet.</p>
          ) : (
            <div className="space-y-3">
              {revenueByCategory.map(({ category, revenue }) => (
                <div key={category}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-700 capitalize font-medium">{category.replace(/-/g, " ")}</span>
                    <span className="text-sm font-bold text-gray-900">{formatPrice(revenue)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-green-500 to-green-400 rounded-full" style={{ width: `${(revenue / maxCatRev) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-5">Top Customers</h3>
          {topCustomers.length === 0 ? (
            <p className="text-sm text-gray-400">No customer orders yet.</p>
          ) : (
            <div className="space-y-3">
              {topCustomers.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="w-6 text-xs font-bold text-gray-400">#{i + 1}</span>
                  <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.totalOrders} orders{c.state ? ` · ${c.state}` : ""}</p>
                  </div>
                  <p className="font-bold text-green-700 text-sm">{formatPrice(c.totalSpent)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-5">Payment Method Breakdown</h3>
        {paymentMethods.length === 0 ? (
          <p className="text-sm text-gray-400">No paid orders yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {paymentMethods.map(({ method, count, revenue }) => {
              const pct = totalPaidOrders ? Math.round((count / totalPaidOrders) * 100) : 0;
              return (
                <div key={method} className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#16a34a" strokeWidth="3" strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-extrabold text-gray-900 text-sm">{pct}%</span>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900 capitalize text-sm">{methodLabel(method)}</p>
                  <p className="text-xs text-gray-400">{count} orders · {formatPrice(revenue)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
