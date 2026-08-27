"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Camera, FileSpreadsheet, Keyboard, X, UploadCloud, CheckCircle2, Search } from "lucide-react";

interface SmartRestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "voice" | "camera" | "csv" | "manual";
}

export function SmartRestockModal({ isOpen, onClose, initialTab = "voice" }: SmartRestockModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState("");

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setIsListening(false);
      setVoiceText("");
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (activeTab === "voice" && isListening) {
      const texts = [
        "Listening...",
        "Add 15 boxes of...",
        "Add 15 boxes of whole wheat pasta...",
        "Add 15 boxes of whole wheat pasta to aisle 4.",
      ];
      let i = 0;
      const interval = setInterval(() => {
        setVoiceText(texts[i]);
        i++;
        if (i >= texts.length) {
          clearInterval(interval);
          setTimeout(() => setIsListening(false), 1000);
        }
      }, 800);
      return () => clearInterval(interval);
    }
  }, [activeTab, isListening]);

  if (!isOpen) return null;

  const tabs = [
    { id: "voice", label: "Voice", icon: Mic, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "camera", label: "Camera", icon: Camera, color: "text-purple-500", bg: "bg-purple-50" },
    { id: "csv", label: "CSV Upload", icon: FileSpreadsheet, color: "text-green-500", bg: "bg-green-50" },
    { id: "manual", label: "Manual", icon: Keyboard, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Smart Restock</h2>
              <p className="text-sm text-gray-500 mt-1">Update your inventory instantly using your preferred method.</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
            {/* Sidebar / Options */}
            <div className="w-full md:w-64 flex flex-col gap-3 shrink-0">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`relative p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 text-left overflow-hidden group ${
                      isActive ? "bg-gray-900 text-white shadow-lg" : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-100"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute inset-0 bg-gray-900 z-0"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isActive ? "bg-white/20 text-white" : `${tab.bg} ${tab.color}`
                    }`}>
                      <Icon size={20} />
                    </div>
                    <span className="relative z-10 font-semibold">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-gray-50 rounded-3xl p-6 relative overflow-hidden min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === "voice" && (
                  <motion.div
                    key="voice"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full flex flex-col items-center justify-center text-center"
                  >
                    <div className="relative mb-8">
                      {isListening && (
                        <>
                          <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-blue-400 rounded-full blur-xl"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0, 0.8] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                            className="absolute inset-0 bg-blue-500 rounded-full blur-lg"
                          />
                        </>
                      )}
                      <button
                        onClick={() => setIsListening(!isListening)}
                        className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
                          isListening ? "bg-blue-600 text-white scale-110" : "bg-white text-blue-600 hover:scale-105"
                        }`}
                      >
                        <Mic size={40} className={isListening ? "animate-pulse" : ""} />
                      </button>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {isListening ? "Listening..." : "Tap to Speak"}
                    </h3>
                    <p className="text-gray-500 max-w-sm mb-6 h-12">
                      {isListening ? voiceText : "Say something like 'Add 15 boxes of whole wheat pasta'"}
                    </p>
                    
                    {!isListening && voiceText && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg font-medium"
                      >
                        <CheckCircle2 size={18} />
                        Successfully added 15 boxes of pasta
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {activeTab === "camera" && (
                  <motion.div
                    key="camera"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full flex flex-col"
                  >
                    <div className="flex-1 bg-gray-900 rounded-2xl relative overflow-hidden flex items-center justify-center group cursor-pointer shadow-inner">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1588611912443-4cb50304c45b?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity group-hover:opacity-60 transition-opacity duration-700" />
                      
                      {/* Viewfinder brackets */}
                      <div className="absolute inset-8 border-2 border-white/20 rounded-xl pointer-events-none">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
                        
                        {/* Scanning line */}
                        <motion.div
                          animate={{ top: ["0%", "100%", "0%"] }}
                          transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                          className="absolute left-0 right-0 h-0.5 bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] z-10"
                        />
                      </div>

                      <div className="relative z-10 text-center pointer-events-none">
                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-4 border border-white/20">
                          <Camera size={32} className="text-white" />
                        </div>
                        <p className="text-white font-medium text-lg">Align items within frame</p>
                        <p className="text-white/60 text-sm mt-1">AI will automatically detect and count</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "csv" && (
                  <motion.div
                    key="csv"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full flex flex-col items-center justify-center"
                  >
                    <div className="w-full max-w-md p-8 rounded-3xl border-2 border-dashed border-gray-300 bg-white text-center hover:border-green-500 hover:bg-green-50/50 transition-colors cursor-pointer group">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                        <UploadCloud size={40} className="text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Inventory Sheet</h3>
                      <p className="text-gray-500 mb-6">Drag and drop your CSV or Excel file here, or click to browse.</p>
                      <button className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-md">
                        Select File
                      </button>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                      <FileSpreadsheet size={16} />
                      <a href="#" className="text-green-600 hover:underline">Download Template</a>
                    </div>
                  </motion.div>
                )}

                {activeTab === "manual" && (
                  <motion.div
                    key="manual"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full"
                  >
                    <div className="bg-white rounded-2xl p-6 shadow-sm h-full flex flex-col">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Manual Entry</h3>
                      
                      <div className="space-y-5 flex-1">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name / SKU</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Search size={16} className="text-gray-400" />
                            </div>
                            <input
                              type="text"
                              placeholder="Search products..."
                              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity Added</label>
                            <input
                              type="number"
                              placeholder="0"
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Location (Aisle/Shelf)</label>
                            <input
                              type="text"
                              placeholder="e.g. A4"
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (Optional)</label>
                          <textarea
                            rows={3}
                            placeholder="Add any relevant notes..."
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                          />
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                        <button className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30">
                          Update Stock
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
