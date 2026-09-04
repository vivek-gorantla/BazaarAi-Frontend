"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function CustomerFooter() {
  const pathname = usePathname();
  if (pathname === "/customer/chat") return null;
  return (
    <footer className="w-full bg-surface-container-low py-12 mt-16 border-t border-surface-container-high pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col items-center text-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
            B
          </div>
          <span className="font-headline-md text-2xl font-bold text-primary tracking-tight">
            Bazaar
          </span>
        </div>
        <p className="text-sm text-on-surface-variant max-w-md">
          Shop your neighborhood with confidence. Premium local curation meets fast, reliable delivery.
        </p>

        <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-on-surface-variant">
          <Link href="/customer/discover" className="hover:text-primary transition-colors">
            Discover Stores
          </Link>

          <Link href="/customer/offers" className="hover:text-primary transition-colors">
            Offers & Coupons
          </Link>

          <Link href="/customer/help" className="hover:text-primary transition-colors">
            Help Center
          </Link>

          <Link href="/customer/account" className="hover:text-primary transition-colors">
            My Account
          </Link>

          <Link href="/merchant" className="hover:text-primary transition-colors text-primary font-bold">
            Merchant Portal
          </Link>
        </div>

        <div className="w-16 h-0.5 bg-surface-container-high rounded-full my-2" />

        <p className="text-xs text-on-surface-variant opacity-70">
          © {new Date().getFullYear()} Bazaar Customer Platform. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
