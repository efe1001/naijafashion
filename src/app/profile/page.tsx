"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User, Package, LogOut, Edit2, Save, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useOrders } from "@/lib/useOrders";
import { formatPrice, formatDate } from "@/lib/utils";
import { nigerianStates } from "@/data/products";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default function ProfilePage() {
  const { currentUser, isAuthenticated, hydrated, logout, updateProfile } = useAuthStore();
  const { orders: userOrders } = useOrders();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", state: "" });

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace("/login");
  }, [hydrated, isAuthenticated, router]);

  useEffect(() => {
    if (currentUser) {
      setForm({ name: currentUser.name, phone: currentUser.phone || "", address: currentUser.address || "", state: currentUser.state || "" });
    }
  }, [currentUser]);

  const totalSpent = userOrders.filter(o => !["cancelled","refunded"].includes(o.status)).reduce((s,o) => s+o.total, 0);

  const handleSave = async () => {
    await updateProfile(form);
    setEditing(false);
  };

  if (!hydrated || !currentUser) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h1 className="text-2xl font-extrabold text-gray-900">My Account</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-green-700 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl mb-4">
                  {currentUser.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                </div>
                <h2 className="font-extrabold text-gray-900 text-xl">{currentUser.name}</h2>
                <p className="text-gray-500 text-sm">{currentUser.email}</p>
                <span className="mt-2 text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full capitalize">{currentUser.role}</span>
              </div>

              <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Orders</span>
                  <span className="font-bold text-gray-900">{userOrders.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Spent</span>
                  <span className="font-bold text-green-700">{formatPrice(totalSpent)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Member Since</span>
                  <span className="font-bold text-gray-900">{formatDate(currentUser.createdAt)}</span>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <button
                  onClick={() => { logout(); router.push("/"); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {[
                { icon: Package, label: "My Orders", href: "#orders" },
                { icon: User, label: "Edit Profile", action: () => setEditing(true) },
              ].map(({ icon: Icon, label, href, action }) => (
                <div key={label}>
                  {href ? (
                    <a href={href} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                      <Icon size={16} className="text-green-700" />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </a>
                  ) : (
                    <button onClick={action} className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                      <Icon size={16} className="text-green-700" />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit profile */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900">Personal Information</h3>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm text-green-700 font-semibold hover:text-green-800">
                    <Edit2 size={14} /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                      <X size={14} /> Cancel
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-1 text-sm text-green-700 font-bold hover:text-green-800">
                      <Save size={14} /> Save
                    </button>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {editing ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                      <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                      <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Address</label>
                      <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">State</label>
                      <select value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="">Select State</option>
                        {nigerianStates.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    {[
                      { label: "Full Name", value: currentUser.name },
                      { label: "Email", value: currentUser.email },
                      { label: "Phone", value: currentUser.phone || "Not set" },
                      { label: "State", value: currentUser.state || "Not set" },
                      { label: "Address", value: currentUser.address || "Not set" },
                      { label: "Last Login", value: currentUser.lastLogin ? formatDate(currentUser.lastLogin) : "—" },
                    ].map(({ label, value }) => (
                      <div key={label} className={label === "Address" ? "sm:col-span-2" : ""}>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                        <p className="font-semibold text-gray-900 mt-0.5">{value}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Orders */}
            <div id="orders" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Order History</h3>
                <p className="text-xs text-gray-400">{userOrders.length} orders</p>
              </div>
              {userOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No orders yet</p>
                  <Link href="/products" className="mt-3 inline-block text-green-700 font-semibold text-sm hover:underline">Start Shopping</Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {userOrders.map(order => (
                    <div key={order.id} className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-mono text-xs font-bold text-gray-700">{order.id}</p>
                          <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${statusColors[order.status]}`}>{order.status}</span>
                          <span className="font-bold text-gray-900">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="relative w-12 h-14 rounded-lg overflow-hidden flex-shrink-0">
                            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                          </div>
                        ))}
                        <div className="flex-1 min-w-0 pl-1">
                          <p className="text-sm text-gray-700 font-medium line-clamp-2">
                            {order.items.map(i => i.name).join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
