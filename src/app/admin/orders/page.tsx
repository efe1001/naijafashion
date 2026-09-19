"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  Search, Eye, ChevronDown, X, Truck, CheckCircle2, Clock, RefreshCw, XCircle, Package,
  ChevronLeft, ChevronRight, Download, Printer,
} from "lucide-react";
import { ApiOrder } from "@/lib/order";
import { formatPrice, formatDate } from "@/lib/utils";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

interface OrderEvent {
  status: string;
  note: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

const ALL_STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];
const PAGE_SIZE = 20;

const statusIcon: Record<string, React.ReactNode> = {
  pending: <Clock size={14} />,
  processing: <RefreshCw size={14} />,
  shipped: <Truck size={14} />,
  delivered: <CheckCircle2 size={14} />,
  cancelled: <XCircle size={14} />,
  refunded: <Package size={14} />,
};

const escapeHtml = (v: string) => v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

function printInvoice(o: ApiOrder) {
  const rows = o.items
    .map(
      (i) =>
        `<tr><td>${escapeHtml(i.name)}<br><small>${escapeHtml(i.size)} · ${escapeHtml(i.color)}</small></td><td>${i.quantity}</td><td>${formatPrice(i.price)}</td><td>${formatPrice(i.price * i.quantity)}</td></tr>`
    )
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${escapeHtml(o.id)}</title>
<style>body{font-family:Arial,sans-serif;max-width:720px;margin:30px auto;color:#111}h1{margin:0}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{text-align:left;padding:8px;border-bottom:1px solid #ddd;font-size:14px}th{background:#f5f5f5}.r{text-align:right}.tot td{border:0}small{color:#666}</style></head><body>
<h1>iFashion</h1><p>Invoice for order <b>${escapeHtml(o.id)}</b><br>${new Date(o.createdAt).toLocaleString()}</p>
<p><b>${escapeHtml(o.customerName)}</b><br>${escapeHtml(o.customerEmail)}<br>${escapeHtml(o.phone)}<br>${escapeHtml(o.address)}, ${escapeHtml(o.state)}</p>
<table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
<table class="tot"><tr><td class="r" colspan="3">Subtotal</td><td>${formatPrice(o.subtotal)}</td></tr>
${o.discount > 0 ? `<tr><td class="r" colspan="3">Discount ${o.couponCode ? "(" + escapeHtml(o.couponCode) + ")" : ""}</td><td>-${formatPrice(o.discount)}</td></tr>` : ""}
<tr><td class="r" colspan="3">Delivery</td><td>${o.delivery === 0 ? "FREE" : formatPrice(o.delivery)}</td></tr>
<tr><td class="r" colspan="3"><b>Total</b></td><td><b>${formatPrice(o.total)}</b></td></tr></table>
<p>Status: ${escapeHtml(o.status)} · Payment: ${escapeHtml(o.paymentMethod ?? "-")} ${escapeHtml(o.paymentRef ?? "")}</p>
<script>window.onload=function(){window.print()}</script></body></html>`;
  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

const csvCell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("q")) { setSearch(params.get("q") ?? ""); setDebouncedSearch(params.get("q") ?? ""); }
    const st = params.get("status");
    if (st && ALL_STATUSES.includes(st as OrderStatus)) setStatusFilter(st as OrderStatus);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const buildQuery = useCallback(
    (p: number, size: number) => {
      const qs = new URLSearchParams({ page: String(p), pageSize: String(size) });
      if (debouncedSearch) qs.set("q", debouncedSearch);
      if (statusFilter !== "all") qs.set("status", statusFilter);
      if (from) qs.set("from", from);
      if (to) qs.set("to", to);
      return qs.toString();
    },
    [debouncedSearch, statusFilter, from, to]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?${buildQuery(page, PAGE_SIZE)}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
        setTotal(data.total);
        setStatusCounts(data.statusCounts ?? {});
      }
    } finally {
      setLoading(false);
    }
  }, [buildQuery, page]);

  useEffect(() => {
    load();
  }, [load]);

  const openOrder = async (order: ApiOrder) => {
    setSelectedOrder(order);
    setNote("");
    setEvents([]);
    const res = await fetch(`/api/orders/${order.id}`);
    if (res.ok) setEvents((await res.json()).events ?? []);
  };

  const updateStatus = async (orderId: string, status: OrderStatus, withNote?: string) => {
    setUpdatingStatus(null);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note: withNote || undefined }),
    });
    if (res.ok) {
      const data = await res.json();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(data.order);
        setNote("");
        const ev = await fetch(`/api/orders/${orderId}`);
        if (ev.ok) setEvents((await ev.json()).events ?? []);
      }
    }
    load();
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const all: ApiOrder[] = [];
      for (let p = 1; p <= 50; p++) {
        const res = await fetch(`/api/orders?${buildQuery(p, 100)}`);
        if (!res.ok) break;
        const data = await res.json();
        all.push(...data.orders);
        if (all.length >= data.total) break;
      }
      const header = ["Order ID", "Date", "Customer", "Email", "Phone", "State", "Address", "Items", "Subtotal", "Discount", "Coupon", "Delivery", "Total", "Status", "Payment", "Reference"];
      const lines = all.map((o) =>
        [
          o.id, new Date(o.createdAt).toISOString(), o.customerName, o.customerEmail, o.phone, o.state, o.address,
          o.items.map((i) => `${i.name} x${i.quantity}`).join("; "),
          o.subtotal, o.discount, o.couponCode ?? "", o.delivery, o.total, o.status, o.paymentMethod ?? "", o.paymentRef ?? "",
        ].map(csvCell).join(",")
      );
      const blob = new Blob(["﻿" + [header.map(csvCell).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const allCount = Object.values(statusCounts).reduce((s, n) => s + n, 0);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm">{total} matching orders</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={exporting}
          className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 text-sm disabled:opacity-60"
        >
          <Download size={16} /> {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-7 gap-3">
        {[{ label: "All", value: "all", count: allCount }, ...ALL_STATUSES.map((s) => ({ label: s, value: s, count: statusCounts[s] ?? 0 }))].map(({ label, value, count }) => (
          <button
            key={value}
            onClick={() => { setStatusFilter(value as OrderStatus | "all"); setPage(1); }}
            className={`flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-colors ${statusFilter === value ? "border-green-600 bg-green-50" : "border-gray-100 bg-white hover:border-gray-200"}`}
          >
            <span className={`text-xl font-extrabold ${statusFilter === value ? "text-green-700" : "text-gray-900"}`}>{count}</span>
            <span className={`text-xs font-medium capitalize mt-0.5 ${statusFilter === value ? "text-green-600" : "text-gray-500"}`}>{label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm grid md:grid-cols-[1fr_auto_auto] gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, order ID, email, phone or payment reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-500">
          From
          <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="px-2 py-2 border border-gray-200 rounded-lg text-sm" />
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-500">
          To
          <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="px-2 py-2 border border-gray-200 rounded-lg text-sm" />
        </label>
      </div>

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
              {loading && <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">Loading...</td></tr>}
              {!loading && orders.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">No orders match these filters.</td></tr>}
              {orders.map((order) => (
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
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="relative w-8 h-10 rounded border-2 border-white overflow-hidden bg-gray-100">
                          {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="32px" />}
                        </div>
                      ))}
                      {order.items.length > 3 && <div className="w-8 h-10 bg-gray-100 rounded border-2 border-white flex items-center justify-center text-xs text-gray-500 font-bold">+{order.items.length - 3}</div>}
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><p className="font-bold text-gray-900">{formatPrice(order.total)}</p></td>
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
                          {ALL_STATUSES.filter((s) => s !== order.status).map((s) => (
                            <button key={s} onClick={() => updateStatus(order.id, s)} className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-green-50 hover:text-green-700 capitalize flex items-center gap-2">
                              {statusIcon[s]} {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell text-xs text-gray-400">{formatDate(order.createdAt)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => openOrder(order)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="View">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => printInvoice(order)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Print invoice">
                      <Printer size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"><ChevronLeft size={16} /></button>
        <span className="text-sm text-gray-600">Page {page} of {pages}</span>
        <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"><ChevronRight size={16} /></button>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Order Details</h2>
                <p className="text-xs text-gray-400 font-mono">{selectedOrder.id}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => printInvoice(selectedOrder)} className="p-2 hover:bg-gray-100 rounded-lg" title="Print invoice"><Printer size={18} /></button>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
              </div>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3">
                <span className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-semibold ${statusColors[selectedOrder.status]}`}>
                  {statusIcon[selectedOrder.status]} <span className="capitalize">{selectedOrder.status}</span>
                </span>
                <span className="text-sm text-gray-400">Updated: {formatDate(selectedOrder.updatedAt)}</span>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-2">Customer</h3>
                <p className="font-semibold text-gray-800">{selectedOrder.customerName}</p>
                <p className="text-sm text-gray-500">{selectedOrder.customerEmail}</p>
                <p className="text-sm text-gray-500">{selectedOrder.phone}</p>
                <p className="text-sm text-gray-500 mt-1">{selectedOrder.address}, {selectedOrder.state}</p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-3">Items Ordered</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="relative w-14 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                        {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />}
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

              <div className="border border-gray-100 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-700"><span>Discount {selectedOrder.couponCode ? `(${selectedOrder.couponCode})` : ""}</span><span>-{formatPrice(selectedOrder.discount)}</span></div>
                )}
                <div className="flex justify-between text-gray-600"><span>Delivery</span><span className={selectedOrder.delivery === 0 ? "text-green-600 font-medium" : ""}>{selectedOrder.delivery === 0 ? "FREE" : formatPrice(selectedOrder.delivery)}</span></div>
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100 text-base"><span>Total</span><span className="text-green-700">{formatPrice(selectedOrder.total)}</span></div>
                <div className="flex justify-between text-gray-500"><span>Payment</span><span className="capitalize font-medium">{selectedOrder.paymentMethod} — {selectedOrder.paymentRef}</span></div>
              </div>

              {events.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-3">History</h3>
                  <ol className="space-y-2 border-l-2 border-gray-100 pl-4">
                    {events.map((e, i) => (
                      <li key={i} className="text-sm">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${statusColors[e.status]}`}>{e.status}</span>
                        <span className="text-xs text-gray-400 ml-2">{new Date(e.created_at.includes("T") ? e.created_at : e.created_at.replace(" ", "T") + "Z").toLocaleString()}</span>
                        {e.note && <p className="text-xs text-gray-500 mt-0.5">{e.note}</p>}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {selectedOrder.note && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-sm text-yellow-800">
                  <span className="font-semibold">Note:</span> {selectedOrder.note}
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Update Status</p>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional note shown in the history (e.g. courier and tracking number)"
                  className="w-full mb-3 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="flex flex-wrap gap-2">
                  {ALL_STATUSES.filter((s) => s !== selectedOrder.status).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selectedOrder.id, s, note)}
                      className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700 capitalize font-medium transition-colors flex items-center gap-1"
                    >
                      {statusIcon[s]} {s}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">Cancelling or refunding an order returns its items to stock.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
