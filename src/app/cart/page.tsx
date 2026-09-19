"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/lib/useProducts";
import { useDelivery } from "@/lib/useDelivery";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const { products } = useProducts();
  const total = getTotalPrice();
  const { delivery, settings: deliverySettings } = useDelivery(total, "");
  const grandTotal = total + delivery;

  const suggested = products.filter((p) => !items.find((i) => i.id === p.id)).slice(0, 4);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <ShoppingBag size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-6">
            Looks like you haven&apos;t added anything to your cart yet. Start shopping!
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-green-700 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-green-800 transition-colors shadow-lg"
          >
            Start Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Shopping Cart ({items.length} {items.length === 1 ? "item" : "items"})
          </h1>
          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                className="bg-white rounded-2xl p-4 sm:p-5 flex gap-4 shadow-sm border border-gray-100"
              >
                <Link href={`/product/${item.id}`} className="relative w-24 sm:w-32 aspect-[3/4] rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    src={item.images[0]}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.id}`}>
                    <h3 className="font-bold text-gray-900 hover:text-green-700 transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      Size: {item.selectedSize}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      Color: {item.selectedColor}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                    <div>
                      <p className="font-extrabold text-gray-900 text-lg">{formatPrice(item.price)}</p>
                      <p className="text-xs text-gray-400">per item</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 border border-gray-200 rounded-xl bg-gray-50">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)
                          }
                          className="p-2 hover:text-green-700 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)
                          }
                          className="p-2 hover:text-green-700 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id, item.selectedSize, item.selectedColor)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-green-700 mt-2">
                    Subtotal: {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}

            {/* Coupon */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={16} className="text-green-700" />
                <h3 className="font-semibold text-gray-900">Have a coupon code?</h3>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button className="bg-gray-900 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-green-700 transition-colors">
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                    className="flex justify-between text-gray-600"
                  >
                    <span className="truncate max-w-[180px]">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}

                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className={`font-medium ${delivery === 0 ? "text-green-600" : ""}`}>
                      {delivery === 0 ? "FREE" : formatPrice(delivery)}
                    </span>
                  </div>
                  {delivery > 0 && deliverySettings.freeDeliveryThreshold > 0 && (
                    <p className="text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                      Add {formatPrice(Math.max(0, deliverySettings.freeDeliveryThreshold - total))} more for free delivery! Exact fee depends on your state.
                    </p>
                  )}
                </div>

                <div className="flex justify-between font-extrabold text-gray-900 text-lg pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-green-700">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-5 block w-full text-center bg-green-700 hover:bg-green-800 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-green-200 text-sm"
              >
                Proceed to Checkout →
              </Link>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <span>🔒</span>
                <span>Secured payment via Monnify</span>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        {suggested.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {suggested.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
