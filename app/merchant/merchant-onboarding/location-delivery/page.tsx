"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search, Truck, ArrowRight, Store } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../../../contexts/LanguageContext";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        <div className="flex-1 max-w-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">{t('merchant_onboarding.location.title')}</h1>
            <p className="text-gray-600 mb-8 leading-relaxed max-w-sm">
              {t('merchant_onboarding.location.subtitle')}
            </p>
          </motion.div>

          <div className="space-y-6">
            {/* Store Address Block */}
            <div className="bg-[#EAF3EA] rounded-[32px] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 text-lg">{t('merchant_onboarding.location.address_title')}</h3>
                <div className="w-12 h-12 rounded-full border-4 border-[#DCE8DC] flex items-center justify-center opacity-30">
                  <div className="w-4 h-4 rounded-full bg-[#496246]"></div>
                </div>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={16} className={searching ? "text-[#496246] animate-pulse" : "text-gray-400"} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={t('merchant_onboarding.location.search_placeholder')}
                  className="w-full pl-10 pr-24 py-3 bg-white/60 rounded-xl border border-white focus:outline-none focus:ring-2 focus:ring-[#496246]/20 transition-all text-sm placeholder-gray-500"
                />
                <button
                  onClick={handleLocateMe}
                  disabled={locating}
                  className="absolute inset-y-1.5 right-1.5 px-4 bg-[#496246] hover:bg-[#3A4E38] text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {locating ? t('merchant_onboarding.location.locating') : t('merchant_onboarding.location.locate_me')}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">{t('merchant_onboarding.location.street')}</label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Artisan Market Street"
                    className="w-full px-4 py-3 bg-white rounded-xl border border-transparent focus:border-[#496246]/30 focus:outline-none focus:ring-2 focus:ring-[#496246]/10 text-sm font-medium transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">{t('merchant_onboarding.location.city')}</label>
                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Hyderabad"
                      className="w-full px-4 py-3 bg-white rounded-xl border border-transparent focus:border-[#496246]/30 focus:outline-none focus:ring-2 focus:ring-[#496246]/10 text-sm font-medium transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">{t('merchant_onboarding.location.state')}</label>
                    <div className="relative">
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white rounded-xl border border-transparent focus:border-[#496246]/30 focus:outline-none focus:ring-2 focus:ring-[#496246]/10 text-sm font-medium transition-all appearance-none"
                      >
                        <option value="">{t('merchant_onboarding.location.select')}</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Maharashtra">Maharashtra</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">{t('merchant_onboarding.location.postal')}</label>
                    <input
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="97205"
                      className="w-full px-4 py-3 bg-white rounded-xl border border-transparent focus:border-[#496246]/30 focus:outline-none focus:ring-2 focus:ring-[#496246]/10 text-sm font-medium transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">{t('merchant_onboarding.location.unit')}</label>
                    <input
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      placeholder={t('merchant_onboarding.location.unit_placeholder')}
                      className="w-full px-4 py-3 bg-white rounded-xl border border-transparent focus:border-[#496246]/30 focus:outline-none focus:ring-2 focus:ring-[#496246]/10 text-sm font-medium transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Radius Block */}
            <div className="bg-[#EAF3EA] rounded-[32px] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#DCE8DC] flex items-center justify-center text-[#496246]">
                    <Truck size={18} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg" dangerouslySetInnerHTML={{ __html: t('merchant_onboarding.location.radius_title') }}></h3>
                </div>
                {/* Custom Toggle Switch */}
                <button
                  onClick={handleToggle}
                  className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out flex ${formData.deliveryEnabled ? 'bg-[#496246] justify-end' : 'bg-gray-300 justify-start'}`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
                </button>
              </div>

              <div className={`transition-opacity duration-300 ${formData.deliveryEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <div className="flex justify-between items-end mb-4">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{t('merchant_onboarding.location.zone_size')}</label>
                  <span className="text-2xl font-black text-gray-900">{formData.deliveryRadius} <span className="text-sm">km</span></span>
                </div>

                <div className="mb-8 relative">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={formData.deliveryRadius}
                    onChange={handleSliderChange}
                    className="w-full h-2 bg-[#DCE8DC] rounded-lg appearance-none cursor-pointer outline-none slider-thumb-custom relative z-10"
                    style={{
                      background: `linear-gradient(to right, #496246 0%, #496246 ${(formData.deliveryRadius / 20) * 100}%, #DCE8DC ${(formData.deliveryRadius / 20) * 100}%, #DCE8DC 100%)`
                    }}
                  />
                  {/* Note: In a real app we'd inject custom CSS for the thumb, but here we just rely on standard appearance or basic styling */}
                  <style dangerouslySetInnerHTML={{
                    __html: `
                    input[type=range]::-webkit-slider-thumb {
                      appearance: none;
                      width: 20px;
                      height: 20px;
                      background: white;
                      border: 4px solid #496246;
                      border-radius: 50%;
                      cursor: pointer;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                  `}} />
                </div>

                <div className="bg-[#2D3A2C] rounded-2xl p-6 text-white flex items-center justify-between shadow-lg">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('merchant_onboarding.location.reach')}</p>
                    <p className="text-3xl font-black">~{estimatedReach}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#3A4E38] rounded-xl flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8BBA87]">
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
                className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-widest"
              >
                {t('merchant_onboarding.location.back')}
              </button>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/merchant/merchant-onboarding/product-catalog")}
                  className="px-6 py-4 text-[#496246] font-bold text-sm tracking-wide hover:bg-[#496246]/10 rounded-xl transition-all"
                >
                  SKIP FOR NOW
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-8 py-4 bg-[#496246] hover:bg-[#3A4E38] text-white rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-md transform hover:-translate-y-0.5 disabled:opacity-50"
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
          <div className="w-full h-full bg-[#E5E3DF] rounded-[32px] overflow-hidden relative shadow-inner border border-gray-200">
            {/* Mapbox Static Map Background */}
            <img
              key={`${formData.lat}-${formData.lng}`}
              src={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${formData.lng},${formData.lat},15.5,0/800x800@2x?access_token=${MAPBOX_TOKEN}`}
              alt="Mapbox Map"
              className="absolute inset-0 w-full h-full object-cover"
            />


            {/* Legend Map Control */}
            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur rounded-xl p-3 shadow-md border border-gray-100 z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-[#2B536C]"></div>
                <span className="text-xs font-bold text-gray-700">{t('merchant_onboarding.location.map_store')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-[#D68C5E] bg-[#D68C5E]/20"></div>
                <span className="text-xs font-bold text-gray-700">{t('merchant_onboarding.location.map_delivery')}</span>
              </div>
            </div>

            {/* Map Controls */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
              <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
                <button className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 font-bold border-b border-gray-100">+</button>
                <button className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 font-bold">−</button>
              </div>
              <button className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-100">
                <MapPin size={18} />
              </button>
            </div>

            {/* Radius Overlay - Center Point */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="mb-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-sm font-black text-[#496246] shadow-lg border border-white flex items-center gap-2">
                <Store size={16} className="text-[#496246]" />
                {formData.city ? `${formData.city}${formData.state ? `, ${formData.state}` : ''}` : "Dammaiguda, Hyderabad"}
              </div>

              {/* The Radius Circle */}
              {formData.deliveryEnabled && (
                <div
                  className="absolute rounded-full bg-[#D68C5E]/20 border border-[#D68C5E] transition-all duration-300 ease-out flex items-center justify-center"
                  style={{
                    width: `${Math.max(100, (formData.deliveryRadius / 20) * 400)}px`,
                    height: `${Math.max(100, (formData.deliveryRadius / 20) * 400)}px`
                  }}
                >
                  <div className="absolute w-full h-full bg-[#D68C5E]/10 rounded-full animate-pulse pointer-events-none"></div>
                </div>
              )}

              {/* Center Pin with Baazar Icon */}
              <div className="relative z-10 -mt-16">
                <div className="w-10 h-10 bg-[#496246] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <Store size={18} className="text-white" />
                </div>
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#496246] mx-auto -mt-1 drop-shadow-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
