"use client";

import { useOrders } from "@/lib/useOrders";
import { useProducts } from "@/lib/useProducts";
import { useUsers } from "@/lib/useUsers";
import { formatPrice } from "@/lib/utils";

export default function AnalyticsPage() {
  const { orders: sampleOrders } = useOrders();
  const { products } = useProducts();
  const { users } = useUsers();

  const revenue = sampleOrders.filter(o => !["cancelled","refunded"].includes(o.status)).reduce((s,o) => s+o.total, 0);

  const categoryRevenue = products.reduce<Record<string,number>>((acc, p) => {
    const cat = p.category.replace(/-/g," ");
    acc[cat] = (acc[cat] || 0) + p.price;
    return acc;
  }, {});
  const maxCatRev = Math.max(...Object.values(categoryRevenue), 1);

  const topCustomers = users.filter(u => u.role === "user")
    .map(u => ({ ...u, orders: { length: u.totalOrders }, spent: u.totalSpent }))
    .sort((a,b) => b.spent - a.spent);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm">Store performance overview</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: formatPrice(revenue), sub: "All time" },
          { label: "Avg Order Value", value: formatPrice(sampleOrders.length ? revenue / sampleOrders.length : 0), sub: `from ${sampleOrders.length} orders` },
          { label: "Conversion Rate", value: "3.8%", sub: "Visits to orders" },
          { label: "Return Rate", value: "8.2%", sub: "Customers who re-ordered" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-sm font-semibold text-gray-700 mt-1">{label}</p>
            <p className="text-xs text-gray-400">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue by category */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-5">Revenue by Category</h3>
          <div className="space-y-3">
            {Object.entries(categoryRevenue).sort((a,b) => b[1]-a[1]).map(([cat, val]) => (
              <div key={cat}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-700 capitalize font-medium">{cat}</span>
                  <span className="text-sm font-bold text-gray-900">{formatPrice(val)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-linear-to-r from-green-500 to-green-400 rounded-full" style={{ width: `${(val/maxCatRev)*100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top customers */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-5">Top Customers</h3>
          <div className="space-y-3">
            {topCustomers.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="w-6 text-xs font-bold text-gray-400">#{i+1}</span>
                <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {c.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.orders.length} orders · {c.state}</p>
                </div>
                <p className="font-bold text-green-700 text-sm">{formatPrice(c.spent)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-5">Payment Method Breakdown</h3>
        <div className="grid grid-cols-3 gap-4">
          {["card","transfer","ussd"].map(method => {
            const count = sampleOrders.filter(o => o.paymentMethod === method).length;
            const pct = sampleOrders.length ? Math.round((count/sampleOrders.length)*100) : 0;
            return (
              <div key={method} className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#16a34a" strokeWidth="3"
                      strokeDasharray={`${pct} ${100-pct}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-extrabold text-gray-900 text-sm">{pct}%</span>
                  </div>
                </div>
                <p className="font-bold text-gray-900 capitalize">{method}</p>
                <p className="text-xs text-gray-400">{count} orders</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
