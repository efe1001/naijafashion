"use client";

import { useState, useMemo } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { categories } from "@/data/products";
import { useProducts } from "@/lib/useProducts";
import { SortOption } from "@/types";

const sortOptions: { label: string; value: SortOption }[] = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-low" },
  { label: "Price: High to Low", value: "price-high" },
  { label: "Newest", value: "newest" },
  { label: "Top Rated", value: "rating" },
];

export default function ProductsPage() {
  const { products } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedOrigin, setSelectedOrigin] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (selectedOrigin !== "all") {
      result = result.filter((p) => p.origin === selectedOrigin);
    }

    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result = result.filter((p) => p.badge === "New").concat(result.filter((p) => p.badge !== "New"));
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [products, selectedCategory, selectedOrigin, sortBy, priceRange]);

  const activeFilterCount = [
    selectedCategory !== "all",
    selectedOrigin !== "all",
    priceRange[0] > 0 || priceRange[1] < 100000,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedOrigin("all");
    setPriceRange([0, 100000]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-extrabold text-gray-900">All Products</h1>
          <p className="text-gray-500 mt-1">
            {filtered.length} {filtered.length === 1 ? "product" : "products"} found
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-medium px-4 py-2.5 rounded-xl hover:border-green-500 hover:text-green-700 transition-colors text-sm"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              <X size={14} /> Clear filters
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-500 hidden sm:block">Sort by:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-white border border-gray-200 text-gray-700 font-medium px-4 py-2.5 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters */}
          {filterOpen && (
            <aside className="w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-6 sticky top-24">
                {/* Categories */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                    Category
                  </h3>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === "all"
                          ? "bg-green-50 text-green-700 font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === cat.id
                            ? "bg-green-50 text-green-700 font-semibold"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {cat.name}
                        <span className="float-right text-xs text-gray-400">{cat.itemCount}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Origin */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                    Origin
                  </h3>
                  <div className="space-y-1.5">
                    {[
                      { label: "All", value: "all" },
                      { label: "🇳🇬 Nigerian", value: "nigerian" },
                      { label: "🌍 International", value: "international" },
                    ].map(({ label, value }) => (
                      <button
                        key={value}
                        onClick={() => setSelectedOrigin(value)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedOrigin === value
                            ? "bg-green-50 text-green-700 font-semibold"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                    Price Range
                  </h3>
                  <div className="space-y-2">
                    {[
                      { label: "Under ₦10,000", min: 0, max: 10000 },
                      { label: "₦10,000 – ₦25,000", min: 10000, max: 25000 },
                      { label: "₦25,000 – ₦50,000", min: 25000, max: 50000 },
                      { label: "Above ₦50,000", min: 50000, max: 100000 },
                    ].map(({ label, min, max }) => (
                      <button
                        key={label}
                        onClick={() => setPriceRange([min, max])}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          priceRange[0] === min && priceRange[1] === max
                            ? "bg-green-50 text-green-700 font-semibold"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Products grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-2xl font-bold text-gray-300 mb-2">No products found</p>
                <p className="text-gray-400 text-sm">Try adjusting your filters</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-green-700 font-semibold text-sm hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-4 sm:gap-5 ${
                  filterOpen
                    ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                }`}
              >
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
