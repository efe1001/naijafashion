"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Search, Menu, X, Heart, ChevronDown, User, LogOut, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useWishlistStore } from "@/store/wishlistStore";
import SearchBar from "@/components/SearchBar";

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
  const { currentUser, isAuthenticated, logout } = useAuthStore();
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const totalItems = getTotalItems();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push("/");
  };

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-green-800 text-white text-center text-xs py-2 px-4 font-medium tracking-wide">
        🇳🇬 Free delivery on orders above ₦50,000 &nbsp;|&nbsp; Pay with Monnify — Safe & Secure 🔒
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white shadow-md" : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 bg-linear-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">iF</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-extrabold text-xl text-gray-900 tracking-tight">i</span>
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
                className="flex relative p-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors"
                aria-label="Wishlist"
              >
                <Heart size={20} />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </Link>
              <button
                onClick={toggleCart}
                className="relative p-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </button>

              {/* User menu */}
              {mounted && (
                isAuthenticated && currentUser ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-green-50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        {currentUser.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                      </div>
                      <ChevronDown size={12} className="text-gray-500 hidden sm:block" />
                    </button>
                    {userMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-50 mb-1">
                          <p className="font-bold text-gray-900 text-sm truncate">{currentUser.name}</p>
                          <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold mt-1 inline-block ${currentUser.role === "admin" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                            {currentUser.role}
                          </span>
                        </div>
                        {currentUser.role === "admin" && (
                          <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50 font-semibold">
                            <ShieldCheck size={14} /> Admin Dashboard
                          </Link>
                        )}
                        <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <User size={14} /> My Profile
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/login" className="flex items-center gap-1.5 bg-green-700 text-white text-sm font-bold px-3 sm:px-4 py-2 rounded-xl hover:bg-green-800 transition-colors">
                    <User size={14} /> <span className="hidden sm:inline">Login</span>
                  </Link>
                )
              )}
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
          {searchOpen && <SearchBar onDone={() => setSearchOpen(false)} />}
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
