"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Building, Smartphone, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../../../contexts/LanguageContext";
import { AgentInput } from "../../../../agent/components/AgentInput";
import { AgentUIRegistry } from "../../../../agent/registry";

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

  useEffect(() => {
    AgentUIRegistry.registerPage("payments-bank", "Payments & Bank");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e?.target?.name) {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
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
    <div className="min-h-screen bg-[#141A15] font-sans pb-20 overflow-x-hidden text-white">
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-transparent relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white flex items-center justify-center rounded-sm">
            <div className="w-4 h-0.5 bg-black" />
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-white/90">
            {t('merchant_onboarding.title')}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-white/70">
          <span>{t('merchant_onboarding.help')}</span>
          <div className="w-8 h-8 rounded-full bg-[#496246] flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
        </div>
      </nav>

      {/* Stepper */}
      <div className="max-w-6xl mx-auto px-6 mt-4 relative z-10">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-white/40">
          {steps.map((step, index) => (
            <div key={step.name} className="flex items-center gap-2 sm:gap-4">
              <span className={step.active ? "text-[#F3B58C]" : ""}>
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <span className="text-white/20">&gt;</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 relative z-10">
        {/* Left Column: Form */}
        <div className="flex-1 max-w-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-black text-white mb-4 tracking-tight flex items-center gap-3">
              {t('merchant_onboarding.payments.title')}
            </h1>
            <p className="text-[#C2D6C0] mb-10 leading-relaxed max-w-sm">
              {t('merchant_onboarding.payments.subtitle')}
            </p>
          </motion.div>

          <div className="space-y-6">
            {/* Bank Transfer Block */}
            <div className="bg-[#1A231C] rounded-[32px] p-8 shadow-2xl border border-[#2E3D30]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#243026] flex items-center justify-center text-[#F3B58C]">
                    <Building size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{t('merchant_onboarding.payments.bank_title')}</h3>
                    <p className="text-xs text-[#C2D6C0]/80 font-medium">{t('merchant_onboarding.payments.bank_desc')}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-[#C2D6C0]/80 uppercase tracking-widest mb-1.5">{t('merchant_onboarding.payments.account_no')}</label>
                  <div className="relative">
                    <AgentInput
                      agentId="bankAccountNumber"
                      agentLabel="Account Number"
                      name="bankAccountNumber"
                      type="password"
                      value={formData.bankAccountNumber}
                      onChange={handleChange}
                      placeholder="•••• •••• •••• 1234"
                      className="w-full px-4 py-3 pl-11 bg-[#141A15] rounded-xl border border-[#2E3D30] focus:border-[#F3B58C]/40 focus:outline-none focus:ring-2 focus:ring-[#F3B58C]/20 text-sm font-medium transition-all font-mono tracking-wider text-white placeholder-[#7A9378]"
                    />
                    <Lock size={14} className="absolute left-4 top-3.5 text-[#7A9378]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#C2D6C0]/80 uppercase tracking-widest mb-1.5">{t('merchant_onboarding.payments.ifsc')}</label>
                  <AgentInput
                    agentId="bankIfsc"
                    agentLabel="IFSC Code"
                    name="bankIfsc"
                    value={formData.bankIfsc}
                    onChange={handleChange}
                    placeholder={t('merchant_onboarding.payments.ifsc_ph')}
                    className="w-full px-4 py-3 bg-[#141A15] rounded-xl border border-[#2E3D30] focus:border-[#F3B58C]/40 focus:outline-none focus:ring-2 focus:ring-[#F3B58C]/20 text-sm font-medium transition-all uppercase text-white placeholder-[#7A9378]"
                  />
                </div>
              </div>
            </div>

            {/* Fast Payments / UPI Block */}
            <div className="bg-[#1A231C] rounded-[32px] p-8 shadow-2xl border border-[#2E3D30]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#3D2618] flex items-center justify-center text-[#F3B58C]">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{t('merchant_onboarding.payments.fast_title')}</h3>
                    <p className="text-xs text-[#C2D6C0]/80 font-medium">{t('merchant_onboarding.payments.fast_desc')}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#C2D6C0]/80 uppercase tracking-widest mb-1.5">{t('merchant_onboarding.payments.upi')}</label>
                <AgentInput
                  agentId="upiId"
                  agentLabel="UPI ID"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleChange}
                  placeholder={t('merchant_onboarding.payments.upi_ph')}
                  className="w-full px-4 py-3 bg-[#141A15] rounded-xl border border-[#2E3D30] focus:border-[#F3B58C]/40 focus:outline-none focus:ring-2 focus:ring-[#F3B58C]/20 text-sm font-medium transition-all text-white placeholder-[#7A9378]"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-8 pt-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-xs font-bold text-white/50 hover:text-white transition-colors uppercase tracking-widest"
              >
                {t('merchant_onboarding.payments.back')}
              </button>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/merchant/merchant-onboarding/staff")}
                  className="px-6 py-4 text-[#F3B58C] font-bold text-sm tracking-wide hover:bg-[#8C5A3B]/20 rounded-xl transition-all"
                >
                  SKIP FOR NOW
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-8 py-4 bg-[#8C5A3B] hover:bg-[#784B2E] text-white rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-[0_8px_20px_rgba(140,90,59,0.4)] transform hover:-translate-y-0.5 disabled:opacity-50"
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

          <div className="absolute inset-0 bg-[#8C5A3B]/20 rounded-[40px] transform rotate-3 scale-95 opacity-50 blur-lg"></div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
            className="w-full max-w-sm aspect-[1.586] bg-gradient-to-br from-[#2D3A2C] to-[#1F271E] rounded-[24px] shadow-2xl relative overflow-hidden border border-white/10 p-8 flex flex-col justify-between"
          >
            {/* Ambient glows */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#496246]/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#496246]/20 rounded-full blur-3xl"></div>

            {/* Card Header */}
            <div className="flex justify-between items-start relative z-10">
              <ShieldCheck size={32} className="text-[#E8F0E7]" />
              <div className="flex gap-1">
                <div className="w-8 h-5 bg-white/20 rounded-md backdrop-blur-sm"></div>
                <div className="w-5 h-5 bg-[#E8F0E7]/80 rounded-full backdrop-blur-sm -ml-3 mix-blend-screen"></div>
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
                <span>{formData.bankAccountNumber ? formData.bankAccountNumber.slice(0, 4).padEnd(4, '•') : '••••'}</span>
                <span>{formData.bankAccountNumber && formData.bankAccountNumber.length > 4 ? formData.bankAccountNumber.slice(4, 8).padEnd(4, '•') : '••••'}</span>
                <span>{formData.bankAccountNumber && formData.bankAccountNumber.length > 8 ? formData.bankAccountNumber.slice(8, 12).padEnd(4, '•') : '••••'}</span>
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
