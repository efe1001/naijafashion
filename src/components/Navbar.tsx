"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag, Search, Menu, X, Heart, ChevronDown } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

const navLinks = [
  {
    label: "Nigerian Wear",
    href: "/category/nigerian-traditional",
    children: [
      { label: "Agbada", href: "/category/nigerian-traditional?sub=agbada" },
      { label: "Ankara", href: "/category/nigerian-traditional?sub=ankara" },
      { label: "Aso-Oke", href: "/category/nigerian-traditional?sub=aso-oke" },
      { label: "Senator", href: "/category/nigerian-traditional?sub=senator" },
      { label: "George Wrapper", href: "/category/nigerian-traditional?sub=george" },
      { label: "Babban Riga", href: "/category/nigerian-traditional?sub=babban-riga" },
    ],
  },
  {
    label: "Women",
    href: "/category/women",
    children: [
      { label: "Dresses", href: "/category/women?sub=dresses" },
      { label: "Tops & Blouses", href: "/category/women?sub=tops" },
      { label: "Bottoms", href: "/category/women?sub=bottoms" },
      { label: "Sets & Co-ords", href: "/category/women?sub=sets" },
    ],
  },
  {
    label: "Men",
    href: "/category/men",
    children: [
      { label: "Shirts", href: "/category/men?sub=shirts" },
      { label: "Trousers", href: "/category/men?sub=trousers" },
      { label: "Suits", href: "/category/men?sub=suits" },
      { label: "Sets", href: "/category/men?sub=sets" },
    ],
  },
  { label: "Kids", href: "/category/kids", children: [] },
  { label: "Accessories", href: "/category/accessories", children: [] },
  { label: "International", href: "/category/international", children: [] },
];

export default function Navbar() {
  const { getTotalItems, toggleCart } = useCartStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const totalItems = getTotalItems();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-green-800 text-white text-center text-xs py-2 px-4 font-medium tracking-wide">
        🇳🇬 Free delivery on orders above ₦50,000 &nbsp;|&nbsp; Pay with Paystack — Safe & Secure 🔒
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white shadow-md" : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">NF</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-extrabold text-xl text-gray-900 tracking-tight">Naija</span>
                <span className="font-extrabold text-xl text-green-700 tracking-tight">Fashion</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-700 transition-colors rounded-md hover:bg-green-50"
                  >
                    {link.label}
                    {link.children.length > 0 && <ChevronDown size={14} />}
                  </Link>

                  {link.children.length > 0 && activeDropdown === link.label && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50">
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <Link
                href="/wishlist"
                className="hidden sm:flex p-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors"
                aria-label="Wishlist"
              >
                <Heart size={20} />
              </Link>
              <button
                onClick={toggleCart}
                className="relative p-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-green-700 rounded-full transition-colors"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <div className="py-3 border-t border-gray-100">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search for Agbada, Ankara, dresses, suits..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <div key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-2.5 px-3 text-sm font-semibold text-gray-800 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                  {link.children.length > 0 && (
                    <div className="pl-4 space-y-1 mt-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block py-2 px-3 text-sm text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
