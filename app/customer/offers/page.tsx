"use client";

import React, { useState } from "react";
import { useCart } from "../../contexts/CartContext";

export default function CustomerOffersPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { applyCoupon } = useCart();

  const coupons = [
    {
      code: "BAZAAR100",
      title: "Flat ₹100 OFF on Local Groceries",
      description: "Valid on orders above ₹499 from any neighborhood store in Banjara Hills.",
      category: "Store Discounts",
      tag: "POPULAR",
      expiry: "Valid till 30 Sep 2026"
    },
    {
      code: "WELCOME50",
      title: "₹50 Discount for New Customers",
      description: "Enjoy ₹50 off on your first 3 orders placed through Bazaar app.",
      category: "First Order",
      tag: "NEW USER",
      expiry: "Valid till 31 Oct 2026"
    },
    {
      code: "FREEDEL",
      title: "100% Free Express Delivery",
      description: "Get free 20-minute delivery on any order above ₹199.",
      category: "Free Delivery",
      tag: "EXPRESS",
      expiry: "Valid everyday"
    },
    {
      code: "ICICIFEST",
      title: "15% Cashback up to ₹150 with ICICI Cards",
      description: "Pay using ICICI Credit/Debit cards to claim instant cashback on checkout.",
      category: "Bank Deals",
      tag: "BANK OFFER",
      expiry: "Valid till 15 Sep 2026"
    }
  ];

  const tabs = ["All", "Store Discounts", "First Order", "Free Delivery", "Bank Deals"];

  const filteredCoupons = coupons.filter(c => activeTab === "All" || c.category === activeTab);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    applyCoupon(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 min-h-screen">
      {/* Hero Offer Banner */}
      <div className="w-full bg-gradient-to-r from-primary via-primary-container to-tertiary text-on-primary rounded-3xl p-8 sm:p-12 mb-10 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <span className="bg-black/30 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
            Mega Savings Month
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold mb-3">
            Neighborhood Deals & Coupons
          </h1>
          <p className="text-sm opacity-90 leading-relaxed mb-6">
            Save big on fresh produce, daily dairy, and artisan baked goods with verified local coupons.
          </p>
        </div>

        {/* Ambient Blur */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-tertiary-fixed-dim/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Offer Tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-4 mb-8 border-b border-surface-container-high">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-full font-label-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCoupons.map((coupon) => (
          <div
            key={coupon.code}
            className="bg-surface-container-low rounded-3xl p-6 border-2 border-dashed border-primary/30 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="bg-primary-fixed text-on-primary-fixed font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {coupon.tag}
                </span>
                <span className="text-[11px] text-on-surface-variant font-medium">{coupon.expiry}</span>
              </div>

              <h3 className="font-bold text-lg text-on-surface mb-2">{coupon.title}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-6">{coupon.description}</p>
            </div>

            <div className="pt-4 border-t border-surface-container-high flex items-center justify-between">
              <div className="px-3.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded-xl font-mono text-sm font-bold text-primary tracking-wider">
                {coupon.code}
              </div>

              <button
                type="button"
                onClick={() => handleCopy(coupon.code)}
                className={`px-5 py-2 rounded-full font-bold text-xs transition-all shadow-xs cursor-pointer ${
                  copiedCode === coupon.code
                    ? "bg-tertiary text-on-tertiary"
                    : "bg-primary text-on-primary hover:bg-primary-container"
                }`}
              >
                {copiedCode === coupon.code ? "Applied & Copied! ✓" : "Apply & Copy Code"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
