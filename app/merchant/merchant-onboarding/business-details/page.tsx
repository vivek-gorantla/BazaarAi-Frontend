"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Store, FileText, User, MessageSquare, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../../../contexts/LanguageContext";
import { AgentInput } from "../../../../agent/components/AgentInput";
import { AgentUIRegistry } from "../../../../agent/registry";
import { useEffect } from "react";

export default function BusinessDetailsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    legalName: "",
    tradingName: "",
    taxId: "",
    vatNumber: "",
    businessEmail: "",
    supportPhone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e?.target?.name) {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  useEffect(() => {
    AgentUIRegistry.registerPage("business-details", "Business Details");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // In a real app we'd save this to a store or context. 
    // Here we create the store with placeholder required fields and the real provided fields.
    try {
      const res = await fetch("/api/merchant/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": localStorage.getItem("merchant_token") || "",
          "Authorization": `Bearer ${localStorage.getItem("merchant_token")}`
        },
        body: JSON.stringify({
          name: formData.tradingName || formData.legalName || "New Store",
          businessType: "retail",
          address: "Pending",
          lat: 0,
          lng: 0,
          ...formData
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Save storeId for next steps
        localStorage.setItem("merchant_store_id", data.data.id);
        router.push("/merchant/merchant-onboarding/store-identity");
      } else {
        const error = await res.json();
        console.error("Failed to save:", error);
        alert(error.error?.message || "Failed to save business details");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { name: t('merchant_onboarding.steps.business_details'), active: true },
    { name: t('merchant_onboarding.steps.store_identity'), active: false },
    { name: t('merchant_onboarding.steps.location'), active: false },
    { name: t('merchant_onboarding.steps.catalog'), active: false },
    { name: t('merchant_onboarding.steps.payments'), active: false },
    { name: t('merchant_onboarding.steps.staff'), active: false },
  ];

  return (
    <div className="min-h-screen bg-[#F2F7F2] font-sans">
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-transparent">
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
      <div className="max-w-5xl mx-auto px-6 mt-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium">
          {steps.map((step, index) => (
            <div key={step.name} className="flex items-center gap-2 sm:gap-4">
              <span className={step.active ? "text-[#496246] font-bold" : "text-gray-400"}>
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <span className="text-gray-300">&gt;</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
        {/* Background rounded shape like in design */}
        <div className="absolute top-0 right-0 bottom-0 left-1/3 bg-gradient-to-b from-[#E8F0E7] to-transparent rounded-tl-[100px] -z-10" />

        {/* Left Column: Form */}
        <div className="flex-1 max-w-xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 leading-tight tracking-tight">
              {t('merchant_onboarding.business.header_title').split('<br />').map((line, i) => <span key={i}>{line}<br /></span>)}
            </h1>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed max-w-md">
              {t('merchant_onboarding.business.header_desc')}
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="bg-white rounded-[32px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.04)] relative z-10">
            {/* Store Identity Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#E8F0E7] flex items-center justify-center text-[#496246]">
                  <Store size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{t('merchant_onboarding.steps.store_identity')}</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                    {t('merchant_onboarding.business.legal_name')}
                  </label>
                  <AgentInput
                    agentId="legalName"
                    agentLabel="Legal Name"
                    name="legalName"
                    value={formData.legalName}
                    onChange={handleChange}
                    placeholder={t('merchant_onboarding.business.legal_name_ph')}
                    required
                    className="w-full px-4 py-3.5 bg-gray-50/50 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#496246]/20 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                    {t('merchant_onboarding.business.trading_name')}
                  </label>
                  <AgentInput
                    agentId="tradingName"
                    agentLabel="Trading Name"
                    name="tradingName"
                    value={formData.tradingName}
                    onChange={handleChange}
                    placeholder={t('merchant_onboarding.business.trading_name_ph')}
                    className="w-full px-4 py-3.5 bg-gray-50/50 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#496246]/20 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Tax & Registration Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#FFF0E5] flex items-center justify-center text-[#D68C5E]">
                  <FileText size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{t('merchant_onboarding.business.tax_title')}</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                    {t('merchant_onboarding.business.tax_id')}
                  </label>
                  <AgentInput
                    agentId="taxId"
                    agentLabel="Tax ID"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    placeholder={t('merchant_onboarding.business.tax_id_ph')}
                    required
                    className="w-full px-4 py-3.5 bg-gray-50/50 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#496246]/20 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                    {t('merchant_onboarding.business.vat')}
                  </label>
                  <AgentInput
                    agentId="vatNumber"
                    agentLabel="VAT Number"
                    name="vatNumber"
                    value={formData.vatNumber}
                    onChange={handleChange}
                    placeholder={t('merchant_onboarding.business.optional')}
                    className="w-full px-4 py-3.5 bg-gray-50/50 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#496246]/20 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Primary Contact Section */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                  <User size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{t('merchant_onboarding.business.contact_title')}</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                    {t('merchant_onboarding.business.email')}
                  </label>
                  <AgentInput
                    agentId="businessEmail"
                    agentLabel="Business Email"
                    agentType="email"
                    name="businessEmail"
                    type="email"
                    value={formData.businessEmail}
                    onChange={handleChange}
                    placeholder="hello@bloomandco.com"
                    required
                    className="w-full px-4 py-3.5 bg-gray-50/50 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#496246]/20 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                    {t('merchant_onboarding.business.phone')}
                  </label>
                  <AgentInput
                    agentId="supportPhone"
                    agentLabel="Support Phone"
                    agentType="tel"
                    name="supportPhone"
                    type="tel"
                    value={formData.supportPhone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    required
                    className="w-full px-4 py-3.5 bg-gray-50/50 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#496246]/20 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#496246] hover:bg-[#3A4E38] text-white rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-[0_8px_16px_rgba(73,98,70,0.2)] hover:shadow-[0_12px_20px_rgba(73,98,70,0.3)] transform hover:-translate-y-0.5"
            >
              {loading ? t('merchant_onboarding.business.saving') : t('merchant_onboarding.business.continue')}
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Right Column: Support Widgets */}
        <div className="hidden lg:flex flex-col gap-6 w-80 pt-16 relative z-10">
          {/* Chat Widget */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-[#E8F0E7]"
          >
            <div className="flex gap-4 mb-4">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop"
                alt="Sarah Jenkins"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Sarah Jenkins</h4>
                <p className="text-xs text-gray-500">{t('merchant_onboarding.business.specialist')}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              {t('merchant_onboarding.business.chat_msg')}
            </p>
            <button className="flex items-center gap-2 text-sm font-bold text-[#496246] hover:text-[#3A4E38] transition-colors">
              <MessageSquare size={16} />
              {t('merchant_onboarding.business.chat_btn')}
            </button>
          </motion.div>

          {/* {t('merchant_onboarding.business.pro_tip')} Widget */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[#F8EFEB] rounded-3xl p-6 shadow-sm border border-[#F0E0D6]"
          >
            <div className="flex items-center gap-2 text-[#D68C5E] font-bold text-xs uppercase tracking-widest mb-3">
              <Lightbulb size={14} />
              {t('merchant_onboarding.business.pro_tip')}
            </div>
            <h4 className="font-bold text-gray-900 mb-3">{t('merchant_onboarding.business.consistency_title')}</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {t('merchant_onboarding.business.consistency_desc')}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
