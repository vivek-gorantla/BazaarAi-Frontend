"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PRIMARY = "#748F70";
const SECONDARY = "#F3B58C";
const SURFACE = "#141A15";
const SURFACE_CH = "#243026";
const ON_SURFACE = "#F2F7F2";
const ON_SURFACE_VAR = "#C2D6C0";

export function CustomerNavbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/customer", exact: true },
    { name: "Discover", href: "/customer/discover" },
    { name: "Search", href: "/customer/search" },
    { name: "Stores", href: "/customer/stores" },
    { name: "Offers", href: "/customer/offers" },
    { name: "Help & Support", href: "/customer/help" },
  ];

  const isActive = (link: { href: string; exact?: boolean }) =>
    link.exact ? pathname === link.href || pathname === "/customer/" : pathname.startsWith(link.href);

  const isChatActive = pathname === "/customer/chat";

  return (
    <div style={{
      background: "rgba(20,26,21,.95)", borderBottom: `1px solid ${SURFACE_CH}`,
      position: "sticky", top: 80, zIndex: 40, backdropFilter: "blur(12px)"
    }}
      className="hidden md:block"
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
        <nav style={{ height: 48, display: "flex", alignItems: "center", gap: 4, overflowX: "auto", scrollbarWidth: "none" }}>
          {navLinks.map(link => {
            const active = isActive(link);
            return (
              <Link key={link.href} href={link.href}
                style={{
                  height: "100%", display: "flex", alignItems: "center", padding: "0 14px",
                  fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", textDecoration: "none",
                  color: active ? PRIMARY : ON_SURFACE_VAR,
                  position: "relative", transition: "color .2s"
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = ON_SURFACE; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = ON_SURFACE_VAR; }}
              >
                {link.name}
                {active && (
                  <span style={{
                    position: "absolute", bottom: 0, left: 10, right: 10, height: 2, borderRadius: 2,
                    background: `linear-gradient(90deg, ${PRIMARY}, ${SECONDARY})`
                  }} />
                )}
              </Link>
            );
          })}

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: SURFACE_CH, margin: "0 8px", flexShrink: 0 }} />

          {/* AI Shop pill */}
          <Link href="/customer/chat"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 16px", borderRadius: 999, fontWeight: 700, fontSize: 12,
              textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0, transition: "all .2s",
              background: isChatActive
                ? `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`
                : `${PRIMARY}18`,
              color: isChatActive ? "#fff" : PRIMARY,
              border: `1px solid ${isChatActive ? "transparent" : `${PRIMARY}40`}`,
              boxShadow: isChatActive ? `0 4px 16px ${PRIMARY}50` : "none"
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            AI Shop
          </Link>
        </nav>
      </div>
    </div>
  );
}
