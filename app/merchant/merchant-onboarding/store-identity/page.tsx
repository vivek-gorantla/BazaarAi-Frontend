"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, Store, Check, Edit2, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../../../contexts/LanguageContext";

const THEME_COLORS = [
  { name: "Green", hex: "#496246" },
  { name: "Brown", hex: "#8C5A3B" },
  { name: "Blue", hex: "#2B536C" },
  { name: "Red", hex: "#943A3A" },
  { name: "Purple", hex: "#5C466A" },
];

export default function StoreIdentityPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("The Artisan Bakery");
  
  const [formData, setFormData] = useState({
    bannerUrl: "",
    logoUrl: "",
    themeColor: THEME_COLORS[0].hex,
    description: "",
  });

  useEffect(() => {
    const id = localStorage.getItem("merchant_store_id");
    if (id) {
      setStoreId(id);
      // Fetch store details to get the name
      fetch(`/api/merchant/stores/${id}`, {
        headers: {
          "x-user-id": localStorage.getItem("merchant_token") || "",
          "Authorization": `Bearer ${localStorage.getItem("merchant_token")}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setStoreName(data.data.tradingName || data.data.legalName || data.data.name);
          if (data.data.description) setFormData(prev => ({ ...prev, description: data.data.description }));
          if (data.data.themeColor) setFormData(prev => ({ ...prev, themeColor: data.data.themeColor }));
          if (data.data.bannerUrl) setFormData(prev => ({ ...prev, bannerUrl: data.data.bannerUrl }));
          if (data.data.logoUrl) setFormData(prev => ({ ...prev, logoUrl: data.data.logoUrl }));
        }
      })
      .catch(console.error);
    }
  }, []);

  const handleSimulatedUpload = (field: "bannerUrl" | "logoUrl") => {
    // Simulate image upload by setting a placeholder image
    const placeholder = field === "bannerUrl" 
      ? "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop"
      : "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=200&auto=format&fit=crop";
    setFormData({ ...formData, [field]: placeholder });
  };

  const handleSave = async (isDraft = false) => {
    if (!storeId) {
      alert("No store ID found. Please complete step 1 first.");
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
        if (!isDraft) {
          router.push("/merchant/merchant-onboarding/location-delivery");
        } else {
          alert("Draft saved!");
        }
      } else {
        const error = await res.json();
        alert(error.error?.message || "Failed to save");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { name: t('merchant_onboarding.steps.business_details'), active: false },
    { name: t('merchant_onboarding.steps.store_identity'), active: true },
    { name: t('merchant_onboarding.steps.location'), active: false },
    { name: t('merchant_onboarding.steps.catalog'), active: false },
    { name: t('merchant_onboarding.steps.payments'), active: false },
    { name: t('merchant_onboarding.steps.staff'), active: false },
  ];

  return (
    <div className="min-h-screen bg-[#F2F7F2] font-sans pb-20">
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
      <div className="max-w-6xl mx-auto px-6 mt-4">
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

      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 relative">
        {/* Left Column: Form */}
        <div className="flex-1 max-w-xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-black text-gray-900 mb-4">{t('merchant_onboarding.identity.title')}</h1>
            <p className="text-gray-600 mb-8 max-w-md">
              {t('merchant_onboarding.identity.subtitle')}
            </p>
          </motion.div>

          <div className="space-y-6">
            {/* Store Banner */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-1">{t('merchant_onboarding.identity.banner_title')}</h3>
              <p className="text-xs text-gray-500 mb-4">{t('merchant_onboarding.identity.banner_desc')}</p>
              
              <div 
                onClick={() => handleSimulatedUpload("bannerUrl")}
                className="w-full h-32 bg-[#F2F7F2] rounded-xl border-2 border-dashed border-[#B0D1B0] flex flex-col items-center justify-center cursor-pointer hover:bg-[#E8F0E7] transition-colors relative overflow-hidden"
              >
                {formData.bannerUrl ? (
                  <img src={formData.bannerUrl} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-[#DCE8DC] flex items-center justify-center text-[#496246] mb-2">
                      <ImageIcon size={18} />
                    </div>
                    <span className="text-xs font-bold text-[#496246]">{t('merchant_onboarding.identity.upload_prompt')}</span>
                  </>
                )}
              </div>
            </div>

            {/* Store Logo */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{t('merchant_onboarding.identity.logo_title')}</h3>
                <p className="text-xs text-gray-500 mb-4 max-w-[200px]">{t('merchant_onboarding.identity.logo_desc')}</p>
                <button 
                  onClick={() => handleSimulatedUpload("logoUrl")}
                  className="px-4 py-2 bg-[#F2F7F2] text-[#496246] font-bold text-xs rounded-lg flex items-center gap-2 hover:bg-[#E8F0E7] transition-colors"
                >
                  <ImageIcon size={14} />
                  Upload Logo
                </button>
              </div>
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#B0D1B0] bg-[#F2F7F2] flex items-center justify-center relative overflow-hidden flex-shrink-0">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Store size={24} className="text-[#496246]" />
                )}
              </div>
            </div>

            {/* Brand Theme */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-1">{t('merchant_onboarding.identity.theme_title')}</h3>
              <p className="text-xs text-gray-500 mb-4">{t('merchant_onboarding.identity.theme_desc')}</p>
              
              <div className="flex items-center gap-3">
                {THEME_COLORS.map(color => (
                  <button
                    key={color.hex}
                    onClick={() => setFormData({ ...formData, themeColor: color.hex })}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative"
                    style={{ backgroundColor: color.hex }}
                  >
                    {formData.themeColor === color.hex && (
                      <Check size={16} className="text-white" />
                    )}
                  </button>
                ))}
                <div className="w-px h-8 bg-gray-200 mx-2" />
                <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200">
                  <Edit2 size={16} />
                </button>
              </div>
            </div>

            {/* Store Description */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-1">{t('merchant_onboarding.identity.desc_title')}</h3>
              <p className="text-xs text-gray-500 mb-4">{t('merchant_onboarding.identity.desc_subtitle')}</p>
              
              <div className="relative">
                <textarea
                  value={formData.description}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setFormData({ ...formData, description: e.target.value });
                    }
                  }}
                  placeholder={t('merchant_onboarding.identity.desc_placeholder')}
                  className="w-full h-32 px-4 py-3 bg-[#F2F7F2] rounded-xl border-none focus:ring-2 focus:ring-[#496246]/20 transition-all text-sm resize-none text-gray-700 placeholder-gray-400"
                />
                <span className="absolute bottom-3 right-4 text-xs font-bold text-gray-400">
                  {formData.description.length}/500
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-8">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => router.back()}
                  className="px-6 py-4 bg-[#E8F0E7] text-[#496246] rounded-xl font-bold text-sm tracking-wide hover:bg-[#DCE8DC] transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={() => handleSave(true)}
                  disabled={loading}
                  className="px-6 py-4 bg-white text-gray-700 rounded-xl font-bold text-sm tracking-wide shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
                >
                  Save Draft
                </button>
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => router.push("/merchant/merchant-onboarding/location-delivery")}
                  className="px-6 py-4 text-[#496246] font-bold text-sm tracking-wide hover:bg-[#496246]/10 rounded-xl transition-all"
                >
                  SKIP FOR NOW
                </button>
                <button 
                  onClick={() => handleSave(false)}
                  disabled={loading}
                  className="px-8 py-4 bg-[#496246] hover:bg-[#3A4E38] text-white rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-[0_8px_16px_rgba(73,98,70,0.2)] hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {loading ? t('merchant_onboarding.identity.saving') : t('merchant_onboarding.identity.next')}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview */}
        <div className="w-full lg:w-[400px]">
          <div className="flex items-center gap-2 text-[#D68C5E] font-bold text-xs uppercase tracking-widest mb-6">
            <div className="w-6 h-6 rounded-full bg-[#FFF0E5] flex items-center justify-center">
              <span className="material-symbols-outlined text-[14px]">visibility</span>
            </div>
            {t('merchant_onboarding.identity.preview_title')}
          </div>

          <div className="bg-white rounded-[40px] shadow-2xl p-2 border-[8px] border-gray-100 overflow-hidden relative min-h-[600px]">
            {/* Phone Header Mock */}
            <div className="w-32 h-6 bg-gray-100 rounded-b-3xl mx-auto absolute top-0 inset-x-0 z-20" />
            
            <div className="w-full h-full bg-gray-50 rounded-[32px] overflow-hidden relative">
              {/* Banner */}
              <div className="h-40 bg-gray-300 relative">
                {formData.bannerUrl ? (
                  <img src={formData.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-400 to-gray-500 opacity-20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              {/* Store Content */}
              <div className="px-6 pb-6 relative">
                <div className="flex justify-between items-end -mt-10 mb-4 relative z-10">
                  <div className="w-20 h-20 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Store size={24} className="text-gray-400" />
                    )}
                  </div>
                  <div 
                    className="px-3 py-1 rounded-full text-white text-[10px] font-bold tracking-wider mb-2"
                    style={{ backgroundColor: formData.themeColor }}
                  >
                    {t('merchant_onboarding.identity.open_now')}
                  </div>
                </div>

                <h2 className="text-2xl font-black text-gray-900 mb-1">{storeName}</h2>
                <p className="text-xs text-gray-500 font-medium mb-6">{t('merchant_onboarding.identity.preview_cat')}</p>

                <p className="text-sm text-gray-600 leading-relaxed mb-8">
                  {formData.description || "{t('merchant_onboarding.identity.preview_desc_placeholder')}"}
                </p>

                <div className="flex items-center gap-3">
                  <button 
                    className="flex-1 py-3 text-white rounded-xl font-bold text-sm shadow-md"
                    style={{ backgroundColor: formData.themeColor }}
                  >
                    Order Now
                  </button>
                  <button className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                    <Heart size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-6 font-medium px-4">
            {t('merchant_onboarding.identity.preview_footer')}
          </p>
        </div>
      </div>
    </div>
  );
}

// Arrow component omitted for brevity, adding it above
function ArrowRight(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  );
}
