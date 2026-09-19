"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Package, Truck, Home, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

function OrderContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId") || "NF-XXXXXX";
  const total = Number(params.get("total") || 0);
  const name = params.get("name") || "Customer";

  const steps = [
    { icon: CheckCircle, label: "Order Placed", done: true },
    { icon: Package, label: "Processing", done: false },
    { icon: Truck, label: "On the Way", done: false },
    { icon: Home, label: "Delivered", done: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Success card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-br from-green-700 to-green-600 p-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Order Confirmed!</h1>
            <p className="text-green-100 mt-1">
              Thank you, {name}! Your order has been placed.
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Order ID */}
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Order ID</p>
              <p className="font-extrabold text-xl text-gray-900 mt-1 font-mono">{orderId}</p>
              <p className="text-xs text-gray-400 mt-1">
                Save this for tracking your order
              </p>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center p-4 border border-green-100 bg-green-50 rounded-xl">
              <span className="font-semibold text-gray-700">Total Paid</span>
              <span className="font-extrabold text-green-700 text-lg">{formatPrice(total)}</span>
            </div>

            {/* Order tracking */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Order Status</h3>
              <div className="relative">
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 z-0" />
                <div className="relative flex justify-between z-10">
                  {steps.map(({ icon: Icon, label, done }, i) => (
                    <div key={label} className="flex flex-col items-center gap-2">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          i === 0
                            ? "bg-green-600 border-green-600 text-white"
                            : "bg-white border-gray-200 text-gray-400"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <span className={`text-xs text-center font-medium ${done ? "text-green-700" : "text-gray-400"}`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Delivery info */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Truck size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-blue-900 text-sm">Estimated Delivery</p>
                  <p className="text-blue-700 text-sm mt-0.5">
                    3 – 5 business days (Lagos) · 5 – 7 days (other states)
                  </p>
                  <p className="text-blue-500 text-xs mt-1">
                    A tracking number will be sent to your email.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
              <Link
                href={`/track?orderId=${orderId}`}
                className="w-full text-center bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Track this order
              </Link>
              <Link
                href="/products"
                className="w-full text-center bg-green-700 hover:bg-green-800 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-200"
              >
                Continue Shopping <ArrowRight size={16} />
              </Link>
              <Link
                href="/"
                className="w-full text-center border border-gray-200 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          Questions? Email us at{" "}
          <a href="mailto:hello@ifashion.ng" className="text-green-700 hover:underline">
            hello@ifashion.ng
          </a>{" "}
          or call{" "}
          <a href="tel:+2348012345678" className="text-green-700 hover:underline">
            +234 801 234 5678
          </a>
        </p>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
      </div>
    }>
      <OrderContent />
    </Suspense>
  );
}
