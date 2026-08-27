"use client";

import React, { useState } from "react";
import { Mic } from "lucide-react";
import { SmartRestockModal } from "./SmartRestockModal";

export function GlobalVoiceFab() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[90]">
        {/* Pulsing background effect */}
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
        
        {/* The Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="relative w-16 h-16 bg-gradient-to-br from-primary to-primary-container text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(73,98,70,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Mic size={28} className="relative z-10 text-white group-hover:animate-bounce" style={{ animationDuration: '2s' }} />
        </button>
        
        {/* Tooltip */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300">
          <div className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
            Smart Restock
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        </div>
      </div>

      <SmartRestockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
