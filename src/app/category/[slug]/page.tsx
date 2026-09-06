"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { categories } from "@/data/products";
import { useProducts } from "@/lib/useProducts";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { products } = useProducts();
  const category = categories.find((c) => c.slug === slug);
  const categoryProducts = products.filter((p) => p.category === slug);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">Category not found</p>
          <Link href="/products" className="mt-4 inline-block text-green-700 font-semibold hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-green-700">Home</Link>
            <ChevronRight size={14} />
            <span className="text-gray-800 font-medium">{category.name}</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-extrabold text-gray-900">{category.name}</h1>
          <p className="text-gray-500 mt-1">{category.description}</p>
          <p className="text-sm text-green-700 font-medium mt-2">
            {categoryProducts.length} {categoryProducts.length === 1 ? "product" : "products"}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {categoryProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl font-bold text-gray-300 mb-2">No products in this category yet</p>
            <p className="text-gray-400 text-sm">Check back soon!</p>
            <Link href="/products" className="mt-6 inline-block bg-green-700 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-800 transition-colors">
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
