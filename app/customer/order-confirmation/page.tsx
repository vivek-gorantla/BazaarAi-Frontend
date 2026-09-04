"use client";

import React from "react";
import Link from "next/link";

export default function CustomerOrderConfirmedPage() {
  const orderId = "BZR-98241";
  const estimatedTime = "22 Mins";

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 min-h-screen flex flex-col items-center justify-center text-center">
      {/* Animated Success Checkmark */}
      <div className="w-24 h-24 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center mb-6 shadow-xl animate-bounce">
        <span className="material-symbols-outlined text-5xl font-bold">check_circle</span>
      </div>

      <span className="bg-primary-container text-on-primary-container font-bold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider mb-2">
        Order Confirmed
      </span>

      <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-on-surface mb-2">
        Thank you for your order!
      </h1>

      <p className="text-sm text-on-surface-variant max-w-md mb-8">
        Your order <span className="font-bold text-primary">#{orderId}</span> has been received by{" "}
        <span className="font-bold text-on-surface">Sri Lakshmi Stores</span>. Delivery partner is on the way!
      </p>

      {/* Delivery Estimate Box */}
      <div className="w-full bg-surface-container-low border border-surface-container-high rounded-3xl p-6 mb-8 text-left shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">timer</span>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant uppercase font-bold">Estimated Arrival</p>
            <p className="text-2xl font-bold text-primary">{estimatedTime}</p>
          </div>
        </div>

        <Link
          href="/customer/tracking"
          className="w-full sm:w-auto px-6 py-3 bg-primary text-on-primary font-bold text-xs rounded-full shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">location_on</span>
          <span>Track Live Order</span>
        </Link>
      </div>

      {/* Status Stepper */}
      <div className="w-full bg-surface-container border border-surface-container-high rounded-3xl p-6 mb-8 shadow-xs">
        <h4 className="font-bold text-sm text-on-surface text-left mb-6">Delivery Progress</h4>

        <div className="grid grid-cols-4 gap-2 relative">
          <div className="flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs mb-2 shadow-xs">
              1
            </div>
            <span className="text-xs font-bold text-primary">Confirmed</span>
          </div>

          <div className="flex flex-col items-center text-center opacity-60">
            <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-bold text-xs mb-2">
              2
            </div>
            <span className="text-xs font-medium text-on-surface-variant">Preparing</span>
          </div>

          <div className="flex flex-col items-center text-center opacity-60">
            <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-bold text-xs mb-2">
              3
            </div>
            <span className="text-xs font-medium text-on-surface-variant">On the Way</span>
          </div>

          <div className="flex flex-col items-center text-center opacity-60">
            <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-bold text-xs mb-2">
              4
            </div>
            <span className="text-xs font-medium text-on-surface-variant">Delivered</span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/customer/orders"
          className="px-6 py-3 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs rounded-full border border-surface-container-high transition-colors"
        >
          View All Orders
        </Link>
        <Link
          href="/customer"
          className="px-6 py-3 bg-primary text-on-primary font-semibold text-xs rounded-full shadow-md hover:bg-primary-container transition-all"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
