"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Package, Truck, Home, Clock, XCircle, Search } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";
import type { ApiOrder } from "@/lib/order";

interface OrderEvent {
  status: string;
  note: string | null;
  created_at: string;
}

const STEPS = [
  { status: "pending", label: "Order placed", icon: Clock },
  { status: "processing", label: "Processing", icon: Package },
  { status: "shipped", label: "On the way", icon: Truck },
  { status: "delivered", label: "Delivered", icon: Home },
];

export default function TrackPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = async (id: string, mail: string) => {
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      let res = currentUser ? await fetch(`/api/orders/${encodeURIComponent(id)}`) : null;
      if (!res || !res.ok) {
        res = await fetch("/api/orders/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: id, email: mail }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order not found");
      setOrder(data.order);
      setEvents(data.events ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hydrated) return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("orderId") ?? "";
    setOrderId(id);
    setEmail(currentUser?.email ?? "");
    if (id && currentUser) lookup(id, currentUser.email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, currentUser?.id]);

  const negative = order && ["cancelled", "refunded"].includes(order.status);
  const currentStep = order ? STEPS.findIndex((s) => s.status === order.status) : -1;
  const eventFor = (status: string) => events.find((e) => e.status === status);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Track your order</h1>
          <p className="text-gray-500 mt-1">Enter your order number and the email you used at checkout.</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            lookup(orderId.trim(), email.trim());
          }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm grid sm:grid-cols-[1fr_1fr_auto] gap-3"
        >
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Order number (NF-...)"
            required
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 text-sm disabled:opacity-60"
          >
            <Search size={15} /> {loading ? "Checking..." : "Track"}
          </button>
        </form>

        {error && <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}

        {order && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs text-gray-400">Order</p>
                <p className="font-mono font-bold text-gray-900">{order.id}</p>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
                  negative ? "bg-red-100 text-red-700" : order.status === "delivered" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                }`}
              >
                {order.status}
              </span>
            </div>

            {negative ? (
              <div className="flex items-center gap-3 bg-red-50 rounded-xl p-4 text-red-700 text-sm">
                <XCircle size={20} /> This order was {order.status}.
              </div>
            ) : (
              <ol className="space-y-4">
                {STEPS.map((step, i) => {
                  const done = i <= currentStep;
                  const ev = eventFor(step.status);
                  const Icon = done ? CheckCircle2 : step.icon;
                  return (
                    <li key={step.status} className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${done ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                        {ev && (
                          <p className="text-xs text-gray-400">
                            {new Date(ev.created_at).toLocaleString()}
                            {ev.note ? ` · ${ev.note}` : ""}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="border-t border-gray-100 pt-4 space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {item.image && <Image src={item.image} alt="" fill className="object-cover" sizes="48px" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.size} · {item.color} · Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
              <div className="text-sm space-y-1 pt-2 border-t border-gray-100">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-700"><span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span><span>-{formatPrice(order.discount)}</span></div>
                )}
                <div className="flex justify-between text-gray-500"><span>Delivery</span><span>{order.delivery === 0 ? "FREE" : formatPrice(order.delivery)}</span></div>
                <div className="flex justify-between font-extrabold text-gray-900 text-base pt-1"><span>Total</span><span>{formatPrice(order.total)}</span></div>
              </div>
              <p className="text-xs text-gray-400">Delivering to: {order.address}, {order.state}</p>
            </div>
          </div>
        )}

        <Link href="/products" className="block text-center text-sm text-green-700 font-semibold hover:underline">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
