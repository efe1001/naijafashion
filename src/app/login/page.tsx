"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, currentUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated && currentUser) {
      router.push(currentUser.role === "admin" ? "/admin" : "/");
    }
  }, [mounted, isAuthenticated, currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true);
    setError("");

    await new Promise((r) => setTimeout(r, 800));
    const result = login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
    }
  };

  const quickFill = (em: string, pw: string) => {
    setEmail(em);
    setPassword(pw);
    setError("");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-950 via-green-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-extrabold text-lg">iF</span>
            </div>
            <span className="text-2xl font-extrabold text-white">
              i<span className="text-green-400">Fashion</span>
            </span>
          </Link>
          <p className="text-gray-400 text-sm">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Welcome back</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5 flex items-center gap-2">
              <span className="text-red-500">⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 mt-2 ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800 shadow-lg shadow-green-200"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock size={16} /> Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3 flex items-center gap-2">
              <ShieldCheck size={12} className="text-green-600" />
              Demo accounts — click to fill
            </p>
            <div className="space-y-2">
              <button
                onClick={() => quickFill("admin@ifashion.ng", "Admin@2025")}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-colors"
              >
                <div className="text-left">
                  <p className="text-xs font-bold text-green-800">Admin Account</p>
                  <p className="text-xs text-green-600">admin@ifashion.ng</p>
                </div>
                <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-bold">ADMIN</span>
              </button>

              {[
                { name: "Adaeze Okonkwo", email: "ada@ifashion.ng", pass: "Ada@2025" },
                { name: "Emeka Nwosu", email: "emeka@ifashion.ng", pass: "Emeka@2025" },
                { name: "Fatima Bello", email: "fatima@ifashion.ng", pass: "Fatima@2025" },
              ].map((u) => (
                <button
                  key={u.email}
                  onClick={() => quickFill(u.email, u.pass)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
                >
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-800">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                  <span className="text-xs bg-gray-500 text-white px-2 py-0.5 rounded-full font-bold">USER</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-5">
          <Link href="/" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
            <ArrowLeft size={14} /> Back to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
