"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";

const badgeColors: Record<string, string> = {
  New: "bg-blue-500",
  Sale: "bg-red-500",
  Hot: "bg-orange-500",
  Limited: "bg-purple-500",
};

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);
  const [imgError, setImgError] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const soldOut = product.stock !== undefined && product.stock <= 0;
  const lowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 5;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (soldOut) return;
    addItem(product, product.sizes[0], product.colors[0]);
  };

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Image */}
      <Link href={`/product/${product.id}`} className="block relative overflow-hidden">
        <div className="aspect-[3/4] bg-gray-100 relative">
          {!imgError ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-green-50 to-green-100">
              <ShoppingBag size={40} className="text-green-300" />
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.badge && (
            <span
              className={`${badgeColors[product.badge]} text-white text-xs font-bold px-2 py-0.5 rounded-full`}
            >
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {soldOut && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-full">Out of stock</span>
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={async (e) => {
            e.preventDefault();
            const result = await toggleWishlist(product);
            if (result.requiresAuth) router.push("/login");
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
        >
          <Heart
            size={16}
            className={wishlisted ? "fill-red-500 text-red-500" : "text-gray-500"}
          />
        </button>

        {/* Quick add */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-200">
          <button
            onClick={handleQuickAdd}
            disabled={soldOut}
            className="w-full bg-gray-900/90 backdrop-blur-sm text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShoppingBag size={14} />
            Quick Add
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-3.5">
        <Link href={`/product/${product.id}`}>
          <p className="text-xs text-green-700 font-medium uppercase tracking-wide mb-0.5">
            {product.subcategory.replace(/-/g, " ")}
          </p>
          <h3 className="font-semibold text-sm text-gray-900 leading-snug line-clamp-2 hover:text-green-700 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium text-gray-700">{product.rating}</span>
            <span className="text-xs text-gray-400">({product.reviewCount})</span>
          </div>
        )}
        {lowStock && <p className="text-xs font-semibold text-orange-600 mt-1">Only {product.stock} left</p>}

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Origin tag */}
        <div className="mt-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              product.origin === "nigerian"
                ? "bg-green-50 text-green-700"
                : "bg-blue-50 text-blue-700"
            }`}
          >
            {product.origin === "nigerian" ? "🇳🇬 Nigerian" : "🌍 International"}
          </span>
        </div>
      </div>
    </div>
  );
}
