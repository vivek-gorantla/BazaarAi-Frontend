"use client";

import React, { useState } from 'react';
import { SmartRestockModal } from '@/components/SmartRestockModal';
import { Mic, Camera, FileSpreadsheet, Keyboard } from 'lucide-react';

export default function QuickRestock() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"voice" | "camera" | "csv" | "manual">("voice");

  const openModal = (tab: "voice" | "camera" | "csv" | "manual") => {
    setActiveTab(tab);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-col w-full h-full max-w-[1400px] mx-auto pb-section-gap">
        <div className="flex flex-col items-center justify-center pt-8 pb-12 text-center relative z-10">
          <div className="w-16 h-16 rounded-full bg-primary-fixed mb-6 flex items-center justify-center shadow-lg shadow-primary-fixed-dim/20 relative group overflow-hidden">
            <span className="material-symbols-outlined text-on-primary-fixed text-[32px] group-hover:scale-110 transition-transform duration-300">bolt</span>
            <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface mb-4 tracking-tight">Quick Update</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Effortlessly update your inventory using voice, camera, bulk upload, or manual entry. Select a method below to begin.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter px-4 md:px-0">
          
          {/* Voice */}
          <div className="relative bg-primary text-on-primary rounded-[24px] p-card-padding shadow-[0_20px_40px_rgba(73,98,70,0.15)] flex flex-col items-center text-center group cursor-pointer overflow-hidden transition-transform duration-500 hover:-translate-y-2">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
            <div className="relative w-32 h-32 mb-8 mt-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-white/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
              <div className="relative z-10 w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <Mic size={40} className="text-primary" />
              </div>
            </div>
            <div className="mt-auto flex flex-col items-center w-full">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white font-label-md text-label-md uppercase tracking-wider mb-4">Voice Update</span>
              <h2 className="font-headline-lg text-headline-lg mb-2">Speak to Update</h2>
              <p className="font-body-md text-body-md text-white/90 max-w-[280px] h-12">"Add 15 boxes of whole wheat pasta..."</p>
            </div>
            <button onClick={() => openModal('voice')} className="mt-6 w-full h-[56px] rounded-xl bg-white text-primary font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors shadow-lg relative z-20">
              <Mic size={20} /> Start Listening
            </button>
          </div>

          {/* Camera */}
          <div className="relative bg-secondary-container text-on-secondary-container rounded-[24px] p-card-padding shadow-[0_20px_40px_rgba(254,191,149,0.2)] flex flex-col items-center text-center group cursor-pointer overflow-hidden transition-transform duration-500 hover:-translate-y-2">
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/30 rounded-full blur-3xl group-hover:bg-white/40 transition-all duration-700"></div>
            <div className="relative w-32 h-32 mb-8 mt-4 flex items-center justify-center">
              <div className="absolute inset-0 bg-white/40 rounded-[2rem] rotate-3 group-hover:rotate-6 transition-transform duration-500"></div>
              <div className="relative z-10 w-24 h-24 rounded-[2rem] bg-white flex items-center justify-center shadow-xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <Camera size={40} className="text-secondary" />
              </div>
            </div>
            <div className="mt-auto flex flex-col items-center w-full">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-md text-on-secondary-container font-label-md text-label-md uppercase tracking-wider mb-4">Visual Scan</span>
              <h2 className="font-headline-lg text-headline-lg mb-2">Snap & Count</h2>
              <p className="font-body-md text-body-md text-on-secondary-container/80 max-w-[280px] h-12">Take a photo to auto-detect stock levels.</p>
            </div>
            <button onClick={() => openModal('camera')} className="mt-6 w-full h-[56px] rounded-xl bg-secondary text-on-secondary font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-secondary/90 transition-colors shadow-lg relative z-20">
              <Camera size={20} /> Open Camera
            </button>
          </div>

          {/* CSV */}
          <div className="relative bg-surface-container-low text-on-surface rounded-[24px] p-card-padding shadow-[0_20px_40px_rgba(0,0,0,0.04)] flex flex-col items-center text-center group cursor-pointer overflow-hidden transition-transform duration-500 hover:-translate-y-2">
            <div className="relative w-32 h-32 mb-8 mt-4 flex items-center justify-center">
              <div className="absolute bottom-0 w-24 h-4 bg-black/5 blur-md rounded-full"></div>
              <div className="relative z-10 w-24 h-24 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-outline-variant/20 overflow-hidden group-hover:-translate-y-2 group-hover:shadow-xl transition-all duration-300">
                <FileSpreadsheet size={40} className="text-green-500" />
              </div>
            </div>
            <div className="mt-auto flex flex-col items-center z-10 w-full">
              <span className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-700 font-label-md text-label-md uppercase tracking-wider mb-4">Bulk Action</span>
              <h2 className="font-headline-lg text-headline-lg mb-2">Upload Sheet</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-[280px] h-12">Drag and drop your Excel or CSV file.</p>
            </div>
            <button onClick={() => openModal('csv')} className="mt-6 w-full h-[56px] rounded-xl bg-white border border-outline-variant border-dashed text-green-600 font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-green-50 transition-colors shadow-sm relative z-20">
              <FileSpreadsheet size={20} /> Browse Files
            </button>
          </div>
          
          {/* Manual */}
          <div className="relative bg-surface-container-lowest text-on-surface rounded-[24px] p-card-padding shadow-[0_20px_40px_rgba(0,0,0,0.04)] flex flex-col items-center text-center group cursor-pointer overflow-hidden transition-transform duration-500 hover:-translate-y-2 border border-outline-variant/30">
            <div className="relative w-32 h-32 mb-8 mt-4 flex items-center justify-center">
              <div className="absolute bottom-0 w-24 h-4 bg-black/5 blur-md rounded-full"></div>
              <div className="relative z-10 w-24 h-24 rounded-2xl bg-orange-50 flex items-center justify-center shadow-lg border border-orange-100 overflow-hidden group-hover:-translate-y-2 group-hover:shadow-xl transition-all duration-300">
                <Keyboard size={40} className="text-orange-500" />
              </div>
            </div>
            <div className="mt-auto flex flex-col items-center z-10 w-full">
              <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 font-label-md text-label-md uppercase tracking-wider mb-4">Classic</span>
              <h2 className="font-headline-lg text-headline-lg mb-2">Manual Entry</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-[280px] h-12">Type in details directly if you prefer.</p>
            </div>
            <button onClick={() => openModal('manual')} className="mt-6 w-full h-[56px] rounded-xl bg-orange-500 text-white font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors shadow-sm relative z-20">
              <Keyboard size={20} /> Type Details
            </button>
          </div>

        </div>

        <div className="mt-section-gap flex justify-center opacity-80 pointer-events-none">
          <div className="w-64 h-64 rounded-full overflow-hidden shadow-2xl mix-blend-multiply">
            <img alt="Friendly shop owner" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1UrSRcH7hGZ_7yqgpxuYmLgwIhqu0lLhDzKy6xOIS10UpcgVOv12VG2-FAQlmQxmBb2H19wGw_waSTjB-RUstOtjrVF39tnMdgxOxIkSN0YMPka8pkMK6JKuimVK_KYGZ5yShI7pjWW3W5mpvxdRtgetNGBJailsOKtN8BqiwQH2Ul9fB-B2AJVw5BcbFPXOAuIcHz9BwhIpWzKGUS7nQ8-8Y9b_KlW2JI5iviYwLGgp3uctMHglwg0GVk" />
          </div>
        </div>
      </div>

      <SmartRestockModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialTab={activeTab} 
      />
    </>
  );
}