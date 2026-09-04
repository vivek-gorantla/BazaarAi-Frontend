"use client";

import React, { useState } from "react";
import { customerApi } from "../../../services/customerApi";

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (profileData: any) => void;
}

export function CustomerProfileModal({ isOpen, onClose, onSuccess }: CustomerProfileModalProps) {
  const [name, setName] = useState("Vivek Sharma");
  const [email, setEmail] = useState("vivek@example.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [line1, setLine1] = useState("Flat 402, Royal Residency, Road No. 12");
  const [line2, setLine2] = useState("Near Cancer Hospital");
  const [landmark, setLandmark] = useState("Banjara Hills");
  const [city, setCity] = useState("Hyderabad");
  const [pincode, setPincode] = useState("500034");
  const [lat, setLat] = useState<number>(17.4156);
  const [lng, setLng] = useState<number>(78.4347);
  const [isSaving, setIsSaving] = useState(false);
  const [geoMsg, setGeoMsg] = useState("");

  if (!isOpen) return null;

  const handleDetectLocation = () => {
    setGeoMsg("Detecting GPS location...");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setGeoMsg("✓ GPS Location Detected!");
        },
        () => {
          setGeoMsg("Unable to access GPS. Using Banjara Hills coordinates.");
        }
      );
    } else {
      setGeoMsg("GPS not supported on browser.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      name,
      email,
      phone,
      address: {
        line1,
        line2,
        landmark,
        city,
        pincode,
        lat,
        lng
      }
    };

    const updated = await customerApi.saveProfile(payload);
    setIsSaving(false);
    if (onSuccess) onSuccess(updated || payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-surface-container-high max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Customer Onboarding
            </span>
            <h3 className="font-headline-md text-xl font-bold text-on-surface">
              Delivery Address & Profile Setup
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p className="text-xs text-on-surface-variant mb-6">
          Provide your delivery details to discover nearby stores, sweet shops, artisan bakeries, and fast 20-minute delivery in your area.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1">Mobile Phone</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 px-3.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-on-surface-variant block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Address Info */}
          <div className="pt-2 border-t border-surface-container-high">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-on-surface">Delivery Address Details</span>
              <button
                type="button"
                onClick={handleDetectLocation}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">my_location</span>
                Detect GPS Location
              </button>
            </div>

            {geoMsg && <p className="text-[11px] font-bold text-tertiary mb-2">{geoMsg}</p>}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-on-surface-variant block mb-1">
                  Flat / House No. / Street (Line 1)
                </label>
                <input
                  type="text"
                  required
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  placeholder="e.g. Flat 402, Royal Residency"
                  className="w-full h-10 px-3.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-on-surface-variant block mb-1">
                  Area / Landmark (Line 2)
                </label>
                <input
                  type="text"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  placeholder="e.g. Near Cancer Hospital, Road No. 12"
                  className="w-full h-10 px-3.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-on-surface-variant block mb-1">Landmark</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full h-10 px-3.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-on-surface-variant block mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-10 px-3.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-on-surface-variant block mb-1">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full h-10 px-3.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 bg-primary text-on-primary font-bold text-sm rounded-full shadow-lg hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer mt-4"
          >
            {isSaving ? "Saving Profile..." : "Save Address & Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
