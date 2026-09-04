"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function CustomerTrackingPage() {
  const [isCalling, setIsCalling] = useState(false);

  const riderInfo = {
    name: "Ramesh Kumar",
    rating: 4.9,
    trips: "1,240 deliveries",
    vehicle: "TVS iQube (TS 09 EQ 4452)",
    phone: "+91 98765 00112",
    photo: "https://lh3.googleusercontent.com/aida-public/AB6AXuDnEnDG9WQvpu8RWDmm8S-U09KwCWGhWoDhm530ChqdifVM9FWds_r2XQX4o4kjImz8heUaENu796em9QQsGiAlQ9Ih7dGTMKunsC4RdXfXLDx6WSFo8VRJ6ZvgrLKz9Ipmhzn-4bceUBKewwrNvweM34y980OuecwDYOIC1oJDkXTcYC5wcW0BUXYs91UvC4euubClXwjjjWn-1vDuJIfzh9K449rmWFkNoTrqlA4_AJZITIpET9I"
  };

  const timelineSteps = [
    { title: "Order Confirmed", time: "10:15 AM", done: true, desc: "Sent to Sri Lakshmi Stores" },
    { title: "Order Packed", time: "10:22 AM", done: true, desc: "All 3 items packed and ready" },
    { title: "Out for Delivery", time: "10:26 AM", done: true, desc: "Rider Ramesh Kumar picked up order" },
    { title: "Arriving at Destination", time: "Est. 10:40 AM", done: false, desc: "1.2 km away from your location" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-tertiary-fixed text-on-tertiary-fixed font-bold text-xs px-3 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-ping" />
              Live Tracking
            </span>
            <span className="text-xs text-on-surface-variant font-mono">#BZR-98241</span>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
            Order On The Way 🛵
          </h1>
        </div>

        <Link
          href="/customer/help"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-full text-xs font-semibold text-on-surface border border-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">help_center</span>
          Need Help?
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Interactive Visual Map Simulation Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative w-full h-[360px] sm:h-[420px] rounded-3xl overflow-hidden border border-surface-container-high shadow-md bg-surface-container">
            {/* Map Canvas Background Simulation */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-85"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAvDj9jOkGn1pBnrGqjKQRN194mfZO_OSn2JZns_V7qxlZ_xRyBnh7lbpomrUmvxdoO-DyvLJKCpfP_UZwE7-45DCswnrc47dWBmVlVrG8OgdouKuefwoAO4Tb116xuBbHKE8lB-5qrYVbW2Q5W0MI2_OrEMOx5cORmpVxxpNXoBmxIsstpMdtdDEVwy--BG2ydbeigKujqqRqQTnFOsQnZizg77wICBYLe10tqdXQR92mA35ttxqs')"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-black/30" />

            {/* Store Pin Marker */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="bg-primary text-on-primary font-bold text-[11px] px-2.5 py-1 rounded-full shadow-lg mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">store</span>
                Sri Lakshmi Stores
              </div>
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg border-2 border-white">
                <span className="material-symbols-outlined text-[16px]">storefront</span>
              </div>
            </div>

            {/* Animated Delivery Rider Marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-pulse">
              <div className="bg-tertiary text-on-tertiary font-bold text-xs px-3 py-1 rounded-full shadow-xl mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">two_wheeler</span>
                Ramesh (1.2 km away)
              </div>
              <div className="w-10 h-10 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shadow-xl border-2 border-white">
                <span className="material-symbols-outlined text-[20px]">two_wheeler</span>
              </div>
            </div>

            {/* Customer Home Pin Marker */}
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 flex flex-col items-center">
              <div className="bg-surface-container text-on-surface font-bold text-[11px] px-2.5 py-1 rounded-full shadow-lg mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">home</span>
                Your Location
              </div>
              <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-lg border-2 border-white">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
              </div>
            </div>

            {/* Bottom Live Banner */}
            <div className="absolute bottom-4 left-4 right-4 bg-surface-container/95 backdrop-blur-md p-4 rounded-2xl border border-surface-container-high shadow-lg flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-on-surface">Arriving in approx. 14 minutes</p>
                <p className="text-xs text-on-surface-variant">Optimal route calculated via Road No. 12</p>
              </div>
              <span className="material-symbols-outlined text-primary text-2xl animate-spin">sync</span>
            </div>
          </div>

          {/* Rider Card */}
          <div className="bg-surface-container rounded-3xl p-6 border border-surface-container-high shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl border border-primary/20">
                RK
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base text-on-surface">{riderInfo.name}</h4>
                  <span className="bg-surface-container px-2 py-0.5 rounded-md text-xs font-semibold text-on-surface flex items-center gap-0.5">
                    <span
                      className="material-symbols-outlined text-[#F9A826] text-[13px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    {riderInfo.rating}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">{riderInfo.vehicle}</p>
                <p className="text-[11px] text-on-surface-variant opacity-75">{riderInfo.trips}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsCalling(true);
                setTimeout(() => setIsCalling(false), 2000);
              }}
              className="w-full sm:w-auto px-6 py-3 bg-tertiary text-on-tertiary font-bold text-xs rounded-full shadow-md hover:bg-tertiary-container transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isCalling ? "sync" : "call"}
              </span>
              <span>{isCalling ? "Dialing Rider..." : "Call Rider"}</span>
            </button>
          </div>
        </div>

        {/* Status Timeline Column */}
        <div className="bg-surface-container rounded-3xl p-6 border border-surface-container-high shadow-xs space-y-6">
          <h3 className="font-headline-md text-base font-bold text-on-surface mb-2">Live Timeline</h3>

          <div className="relative pl-6 border-l-2 border-surface-container-high space-y-6">
            {timelineSteps.map((step) => (
              <div key={step.title} className="relative">
                {/* Stepper Dot */}
                <div
                  className={`absolute -left-[31px] top-0.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                    step.done ? "bg-primary text-on-primary shadow-xs" : "bg-surface-container-highest"
                  }`}
                >
                  {step.done && <span className="material-symbols-outlined text-[12px] font-bold">check</span>}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-bold ${step.done ? "text-on-surface" : "text-on-surface-variant"}`}>
                      {step.title}
                    </h4>
                    <span className="text-[10px] font-semibold text-primary">{step.time}</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-surface-container-high pt-4">
            <p className="font-bold text-xs text-on-surface mb-1">Delivery Address</p>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Flat 402, Royal Residency, Road No. 12, Banjara Hills, Hyderabad
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
