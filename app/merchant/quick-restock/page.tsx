'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SmartRestockModal } from '@/components/SmartRestockModal';
import {
  getInventoryData,
  updateStockApi,
  InventoryItem
} from '@/services/merchantApi';
import { subscribeInventoryUpdated } from '@/services/eventBus';
import {
  Mic,
  Camera,
  FileSpreadsheet,
  Keyboard,
  Zap,
  Sparkles,
  AlertTriangle,
  Plus,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  Volume2
} from 'lucide-react';

export default function QuickRestock() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'voice' | 'camera' | 'csv' | 'text'>('voice');
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Load Live Low-Stock Inventory
  const loadLowStockData = async () => {
    setLoading(true);
    try {
      const inv = await getInventoryData();
      const critical = inv.items.filter(i => i.units <= 10);
      setLowStockItems(critical);
    } catch (err) {
      console.error("Failed to load quick restock inventory data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLowStockData();
    const unsubscribe = subscribeInventoryUpdated(() => {
      loadLowStockData();
    });
    return () => unsubscribe();
  }, []);

  const openModal = (tab: 'voice' | 'camera' | 'csv' | 'text') => {
    setActiveTab(tab);
    setIsModalOpen(true);
  };

  // One-Tap Quick Restock for Critical Items
  const handleQuickRestockItem = async (item: InventoryItem, qtyToAdd: number) => {
    setUpdatingId(item.id);
    try {
      const newQty = item.units + qtyToAdd;
      await updateStockApi(item.id, newQty);
      await loadLowStockData();
    } catch (err: any) {
      alert(err.message || "Failed to update stock");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <div className="flex flex-col w-full gap-8 pb-16 relative z-10">

        {/* Ambient Backlight Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#496246]/10 rounded-full blur-[140px] -z-10 pointer-events-none" />

        {/* Hero Banner with Merchant-Friendly Guidance */}
        <div className="p-6 md:p-10 rounded-3xl bg-gradient-to-br from-[#2D3A2C] via-[#1F271E] to-[#121811] text-white shadow-2xl relative overflow-hidden border border-[#496246]/40 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/10">
            <Zap size={32} className="text-emerald-400 animate-pulse" />
          </div>

          <span className="px-3.5 py-1 bg-white/10 text-[#D1E2CF] rounded-full text-xs font-black uppercase tracking-widest border border-white/15 mb-3">
            Instant Shop Stock Update
          </span>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl mb-3">
            Quick Restock Hub
          </h1>

          <p className="text-xs md:text-sm text-[#D1E2CF] max-w-xl font-medium leading-relaxed">
            Choose your preferred method below to update inventory. Talk in your natural speech, take a picture of your physical shelf, or upload an Excel sheet.
          </p>

          {/* Quick Voice Spoken Examples Pill Container */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
            <span className="text-white/60 text-[11px] uppercase tracking-wider">Example Voice Commands:</span>
            <span className="px-3 py-1 bg-white/10 rounded-lg text-emerald-300 border border-white/15">
              "Restock 20 packs of Milk"
            </span>
            <span className="px-3 py-1 bg-white/10 rounded-lg text-emerald-300 border border-white/15">
              "Added 15 bags of Rice at ₹120"
            </span>
          </div>
        </div>

        {/* 4 High-Impact Visual Action Cards (Simplified for Low-Literacy Shopkeepers) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          {/* 1. VOICE ASSISTANT CARD */}
          <div
            onClick={() => openModal('voice')}
            className="group relative bg-gradient-to-b from-[#2E3C2C] to-[#1C251B] text-white rounded-3xl p-6 shadow-xl border border-[#496246]/50 flex flex-col justify-between cursor-pointer hover:border-emerald-400/80 hover:-translate-y-1.5 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />

            <div className="flex items-center justify-between mb-6">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-[10px] uppercase tracking-wider border border-emerald-500/30">
                🎙️ Most Popular
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Volume2 size={20} />
              </div>
            </div>

            <div className="flex flex-col items-center text-center my-4">
              <div className="relative w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
                <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg text-white">
                  <Mic size={32} />
                </div>
              </div>

              <h2 className="text-xl font-black text-white mb-1">Speak to Update</h2>
              <p className="text-xs text-[#D1E2CF] font-medium max-w-[220px]">
                Just talk! Say item names & stock quantities naturally.
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                openModal('voice');
              }}
              className="w-full py-3.5 rounded-2xl bg-[#8C5A3B] hover:bg-[#7A4E33] text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-colors mt-4"
            >
              <Mic size={16} />
              <span>Tap to Speak Stock</span>
            </button>
          </div>

          {/* 2. CAMERA SHELF SNAP CARD (Olive Green & Brown Button) */}
          <div
            onClick={() => openModal('camera')}
            className="group relative bg-gradient-to-b from-[#2D3A2C] to-[#1A2419] text-white rounded-3xl p-6 shadow-xl border border-[#556B2F]/40 flex flex-col justify-between cursor-pointer hover:border-emerald-400/80 hover:-translate-y-1.5 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />

            <div className="flex items-center justify-between mb-6">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-[#A3C9A8] font-black text-[10px] uppercase tracking-wider border border-emerald-500/30">
                📷 AI Photo Scan
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-[#A3C9A8] group-hover:scale-110 transition-transform">
                <Camera size={20} />
              </div>
            </div>

            <div className="flex flex-col items-center text-center my-4">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform text-[#A3C9A8]">
                <Camera size={36} />
              </div>

              <h2 className="text-xl font-black text-white mb-1">Snap Shelf Photo</h2>
              <p className="text-xs text-[#D1E2CF] font-medium max-w-[220px]">
                Take a picture of physical stock to auto-detect products.
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                openModal('camera');
              }}
              className="w-full py-3.5 rounded-2xl bg-[#8C5A3B] hover:bg-[#7A4E33] text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-colors mt-4"
            >
              <Camera size={16} />
              <span>Open Camera Scanner</span>
            </button>
          </div>

          {/* 3. CSV & EXCEL BULK SHEET CARD */}
          <div
            onClick={() => openModal('csv')}
            className="group relative bg-gradient-to-b from-[#1C2C24] to-[#121E18] text-white rounded-3xl p-6 shadow-xl border border-teal-500/30 flex flex-col justify-between cursor-pointer hover:border-teal-400/80 hover:-translate-y-1.5 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 font-black text-[10px] uppercase tracking-wider border border-teal-500/30">
                📊 Bulk Import
              </span>
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                <FileSpreadsheet size={20} />
              </div>
            </div>

            <div className="flex flex-col items-center text-center my-4">
              <div className="w-20 h-20 rounded-2xl bg-teal-500/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform text-teal-300">
                <FileSpreadsheet size={36} />
              </div>

              <h2 className="text-xl font-black text-white mb-1">Excel & CSV Upload</h2>
              <p className="text-xs text-teal-200 font-medium max-w-[220px]">
                Upload spreadsheet list to restock multiple items at once.
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                openModal('csv');
              }}
              className="w-full py-3.5 rounded-2xl bg-[#8C5A3B] hover:bg-[#7A4E33] text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-colors mt-4"
            >
              <FileSpreadsheet size={16} />
              <span>Upload CSV File</span>
            </button>
          </div>

          {/* 4. MANUAL FORM CARD */}
          <div
            onClick={() => openModal('text')}
            className="group relative bg-gradient-to-b from-[#38271C] to-[#241912] text-white rounded-3xl p-6 shadow-xl border border-amber-500/30 flex flex-col justify-between cursor-pointer hover:border-amber-400/80 hover:-translate-y-1.5 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-black text-[10px] uppercase tracking-wider border border-amber-500/30">
                ⌨️ Manual Type
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Keyboard size={20} />
              </div>
            </div>

            <div className="flex flex-col items-center text-center my-4">
              <div className="w-20 h-20 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform text-amber-300">
                <Keyboard size={36} />
              </div>

              <h2 className="text-xl font-black text-white mb-1">Manual Form</h2>
              <p className="text-xs text-amber-200 font-medium max-w-[220px]">
                Type product name, price & quantity manually into text inputs.
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                openModal('text');
              }}
              className="w-full py-3.5 rounded-2xl bg-[#8C5A3B] hover:bg-[#7A4E33] text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-colors mt-4"
            >
              <Keyboard size={16} />
              <span>Type Product Details</span>
            </button>
          </div>

        </div>

        {/* DYNAMIC LOW-STOCK ONE-TAP RESTOCK SECTION */}
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={20} className="text-amber-500" />
                <h2 className="text-xl font-black text-gray-900">Dynamic Low-Stock Quick Restock</h2>
              </div>
              <p className="text-xs text-gray-500 font-semibold">
                Live items from your store catalog with 10 or fewer units remaining. Tap to instantly add stock!
              </p>
            </div>

            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-black uppercase tracking-wider shrink-0">
              {lowStockItems.length} Items Need Restock
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8 text-gray-500 text-xs font-bold">
              <RefreshCw size={20} className="animate-spin text-[#496246] mr-2" /> Loading store items...
            </div>
          ) : lowStockItems.length === 0 ? (
            <div className="p-8 text-center bg-emerald-50/50 rounded-2xl border border-emerald-200 text-emerald-800">
              <CheckCircle2 size={36} className="mx-auto text-emerald-600 mb-2" />
              <h3 className="text-base font-black text-emerald-900">Stock Levels Healthy!</h3>
              <p className="text-xs text-emerald-700 font-medium">No store items are currently below low-stock threshold.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-3 hover:border-amber-400 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={item.image} alt={item.title} className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-gray-900 truncate">{item.title}</h4>
                      <p className="text-[11px] text-gray-500 font-semibold">{item.category} • {item.price}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        item.units === 0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.units} left
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => handleQuickRestockItem(item, 10)}
                      disabled={updatingId === item.id}
                      className="px-3 py-1.5 bg-[#496246] hover:bg-[#3A4E38] text-white rounded-xl text-[11px] font-black shadow-xs flex items-center gap-1 transition-all disabled:opacity-50"
                    >
                      <Plus size={12} /> Restock +10
                    </button>
                    <button
                      onClick={() => handleQuickRestockItem(item, 25)}
                      disabled={updatingId === item.id}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black shadow-xs flex items-center gap-1 transition-all disabled:opacity-50"
                    >
                      <Plus size={12} /> Restock +25
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Smart Restock Modal Trigger */}
      <SmartRestockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab={activeTab}
      />
    </>
  );
}