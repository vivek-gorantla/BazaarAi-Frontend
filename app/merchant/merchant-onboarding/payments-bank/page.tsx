"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Building, Smartphone, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../../../contexts/LanguageContext";

export default function PaymentsBankPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    bankAccountNumber: "",
    bankIfsc: "",
    upiId: "",
  });

  useEffect(() => {
    const id = localStorage.getItem("merchant_store_id");
    if (id) {
      setStoreId(id);
      fetch(`/api/merchant/stores/${id}`, {
        headers: {
          "x-user-id": localStorage.getItem("merchant_token") || "",
          "Authorization": `Bearer ${localStorage.getItem("merchant_token")}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setFormData({
            bankAccountNumber: data.data.bankAccountNumber || "",
            bankIfsc: data.data.bankIfsc || "",
            upiId: data.data.upiId || "",
          });
        }
      })
      .catch(console.error);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!storeId) {
      alert("No store ID found. Please start over.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/merchant/stores/${storeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": localStorage.getItem("merchant_token") || "",
          "Authorization": `Bearer ${localStorage.getItem("merchant_token")}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        router.push("/merchant/merchant-onboarding/staff");
      } else {
        const error = await res.json();
        alert(error.error?.message || "Failed to save payment details");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { name: t('merchant_onboarding.steps.business_details'), active: false },
    { name: t('merchant_onboarding.steps.store_identity'), active: false },
    { name: t('merchant_onboarding.steps.location'), active: false },
    { name: t('merchant_onboarding.steps.catalog'), active: false },
    { name: t('merchant_onboarding.steps.payments'), active: true },
    { name: t('merchant_onboarding.steps.staff'), active: false },
  ];

  return (
    <div className="min-h-screen bg-[#F2F7F2] font-sans pb-20 overflow-x-hidden">
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-transparent relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black flex items-center justify-center rounded-sm">
            <div className="w-4 h-0.5 bg-white" />
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-gray-800">
            {t('merchant_onboarding.title')}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
          <span>{t('merchant_onboarding.help')}</span>
          <div className="w-8 h-8 rounded-full bg-[#496246] flex items-center justify-center text-white text-xs">
            A
          </div>
        </div>
      </nav>

      {/* Stepper */}
      <div className="max-w-6xl mx-auto px-6 mt-4 relative z-10">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-gray-400">
          {steps.map((step, index) => (
            <div key={step.name} className="flex items-center gap-2 sm:gap-4">
              <span className={step.active ? "text-[#496246]" : ""}>
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <span className="text-gray-300">&gt;</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 relative z-10">
        {/* Left Column: Form */}
        <div className="flex-1 max-w-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight flex items-center gap-3">
              {t('merchant_onboarding.payments.title')}
            </h1>
            <p className="text-gray-600 mb-10 leading-relaxed max-w-sm">
              {t('merchant_onboarding.payments.subtitle')}
            </p>
          </motion.div>

          <div className="space-y-6">
            {/* Bank Transfer Block */}
            <div className="bg-[#EAF3EA] rounded-[32px] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#DCE8DC] flex items-center justify-center text-[#496246]">
                    <Building size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{t('merchant_onboarding.payments.bank_title')}</h3>
                    <p className="text-xs text-gray-500 font-medium">{t('merchant_onboarding.payments.bank_desc')}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t('merchant_onboarding.payments.account_no')}</label>
                  <div className="relative">
                    <input
                      name="bankAccountNumber"
                      type="password"
                      value={formData.bankAccountNumber}
                      onChange={handleChange}
                      placeholder="•••• •••• •••• 1234"
                      className="w-full px-4 py-3 pl-11 bg-white rounded-xl border border-transparent focus:border-[#496246]/30 focus:outline-none focus:ring-2 focus:ring-[#496246]/10 text-sm font-medium transition-all font-mono tracking-wider"
                    />
                    <Lock size={14} className="absolute left-4 top-3.5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t('merchant_onboarding.payments.ifsc')}</label>
                  <input
                    name="bankIfsc"
                    value={formData.bankIfsc}
                    onChange={handleChange}
                    placeholder={t('merchant_onboarding.payments.ifsc_ph')}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-transparent focus:border-[#496246]/30 focus:outline-none focus:ring-2 focus:ring-[#496246]/10 text-sm font-medium transition-all uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Fast Payments / UPI Block */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{t('merchant_onboarding.payments.fast_title')}</h3>
                    <p className="text-xs text-gray-500 font-medium">{t('merchant_onboarding.payments.fast_desc')}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t('merchant_onboarding.payments.upi')}</label>
                <input
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleChange}
                  placeholder={t('merchant_onboarding.payments.upi_ph')}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-sm font-medium transition-all"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-8 pt-4">
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-widest"
              >
                {t('merchant_onboarding.payments.back')}
              </button>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => router.push("/merchant/merchant-onboarding/staff")}
                  className="px-6 py-4 text-[#496246] font-bold text-sm tracking-wide hover:bg-[#496246]/10 rounded-xl transition-all"
                >
                  SKIP FOR NOW
                </button>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="px-8 py-4 bg-[#496246] hover:bg-[#3A4E38] text-white rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-md transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {loading ? t('merchant_onboarding.payments.saving') : t('merchant_onboarding.payments.next')}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Shield / Card */}
        <div className="flex-1 w-full lg:max-w-md hidden lg:flex items-center justify-center relative">
          
          <div className="absolute inset-0 bg-[#E8F0E7] rounded-[40px] transform rotate-3 scale-95 opacity-50"></div>
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
            className="w-full max-w-sm aspect-[1.586] bg-gradient-to-br from-[#2D3A2C] to-[#1A231A] rounded-[24px] shadow-2xl relative overflow-hidden border border-white/10 p-8 flex flex-col justify-between"
          >
            {/* Ambient glows */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#D68C5E]/20 rounded-full blur-3xl"></div>
            
            {/* Card Header */}
            <div className="flex justify-between items-start relative z-10">
              <ShieldCheck size={32} className="text-[#8BBA87]" />
              <div className="flex gap-1">
                <div className="w-8 h-5 bg-white/20 rounded-md backdrop-blur-sm"></div>
                <div className="w-5 h-5 bg-[#D68C5E]/80 rounded-full backdrop-blur-sm -ml-3 mix-blend-screen"></div>
              </div>
            </div>

            {/* Chip */}
            <div className="w-12 h-9 rounded bg-gradient-to-br from-yellow-200 to-yellow-500/50 mt-4 relative z-10 opacity-80 border border-yellow-300/30">
              <div className="w-full h-[1px] bg-black/20 absolute top-1/3"></div>
              <div className="w-full h-[1px] bg-black/20 absolute top-2/3"></div>
              <div className="w-[1px] h-full bg-black/20 absolute left-1/2"></div>
            </div>

            {/* Card Details */}
            <div className="relative z-10 mt-auto space-y-4">
              <div className="font-mono text-white/90 text-lg tracking-[0.2em] flex justify-between">
                <span>{formData.bankAccountNumber ? formData.bankAccountNumber.slice(0,4).padEnd(4, '•') : '••••'}</span>
                <span>{formData.bankAccountNumber && formData.bankAccountNumber.length > 4 ? formData.bankAccountNumber.slice(4,8).padEnd(4, '•') : '••••'}</span>
                <span>{formData.bankAccountNumber && formData.bankAccountNumber.length > 8 ? formData.bankAccountNumber.slice(8,12).padEnd(4, '•') : '••••'}</span>
                <span>{formData.bankAccountNumber && formData.bankAccountNumber.length > 12 ? formData.bankAccountNumber.slice(-4) : '••••'}</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] text-white/50 uppercase tracking-widest mb-1">{t('merchant_onboarding.payments.card_ifsc')}</p>
                  <p className="text-sm text-white font-medium uppercase tracking-wider">{formData.bankIfsc || "BANK0000000"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-white/50 uppercase tracking-widest mb-1">{t('merchant_onboarding.payments.card_upi')}</p>
                  <p className="text-sm text-white font-medium truncate max-w-[120px]">{formData.upiId || "secure@bank"}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
