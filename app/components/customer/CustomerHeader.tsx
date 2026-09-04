"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/WishlistContext";
import { useCustomerAuth } from "../../contexts/CustomerAuthContext";
import { CustomerAuthModal } from "./CustomerAuthModal";

export function CustomerHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { wishlistItems } = useWishlist();
  const { customerUser, isAuthenticated, openAuthModal, logoutCustomer } = useCustomerAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Banjara Hills, Hyderabad");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const locations = [
    { name: "Nagaram, Hyderabad", desc: "ECIL - Nagaram Main Rd, TS 500083", lat: 17.4960, lng: 78.5900 },
    { name: "Dammaiguda, Hyderabad", desc: "Dammaiguda Main Rd, TS 500083", lat: 17.4910, lng: 78.5820 },
    { name: "Banjara Hills, Hyderabad", desc: "Road No. 12, Hyderabad, TS 500034", lat: 17.4156, lng: 78.4347 },
    { name: "Jubilee Hills, Hyderabad", desc: "Road No. 36, Hyderabad, TS 500033", lat: 17.4240, lng: 78.4120 },
    { name: "Gachibowli, Hyderabad", desc: "DLF Cyber City, Hyderabad, TS 500032", lat: 17.4401, lng: 78.3489 },
    { name: "Hitec City, Hyderabad", desc: "Mindspace IT Park, Hyderabad, TS 500081", lat: 17.4435, lng: 78.3772 }
  ];

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const savedLoc = localStorage.getItem("bazaar_user_location");
      if (savedLoc) {
        setSelectedLocation(savedLoc);
      }
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/customer/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleGetGpsLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetectingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocoding using OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const area =
            data.address?.suburb ||
            data.address?.neighbourhood ||
            data.address?.residential ||
            data.address?.city_district ||
            "Current Area";
          const city = data.address?.city || data.address?.town || "Hyderabad";
          const locationString = `${area}, ${city}`;

          setSelectedLocation(locationString);
          localStorage.setItem("bazaar_user_lat", String(latitude));
          localStorage.setItem("bazaar_user_lng", String(longitude));
          localStorage.setItem("bazaar_user_location", locationString);
          setIsLocationModalOpen(false);
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("bazaar_location_changed", {
                detail: { lat: latitude, lng: longitude, locationString }
              })
            );
          }
        } catch (e) {
          const fallbackString = `GPS (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`;
          setSelectedLocation(fallbackString);
          localStorage.setItem("bazaar_user_lat", String(latitude));
          localStorage.setItem("bazaar_user_lng", String(longitude));
          localStorage.setItem("bazaar_user_location", fallbackString);
          setIsLocationModalOpen(false);
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("bazaar_location_changed", {
                detail: { lat: latitude, lng: longitude, locationString: fallbackString }
              })
            );
          }
        } finally {
          setIsDetectingGps(false);
        }
      },
      (err) => {
        setIsDetectingGps(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError("Location permission denied. Please allow location access in your browser settings.");
        } else {
          setGpsError("Could not retrieve GPS coordinates. Please select your area below.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-[#141A15]/95 backdrop-blur-md border-b border-surface-container-high">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col">
          {/* Main Bar */}
          <div className="h-20 flex items-center justify-between gap-3 sm:gap-6">
            {/* Logo */}
            <Link href="/customer" className="flex items-center gap-2 flex-shrink-0 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-105 transition-transform"
                style={{ background: "linear-gradient(135deg, #748F70, #F3B58C)" }}
              >
                B
              </div>
              <span className="font-black text-2xl tracking-tight hidden sm:block"
                style={{ background: "linear-gradient(135deg, #748F70 0%, #F3B58C 70%, #ffffff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
              >
                Bazaar
              </span>
            </Link>

            {/* Location & Search (Desktop / Tablet) */}
            <div className="hidden md:flex flex-1 items-center gap-4 max-w-2xl mx-4">
              {/* Location Picker Pill */}
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-surface-container-low hover:bg-surface-container rounded-full min-w-[180px] max-w-[240px] transition-colors border border-surface-container-high text-left cursor-pointer group"
              >
                <span className="material-symbols-outlined text-[#556B2F] text-[20px] group-hover:scale-110 transition-transform">
                  location_on
                </span>
                <div className="flex flex-col truncate">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant leading-none">
                    Deliver to
                  </span>
                  <span className="font-label-md text-xs font-semibold text-on-surface truncate">
                    {selectedLocation}
                  </span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px] ml-auto">
                  expand_more
                </span>
              </button>

              {/* Search Bar Input */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stores, groceries, artisan finds..."
                  className="w-full h-11 pl-11 pr-4 bg-surface-container-low border border-surface-container-high rounded-full font-body-md text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-[#556B2F]/20 focus:border-[#556B2F] transition-all"
                />
              </form>
            </div>

            {/* Quick Actions (Desktop & Mobile) */}
            <div className="flex items-center gap-3 sm:gap-6">
              {/* AI Shop pill — desktop only */}
              <Link
                href="/customer/chat"
                className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm transition-all cursor-pointer flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, rgba(116,143,112,0.15), rgba(243,181,140,0.15))",
                  border: "1px solid rgba(116,143,112,0.4)",
                  color: "#748F70",
                }}
              >
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                AI Shop
              </Link>

              {/* Orders */}
              <Link
                href="/customer/orders"
                className="hidden sm:flex flex-col items-center text-on-surface-variant hover:text-[#748F70] transition-colors text-xs font-medium"
              >
                <span className="material-symbols-outlined text-[22px]">receipt_long</span>
                <span className="mt-0.5">Orders</span>
              </Link>

              {/* Wishlist */}
              <Link
                href="/customer/wishlist"
                className="relative flex flex-col items-center text-on-surface-variant hover:text-[#748F70] transition-colors text-xs font-medium"
              >
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: mounted && wishlistItems.length > 0 ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                {mounted && wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm badge-pop">
                    {wishlistItems.length}
                  </span>
                )}
                <span className="hidden sm:inline mt-0.5">Wishlist</span>
              </Link>

              {/* Cart */}
              <Link
                href="/customer/cart"
                className="relative flex flex-col items-center text-on-surface-variant hover:text-[#748F70] transition-colors text-xs font-medium group"
              >
                <div className="relative">
                  <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform" style={{ fontVariationSettings: mounted && itemCount > 0 ? "'FILL' 1" : "'FILL' 0" }}>
                    shopping_bag
                  </span>
                  {mounted && itemCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-primary text-on-primary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md badge-pop">
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline mt-0.5">Cart</span>
              </Link>

              {/* Profile Avatar & Menu / Sign In Button */}
              {!mounted ? (
                <div className="w-24 h-9 bg-surface-container-high rounded-full animate-pulse"></div>
              ) : isAuthenticated ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors border border-surface-container-high cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#556B2F] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {customerUser?.name ? customerUser.name.charAt(0) : "C"}
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                      expand_more
                    </span>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-surface-container rounded-2xl shadow-xl border border-surface-container-high py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                      onMouseLeave={() => setIsProfileMenuOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-surface-container-high">
                        <p className="font-semibold text-sm text-on-surface">{customerUser?.name}</p>
                        <p className="text-xs text-on-surface-variant truncate">{customerUser?.phone}</p>
                      </div>
                      <Link
                        href="/customer/account"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">person</span>
                        My Account
                      </Link>
                      <Link
                        href="/customer/orders"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">package_2</span>
                        Order History
                      </Link>
                      <Link
                        href="/customer/offers"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">local_offer</span>
                        Offers & Coupons
                      </Link>
                      <Link
                        href="/customer/help"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">help_center</span>
                        Help & Support
                      </Link>
                      <div className="border-t border-surface-container-high my-1" />
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          logoutCustomer();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error-container/20 transition-colors text-left font-medium cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal()}
                  className="px-4 py-2 bg-[#556B2F] text-white font-bold text-xs rounded-full shadow-xs hover:bg-[#435525] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Search Row */}
          <div className="md:hidden pb-3 pt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-1 text-xs font-semibold text-[#556B2F] px-2.5 py-2 bg-surface-container-low rounded-full border border-surface-container-high"
            >
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              <span className="truncate max-w-[100px]">{selectedLocation.split(",")[0]}</span>
            </button>

            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products & stores..."
                className="w-full h-9 pl-9 pr-3 bg-surface-container-low border border-surface-container-high rounded-full text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
              />
            </form>
          </div>
        </div>
      </header>

      {/* Customer Auth Modal */}
      <CustomerAuthModal />

      {/* Location Selector Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface-container rounded-3xl p-6 w-full max-w-md shadow-2xl border border-surface-container-high">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline-md text-lg text-[#556B2F] font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px]">location_on</span>
                Select Delivery Location
              </h3>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant mb-5">
              Choose your delivery location or enable GPS to find nearby stores and fast delivery options.
            </p>

            {/* 🎯 USE CURRENT LOCATION GPS BUTTON */}
            <button
              type="button"
              onClick={handleGetGpsLocation}
              disabled={isDetectingGps}
              className="w-full p-4 mb-5 rounded-2xl bg-[#556B2F]/10 hover:bg-[#556B2F]/20 border-2 border-[#556B2F] text-[#556B2F] transition-all flex items-center gap-3 cursor-pointer group shadow-sm disabled:opacity-60"
            >
              <div className="relative flex items-center justify-center">
                {isDetectingGps && (
                  <span className="w-8 h-8 rounded-full bg-[#556B2F]/30 animate-ping absolute" />
                )}
                <span className="w-8 h-8 rounded-full bg-[#556B2F] text-white flex items-center justify-center shadow-xs">
                  <span className={`material-symbols-outlined text-[18px] ${isDetectingGps ? "animate-spin" : "group-hover:scale-110 transition-transform"}`}>
                    {isDetectingGps ? "sync" : "my_location"}
                  </span>
                </span>
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-sm text-[#556B2F]">
                  {isDetectingGps ? "Detecting GPS Location..." : "Use Current Location (GPS)"}
                </p>
                <p className="text-xs text-[#556B2F]/80">
                  {isDetectingGps ? "Connecting to browser GPS satellite..." : "Automatically detect your exact area"}
                </p>
              </div>
              <span className="material-symbols-outlined text-[20px] text-[#556B2F]">
                chevron_right
              </span>
            </button>

            {/* GPS Error Alert */}
            {gpsError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{gpsError}</span>
              </div>
            )}

            <div className="relative flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-surface-container-high" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Or Select Saved Area
              </span>
              <div className="flex-1 h-px bg-surface-container-high" />
            </div>

            {/* Saved Locations List */}
            <div className="space-y-2.5 mb-6 max-h-60 overflow-y-auto pr-1">
              {locations.map((loc) => (
                <button
                  key={loc.name}
                  type="button"
                  onClick={() => {
                    setSelectedLocation(loc.name);
                    localStorage.setItem("bazaar_user_location", loc.name);
                    localStorage.setItem("bazaar_user_lat", String(loc.lat));
                    localStorage.setItem("bazaar_user_lng", String(loc.lng));
                    setIsLocationModalOpen(false);
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(
                        new CustomEvent("bazaar_location_changed", {
                          detail: { lat: loc.lat, lng: loc.lng, locationString: loc.name }
                        })
                      );
                    }
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                    selectedLocation === loc.name
                      ? "border-[#556B2F] bg-[#556B2F]/10 shadow-xs"
                      : "border-surface-container-high hover:bg-surface-container-low"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] mt-0.5 ${
                      selectedLocation === loc.name ? "text-[#556B2F]" : "text-on-surface-variant"
                    }`}
                  >
                    {selectedLocation === loc.name ? "check_circle" : "location_on"}
                  </span>
                  <div>
                    <p className="font-semibold text-sm text-on-surface">{loc.name}</p>
                    <p className="text-xs text-on-surface-variant">{loc.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsLocationModalOpen(false)}
              className="w-full py-3 bg-[#556B2F] text-white font-bold text-sm rounded-full shadow-md hover:bg-[#435525] transition-all cursor-pointer"
            >
              Confirm Location
            </button>
          </div>
        </div>
      )}
    </>
  );
}
