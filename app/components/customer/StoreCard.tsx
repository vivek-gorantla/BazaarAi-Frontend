"use client";

import React from "react";
import Link from "next/link";

export interface StoreCardProps {
  id: string;
  name: string;
  distance: string;
  rating: number;
  image: string;
  verified?: boolean;
  featured?: boolean;
  categoryTag?: string;
  offerText?: string;
  deliveryTime?: string;
}

export function StoreCard(props: StoreCardProps) {
  const { id, name, distance, rating, image, verified = true, featured = false, categoryTag, offerText, deliveryTime } = props;

  if (featured) {
    return (
      <Link href={`/customer/stores/${id}`} className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 group block">
        <div className="relative w-full h-full min-h-[360px] lg:min-h-[420px] bg-surface-container rounded-[32px] overflow-hidden shadow-[0_4px_20px_rgba(96,64,95,0.05)] group-hover:shadow-[0_12px_40px_rgba(96,64,95,0.12)] transition-all">
          <div
            className="absolute inset-0 bg-cover bg-center w-full h-full transform group-hover:scale-105 transition-transform duration-700"
            style={{ backgroundImage: `url('${image}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {verified && (
            <div className="absolute top-6 left-6 bg-tertiary/90 backdrop-blur-md text-on-tertiary px-4 py-2 rounded-full font-label-md text-xs font-semibold flex items-center gap-2 shadow-md">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              Local Favorite
            </div>
          )}

          {offerText && (
            <div className="absolute top-6 right-6 bg-secondary text-on-secondary px-3.5 py-1.5 rounded-full font-label-md text-xs font-bold shadow-md">
              {offerText}
            </div>
          )}

          <div className="absolute bottom-8 left-8 right-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 text-white">
            <div className="flex flex-col gap-1.5">
              {categoryTag && (
                <span className="text-xs font-semibold text-primary-fixed uppercase tracking-wider">
                  {categoryTag}
                </span>
              )}
              <h3 className="font-headline-lg text-2xl lg:text-3xl font-bold">{name}</h3>
              <p className="text-sm opacity-90 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
                {distance} • {deliveryTime || "Express 20-min delivery"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-[#141A15]/90 backdrop-blur-md px-4 py-2 rounded-full text-on-surface shadow-md">
              <span
                className="material-symbols-outlined text-[#F9A826] text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span className="font-bold text-sm text-white">{rating}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/customer/stores/${id}`} className="col-span-1 group block">
      <div className="relative w-full h-[280px] bg-surface-container rounded-[28px] overflow-hidden shadow-[0_4px_20px_rgba(96,64,95,0.05)] group-hover:shadow-[0_12px_40px_rgba(96,64,95,0.12)] transition-all flex flex-col justify-end p-6 border border-surface-container-high/60">
        <div
          className="absolute inset-0 bg-cover bg-center w-full h-full transform group-hover:scale-105 transition-transform duration-700"
          style={{ backgroundImage: `url('${image}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        <div className="relative z-10 text-white">
          {offerText && (
            <span className="inline-block bg-primary text-on-primary text-[10px] font-bold px-2.5 py-1 rounded-full mb-2">
              {offerText}
            </span>
          )}
          <h3 className="font-headline-md text-xl font-bold mb-1">{name}</h3>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs opacity-90 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              {distance}
            </p>
            <div className="flex items-center gap-1 bg-[#141A15]/90 backdrop-blur-md px-3 py-1 rounded-full text-on-surface">
              <span
                className="material-symbols-outlined text-[#F9A826] text-[15px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span className="font-bold text-xs text-white">{rating}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
