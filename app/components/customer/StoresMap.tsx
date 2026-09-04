"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Store } from "../../../services/customerApi";

interface StoresMapProps {
  stores: Store[];
  selectedRadius: number;
  onRadiusChange: (radius: number) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  userLat?: number;
  userLng?: number;
}

export function StoresMap({
  stores,
  selectedRadius,
  onRadiusChange,
  selectedCategory,
  onCategoryChange,
  userLat = 17.4156,
  userLng = 78.4347
}: StoresMapProps) {
  const [activeStore, setActiveStore] = useState<Store | null>(stores[0] || null);
  const [mapTheme, setMapTheme] = useState<"light" | "dark" | "tactical">("dark");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [currentLat, setCurrentLat] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bazaar_user_lat");
      if (saved) return parseFloat(saved);
    }
    return userLat;
  });
  const [currentLng, setCurrentLng] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bazaar_user_lng");
      if (saved) return parseFloat(saved);
    }
    return userLng;
  });
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);

  const [currentLocName, setCurrentLocName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bazaar_user_location");
      if (saved) return saved;
    }
    return "My Location";
  });

  React.useEffect(() => {
    setCurrentLat(userLat);
    setCurrentLng(userLng);
    if (typeof window !== "undefined") {
      const savedLat = localStorage.getItem("bazaar_user_lat");
      const savedLng = localStorage.getItem("bazaar_user_lng");
      const savedLoc = localStorage.getItem("bazaar_user_location");
      if (savedLat && savedLng) {
        setCurrentLat(Number(savedLat));
        setCurrentLng(Number(savedLng));
      }
      if (savedLoc) {
        setCurrentLocName(savedLoc);
      }

      const handleLocChanged = (e: any) => {
        if (e.detail?.lat && e.detail?.lng) {
          setCurrentLat(e.detail.lat);
          setCurrentLng(e.detail.lng);
        }
        if (e.detail?.locationString) {
          setCurrentLocName(e.detail.locationString);
        }
      };

      window.addEventListener("bazaar_location_changed", handleLocChanged);
      return () => window.removeEventListener("bazaar_location_changed", handleLocChanged);
    }
  }, [userLat, userLng]);

  const handleLocateMe = () => {
    if (typeof window === "undefined" || !navigator.geolocation) return;
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentLat(latitude);
        setCurrentLng(longitude);
        localStorage.setItem("bazaar_user_lat", String(latitude));
        localStorage.setItem("bazaar_user_lng", String(longitude));
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("bazaar_location_changed", {
              detail: { lat: latitude, lng: longitude }
            })
          );
        }
        setIsDetectingGps(false);
      },
      () => {
        setIsDetectingGps(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const categories = [
    { label: "All Shops", value: "All", icon: "storefront", color: "bg-[#556B2F]" },
    { label: "Groceries & Essentials", value: "Groceries", icon: "shopping_basket", color: "bg-emerald-600" },
    { label: "Bakery & Treats", value: "Bakery", icon: "bakery_dining", color: "bg-amber-600" },
    { label: "Fresh Produce", value: "Fresh Produce", icon: "nutrition", color: "bg-rose-600" },
    { label: "Supermarkets", value: "Supermarket", icon: "domain", color: "bg-indigo-600" },
    { label: "Dairy & Milk", value: "Dairy", icon: "water_drop", color: "bg-cyan-600" }
  ];

  const radii = [1, 3, 5, 10];

  // Helper to get category badge color
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "Bakery":
        return { bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-400", hex: "#F59E0B" };
      case "Fresh Produce":
        return { bg: "bg-rose-500", text: "text-rose-500", border: "border-rose-400", hex: "#F43F5E" };
      case "Dairy":
        return { bg: "bg-cyan-500", text: "text-cyan-500", border: "border-cyan-400", hex: "#06B6D4" };
      case "Supermarket":
        return { bg: "bg-indigo-500", text: "text-indigo-500", border: "border-indigo-400", hex: "#6366F1" };
      default:
        return { bg: "bg-emerald-600", text: "text-emerald-600", border: "border-emerald-500", hex: "#10B981" };
    }
  };

  // Calculate coordinates mapping to map canvas percentage positions
  const getMapPosition = (store: Store, index: number) => {
    if (store.lat && store.lng) {
      // Delta from user position (center: 50%, 50%)
      const deltaLat = (store.lat - currentLat) * (700 * zoomLevel);
      const deltaLng = (store.lng - currentLng) * (700 * zoomLevel);
      const x = Math.min(88, Math.max(12, 50 + deltaLng));
      const y = Math.min(88, Math.max(12, 50 - deltaLat));
      return { x, y };
    }
    // Fallback deterministic spread around center
    const angles = [35, 125, 210, 310, 75, 160, 260];
    const distances = [22, 32, 28, 38, 18, 35, 25];
    const angle = (angles[index % angles.length] * Math.PI) / 180;
    const dist = (distances[index % distances.length] * (selectedRadius / 10)) * zoomLevel;
    const x = 50 + Math.cos(angle) * dist;
    const y = 50 + Math.sin(angle) * dist;
    return { x: Math.min(88, Math.max(12, x)), y: Math.min(88, Math.max(12, y)) };
  };

  return (
    <div className="w-full bg-surface-container rounded-3xl border border-surface-container-high shadow-xl overflow-hidden flex flex-col mb-8 transition-all">
      {/* Map Control Header */}
      <div className="p-4 sm:p-5 bg-surface-container-low border-b border-surface-container-high flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => onCategoryChange(cat.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat.value
                  ? "bg-[#556B2F] text-white shadow-md scale-105"
                  : "bg-surface hover:bg-surface-container text-on-surface-variant border border-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Controls Right Group: Radius & Theme Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Radius Selector */}
          <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-full border border-surface-container-high shadow-xs">
            <span className="material-symbols-outlined text-[#556B2F] text-[18px]">radar</span>
            <span className="text-xs font-bold text-on-surface-variant">Radius:</span>
            {radii.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onRadiusChange(r)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedRadius === r
                    ? "bg-[#556B2F] text-white shadow-xs"
                    : "text-on-surface-variant hover:text-[#556B2F]"
                }`}
              >
                {r} km
              </button>
            ))}
          </div>

          {/* Map Appearance Mode Switcher */}
          <div className="flex items-center bg-surface p-1 rounded-full border border-surface-container-high shadow-xs text-xs font-semibold text-on-surface-variant">
            <button
              type="button"
              onClick={() => setMapTheme("light")}
              className={`px-2.5 py-1 rounded-full flex items-center gap-1 transition-all ${
                mapTheme === "light" ? "bg-[#556B2F]/15 text-[#556B2F] font-bold" : "hover:text-on-surface"
              }`}
              title="Light Street Map"
            >
              <span className="material-symbols-outlined text-[15px]">light_mode</span>
              Light
            </button>
            <button
              type="button"
              onClick={() => setMapTheme("dark")}
              className={`px-2.5 py-1 rounded-full flex items-center gap-1 transition-all ${
                mapTheme === "dark" ? "bg-slate-800 text-yellow-400 font-bold shadow-xs" : "hover:text-on-surface"
              }`}
              title="Dark Cyber Map"
            >
              <span className="material-symbols-outlined text-[15px]">dark_mode</span>
              Dark
            </button>
            <button
              type="button"
              onClick={() => setMapTheme("tactical")}
              className={`px-2.5 py-1 rounded-full flex items-center gap-1 transition-all ${
                mapTheme === "tactical" ? "bg-emerald-950 text-emerald-400 font-bold shadow-xs" : "hover:text-on-surface"
              }`}
              title="Tactical Grid"
            >
              <span className="material-symbols-outlined text-[15px]">grid_4x4</span>
              Tactical
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Map Canvas Window */}
      <div
        className={`relative w-full h-[400px] sm:h-[480px] overflow-hidden select-none transition-colors duration-500 ${
          mapTheme === "dark"
            ? "bg-[#0F172A]"
            : mapTheme === "tactical"
            ? "bg-[#061612]"
            : "bg-[#EBF2EA]"
        }`}
      >
        {/* Dynamic Vector SVG Road Network & Topo Landscape Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Grid Pattern */}
            <pattern
              id="mapGrid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke={
                  mapTheme === "dark"
                    ? "rgba(255, 255, 255, 0.05)"
                    : mapTheme === "tactical"
                    ? "rgba(16, 185, 129, 0.12)"
                    : "rgba(85, 107, 47, 0.08)"
                }
                strokeWidth="1"
              />
            </pattern>

            {/* Linear Radar Sweep Gradient */}
            <linearGradient id="radarSweep" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FACC15" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FACC15" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#mapGrid)" />

          {/* Park Green Zones */}
          <polygon
            points="50,40 180,30 220,120 120,160 40,110"
            fill={
              mapTheme === "dark"
                ? "rgba(16, 185, 129, 0.08)"
                : mapTheme === "tactical"
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(166, 206, 155, 0.45)"
            }
          />
          <polygon
            points="680,280 880,240 920,420 740,460"
            fill={
              mapTheme === "dark"
                ? "rgba(16, 185, 129, 0.08)"
                : mapTheme === "tactical"
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(166, 206, 155, 0.4)"
            }
          />

          {/* Water Body (Hussain Sagar Lake curve simulation) */}
          <path
            d="M -50 380 Q 250 320 400 480 T 900 520 L 900 600 L -50 600 Z"
            fill={
              mapTheme === "dark"
                ? "rgba(14, 165, 233, 0.12)"
                : mapTheme === "tactical"
                ? "rgba(6, 182, 212, 0.15)"
                : "rgba(147, 197, 253, 0.5)"
            }
          />

          {/* Building Blocks */}
          <g
            fill={
              mapTheme === "dark"
                ? "rgba(255,255,255,0.03)"
                : mapTheme === "tactical"
                ? "rgba(16,185,129,0.05)"
                : "rgba(0,0,0,0.04)"
            }
            stroke={
              mapTheme === "dark"
                ? "rgba(255,255,255,0.08)"
                : mapTheme === "tactical"
                ? "rgba(16,185,129,0.2)"
                : "rgba(0,0,0,0.08)"
            }
            strokeWidth="1"
          >
            <rect x="140" y="80" width="70" height="45" rx="4" />
            <rect x="230" y="70" width="90" height="50" rx="4" />
            <rect x="150" y="190" width="80" height="60" rx="4" />
            <rect x="250" y="190" width="110" height="55" rx="4" />
            <rect x="520" y="90" width="100" height="65" rx="4" />
            <rect x="640" y="80" width="85" height="50" rx="4" />
            <rect x="540" y="220" width="120" height="70" rx="4" />
            <rect x="680" y="210" width="75" height="55" rx="4" />
          </g>

          {/* Main Road Networks */}
          {/* Avenue 1 - Main Avenue Horizontal */}
          <path
            d="M -100 240 Q 400 220 1100 250"
            fill="none"
            stroke={
              mapTheme === "dark"
                ? "#334155"
                : mapTheme === "tactical"
                ? "#064E3B"
                : "#FFFFFF"
            }
            strokeWidth="14"
          />
          <path
            d="M -100 240 Q 400 220 1100 250"
            fill="none"
            stroke={
              mapTheme === "dark"
                ? "#F59E0B"
                : mapTheme === "tactical"
                ? "#10B981"
                : "#556B2F"
            }
            strokeWidth="2"
            strokeDasharray="8 6"
          />

          {/* Avenue 2 - Road No 12 Diagonal */}
          <path
            d="M 120 -50 L 750 550"
            fill="none"
            stroke={
              mapTheme === "dark"
                ? "#334155"
                : mapTheme === "tactical"
                ? "#064E3B"
                : "#FFFFFF"
            }
            strokeWidth="12"
          />

          {/* Secondary Connecting Streets */}
          <path
            d="M 380 -50 L 380 550"
            fill="none"
            stroke={
              mapTheme === "dark"
                ? "#1E293B"
                : mapTheme === "tactical"
                ? "#022C22"
                : "#FFFFFF"
            }
            strokeWidth="8"
          />
          <path
            d="M -50 140 L 950 140"
            fill="none"
            stroke={
              mapTheme === "dark"
                ? "#1E293B"
                : mapTheme === "tactical"
                ? "#022C22"
                : "#FFFFFF"
            }
            strokeWidth="8"
          />
          <path
            d="M -50 360 L 950 360"
            fill="none"
            stroke={
              mapTheme === "dark"
                ? "#1E293B"
                : mapTheme === "tactical"
                ? "#022C22"
                : "#FFFFFF"
            }
            strokeWidth="8"
          />
        </svg>

        {/* Dynamic Concentric Distance Radius Rings */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-700 flex items-center justify-center"
          style={{
            width: `${Math.min(420, selectedRadius * 42 * zoomLevel)}px`,
            height: `${Math.min(420, selectedRadius * 42 * zoomLevel)}px`
          }}
        >
          {/* Outer Dashed Radius Boundary */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-yellow-500/70 bg-yellow-400/5 shadow-[0_0_40px_rgba(234,179,8,0.15)] animate-pulse" />
          
          {/* Sonar Radar Sweep Line */}
          <div className="absolute inset-0 rounded-full overflow-hidden opacity-30 pointer-events-none">
            <div className="w-1/2 h-1/2 bg-gradient-to-br from-yellow-400/50 to-transparent origin-bottom-right animate-[spin_4s_linear_infinite]" />
          </div>

          {/* Distance Callout Tag */}
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md tracking-wider">
            {selectedRadius} KM RADIUS ZONE
          </span>
        </div>

        {/* Road Name Map Overlay Labels (Dynamic based on selected location) */}
        <div className="absolute inset-0 pointer-events-none text-[10px] font-bold tracking-widest opacity-60">
          <span
            className={`absolute top-28 left-16 uppercase ${
              mapTheme === "dark" ? "text-slate-400" : "text-[#748F70]"
            }`}
          >
            🌿 {currentLocName.split(",")[0].trim()} Green Zone
          </span>
          <span
            className={`absolute top-1/2 left-8 -translate-y-12 -rotate-12 uppercase ${
              mapTheme === "dark" ? "text-amber-400" : "text-[#748F70]"
            }`}
          >
            {currentLocName.split(",")[0].trim()} Main Avenue
          </span>
          <span
            className={`absolute bottom-24 right-20 uppercase ${
              mapTheme === "dark" ? "text-cyan-400" : "text-sky-700"
            }`}
          >
            🌊 {currentLocName.split(",")[1]?.trim() || "Hyderabad"} Promenade
          </span>
        </div>

        {/* 🟡 USER LOCATION MARKER - BRIGHT YELLOW DOT (Explicit Requirement) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center group">
          {/* Dual Pulsing Yellow Radar Rings */}
          <div className="w-12 h-12 rounded-full bg-yellow-400/40 animate-ping absolute -top-2" />
          <div className="w-8 h-8 rounded-full bg-yellow-300/60 animate-pulse absolute -top-0.5" />

          {/* Bright Yellow Core Dot */}
          <div className="relative z-10 w-7 h-7 rounded-full bg-yellow-400 border-2 border-white shadow-[0_0_20px_rgba(250,204,21,0.9)] flex items-center justify-center transition-transform hover:scale-125 cursor-pointer">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-slate-950 absolute" />
          </div>

          {/* "You are here" Location Badge */}
          <div className="relative z-20 mt-1 bg-slate-900/90 backdrop-blur-sm text-white px-3 py-1 rounded-full shadow-2xl border border-yellow-400/50 flex items-center gap-1.5 transition-all group-hover:scale-105">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-[11px] font-black tracking-wide text-yellow-300">You are here</span>
            <span className="text-[9px] text-slate-300 font-medium hidden sm:inline">
              ({currentLat.toFixed(3)}, {currentLng.toFixed(3)})
            </span>
          </div>
        </div>

        {/* 🏬 STORE VICINITY MARKERS (Explicit Requirement) */}
        {stores.map((store, idx) => {
          const { x, y } = getMapPosition(store, idx);
          const isSelected = activeStore?.id === store.id;
          const catStyle = getCategoryColor(store.category);

          return (
            <div
              key={store.id}
              onClick={() => setActiveStore(store)}
              className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 group"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {/* Outer Selection Pulsing Halo */}
              {isSelected && (
                <div
                  className={`w-14 h-14 -left-3 -top-3 absolute rounded-full ${catStyle.bg}/30 animate-ping`}
                />
              )}

              {/* Pin Pill Marker */}
              <div
                className={`px-3 py-1.5 rounded-2xl flex items-center gap-2 shadow-xl border-2 transition-all duration-300 ${
                  isSelected
                    ? `${catStyle.bg} text-white border-white scale-110 z-40 shadow-2xl`
                    : "bg-surface text-on-surface border-surface-container-high hover:border-surface-container-high hover:scale-105"
                }`}
              >
                {/* Store Icon */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isSelected ? "bg-surface-container/20 text-white" : `${catStyle.bg} text-white`
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {store.category === "Bakery"
                      ? "bakery_dining"
                      : store.category === "Fresh Produce"
                      ? "nutrition"
                      : store.category === "Dairy"
                      ? "water_drop"
                      : store.category === "Supermarket"
                      ? "domain"
                      : "storefront"}
                  </span>
                </div>

                {/* Store Details */}
                <div className="flex flex-col">
                  <span className="font-black text-xs leading-none truncate max-w-[110px]">
                    {store.name}
                  </span>
                  <span
                    className={`text-[9px] font-bold mt-0.5 ${
                      isSelected ? "text-white/90" : "text-on-surface-variant"
                    }`}
                  >
                    {store.distance}
                  </span>
                </div>

                {/* Rating Badge */}
                <span
                  className={`flex items-center text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                    isSelected
                      ? "bg-surface-container/20 text-white"
                      : "bg-amber-100 text-amber-900"
                  }`}
                >
                  ★ {store.rating}
                </span>
              </div>
            </div>
          );
        })}

        {/* Map Control Buttons Floating Widget (Bottom-Right) */}
        <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-2">
          {/* Zoom In */}
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.2))}
            className="w-9 h-9 rounded-full bg-surface-container/90 backdrop-blur-md shadow-lg border border-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-black transition-all cursor-pointer font-bold"
            title="Zoom In"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
          {/* Zoom Out */}
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.2))}
            className="w-9 h-9 rounded-full bg-surface-container-high/90 backdrop-blur-md shadow-lg border border-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-black transition-all cursor-pointer font-bold"
            title="Zoom Out"
          >
            <span className="material-symbols-outlined text-[18px]">remove</span>
          </button>
          {/* Center Location (GPS) */}
          <button
            type="button"
            onClick={() => {
              setZoomLevel(1);
              handleLocateMe();
            }}
            disabled={isDetectingGps}
            className="w-9 h-9 rounded-full bg-yellow-400 shadow-lg border border-yellow-300 flex items-center justify-center text-slate-950 hover:bg-yellow-300 transition-all cursor-pointer font-bold disabled:opacity-50"
            title="Detect GPS & Re-center"
          >
            <span className={`material-symbols-outlined text-[18px] ${isDetectingGps ? "animate-spin" : ""}`}>
              {isDetectingGps ? "sync" : "my_location"}
            </span>
          </button>
        </div>

        {/* Active Store Interactive Popup Drawer Card */}
        {activeStore && (
          <div style={{
            position: "absolute", bottom: 16, left: 16, right: 16, maxWidth: 360,
            background: "rgba(26, 35, 28, 0.95)", backdropFilter: "blur(16px)",
            padding: 18, borderRadius: 24, border: "1px solid #243026",
            boxShadow: "0 20px 50px rgba(0,0,0,0.6)", zIndex: 40
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <img
                  src={activeStore.image}
                  alt={activeStore.name}
                  style={{ width: 48, height: 48, borderRadius: 14, objectFit: "cover", border: "1px solid #243026" }}
                />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "#748F70", textTransform: "uppercase", letterSpacing: "0.06em", background: "rgba(116,143,112,0.18)", padding: "2px 8px", borderRadius: 999 }}>
                      {activeStore.categoryTag || activeStore.category}
                    </span>
                    {activeStore.verified && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#60a5fa", background: "rgba(96,165,250,0.15)", padding: "2px 6px", borderRadius: 6, display: "flex", alignItems: "center", gap: 2 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>verified</span>
                        Verified
                      </span>
                    )}
                  </div>
                  <h4 style={{ margin: "4px 0 0", fontWeight: 800, fontSize: 15, color: "#F2F7F2" }}>{activeStore.name}</h4>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#C2D6C0", display: "flex", alignItems: "center", gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#748F70" }}>location_on</span>
                    {activeStore.distance} • {activeStore.address}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveStore(null)}
                style={{ width: 28, height: 28, borderRadius: "50%", background: "#243026", border: "none", color: "#C2D6C0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
              </button>
            </div>

            <div style={{ paddingTop: 12, borderTop: "1px solid #243026", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#4ade80", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                  {activeStore.timing}
                </span>
                {activeStore.offerText && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#F3B58C", marginTop: 2 }}>
                    🏷️ {activeStore.offerText}
                  </span>
                )}
              </div>

              <Link
                href={`/customer/stores/${activeStore.id}`}
                style={{
                  padding: "8px 16px", background: "#748F70", color: "#fff",
                  fontWeight: 700, fontSize: 12, borderRadius: 999,
                  textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
                  boxShadow: "0 4px 16px rgba(116,143,112,0.4)"
                }}
              >
                <span>Visit Store</span>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
