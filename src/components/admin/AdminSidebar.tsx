"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut,
  Tag, BarChart2, Bell, ChevronRight, Menu, X, Ticket, History,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: ShoppingCart, label: "Orders", href: "/admin/orders", badgeKey: "pending" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Tag, label: "Categories", href: "/admin/categories" },
  { icon: BarChart2, label: "Analytics", href: "/admin/analytics" },
  { icon: Ticket, label: "Coupons", href: "/admin/coupons" },
  { icon: Bell, label: "Notifications", href: "/admin/notifications" },
  { icon: History, label: "Activity Log", href: "/admin/activity" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    fetch("/api/orders?page=1&pageSize=1&status=pending")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setPending(d?.total ?? 0))
      .catch(() => setPending(0));
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-extrabold text-sm">iF</span>
          </div>
          <div>
            <p className="text-white font-extrabold text-sm leading-none">iFashion</p>
            <p className="text-green-400 text-xs font-medium">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Admin info */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-3">
          <div className="w-9 h-9 bg-linear-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
            {currentUser?.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{currentUser?.name}</p>
            <p className="text-green-400 text-xs font-medium uppercase">{currentUser?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-3 py-2">
          Main Menu
        </p>
        {navItems.map(({ icon: Icon, label, href, badgeKey }) => {
          const badge = badgeKey === "pending" && pending > 0 ? String(pending) : null;
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                active
                  ? "bg-green-600 text-white shadow-lg shadow-green-900/50"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={18} className={active ? "text-white" : "text-gray-500 group-hover:text-white"} />
              <span className="font-medium text-sm flex-1">{label}</span>
              {badge && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${active ? "bg-white/20 text-white" : "bg-green-600 text-white"}`}>
                  {badge}
                </span>
              )}
              {active && <ChevronRight size={14} className="text-white/70" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-800 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all text-sm font-medium"
        >
          <Package size={18} className="text-gray-500" />
          View Store
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all text-sm font-medium"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-gray-900 text-white rounded-xl shadow-lg"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-gray-900 z-40 transform transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 bg-gray-900 min-h-screen flex-col shrink-0">
        <SidebarContent />
      </div>
    </>
  );
}
