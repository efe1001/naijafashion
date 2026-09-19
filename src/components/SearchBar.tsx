"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useProducts } from "@/lib/useProducts";
import { formatPrice } from "@/lib/utils";

export default function SearchBar({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const { products } = useProducts();
  const [query, setQuery] = useState("");

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return products
      .filter((p) =>
        [p.name, p.subcategory, p.category, p.description, p.material ?? ""].some((field) => field.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [products, query]);

  const submit = () => {
    const q = query.trim();
    if (!q) return;
    router.push(`/products?search=${encodeURIComponent(q)}`);
    onDone();
  };

  return (
    <div className="py-3 border-t border-gray-100">
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") onDone();
          }}
          placeholder="Search for Agbada, Ankara, dresses, suits..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        {query.trim().length >= 2 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
            {suggestions.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-500">No products match &quot;{query.trim()}&quot;</p>
            ) : (
              <>
                {suggestions.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.id}`}
                    onClick={onDone}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-green-50 transition-colors"
                  >
                    <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <Image src={p.images[0]} alt="" fill className="object-cover" sizes="40px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{p.category.replace(/-/g, " ")}</p>
                    </div>
                    <span className="text-sm font-bold text-green-700">{formatPrice(p.price)}</span>
                  </Link>
                ))}
                <button
                  onClick={submit}
                  className="w-full text-left px-4 py-2.5 text-sm font-semibold text-green-700 border-t border-gray-100 hover:bg-green-50"
                >
                  See all results for &quot;{query.trim()}&quot;
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
