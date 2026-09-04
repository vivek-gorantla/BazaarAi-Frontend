"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../contexts/LanguageContext";

export default function CustomerSignupPage() {
  const router = useRouter();
  const { t, setLanguage, language } = useLanguage();
  
  const [step, setStep] = useState(1);
  const [selectedLang, setSelectedLang] = useState(language);
  const [translateContent, setTranslateContent] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNextStep = () => {
    if (translateContent) {
      setLanguage(selectedLang);
    } else {
      setLanguage("en");
    }
    setStep(2);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          phone, 
          role: "customer",
          preferredLanguage: selectedLang,
          translateContent 
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error?.message || "Signup failed");
      }
      
      localStorage.setItem("buyer_token", data.data.token);
      localStorage.setItem("buyer_user", JSON.stringify(data.data.user));
      localStorage.setItem("bazaar_customer_token", data.data.token);
      localStorage.setItem("bazaar_customer_user", JSON.stringify(data.data.user));
      
      router.push("/customer");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-[#556B2F]/10 to-transparent mix-blend-multiply" />
      
      <div className="relative z-10 w-full max-w-md p-8 bg-surface-container-high rounded-3xl shadow-2xl border border-outline-variant/30">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#556B2F] tracking-tight mb-2">
            {step === 1 ? t('onboarding.step1_title') : "Join Bazaar"}
          </h1>
          <p className="text-on-surface-variant">
            {step === 1 ? t('onboarding.step1_desc') : "Create your customer account"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-4">
                {[
                  { code: 'en', label: t('onboarding.english') },
                  { code: 'hi', label: t('onboarding.hindi') },
                  { code: 'te', label: t('onboarding.telugu') }
                ].map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLang(lang.code as any);
                      if (translateContent) {
                        setLanguage(lang.code as any);
                      }
                    }}
                    className={`w-full p-4 rounded-xl border-2 text-left font-bold text-lg transition-all ${
                      selectedLang === lang.code 
                        ? 'border-[#556B2F] bg-[#556B2F]/5 text-[#556B2F]' 
                        : 'border-outline-variant text-on-surface hover:border-[#556B2F]/50'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/30 mt-6">
                <p className="text-sm font-semibold mb-3">{t('onboarding.translate_prompt')}</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="translate" 
                      checked={translateContent} 
                      onChange={() => {
                        setTranslateContent(true);
                        setLanguage(selectedLang as any);
                      }}
                      className="text-[#556B2F] focus:ring-[#556B2F]"
                    />
                    <span>{t('onboarding.yes')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="translate" 
                      checked={!translateContent} 
                      onChange={() => {
                        setTranslateContent(false);
                        setLanguage("en");
                      }}
                      className="text-[#556B2F] focus:ring-[#556B2F]"
                    />
                    <span>{t('onboarding.no')}</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleNextStep}
                className="w-full py-3.5 bg-[#556B2F] text-white rounded-xl font-bold hover:bg-[#435525] transition-all shadow-lg text-lg mt-4"
              >
                {t('onboarding.continue')}
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <form onSubmit={handleSignup} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-on-surface mb-2">
                    {t('auth.name')}
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Singh"
                    className="w-full px-4 py-3 bg-surface rounded-xl border border-outline-variant focus:border-[#556B2F] focus:ring-2 focus:ring-[#556B2F]/20 transition-all outline-none"
                    required
                  />
                </div>

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

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="py-3.5 px-6 bg-surface-container border border-outline-variant rounded-xl font-bold hover:bg-surface-container-high transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 bg-[#556B2F] text-white rounded-xl font-bold hover:bg-[#435525] transition-all shadow-lg hover:shadow-[#556B2F]/30 disabled:opacity-70 text-lg"
                  >
                    {loading ? "Creating..." : t('onboarding.create_account')}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          {t('auth.already_have_account')}{" "}
          <Link href="/login/customer" className="text-[#556B2F] font-bold hover:underline">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
