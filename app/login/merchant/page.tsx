"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "../../contexts/LanguageContext";

export default function MerchantLoginPage() {
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
        body: JSON.stringify({ phone, role: "merchant" }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error?.message || "Login failed");
      }
      
      localStorage.setItem("merchant_token", data.data.token);
      localStorage.setItem("merchant_user", JSON.stringify(data.data.user));
      
      router.push("/merchant/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Left side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#8C5A3B]/5 to-transparent pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-black text-[#556B2F] tracking-tight mb-2">
              {t('auth.welcome_merchant')}
            </h1>
            <p className="text-on-surface-variant text-lg">Log in to manage your Bazaar store</p>
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
              className="w-full py-3.5 bg-[#8C5A3B] text-white rounded-xl font-bold hover:bg-[#7A4E33] transition-all shadow-lg hover:shadow-[#8C5A3B]/30 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 text-lg"
            >
              {loading ? "Logging in..." : t('auth.login')}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-on-surface-variant">
            {t('auth.dont_have_account')}{" "}
            <Link href="/signup/merchant" className="text-[#8C5A3B] font-bold hover:underline">
              {t('auth.signup')}
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side: Image */}
      <div className="hidden lg:block w-1/2 relative bg-[#556B2F]">
        <div className="absolute inset-0 bg-black/20 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2000&auto=format&fit=crop" 
          alt="Fresh produce market" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2 className="text-5xl font-black mb-4 leading-tight">Grow Your Business<br/>With Bazaar</h2>
            <p className="text-xl opacity-90 max-w-md">Join thousands of merchants selling fresh produce directly to customers.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
