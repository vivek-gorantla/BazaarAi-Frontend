"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ProductCard } from "../../components/customer/ProductCard";
import { StoreCard } from "../../components/customer/StoreCard";
import { customerApi, Store } from "../../../services/customerApi";

export default function CustomerDiscoverPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [collections, setCollections] = useState<any[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    customerApi.getDiscoverData().then((res) => {
      if (isMounted) {
        setCollections(res.collections || []);
        setStores(res.spotlightStores || []);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filterChips = [
    "All",
    "Trending",
    "Organic & Fresh",
    "Artisan Bakery",
    "Local Specials",
    "Fast Delivery ⚡"
  ];

  const trendingProducts = [
    {
      id: "disc-1",
      title: "Handpicked Farm Fresh Tomatoes",
      price: 120,
      originalPrice: 150,
      weight: "1 kg",
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500",
      storeName: "Sri Lakshmi Stores",
      rating: 4.9,
      discountBadge: "TOP SELLER"
    },
    {
      id: "disc-2",
      title: "Organic Whole Wheat Atta",
      price: 320,
      originalPrice: 360,
      weight: "5 kg",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTA8wDPgxLIpIoZDqjIk3db5qlrZj5q-1ejkjww4xDFzw&s=10",
      storeName: "Sri Lakshmi Stores",
      rating: 4.8
    },
    {
      id: "disc-3",
      title: "Premium Kashmiri Chilli Powder",
      price: 160,
      originalPrice: 190,
      weight: "200 g",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQicigi_9-GYo0lJurRW_wEnzloGFhUiWt7kd8qAPztg&s=10",
      storeName: "Ravi Kirana",
      rating: 4.9,
      discountBadge: "AUTHENTIC"
    },
    {
      id: "disc-4",
      title: "Fresh Baked Artisan Garlic Breadstick",
      price: 110,
      originalPrice: 130,
      weight: "250 g",
      image: "https://www.ambitiouskitchen.com/wp-content/uploads/2023/02/Garlic-Bread-4.jpg",
      storeName: "Local Mart",
      rating: 4.6
    }
  ];

  return (
    <div className="flex flex-col w-full min-h-screen pb-16">
      {/* Hero Spotlight */}
      <section className="bg-gradient-to-br from-primary/10 via-surface to-tertiary-fixed-dim/20 py-12 px-6 lg:px-12 border-b border-surface-container-high">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-on-primary text-xs font-bold uppercase tracking-wider mb-4">
              <span className="material-symbols-outlined text-[16px]">explore</span>
              Discover Local
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary tracking-tight mb-4">
              Explore Neighborhood Treasures
            </h1>
            <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed">
              Find unique artisan products, handpicked seasonal produce, and top-rated local merchants right in your vicinity.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-surface-container/80 backdrop-blur-md p-4 rounded-3xl border border-surface-container-high shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">storefront</span>
            </div>
            <div>
              <p className="font-bold text-lg text-on-surface">{stores.length || 50}+ Verified Merchants</p>
              <p className="text-xs text-on-surface-variant">Delivering within 3 km of Banjara Hills</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Chips Bar */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-6 w-full sticky top-20 z-40 bg-surface/90 backdrop-blur-md border-b border-surface-container-high">
        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar">
          {filterChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setActiveFilter(chip)}
              className={`px-5 py-2.5 rounded-full font-label-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${activeFilter === chip
                ? "bg-primary text-on-primary shadow-md"
                : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </section>

      {/* Curated Story Collections */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Handpicked Collections
            </span>
            <h2 className="font-headline-lg text-2xl lg:text-3xl font-bold text-on-surface">
              Featured Stories & Bundles
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.map((col) => (
            <div
              key={col.title}
              className="relative h-[320px] rounded-[32px] overflow-hidden shadow-md group border border-surface-container-high/60 flex flex-col justify-end p-6"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${col.image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              <div className="relative z-10 text-white">
                <span className="bg-black/40 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full mb-3 inline-block">
                  {col.count}
                </span>
                <h3 className="font-headline-md text-xl font-bold mb-1">{col.title}</h3>
                <p className="text-xs opacity-90 mb-4">{col.subtitle}</p>
                <Link
                  href="/customer/search"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-fixed hover:underline"
                >
                  Browse Collection
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Items Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Popular Demand
            </span>
            <h2 className="font-headline-lg text-2xl lg:text-3xl font-bold text-on-surface">
              Trending Nearby Right Now
            </h2>
          </div>
          <Link
            href="/customer/search"
            className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
          >
            View All
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((prod) => (
            <ProductCard key={prod.id} {...prod} />
          ))}
        </div>
      </section>

      {/* Merchant Spotlight */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-tertiary uppercase tracking-wider">
              Trusted Merchants
            </span>
            <h2 className="font-headline-lg text-2xl lg:text-3xl font-bold text-on-surface">
              Top Rated Local Stores
            </h2>
          </div>
          <Link
            href="/customer/stores"
            className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
          >
            All Stores
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <StoreCard key={store.id} {...store} />
          ))}
        </div>
      </section>
    </div>
  );
}
