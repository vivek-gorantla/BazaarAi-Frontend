"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "../../contexts/CartContext";

export function MobileNavigation() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  if (pathname === "/customer/chat") return null;

  const items = [
    { label: "Home", icon: "home", href: "/customer", exact: true },
    { label: "Discover", icon: "explore", href: "/customer/discover" },
    { label: "AI Shop", icon: "auto_awesome", href: "/customer/chat", isSpecial: true },
    { label: "Cart", icon: "shopping_bag", href: "/customer/cart", badge: itemCount },
    { label: "Account", icon: "person", href: "/customer/account" },
  ];

  const isActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) return pathname === item.href || pathname === "/customer/";
    return pathname.startsWith(item.href);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#141A15]/95 backdrop-blur-xl border-t border-surface-container-high px-1 py-1.5">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const active = isActive(item);

          if (item.isSpecial) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center py-1 px-2"
              >
                <div
                  className={`w-12 h-9 rounded-2xl flex items-center justify-center transition-all ${
                    active
                      ? "shadow-lg shadow-primary/40"
                      : ""
                  }`}
                  style={{
                    background: active
                      ? "linear-gradient(135deg, #748F70, #F3B58C)"
                      : "linear-gradient(135deg, rgba(116,143,112,0.2), rgba(243,181,140,0.2))",
                  }}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${active ? "text-white" : "text-primary"}`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {item.icon}
                  </span>
                </div>
                <span
                  className={`text-[10px] leading-tight mt-0.5 font-bold ${
                    active ? "text-primary" : "text-on-surface-variant"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
                active ? "text-primary" : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <div className="relative">
                <span
                  className={`material-symbols-outlined text-[24px]`}
                  style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-primary text-on-primary text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center badge-pop">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] leading-tight mt-0.5 ${active ? "font-bold" : "font-medium"}`}>
                {item.label}
              </span>
              {active && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
