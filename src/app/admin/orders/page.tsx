"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search, Eye, ChevronDown, X, Truck, CheckCircle2, Clock, RefreshCw, XCircle, Package } from "lucide-react";
import { useOrders } from "@/lib/useOrders";
import { ApiOrder } from "@/lib/order";
import { formatPrice, formatDate } from "@/lib/utils";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

const ALL_STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

export default function AdminOrdersPage() {
  const { orders, refetch } = useOrders();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const matchSearch =
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingStatus(null);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await refetch();
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status } : null);
    }
  };

  const statusIcon: Record<string, React.ReactNode> = {
    pending: <Clock size={14} />,
    processing: <RefreshCw size={14} />,
    shipped: <Truck size={14} />,
    delivered: <CheckCircle2 size={14} />,
    cancelled: <XCircle size={14} />,
    refunded: <Package size={14} />,
  };

  const totalRevenue = orders.filter(o => !["cancelled","refunded"].includes(o.status)).reduce((s,o) => s+o.total, 0);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm">{filtered.length} orders · Revenue: {formatPrice(totalRevenue)}</p>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[{ label: "All", value: "all", count: orders.length }, ...ALL_STATUSES.map(s => ({ label: s, value: s, count: orders.filter(o => o.status === s).length }))].map(({ label, value, count }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value as OrderStatus | "all")}
            className={`flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-colors ${statusFilter === value ? "border-green-600 bg-green-50" : "border-gray-100 bg-white hover:border-gray-200"}`}
          >
            <span className={`text-xl font-extrabold ${statusFilter === value ? "text-green-700" : "text-gray-900"}`}>{count}</span>
            <span className={`text-xs font-medium capitalize mt-0.5 ${statusFilter === value ? "text-green-600" : "text-gray-500"}`}>{label}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, order ID, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Order</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Items</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Date</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-mono font-bold text-gray-900 text-xs">{order.id}</p>
                    <p className="text-xs text-gray-400 capitalize">{order.paymentMethod}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <p className="font-semibold text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.state}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <div className="flex -space-x-2">
                      {order.items.slice(0,3).map((item, i) => (
                        <div key={i} className="relative w-8 h-10 rounded border-2 border-white overflow-hidden">
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="32px" />
                        </div>
                      ))}
                      {order.items.length > 3 && <div className="w-8 h-10 bg-gray-100 rounded border-2 border-white flex items-center justify-center text-xs text-gray-500 font-bold">+{order.items.length-3}</div>}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-gray-900">{formatPrice(order.total)}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="relative">
                      <button
                        onClick={() => setUpdatingStatus(updatingStatus === order.id ? null : order.id)}
                        className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full font-semibold ${statusColors[order.status]}`}
                      >
                        {statusIcon[order.status]}
                        <span className="capitalize">{order.status}</span>
                        <ChevronDown size={10} />
                      </button>
                      {updatingStatus === order.id && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-1 min-w-36">
                          {ALL_STATUSES.filter(s => s !== order.status).map(s => (
                            <button
                              key={s}
                              onClick={() => updateStatus(order.id, s)}
                              className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-green-50 hover:text-green-700 capitalize flex items-center gap-2"
                            >
                              {statusIcon[s]} {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell text-xs text-gray-400">{formatDate(order.createdAt)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Order Details</h2>
                <p className="text-xs text-gray-400 font-mono">{selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-5">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-semibold ${statusColors[selectedOrder.status]}`}>
                  {statusIcon[selectedOrder.status]} <span className="capitalize">{selectedOrder.status}</span>
                </span>
                <span className="text-sm text-gray-400">Updated: {formatDate(selectedOrder.updatedAt)}</span>
              </div>

              {/* Customer */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-2">Customer</h3>
                <p className="font-semibold text-gray-800">{selectedOrder.customerName}</p>
                <p className="text-sm text-gray-500">{selectedOrder.customerEmail}</p>
                <p className="text-sm text-gray-500">{selectedOrder.phone}</p>
                <p className="text-sm text-gray-500 mt-1">{selectedOrder.address}, {selectedOrder.state}</p>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-3">Items Ordered</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="relative w-14 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">Size: {item.size} · Color: {item.color} · Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment summary */}
              <div className="border border-gray-100 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Delivery</span><span className={selectedOrder.delivery === 0 ? "text-green-600 font-medium" : ""}>{selectedOrder.delivery === 0 ? "FREE" : formatPrice(selectedOrder.delivery)}</span></div>
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100 text-base"><span>Total</span><span className="text-green-700">{formatPrice(selectedOrder.total)}</span></div>
                <div className="flex justify-between text-gray-500"><span>Payment</span><span className="capitalize font-medium">{selectedOrder.paymentMethod} — {selectedOrder.paymentRef}</span></div>
              </div>

              {selectedOrder.note && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-sm text-yellow-800">
                  <span className="font-semibold">Note:</span> {selectedOrder.note}
                </div>
              )}

              {/* Update status */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_STATUSES.filter(s => s !== selectedOrder.status).map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selectedOrder.id, s)}
                      className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700 capitalize font-medium transition-colors flex items-center gap-1"
                    >
                      {statusIcon[s]} {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
