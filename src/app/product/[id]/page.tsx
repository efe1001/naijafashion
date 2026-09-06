"use client";

import { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Heart, Star, ChevronRight, Minus, Plus, Shield, Truck, RefreshCw } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useProduct, useProducts } from "@/lib/useProducts";
import { formatPrice, buildWhatsAppLink } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { product, loading, notFound } = useProduct(id);
  const { products: allProducts } = useProducts();
  const { addItem } = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const { whatsappNumber } = useSettingsStore();
  const productVideo = product?.videoUrl;

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">Product not found</p>
          <Link href="/products" className="mt-4 inline-block text-green-700 font-semibold hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const wishlisted = isWishlisted(product.id);

  const handleToggleWishlist = async () => {
    const result = await toggleWishlist(product);
    if (result.requiresAuth) router.push("/login");
  };

  const handleAddToCart = () => {
    if (!selectedSize) { setSizeError(true); return; }
    if (!selectedColor) { setColorError(true); return; }

    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedSize, selectedColor);
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleSendToWhatsApp = () => {
    const lines = [
      `Hi! I'm interested in this product from iFashion:`,
      ``,
      `*${product.name}*`,
      `Price: ${formatPrice(product.price)}`,
      selectedSize ? `Size: ${selectedSize}` : null,
      selectedColor ? `Color: ${selectedColor}` : null,
      `Image: ${product.images[0]}`,
      productVideo ? `Video: ${productVideo}` : null,
      `Link: ${typeof window !== "undefined" ? window.location.href : ""}`,
    ].filter(Boolean);
    window.open(buildWhatsAppLink(whatsappNumber, lines.join("\n")), "_blank");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-green-700">Home</Link>
            <ChevronRight size={14} />
            <Link href="/products" className="hover:text-green-700">Products</Link>
            <ChevronRight size={14} />
            <Link href={`/category/${product.category}`} className="hover:text-green-700 capitalize">
              {product.category.replace(/-/g, " ")}
            </Link>
            <ChevronRight size={14} />
            <span className="text-gray-800 font-medium truncate max-w-xs">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
              <Image
                src={product.images[activeImage] || product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {product.badge && (
                <span className="absolute top-4 left-4 bg-green-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {product.badge}
                </span>
              )}
              {discount > 0 && (
                <span className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{discount}%
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-20 aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                      activeImage === i ? "border-green-600" : "border-transparent"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
            {productVideo && (
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
                <video src={productVideo} controls className="w-full h-full" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  product.origin === "nigerian"
                    ? "bg-green-50 text-green-700"
                    : "bg-blue-50 text-blue-700"
                }`}>
                  {product.origin === "nigerian" ? "🇳🇬 Nigerian" : "🌍 International"}
                </span>
                <span className="text-xs text-gray-400 capitalize">
                  {product.subcategory.replace(/-/g, " ")}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{product.name}</h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    className={s <= Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                  />
                ))}
              </div>
              <span className="font-semibold text-sm text-gray-700">{product.rating}</span>
              <span className="text-sm text-gray-400">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-gray-900">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {product.material && (
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Material:</span> {product.material}
              </p>
            )}

            {/* Color */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-sm">
                  Color: <span className="font-normal text-gray-600">{selectedColor || "Select"}</span>
                </h3>
                {colorError && !selectedColor && (
                  <span className="text-xs text-red-500">Please select a color</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => { setSelectedColor(color); setColorError(false); }}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                      selectedColor === color
                        ? "border-green-600 bg-green-50 text-green-700"
                        : "border-gray-200 text-gray-700 hover:border-green-300"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-sm">
                  Size: <span className="font-normal text-gray-600">{selectedSize || "Select"}</span>
                </h3>
                {sizeError && !selectedSize && (
                  <span className="text-xs text-red-500">Please select a size</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setSizeError(false); }}
                    className={`min-w-[44px] px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-gray-200 text-gray-700 hover:border-green-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-semibold text-gray-900 text-sm mb-2">Quantity</h3>
              <div className="flex items-center gap-1 w-fit border border-gray-200 rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 hover:text-green-700 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center font-semibold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2.5 hover:text-green-700 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${
                  addedToCart
                    ? "bg-green-500 text-white"
                    : "bg-gray-900 hover:bg-green-800 text-white"
                }`}
              >
                <ShoppingBag size={18} />
                {addedToCart ? "Added to Cart!" : "Add to Cart"}
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`p-3.5 rounded-xl border-2 transition-colors ${
                  wishlisted
                    ? "border-red-400 bg-red-50 text-red-500"
                    : "border-gray-200 text-gray-600 hover:border-red-300"
                }`}
              >
                <Heart size={18} className={wishlisted ? "fill-red-500" : ""} />
              </button>
            </div>

            <button
              onClick={handleSendToWhatsApp}
              className="flex w-full items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm border-2 border-[#25D366] text-[#128C7E] hover:bg-[#25D366]/10 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2zm5.85 14.19c-.25.7-1.45 1.34-2 1.42-.51.08-1.15.11-1.86-.12-.43-.14-.98-.32-1.69-.63-2.97-1.28-4.91-4.28-5.06-4.48-.15-.2-1.21-1.61-1.21-3.07 0-1.46.77-2.18 1.04-2.48.27-.3.6-.37.8-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.25.6.85 2.08.92 2.23.07.15.12.33.02.53-.1.2-.15.32-.3.49-.15.17-.31.38-.44.51-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.36 1.46.3.15.48.13.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.28.1 1.75.83 2.05.98.3.15.5.22.57.35.08.13.08.75-.17 1.45z"/>
              </svg>
              Send Details to Admin on WhatsApp
            </button>

            <Link
              href="/checkout"
              onClick={() => {
                if (selectedSize && selectedColor) {
                  addItem(product, selectedSize, selectedColor);
                }
              }}
              className="block w-full text-center py-3.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl transition-colors shadow-lg shadow-green-200"
            >
              Buy Now — {formatPrice(product.price * quantity)}
            </Link>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
              {[
                { icon: Truck, text: "Fast Delivery" },
                { icon: Shield, text: "Secure Payment" },
                { icon: RefreshCw, text: "Easy Returns" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl">
                  <Icon size={18} className="text-green-700" />
                  <span className="text-xs text-gray-600 text-center font-medium">{text}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
