"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, removeItem, updateQuantity, getTotalPrice } =
    useCartStore();

  const total = getTotalPrice();
  const delivery = total >= 50000 ? 0 : 3500;

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-green-700" />
            <h2 className="font-bold text-lg text-gray-900">
              Your Cart ({items.length} {items.length === 1 ? "item" : "items"})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                <ShoppingBag size={32} className="text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-lg">Your cart is empty</p>
                <p className="text-gray-500 text-sm mt-1">
                  Add items to start your order
                </p>
              </div>
              <button
                onClick={closeCart}
                className="mt-2 bg-green-700 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-green-800 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                  className="flex gap-4 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="relative w-20 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.images[0]}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Size: {item.selectedSize} &bull; Color: {item.selectedColor}
                    </p>
                    <p className="font-bold text-green-700 text-sm mt-1">
                      {formatPrice(item.price)}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.selectedSize,
                              item.selectedColor,
                              item.quantity - 1
                            )
                          }
                          className="p-1.5 hover:text-green-700 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.selectedSize,
                              item.selectedColor,
                              item.quantity + 1
                            )
                          }
                          className="p-1.5 hover:text-green-700 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          removeItem(item.id, item.selectedSize, item.selectedColor)
                        }
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-100 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span className={delivery === 0 ? "text-green-600 font-medium" : ""}>
                  {delivery === 0 ? "FREE" : formatPrice(delivery)}
                </span>
              </div>
              {delivery > 0 && (
                <p className="text-xs text-gray-400">
                  Add {formatPrice(50000 - total)} more for free delivery
                </p>
              )}
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-green-700">{formatPrice(total + delivery)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-green-700 text-white text-center py-3.5 rounded-xl font-bold hover:bg-green-800 transition-colors shadow-lg shadow-green-200"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/cart"
              onClick={closeCart}
              className="block w-full text-center py-2.5 text-sm text-gray-600 hover:text-green-700 transition-colors"
            >
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
