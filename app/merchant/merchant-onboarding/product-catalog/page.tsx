"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mic, Camera, FileSpreadsheet, Plus, Trash2, ArrowRight, X, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../../contexts/LanguageContext";
import { AgentInput } from "../../../../agent/components/AgentInput";
import { AgentSelect } from "../../../../agent/components/AgentSelect";
import { AgentTextarea } from "../../../../agent/components/AgentTextarea";
import { AgentUIRegistry } from "../../../../agent/registry";
import { MerchantImageAgent } from "../../../../agent/components/MerchantImageAgent";
import { SmartRestockModal } from "../../../../components/SmartRestockModal";

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
  const [smartRestockOpen, setSmartRestockOpen] = useState(false);
  const [smartRestockTab, setSmartRestockTab] = useState<"voice" | "csv" | "text" | "camera">("voice");

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

  // Agent partial-fill: tracks which fields were left empty after image analysis
  const [agentEmptyFields, setAgentEmptyFields] = useState<string[]>([]);

  useEffect(() => {
    const id = localStorage.getItem("merchant_store_id");
    if (id) {
      setStoreId(id);
      fetchCatalog(id);
    } else {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    AgentUIRegistry.registerPage("product-catalog", "Product Catalog");
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

  // Called by MerchantImageAgent after it finishes filling the form
  const handleAgentFilled = (fills: { fieldId: string; value: string }[], partial: boolean) => {
    if (partial) {
      // Collect IDs of fields that were NOT filled
      const filledIds = new Set(fills.map(f => f.fieldId));
      const allFields = AgentUIRegistry.getFields();
      const empty = allFields
        .filter(f => !filledIds.has(f.id))
        .map(f => f.id);
      setAgentEmptyFields(empty);
    } else {
      setAgentEmptyFields([]);
    }
    // Open the manual modal so user can review / complete
    setShowManualModal(true);
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
        {/* Left Column: Ingestion Options */}
        <div className="flex-1 max-w-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-black text-white mb-4 tracking-tight">{t('merchant_onboarding.catalog.title')}</h1>
            <p className="text-[#C2D6C0] mb-10 leading-relaxed max-w-sm">
              {t('merchant_onboarding.catalog.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {/* Speak Option */}
            <button
              onClick={() => {
                setSmartRestockTab("voice");
                setSmartRestockOpen(true);
              }}
              className="bg-[#1A231C] hover:bg-[#243026] group rounded-[32px] p-6 text-left shadow-xl transition-all border border-[#2E3D30] hover:border-[#8C5A3B]/40 flex flex-col items-start gap-4 h-48"
            >
              <div className="w-12 h-12 rounded-full bg-[#243026] group-hover:bg-[#8C5A3B] text-[#F3B58C] group-hover:text-white flex items-center justify-center transition-colors">
                <Mic size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">{t('merchant_onboarding.catalog.voice_title')}</h3>
                <p className="text-xs text-[#C2D6C0]/80 font-medium">{t('merchant_onboarding.catalog.voice_desc')}</p>
              </div>
            </button>

            {/* Snap Option — wired to MerchantImageAgent */}
            <MerchantImageAgent
              onFilled={handleAgentFilled}
              label={t('merchant_onboarding.catalog.snap_title')}
              className="bg-[#1A231C] hover:bg-[#243026] group rounded-[32px] p-6 text-left shadow-xl transition-all border border-[#2E3D30] hover:border-[#8C5A3B]/40 flex flex-col items-start gap-4 h-48 w-full text-white"
            />

            {/* CSV Option */}
            <button
              onClick={() => {
                setSmartRestockTab("csv");
                setSmartRestockOpen(true);
              }}
              className="bg-[#1A231C] hover:bg-[#243026] group rounded-[32px] p-6 text-left shadow-xl transition-all border border-[#2E3D30] hover:border-[#8C5A3B]/40 flex flex-col items-start gap-4 h-48"
            >
              <div className="w-12 h-12 rounded-full bg-[#243026] group-hover:bg-[#8C5A3B] text-[#F3B58C] group-hover:text-white flex items-center justify-center transition-colors">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">{t('merchant_onboarding.catalog.csv_title')}</h3>
                <p className="text-xs text-[#C2D6C0]/80 font-medium">{t('merchant_onboarding.catalog.csv_desc')}</p>
              </div>
            </button>

            {/* Manual Option */}
            <button
              onClick={() => setShowManualModal(true)}
              className="bg-[#8C5A3B] hover:bg-[#784B2E] group rounded-[32px] p-6 text-left shadow-xl transition-all flex flex-col items-start gap-4 h-48 border border-[#F3B58C]/20"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center backdrop-blur-sm">
                <Plus size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">{t('merchant_onboarding.catalog.manual_title')}</h3>
                <p className="text-xs text-white/90 font-medium">{t('merchant_onboarding.catalog.manual_desc')}</p>
              </div>
            </button>
          </div>

          <div className="mt-12 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-xs font-bold text-white/50 hover:text-white transition-colors uppercase tracking-widest"
            >
              {t('merchant_onboarding.catalog.back')}
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/merchant/merchant-onboarding/payments-bank")}
                className="px-6 py-4 text-[#F3B58C] font-bold text-sm tracking-wide hover:bg-[#8C5A3B]/20 rounded-xl transition-all"
              >
                SKIP FOR NOW
              </button>
              <button
                onClick={() => router.push("/merchant/merchant-onboarding/payments-bank")}
                className="px-8 py-4 bg-[#8C5A3B] hover:bg-[#784B2E] text-white rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-[0_8px_20px_rgba(140,90,59,0.4)] transform hover:-translate-y-0.5"
              >
                {t('merchant_onboarding.catalog.next')}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Catalog */}
        <div className="flex-1 w-full lg:max-w-md h-[700px] bg-[#1A231C] rounded-[40px] shadow-2xl border border-[#2E3D30] flex flex-col overflow-hidden relative">
          <div className="p-8 pb-4 border-b border-[#2E3D30] flex items-center justify-between bg-[#1A231C] z-10">
            <div>
              <h3 className="font-black text-white text-xl">{t('merchant_onboarding.catalog.live_title')}</h3>
              <p className="text-xs font-bold text-[#C2D6C0]/60 uppercase tracking-wider mt-1">{products.length} {t('merchant_onboarding.catalog.items_indexed')}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#243026] flex items-center justify-center">
              <Package size={20} className="text-[#F3B58C]" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-[#141A15]">
            {fetching ? (
              <div className="flex flex-col items-center justify-center h-full text-white/50">
                <div className="w-8 h-8 border-4 border-[#2E3D30] border-t-[#8C5A3B] rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-bold">{t('merchant_onboarding.catalog.syncing')}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8 opacity-50">
                <Package size={48} className="text-white/40 mb-4" />
                <h4 className="font-bold text-white mb-2">{t('merchant_onboarding.catalog.empty_title')}</h4>
                <p className="text-sm text-[#C2D6C0]">{t('merchant_onboarding.catalog.empty_desc')}</p>
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
                      className="bg-[#1A231C] p-4 rounded-2xl shadow-md border border-[#2E3D30] flex items-center gap-4 group"
                    >
                      <div className="w-16 h-16 rounded-xl bg-[#243026] flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/5">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={24} className="text-[#F3B58C]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white truncate">{product.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm font-black text-[#F3B58C]">₹{Number(product.price).toFixed(2)}</span>
                          <span className="text-xs font-medium text-[#C2D6C0] bg-[#243026] px-2 py-0.5 rounded-full">{Number(product.stockQty)} {product.unit}s</span>
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
                    <AgentInput
                      agentId="name"
                      agentLabel="Product Name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t('merchant_onboarding.catalog.modal_name_ph')}
                      className={`w-full px-4 py-3 bg-[#E8F0E7]/50 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#496246]/10 text-sm font-medium transition-all ${
                        agentEmptyFields.includes('name')
                          ? 'border-amber-400 ring-2 ring-amber-200 bg-amber-50/50'
                          : 'border-transparent focus:border-[#496246]/30'
                      }`}
                    />
                    {agentEmptyFields.includes('name') && (
                      <p className="mt-1 text-xs text-amber-600 font-medium">⚠ Please fill this field manually</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t('merchant_onboarding.catalog.modal_cat')}</label>
                      <AgentInput
                        agentId="category"
                        agentLabel="Category"
                        name="category"
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder={t('merchant_onboarding.catalog.modal_cat_ph')}
                        className={`w-full px-4 py-3 bg-[#E8F0E7]/50 rounded-xl border focus:outline-none focus:ring-2 text-sm font-medium transition-all ${
                          agentEmptyFields.includes('category')
                            ? 'border-amber-400 ring-2 ring-amber-200 bg-amber-50/50'
                            : 'border-transparent focus:border-[#496246]/30 focus:ring-[#496246]/10'
                        }`}
                      />
                      {agentEmptyFields.includes('category') && (
                        <p className="mt-1 text-xs text-amber-600 font-medium">⚠ Please fill this field manually</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t('merchant_onboarding.catalog.modal_price')}</label>
                      <AgentInput
                        agentId="price"
                        agentLabel="Price"
                        agentType="number"
                        name="price"
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                        className={`w-full px-4 py-3 bg-[#E8F0E7]/50 rounded-xl border focus:outline-none focus:ring-2 text-sm font-medium transition-all ${
                          agentEmptyFields.includes('price')
                            ? 'border-amber-400 ring-2 ring-amber-200 bg-amber-50/50'
                            : 'border-transparent focus:border-[#496246]/30 focus:ring-[#496246]/10'
                        }`}
                      />
                      {agentEmptyFields.includes('price') && (
                        <p className="mt-1 text-xs text-amber-600 font-medium">⚠ Price needed — agent couldn't detect it</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t('merchant_onboarding.catalog.modal_stock')}</label>
                      <AgentInput
                        agentId="stockQty"
                        agentLabel="Stock Quantity"
                        agentType="number"
                        name="stockQty"
                        type="number"
                        min="0"
                        value={formData.stockQty}
                        onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
                        placeholder="0"
                        className={`w-full px-4 py-3 bg-[#E8F0E7]/50 rounded-xl border focus:outline-none focus:ring-2 text-sm font-medium transition-all ${
                          agentEmptyFields.includes('stockQty')
                            ? 'border-amber-400 ring-2 ring-amber-200 bg-amber-50/50'
                            : 'border-transparent focus:border-[#496246]/30 focus:ring-[#496246]/10'
                        }`}
                      />
                      {agentEmptyFields.includes('stockQty') && (
                        <p className="mt-1 text-xs text-amber-600 font-medium">⚠ Enter stock quantity</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t('merchant_onboarding.catalog.modal_unit')}</label>
                      <AgentSelect
                        agentId="unit"
                        agentLabel="Unit"
                        name="unit"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        className="w-full px-4 py-3 bg-[#E8F0E7]/50 rounded-xl border border-transparent focus:border-[#496246]/30 focus:outline-none focus:ring-2 focus:ring-[#496246]/10 text-sm font-medium transition-all appearance-none"
                      >
                        {['piece', 'kg', 'gram', 'litre', 'ml', 'pack', 'box', 'dozen', 'other'].map(u => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </AgentSelect>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t('merchant_onboarding.catalog.modal_desc')}</label>
                    <AgentTextarea
                      agentId="description"
                      agentLabel="Description"
                      name="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={t('merchant_onboarding.catalog.modal_desc_ph')}
                      rows={3}
                      className="w-full px-4 py-3 bg-[#E8F0E7]/50 rounded-xl border border-transparent focus:border-[#496246]/30 focus:outline-none focus:ring-2 focus:ring-[#496246]/10 text-sm font-medium transition-all resize-none"
                    />
                  </div>

                  {/* Partial-fill summary banner */}
                  {agentEmptyFields.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                      <span className="text-amber-500 text-lg leading-none">⚠</span>
                      <div>
                        <p className="text-xs font-bold text-amber-800">Agent filled what it could — please complete the highlighted fields above.</p>
                        <p className="text-xs text-amber-600 mt-0.5">Missing: {agentEmptyFields.join(', ')}</p>
                      </div>
                    </div>
                  )}
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
      {/* Smart Restock Agent Modal for Voice & CSV Ingestion */}
      <SmartRestockModal
        isOpen={smartRestockOpen}
        onClose={() => {
          setSmartRestockOpen(false);
          if (storeId) fetchCatalog(storeId);
        }}
        initialTab={smartRestockTab}
      />
    </div>
  );
}
