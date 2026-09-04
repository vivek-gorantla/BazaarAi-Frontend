"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search, Truck, ArrowRight, Store } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../../../contexts/LanguageContext";
import { AgentInput } from "../../../../agent/components/AgentInput";
import { AgentSelect } from "../../../../agent/components/AgentSelect";
import { AgentUIRegistry } from "../../../../agent/registry";

export default function LocationDeliveryPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [storeId, setStoreId] = useState<string | null>(null);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const [formData, setFormData] = useState({
    address: "",
    city: "",
    state: "",
    pincode: "",
    unit: "",
    deliveryEnabled: true,
    deliveryRadius: 5,
    lat: 17.5028,
    lng: 78.5833,
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
            setFormData(prev => ({
              ...prev,
              address: data.data.address !== "Pending" ? data.data.address : "",
              city: data.data.city || "",
              state: data.data.state || "",
              pincode: data.data.pincode || "",
              unit: data.data.unit || "",
              deliveryEnabled: data.data.deliveryEnabled ?? true,
              deliveryRadius: data.data.deliveryRadius || 5,
              lat: data.data.lat || 17.5028,
              lng: data.data.lng || 78.5833,
            }));
          }
        })
        .catch(console.error);
    }
  }, []);

  useEffect(() => {
    AgentUIRegistry.registerPage("location-delivery", "Location & Delivery");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e?.target?.name) {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const handleToggle = () => {
    setFormData({ ...formData, deliveryEnabled: !formData.deliveryEnabled });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, deliveryRadius: parseFloat(e.target.value) });
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Mapbox Reverse Geocoding
          const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`);
          const data = await res.json();

          if (data && data.features && data.features.length > 0) {
            const feature = data.features[0];
            const context = feature.context || [];

            const cityObj = context.find((c: any) => c.id.startsWith('place') || c.id.startsWith('locality'));
            const stateObj = context.find((c: any) => c.id.startsWith('region'));
            const zipObj = context.find((c: any) => c.id.startsWith('postcode'));

            // feature.address often contains the house/plot number in Mapbox, feature.text is the street
            const streetAddress = [feature.address, feature.text].filter(Boolean).join(" ");

            setFormData(prev => ({
              ...prev,
              lat: latitude,
              lng: longitude,
              unit: feature.address || prev.unit, // Assign house/plot number to the Unit field if Mapbox finds it
              address: streetAddress || feature.place_name.split(',')[0],
              city: cityObj ? cityObj.text : prev.city,
              state: stateObj ? stateObj.text : prev.state,
              pincode: zipObj ? zipObj.text : prev.pincode
            }));
          } else {
            setFormData(prev => ({ ...prev, lat: latitude, lng: longitude }));
          }
        } catch (err) {
          console.error("Geocoding failed", err);
          setFormData(prev => ({ ...prev, lat: latitude, lng: longitude }));
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error", error);
        alert("Unable to retrieve your location");
        setLocating(false);
      }
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_TOKEN}`);
      const data = await res.json();

      if (data && data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [longitude, latitude] = feature.center;
        const context = feature.context || [];

        const cityObj = context.find((c: any) => c.id.startsWith('place') || c.id.startsWith('locality'));
        const stateObj = context.find((c: any) => c.id.startsWith('region'));
        const zipObj = context.find((c: any) => c.id.startsWith('postcode'));

        const streetAddress = [feature.address, feature.text].filter(Boolean).join(" ");

        setFormData(prev => ({
          ...prev,
          lat: latitude,
          lng: longitude,
          unit: feature.address || prev.unit,
          address: streetAddress || feature.place_name.split(',')[0],
          city: cityObj ? cityObj.text : prev.city,
          state: stateObj ? stateObj.text : prev.state,
          pincode: zipObj ? zipObj.text : prev.pincode
        }));
      } else {
        alert("Location not found. Try a broader search term.");
      }
    } catch (err) {
      console.error("Search failed", err);
      alert("Search failed. Please try again.");
    } finally {
      setSearching(false);
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
        router.push("/merchant/merchant-onboarding/product-catalog");
      } else {
        const error = await res.json();
        alert(error.error?.message || "Failed to save location");
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
    { name: t('merchant_onboarding.steps.location'), active: true },
    { name: t('merchant_onboarding.steps.catalog'), active: false },
    { name: t('merchant_onboarding.steps.payments'), active: false },
    { name: t('merchant_onboarding.steps.staff'), active: false },
  ];

  // Calculate a mock estimated reach based on radius (e.g. 2500 people per km radius squared)
  const estimatedReach = formData.deliveryEnabled
    ? Math.round(Math.pow(formData.deliveryRadius, 2) * 500).toLocaleString()
    : "0";

  return (
    <div className="min-h-screen bg-[#141A15] font-sans pb-20 text-white">
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-transparent">
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
      <div className="max-w-6xl mx-auto px-6 mt-4">
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

      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 relative">
        {/* Left Column: Form */}
        <div className="flex-1 max-w-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-black text-white mb-4 tracking-tight">{t('merchant_onboarding.location.title')}</h1>
            <p className="text-[#C2D6C0] mb-8 leading-relaxed max-w-sm">
              {t('merchant_onboarding.location.subtitle')}
            </p>
          </motion.div>

          <div className="space-y-6">
            {/* Store Address Block */}
            <div className="bg-[#1A231C] rounded-[32px] p-8 shadow-2xl border border-[#2E3D30]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white text-lg">{t('merchant_onboarding.location.address_title')}</h3>
                <div className="w-12 h-12 rounded-full border-4 border-[#2E3D30] flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-[#F3B58C]"></div>
                </div>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={16} className={searching ? "text-[#F3B58C] animate-pulse" : "text-[#7A9378]"} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={t('merchant_onboarding.location.search_placeholder')}
                  className="w-full pl-10 pr-28 py-3 bg-[#141A15] rounded-xl border border-[#2E3D30] focus:outline-none focus:ring-2 focus:ring-[#F3B58C]/40 transition-all text-sm text-white placeholder-[#7A9378]"
                />
                <button
                  onClick={handleLocateMe}
                  disabled={locating}
                  className="absolute inset-y-1.5 right-1.5 px-4 bg-[#8C5A3B] hover:bg-[#784B2E] text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {locating ? t('merchant_onboarding.location.locating') : t('merchant_onboarding.location.locate_me')}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#C2D6C0]/80 uppercase tracking-widest mb-1">{t('merchant_onboarding.location.street')}</label>
                  <AgentInput
                    agentId="address"
                    agentLabel="Street Address"
                    agentDescription="The primary street address for the store"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Artisan Market Street"
                    className="w-full px-4 py-3 bg-[#141A15] rounded-xl border border-[#2E3D30] focus:border-[#F3B58C]/40 focus:outline-none focus:ring-2 focus:ring-[#F3B58C]/20 text-sm font-medium transition-all text-white placeholder-[#7A9378]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#C2D6C0]/80 uppercase tracking-widest mb-1">{t('merchant_onboarding.location.city')}</label>
                    <AgentInput
                      agentId="city"
                      agentLabel="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Hyderabad"
                      className="w-full px-4 py-3 bg-[#141A15] rounded-xl border border-[#2E3D30] focus:border-[#F3B58C]/40 focus:outline-none focus:ring-2 focus:ring-[#F3B58C]/20 text-sm font-medium transition-all text-white placeholder-[#7A9378]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#C2D6C0]/80 uppercase tracking-widest mb-1">{t('merchant_onboarding.location.state')}</label>
                    <div className="relative">
                      <AgentSelect
                        agentId="state"
                        agentLabel="State"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-[#141A15] rounded-xl border border-[#2E3D30] focus:border-[#F3B58C]/40 focus:outline-none focus:ring-2 focus:ring-[#F3B58C]/20 text-sm font-medium transition-all appearance-none text-white"
                      >
                        <option value="" className="bg-[#141A15]">{t('merchant_onboarding.location.select')}</option>
                        <option value="Telangana" className="bg-[#141A15]">Telangana</option>
                        <option value="Andhra Pradesh" className="bg-[#141A15]">Andhra Pradesh</option>
                        <option value="Karnataka" className="bg-[#141A15]">Karnataka</option>
                        <option value="Maharashtra" className="bg-[#141A15]">Maharashtra</option>
                      </AgentSelect>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-white/50">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#C2D6C0]/80 uppercase tracking-widest mb-1">{t('merchant_onboarding.location.postal')}</label>
                    <AgentInput
                      agentId="pincode"
                      agentLabel="Postal Code"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="97205"
                      className="w-full px-4 py-3 bg-[#141A15] rounded-xl border border-[#2E3D30] focus:border-[#F3B58C]/40 focus:outline-none focus:ring-2 focus:ring-[#F3B58C]/20 text-sm font-medium transition-all text-white placeholder-[#7A9378]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#C2D6C0]/80 uppercase tracking-widest mb-1">{t('merchant_onboarding.location.unit')}</label>
                    <AgentInput
                      agentId="unit"
                      agentLabel="Unit/Apt"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      placeholder={t('merchant_onboarding.location.unit_placeholder')}
                      className="w-full px-4 py-3 bg-[#141A15] rounded-xl border border-[#2E3D30] focus:border-[#F3B58C]/40 focus:outline-none focus:ring-2 focus:ring-[#F3B58C]/20 text-sm font-medium transition-all text-white placeholder-[#7A9378]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Radius Block */}
            <div className="bg-[#1A231C] rounded-[32px] p-8 shadow-2xl border border-[#2E3D30]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#243026] flex items-center justify-center text-[#F3B58C]">
                    <Truck size={18} />
                  </div>
                  <h3 className="font-bold text-white text-lg" dangerouslySetInnerHTML={{ __html: t('merchant_onboarding.location.radius_title') }}></h3>
                </div>
                {/* Custom Toggle Switch */}
                <button
                  onClick={handleToggle}
                  className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out flex ${formData.deliveryEnabled ? 'bg-[#8C5A3B] justify-end' : 'bg-gray-700 justify-start'}`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
                </button>
              </div>

              <div className={`transition-opacity duration-300 ${formData.deliveryEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <div className="flex justify-between items-end mb-4">
                  <label className="text-[11px] font-bold text-[#C2D6C0]/80 uppercase tracking-widest">{t('merchant_onboarding.location.zone_size')}</label>
                  <span className="text-2xl font-black text-white">{formData.deliveryRadius} <span className="text-sm text-[#F3B58C]">km</span></span>
                </div>

                <div className="mb-8 relative">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={formData.deliveryRadius}
                    onChange={handleSliderChange}
                    className="w-full h-2 bg-[#243026] rounded-lg appearance-none cursor-pointer outline-none slider-thumb-custom relative z-10"
                    style={{
                      background: `linear-gradient(to right, #8C5A3B 0%, #8C5A3B ${(formData.deliveryRadius / 20) * 100}%, #243026 ${(formData.deliveryRadius / 20) * 100}%, #243026 100%)`
                    }}
                  />
                  <style dangerouslySetInnerHTML={{
                    __html: `
                    input[type=range]::-webkit-slider-thumb {
                      appearance: none;
                      width: 20px;
                      height: 20px;
                      background: #F3B58C;
                      border: 4px solid #141A15;
                      border-radius: 50%;
                      cursor: pointer;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.5);
                    }
                  `}} />
                </div>

                <div className="bg-[#141A15] rounded-2xl p-6 text-white flex items-center justify-between shadow-lg border border-[#2E3D30]">
                  <div>
                    <p className="text-[10px] font-bold text-[#C2D6C0] uppercase tracking-widest mb-1">{t('merchant_onboarding.location.reach')}</p>
                    <p className="text-3xl font-black text-[#F3B58C]">~{estimatedReach}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#243026] rounded-xl flex items-center justify-center border border-[#496246]/40">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#F3B58C]">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-8 pt-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-xs font-bold text-white/50 hover:text-white transition-colors uppercase tracking-widest"
              >
                {t('merchant_onboarding.location.back')}
              </button>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/merchant/merchant-onboarding/product-catalog")}
                  className="px-6 py-4 text-[#F3B58C] font-bold text-sm tracking-wide hover:bg-[#8C5A3B]/20 rounded-xl transition-all"
                >
                  SKIP FOR NOW
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-8 py-4 bg-[#8C5A3B] hover:bg-[#784B2E] text-white rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-[0_8px_20px_rgba(140,90,59,0.4)] transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {loading ? t('merchant_onboarding.location.saving') : t('merchant_onboarding.location.next')}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Map Visualization */}
        <div className="flex-1 w-full lg:max-w-md h-[800px] relative">
          <div className="w-full h-full bg-[#141A15] rounded-[32px] overflow-hidden relative shadow-2xl border border-[#2E3D30]">
            {/* Mapbox Static Map Background - Dark Style */}
            <img
              key={`${formData.lat}-${formData.lng}`}
              src={`https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${formData.lng},${formData.lat},15.5,0/800x800@2x?access_token=${MAPBOX_TOKEN}`}
              alt="Mapbox Map"
              className="absolute inset-0 w-full h-full object-cover opacity-90"
            />

            {/* Legend Map Control */}
            <div className="absolute top-6 left-6 bg-[#1A231C]/90 backdrop-blur-md rounded-xl p-3 shadow-xl border border-[#2E3D30] z-10 text-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-[#8C5A3B]"></div>
                <span className="text-xs font-bold text-white/90">{t('merchant_onboarding.location.map_store')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-[#F3B58C] bg-[#F3B58C]/30"></div>
                <span className="text-xs font-bold text-white/90">{t('merchant_onboarding.location.map_delivery')}</span>
              </div>
            </div>

            {/* Map Controls */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
              <div className="bg-[#1A231C] rounded-xl shadow-xl overflow-hidden flex flex-col border border-[#2E3D30]">
                <button className="w-10 h-10 flex items-center justify-center text-white hover:bg-[#243026] font-bold border-b border-[#2E3D30]">+</button>
                <button className="w-10 h-10 flex items-center justify-center text-white hover:bg-[#243026] font-bold">−</button>
              </div>
              <button className="w-10 h-10 bg-[#1A231C] rounded-xl shadow-xl flex items-center justify-center text-white hover:bg-[#243026] border border-[#2E3D30]">
                <MapPin size={18} className="text-[#F3B58C]" />
              </button>
            </div>

            {/* Radius Overlay - Center Point */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="mb-4 bg-[#1A231C]/90 backdrop-blur-md px-4 py-2 rounded-full text-sm font-black text-white shadow-xl border border-[#8C5A3B]/40 flex items-center gap-2">
                <Store size={16} className="text-[#F3B58C]" />
                {formData.city ? `${formData.city}${formData.state ? `, ${formData.state}` : ''}` : "Dammaiguda, Hyderabad"}
              </div>

              {/* The Radius Circle */}
              {formData.deliveryEnabled && (
                <div
                  className="absolute rounded-full bg-[#F3B58C]/20 border-2 border-[#F3B58C] transition-all duration-300 ease-out flex items-center justify-center shadow-[0_0_30px_rgba(243,181,140,0.3)]"
                  style={{
                    width: `${Math.max(100, (formData.deliveryRadius / 20) * 400)}px`,
                    height: `${Math.max(100, (formData.deliveryRadius / 20) * 400)}px`
                  }}
                >
                  <div className="absolute w-full h-full bg-[#F3B58C]/10 rounded-full animate-pulse pointer-events-none"></div>
                </div>
              )}

              {/* Center Pin with Baazar Icon */}
              <div className="relative z-10 -mt-16">
                <div className="w-10 h-10 bg-[#8C5A3B] rounded-full flex items-center justify-center shadow-xl border-2 border-white">
                  <Store size={18} className="text-white" />
                </div>
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#8C5A3B] mx-auto -mt-1 drop-shadow-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
