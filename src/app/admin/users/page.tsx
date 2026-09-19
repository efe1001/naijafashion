"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { ApiOrder } from "@/lib/order";
import { Search, Plus, Edit2, Trash2, ShieldCheck, User, X, Eye, EyeOff, Ban, CheckCircle } from "lucide-react";
import { useUsers, AdminUser } from "@/lib/useUsers";
import { formatPrice, formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const { users, refetch } = useUsers();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewUser, setViewUser] = useState<AdminUser | null>(null);
  const [userOrders, setUserOrders] = useState<ApiOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!viewUser) { setUserOrders([]); return; }
    setOrdersLoading(true);
    fetch(`/api/orders?page=1&pageSize=50&userId=${viewUser.id}`)
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((d) => setUserOrders(d.orders ?? []))
      .finally(() => setOrdersLoading(false));
  }, [viewUser]);
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", address: "",
    state: "", role: "user" as "user" | "admin", status: "active" as "active" | "suspended",
  });

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditUser(null);
    setFormError("");
    setForm({ name: "", email: "", password: "", phone: "", address: "", state: "", role: "user", status: "active" });
    setShowModal(true);
  };

  const openEdit = (u: AdminUser) => {
    setEditUser(u);
    setFormError("");
    setForm({ name: u.name, email: u.email, password: "", phone: u.phone || "", address: u.address || "", state: u.state || "", role: u.role, status: u.status });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email || (!editUser && !form.password)) return;
    setSaving(true);
    setFormError("");
    try {
      const res = editUser
        ? await fetch(`/api/users/${editUser.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, password: form.password || undefined }),
          })
        : await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error || "Could not save user");
        return;
      }
      await refetch();
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (u: AdminUser) => {
    await fetch(`/api/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: u.status === "active" ? "suspended" : "active" }),
    });
    refetch();
  };

  const deleteUser = async (id: string) => {
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    refetch();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm">{filtered.length} accounts</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-green-800 transition-colors shadow-lg shadow-green-200 text-sm"
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: users.filter(u => u.role === "user").length, color: "bg-blue-500" },
          { label: "Admins", value: users.filter(u => u.role === "admin").length, color: "bg-green-600" },
          { label: "Active", value: users.filter(u => u.status === "active").length, color: "bg-emerald-500" },
          { label: "Suspended", value: users.filter(u => u.status === "suspended").length, color: "bg-red-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white font-extrabold text-lg`}>{value}</div>
            <p className="text-sm font-semibold text-gray-700">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Orders</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Total Spent</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 ${u.role === "admin" ? "bg-green-600" : "bg-gray-400"} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {u.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">Joined {formatDate(u.createdAt)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <p className="text-gray-700">{u.email}</p>
                    <p className="text-xs text-gray-400">{u.phone}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold w-fit ${u.role === "admin" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                      {u.role === "admin" ? <ShieldCheck size={11} /> : <User size={11} />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className="font-semibold text-gray-900">{u.totalOrders}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className="font-semibold text-gray-900">
                      {u.role === "admin" ? "—" : formatPrice(u.totalSpent)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => toggleStatus(u)} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${u.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}`}>
                      {u.status === "active" ? <CheckCircle size={11} /> : <Ban size={11} />}
                      {u.status}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setViewUser(u)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Eye size={14} /></button>
                      <button onClick={() => openEdit(u)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                      {u.role !== "admin" && (
                        <button onClick={() => setDeleteConfirm(u.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg">{editUser ? "Edit User" : "Add New User"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{formError}</div>
              )}
              {[
                { label: "Full Name *", key: "name", type: "text", placeholder: "Ada Okonkwo" },
                { label: "Email *", key: "email", type: "email", placeholder: "ada@example.com" },
                { label: "Phone", key: "phone", type: "tel", placeholder: "+234 801 234 5678" },
                { label: "Address", key: "address", type: "text", placeholder: "15 Allen Avenue, Ikeja" },
                { label: "State", key: "state", type: "text", placeholder: "Lagos" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type={type} value={form[key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editUser ? "(leave blank to keep current)" : "*"}
                </label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 6 characters"
                    className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as "user" | "admin" }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as "active" | "suspended" }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 text-sm disabled:opacity-60">
                {saving ? "Saving..." : editUser ? "Save Changes" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View user modal */}
      {viewUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">User Profile</h2>
              <button onClick={() => setViewUser(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 ${viewUser.role === "admin" ? "bg-green-600" : "bg-gray-500"} rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl`}>
                  {viewUser.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                </div>
                <div>
                  <p className="font-extrabold text-gray-900 text-xl">{viewUser.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${viewUser.role === "admin" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>{viewUser.role}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold ${viewUser.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{viewUser.status}</span>
                </div>
              </div>
              {[
                { label: "Email", value: viewUser.email },
                { label: "Phone", value: viewUser.phone },
                { label: "Address", value: viewUser.address },
                { label: "State", value: viewUser.state },
                { label: "Joined", value: formatDate(viewUser.createdAt) },
                { label: "Last Login", value: viewUser.lastLogin ? formatDate(viewUser.lastLogin) : null },
              ].map(({ label, value }) => value && (
                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-semibold text-gray-900">{value}</span>
                </div>
              ))}
              {viewUser.role === "user" && (
                <>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500">Total Orders</span>
                    <span className="font-bold text-gray-900">{viewUser.totalOrders}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-500">Total Spent</span>
                    <span className="font-bold text-green-700">{formatPrice(viewUser.totalSpent)}</span>
                  </div>
                </>
              )}
            </div>
            {viewUser.role === "user" && (
              <div className="px-6 pb-6">
                <h4 className="font-bold text-gray-900 text-sm mb-2">Order history</h4>
                {ordersLoading && <p className="text-xs text-gray-400">Loading...</p>}
                {!ordersLoading && userOrders.length === 0 && <p className="text-xs text-gray-400">No orders yet.</p>}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userOrders.map((o) => (
                    <Link key={o.id} href={`/admin/orders?q=${o.id}`} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors">
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-bold text-gray-800 truncate">{o.id}</p>
                        <p className="text-xs text-gray-400">{formatDate(o.createdAt)} · {o.items.length} item{o.items.length > 1 ? "s" : ""}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{formatPrice(o.total)}</p>
                        <p className="text-xs text-gray-500 capitalize">{o.status}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-red-500" /></div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Delete User?</h3>
            <p className="text-gray-500 text-sm mb-5">This will permanently remove the account.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl text-sm">Cancel</button>
              <button onClick={() => deleteUser(deleteConfirm)} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
