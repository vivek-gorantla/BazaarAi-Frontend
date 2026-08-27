"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#8C5A3B]/5 to-[#556B2F]/10 mix-blend-multiply" />
      <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2000&auto=format&fit=crop')] opacity-5 bg-cover bg-center" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-8 bg-surface-container-high rounded-3xl shadow-2xl border border-outline-variant/30 flex flex-col items-center gap-6"
      >
        <div className="text-center mb-4">
          <h1 className="text-3xl font-black text-on-surface tracking-tight mb-2">{t('auth.login')}</h1>
          <p className="text-on-surface-variant">Choose how you want to log in</p>
        </div>

        <Link 
          href="/login/merchant"
          className="w-full py-4 bg-[#8C5A3B] text-white rounded-xl font-bold hover:bg-[#7A4E33] transition-all shadow-lg hover:shadow-[#8C5A3B]/30 hover:-translate-y-0.5 flex justify-center items-center gap-2"
        >
          <span className="material-symbols-outlined">storefront</span>
          {t('auth.login_as_merchant')}
        </Link>
        
        <Link 
          href="/login/customer"
          className="w-full py-4 bg-[#556B2F] text-white rounded-xl font-bold hover:bg-[#435525] transition-all shadow-lg hover:shadow-[#556B2F]/30 hover:-translate-y-0.5 flex justify-center items-center gap-2"
        >
          <span className="material-symbols-outlined">person</span>
          {t('auth.login_as_customer')}
        </Link>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          {t('auth.dont_have_account')}{" "}
          <Link href="/signup" className="text-[#8C5A3B] font-bold hover:underline">
            {t('auth.signup')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
