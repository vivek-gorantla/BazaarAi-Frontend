"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { ProductCard } from "../../../components/customer/ProductCard";
import { customerApi, Store, Product } from "../../../../services/customerApi";

export default function CustomerStoreDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [storeInfo, setStoreInfo] = useState<(Store & { products: Product[] }) | null>(null);
  const [activeTab, setActiveTab] = useState("All Products");
  const [storeSearch, setStoreSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    customerApi.getStoreDetail(id).then((data) => {
      if (isMounted) {
        setStoreInfo(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [id]);

  const availableCategories = Array.from(
    new Set(storeInfo?.products?.map((p) => p.category).filter(Boolean) as string[])
  );
  const tabs = ["All Products", ...availableCategories];

  const filtered = (storeInfo?.products || []).filter((p) => {
    const matchesTab = activeTab === "All Products" || p.category === activeTab;
    const matchesSearch = !storeSearch || p.title.toLowerCase().includes(storeSearch.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 animate-pulse space-y-6">
        <div className="h-64 bg-surface-container rounded-3xl" />
        <div className="h-12 bg-surface-container rounded-full w-1/2" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-60 bg-surface-container rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen pb-16">
      {/* Store Header Hero */}
      <div className="relative w-full h-[280px] lg:h-[340px] bg-surface-container overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${storeInfo?.image}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-full relative z-10 flex items-end pb-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 w-full">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-surface-container p-2 shadow-2xl flex-shrink-0 flex items-center justify-center border-2 border-white">
                <div className="w-full h-full rounded-2xl bg-primary text-on-primary font-bold text-2xl flex items-center justify-center">
                  {storeInfo?.name.charAt(0)}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-tertiary text-on-tertiary text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    Verified Local Store
                  </span>
                  <span className="bg-surface-container/20 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                    {storeInfo?.timing || "Open now • 8:00 AM - 10:00 PM"}
                  </span>
                </div>
                <h1 className="font-headline-lg text-2xl sm:text-4xl font-bold">{storeInfo?.name}</h1>
                <p className="text-xs sm:text-sm opacity-90">{storeInfo?.categoryTag || "Local Heritage Store"}</p>
                <p className="text-xs opacity-75 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">location_on</span>
                  {storeInfo?.address || "Road No. 12, Banjara Hills"} • {storeInfo?.distance}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-surface-container/90 backdrop-blur-md text-on-surface px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg">
                <span
                  className="material-symbols-outlined text-[#F9A826] text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <div>
                  <p className="font-bold text-base leading-none">{storeInfo?.rating}</p>
                  <p className="text-[10px] text-on-surface-variant leading-none">{storeInfo?.reviewsCount || 240} ratings</p>
                </div>
              </div>

              <a
                href={`tel:${storeInfo?.phone || "+919876543210"}`}
                className="w-11 h-11 rounded-2xl bg-surface-container/20 backdrop-blur-md hover:bg-surface-container hover:text-primary flex items-center justify-center transition-colors cursor-pointer text-white"
                title="Call Store"
              >
                <span className="material-symbols-outlined text-[20px]">call</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs & Search Bar */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-8 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-container-high">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
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

          <div className="relative min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={storeSearch}
              onChange={(e) => setStoreSearch(e.target.value)}
              placeholder={`Search in ${storeInfo?.name}...`}
              className="w-full h-10 pl-10 pr-4 bg-surface-container-low border border-surface-container-high rounded-full text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Store Products */}
        <div className="pt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-md text-xl font-bold text-on-surface">{activeTab}</h3>
            <span className="text-xs text-on-surface-variant">{filtered.length} products available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((prod) => (
              <ProductCard key={prod.id} {...prod} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
