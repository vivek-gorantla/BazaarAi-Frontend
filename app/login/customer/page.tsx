"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "../../contexts/LanguageContext";

export default function CustomerLoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, role: "buyer" }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error?.message || "Login failed");
      }
      
      localStorage.setItem("buyer_token", data.data.token);
      localStorage.setItem("buyer_user", JSON.stringify(data.data.user));
      
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#556B2F]/10 to-transparent mix-blend-multiply" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-8 bg-surface-container-high rounded-3xl shadow-2xl border border-outline-variant/30"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#556B2F] tracking-tight mb-2">Welcome Back</h1>
          <p className="text-on-surface-variant">Log in to shop at Bazaar</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-on-surface mb-2">
              {t('auth.phone')}
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +919876543210"
              className="w-full px-4 py-3 bg-surface rounded-xl border border-outline-variant focus:border-[#556B2F] focus:ring-2 focus:ring-[#556B2F]/20 transition-all outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#556B2F] text-white rounded-xl font-bold hover:bg-[#435525] transition-all shadow-lg hover:shadow-[#556B2F]/30 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? "Logging in..." : t('auth.login')}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          {t('auth.dont_have_account')}{" "}
          <Link href="/signup/customer" className="text-[#556B2F] font-bold hover:underline">
            {t('auth.signup')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
