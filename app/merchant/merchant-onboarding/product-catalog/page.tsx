"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mic, Camera, FileSpreadsheet, Plus, Trash2, ArrowRight, X, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../../contexts/LanguageContext";

type Product = {
  id: string;
  name: string;
  price: string;
  stockQty: string;
  unit: string;
  imageUrl?: string;
};

export default function ProductCatalogPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [storeId, setStoreId] = useState<string | null>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    subcategory: "",
    price: "",
    stockQty: "",
    unit: "piece",
    description: "",
  });

  useEffect(() => {
    const id = localStorage.getItem("merchant_store_id");
    if (id) {
      setStoreId(id);
      fetchCatalog(id);
    } else {
      setFetching(false);
    }
  }, []);

  const fetchCatalog = async (id: string) => {
    try {
      const res = await fetch(`/api/catalog/${id}`, {
        headers: {
          "x-user-id": localStorage.getItem("merchant_token") || "",
          "Authorization": `Bearer ${localStorage.getItem("merchant_token")}`
        }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/catalog/${storeId}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": localStorage.getItem("merchant_token") || "",
          "Authorization": `Bearer ${localStorage.getItem("merchant_token")}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stockQty: parseFloat(formData.stockQty || "0"),
          source: "manual"
        })
      });
      
      const data = await res.json();
      if (data.success) {
        // Add product to top of list
        setProducts([data.data, ...products]);
        setShowManualModal(false);
        // Reset form
        setFormData({
          name: "", category: "", subcategory: "", price: "", stockQty: "", unit: "piece", description: ""
        });
      } else {
        alert(data.error?.message || "Failed to add product");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm(t('merchant_onboarding.catalog.delete_confirm'))) return;
    
    try {
      const res = await fetch(`/api/catalog/products/${productId}`, {
        method: "DELETE",
        headers: {
          "x-user-id": localStorage.getItem("merchant_token") || "",
          "Authorization": `Bearer ${localStorage.getItem("merchant_token")}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter(p => p.id !== productId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const simulateIngestion = (type: string) => {
    alert(t('merchant_onboarding.catalog.alert_ingestion').replace('{type}', type));
  };

  const steps = [
    { name: t('merchant_onboarding.steps.business_details'), active: false },
    { name: t('merchant_onboarding.steps.store_identity'), active: false },
    { name: t('merchant_onboarding.steps.location'), active: false },
    { name: t('merchant_onboarding.steps.catalog'), active: true },
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
        {/* Left Column: Ingestion Options */}
        <div className="flex-1 max-w-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">{t('merchant_onboarding.catalog.title')}</h1>
            <p className="text-gray-600 mb-10 leading-relaxed max-w-sm">
              {t('merchant_onboarding.catalog.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {/* Speak Option */}
            <button 
              onClick={() => simulateIngestion("Voice")}
              className="bg-white hover:bg-[#EAF3EA] group rounded-[32px] p-6 text-left shadow-sm transition-all border border-transparent hover:border-[#496246]/20 flex flex-col items-start gap-4 h-48"
            >
              <div className="w-12 h-12 rounded-full bg-[#E8F0E7] group-hover:bg-[#496246] text-[#496246] group-hover:text-white flex items-center justify-center transition-colors">
                <Mic size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{t('merchant_onboarding.catalog.voice_title')}</h3>
                <p className="text-xs text-gray-500 font-medium">{t('merchant_onboarding.catalog.voice_desc')}</p>
              </div>
            </button>

            {/* Snap Option */}
            <button 
              onClick={() => simulateIngestion("Image")}
              className="bg-white hover:bg-[#EAF3EA] group rounded-[32px] p-6 text-left shadow-sm transition-all border border-transparent hover:border-[#496246]/20 flex flex-col items-start gap-4 h-48"
            >
              <div className="w-12 h-12 rounded-full bg-[#E8F0E7] group-hover:bg-[#496246] text-[#496246] group-hover:text-white flex items-center justify-center transition-colors">
                <Camera size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{t('merchant_onboarding.catalog.snap_title')}</h3>
                <p className="text-xs text-gray-500 font-medium">{t('merchant_onboarding.catalog.snap_desc')}</p>
              </div>
            </button>

            {/* CSV Option */}
            <button 
              onClick={() => simulateIngestion("CSV")}
              className="bg-white hover:bg-[#EAF3EA] group rounded-[32px] p-6 text-left shadow-sm transition-all border border-transparent hover:border-[#496246]/20 flex flex-col items-start gap-4 h-48"
            >
              <div className="w-12 h-12 rounded-full bg-[#E8F0E7] group-hover:bg-[#496246] text-[#496246] group-hover:text-white flex items-center justify-center transition-colors">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{t('merchant_onboarding.catalog.csv_title')}</h3>
                <p className="text-xs text-gray-500 font-medium">{t('merchant_onboarding.catalog.csv_desc')}</p>
              </div>
            </button>

            {/* Manual Option */}
            <button 
              onClick={() => setShowManualModal(true)}
              className="bg-[#496246] hover:bg-[#3A4E38] group rounded-[32px] p-6 text-left shadow-md transition-all flex flex-col items-start gap-4 h-48"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center backdrop-blur-sm">
                <Plus size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">{t('merchant_onboarding.catalog.manual_title')}</h3>
                <p className="text-xs text-white/80 font-medium">{t('merchant_onboarding.catalog.manual_desc')}</p>
              </div>
            </button>
          </div>

          <div className="mt-12 flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-widest"
            >
              {t('merchant_onboarding.catalog.back')}
            </button>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push("/merchant/merchant-onboarding/payments-bank")}
                className="px-6 py-4 text-[#496246] font-bold text-sm tracking-wide hover:bg-[#496246]/10 rounded-xl transition-all"
              >
                SKIP FOR NOW
              </button>
              <button 
                onClick={() => router.push("/merchant/merchant-onboarding/payments-bank")}
                className="px-8 py-4 bg-[#496246] hover:bg-[#3A4E38] text-white rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-md transform hover:-translate-y-0.5"
              >
                {t('merchant_onboarding.catalog.next')}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Catalog */}
        <div className="flex-1 w-full lg:max-w-md h-[700px] bg-white rounded-[40px] shadow-sm border border-gray-100 flex flex-col overflow-hidden relative">
          <div className="p-8 pb-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
            <div>
              <h3 className="font-black text-gray-900 text-xl">{t('merchant_onboarding.catalog.live_title')}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{products.length} {t('merchant_onboarding.catalog.items_indexed')}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#F2F7F2] flex items-center justify-center">
              <Package size={20} className="text-[#496246]" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-[#fafbfa]">
            {fetching ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="w-8 h-8 border-4 border-[#DCE8DC] border-t-[#496246] rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-bold">{t('merchant_onboarding.catalog.syncing')}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8 opacity-50">
                <Package size={48} className="text-gray-300 mb-4" />
                <h4 className="font-bold text-gray-600 mb-2">{t('merchant_onboarding.catalog.empty_title')}</h4>
                <p className="text-sm text-gray-500">{t('merchant_onboarding.catalog.empty_desc')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {products.map((product) => (
                    <motion.div 
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group"
                    >
                      <div className="w-16 h-16 rounded-xl bg-[#F2F7F2] flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-50">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={24} className="text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate">{product.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm font-black text-[#496246]">₹{Number(product.price).toFixed(2)}</span>
                          <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{Number(product.stockQty)} {product.unit}s</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Product Modal */}
      <AnimatePresence>
        {showManualModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowManualModal(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-20">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{t('merchant_onboarding.catalog.modal_title')}</h2>
                  <p className="text-sm text-gray-500 font-medium">{t('merchant_onboarding.catalog.modal_subtitle')}</p>
                </div>
                <button 
                  onClick={() => setShowManualModal(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto">
                <form id="manual-form" onSubmit={handleManualSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t('merchant_onboarding.catalog.modal_name')}</label>
                    <input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder={t('merchant_onboarding.catalog.modal_name_ph')}
                      className="w-full px-4 py-3 bg-[#F2F7F2]/50 rounded-xl border border-transparent focus:border-[#496246]/30 focus:outline-none focus:ring-2 focus:ring-[#496246]/10 text-sm font-medium transition-all"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t('merchant_onboarding.catalog.modal_cat')}</label>
                      <input
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        placeholder={t('merchant_onboarding.catalog.modal_cat_ph')}
                        className="w-full px-4 py-3 bg-[#F2F7F2]/50 rounded-xl border border-transparent focus:border-[#496246]/30 focus:outline-none focus:ring-2 focus:ring-[#496246]/10 text-sm font-medium transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t('merchant_onboarding.catalog.modal_price')}</label>
                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        placeholder="0.00"
                        className="w-full px-4 py-3 bg-[#F2F7F2]/50 rounded-xl border border-transparent focus:border-[#496246]/30 focus:outline-none focus:ring-2 focus:ring-[#496246]/10 text-sm font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t('merchant_onboarding.catalog.modal_stock')}</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stockQty}
                        onChange={(e) => setFormData({...formData, stockQty: e.target.value})}
                        placeholder="0"
                        className="w-full px-4 py-3 bg-[#F2F7F2]/50 rounded-xl border border-transparent focus:border-[#496246]/30 focus:outline-none focus:ring-2 focus:ring-[#496246]/10 text-sm font-medium transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t('merchant_onboarding.catalog.modal_unit')}</label>
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                        className="w-full px-4 py-3 bg-[#F2F7F2]/50 rounded-xl border border-transparent focus:border-[#496246]/30 focus:outline-none focus:ring-2 focus:ring-[#496246]/10 text-sm font-medium transition-all appearance-none"
                      >
                        {['piece', 'kg', 'gram', 'litre', 'ml', 'pack', 'box', 'dozen', 'other'].map(u => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t('merchant_onboarding.catalog.modal_desc')}</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder={t('merchant_onboarding.catalog.modal_desc_ph')}
                      rows={3}
                      className="w-full px-4 py-3 bg-[#F2F7F2]/50 rounded-xl border border-transparent focus:border-[#496246]/30 focus:outline-none focus:ring-2 focus:ring-[#496246]/10 text-sm font-medium transition-all resize-none"
                    />
                  </div>
                </form>
              </div>

              <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-[32px]">
                <button 
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-6 py-3 font-bold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="manual-form"
                  disabled={loading}
                  className="px-8 py-3 bg-[#496246] hover:bg-[#3A4E38] text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-md"
                >
                  {loading ? t('merchant_onboarding.catalog.adding') : t('merchant_onboarding.catalog.add_btn')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
