"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ProductCard } from "../components/customer/ProductCard";
import { StoreCard } from "../components/customer/StoreCard";
import { customerApi, HomeData } from "../../services/customerApi";

/* ── Palette Tokens ── */
const PRIMARY = "#748F70";
const SECONDARY = "#F3B58C";
const SURFACE = "#141A15";
const SURFACE_C = "#1A231C";
const SURFACE_CH = "#243026";
const SURFACE_CHH = "#2E3D30";
const ON_SURFACE = "#F2F7F2";
const ON_SURFACE_VAR = "#C2D6C0";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const } }
};

const DEFAULT_CATS = [
  { name: "Groceries", icon: "shopping_basket", desc: "Staples & Essentials" },
  { name: "Fresh Produce", icon: "nutrition", desc: "Farm Vegetables & Fruits" },
  { name: "Dairy & Milk", icon: "water_drop", desc: "Fresh Milk & Paneer" },
  { name: "Snacks", icon: "cookie", desc: "Namkeen & Munchies" },
  { name: "Beverages", icon: "local_cafe", desc: "Tea, Coffee & Juices" },
  { name: "Personal Care", icon: "spa", desc: "Soaps & Hygiene" },
  { name: "Bakery", icon: "bakery_dining", desc: "Breads & Cakes" },
];

const HIGHLIGHT_FEATURES = [
  { icon: "bolt", title: "20-Min Delivery", desc: "Direct from your neighborhood merchants" },
  { icon: "verified", title: "100% Verified Stores", desc: "Trusted local merchants & artisans" },
  { icon: "auto_awesome", title: "AI Voice Shopper", desc: "Order naturally in English or Hindi" },
  { icon: "radar", title: "Distance Radius Map", desc: "Discover nearby hidden gems" }
];

export default function CustomerHomePage() {
  const catScrollRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    customerApi.getHomeData().then((res) => {
      if (alive) {
        setData(res);
        setLoading(false);
      }
    });
    return () => { alive = false; };
  }, []);

  const scroll = (dir: "left" | "right") =>
    catScrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });

  const cats = data?.categories?.length ? data.categories : DEFAULT_CATS;

  return (
    <div style={{ background: SURFACE, minHeight: "100vh", color: ON_SURFACE, fontFamily: "'Outfit', sans-serif" }}>

      {/* ═══════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════ */}
      <section style={{ position: "relative", overflow: "hidden", paddingTop: 32, paddingBottom: 64 }}>
        
        {/* Glow Effects */}
        <div style={{
          position: "absolute", top: -140, right: -60, width: 650, height: 650,
          background: `radial-gradient(circle, ${PRIMARY}30 0%, transparent 65%)`,
          borderRadius: "50%", pointerEvents: "none", filter: "blur(40px)"
        }} />
        <div style={{
          position: "absolute", bottom: -100, left: -80, width: 550, height: 550,
          background: `radial-gradient(circle, ${SECONDARY}22 0%, transparent 65%)`,
          borderRadius: "50%", pointerEvents: "none", filter: "blur(40px)"
        }} />
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.02,
          backgroundImage: `linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)`,
          backgroundSize: "40px 40px"
        }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 40px 0", display: "flex", gap: 56, alignItems: "center", flexWrap: "wrap", position: "relative", zIndex: 1 }}>

          {/* LEFT: Copy & CTAs */}
          <motion.div
            initial={{ opacity: 0, x: -36 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
            style={{ flex: "1 1 420px", display: "flex", flexDirection: "column", gap: 24 }}
          >
            {/* Pill Tag */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "8px 18px", borderRadius: 999,
              border: `1px solid ${PRIMARY}66`, background: `rgba(116,143,112,0.12)`,
              color: PRIMARY, fontWeight: 700, fontSize: 13, letterSpacing: "0.04em",
              alignSelf: "flex-start", boxShadow: `0 4px 20px ${PRIMARY}20`
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: SECONDARY, fontVariationSettings: "'FILL' 1" }}>eco</span>
              Hyperlocal Community Bazaar · Hyderabad
            </div>

            {/* Main Headline */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <h1 style={{ margin: 0, fontSize: "clamp(46px, 6vw, 76px)", fontWeight: 900, lineHeight: 0.96, letterSpacing: "-0.03em", color: ON_SURFACE }}>
                Fresh Local,
              </h1>
              <h1 style={{
                margin: 0, fontSize: "clamp(46px, 6vw, 76px)", fontWeight: 900, lineHeight: 0.96, letterSpacing: "-0.03em",
                background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 55%, #FFFFFF 100%)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
              }}>
                Delivered Green.
              </h1>
            </div>

            <p style={{ margin: 0, fontSize: 16, color: ON_SURFACE_VAR, lineHeight: 1.6, maxWidth: 460 }}>
              {data?.hero.subtitle || "Order daily essentials, fresh produce, and artisan goods from trusted neighborhood merchants and sweet shops near you — delivered in under 20 minutes."}
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", paddingTop: 8 }}>
              <Link href="/customer/stores" style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "16px 32px", borderRadius: 18, fontWeight: 700, fontSize: 15,
                background: PRIMARY, color: "#fff", textDecoration: "none",
                boxShadow: `0 10px 32px ${PRIMARY}55`, transition: "all .25s ease",
                border: "1px solid rgba(255,255,255,0.15)"
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px ${PRIMARY}75`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = `0 10px 32px ${PRIMARY}55`; }}
              >
                {data?.hero.ctaText || "Explore Nearby Stores"}
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
              </Link>

              <Link href="/customer/chat" style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "16px 30px", borderRadius: 18, fontWeight: 700, fontSize: 15,
                background: `rgba(116,143,112,0.14)`, color: PRIMARY, textDecoration: "none",
                border: `1px solid ${PRIMARY}55`, transition: "all .25s ease",
                backdropFilter: "blur(10px)"
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `rgba(116,143,112,0.25)`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `rgba(116,143,112,0.14)`; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                AI Voice Shopper
              </Link>
            </div>

            {/* Quick Stats Strip */}
            <div style={{ display: "flex", gap: 36, paddingTop: 20, borderTop: `1px solid ${SURFACE_CH}` }}>
              {[
                ["2,400+", "Local Merchants"],
                ["18 Min", "Avg Delivery"],
                ["4.9★", "Neighborhood Rating"]
              ].map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: PRIMARY, letterSpacing: "-0.02em" }}>{val}</div>
                  <div style={{ fontSize: 12, color: ON_SURFACE_VAR, marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT: Green Hero Banner Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            style={{ flex: "1 1 420px", position: "relative", minHeight: 420 }}
          >
            <div style={{
              borderRadius: 36, overflow: "hidden", height: 480,
              boxShadow: `0 30px 90px rgba(0,0,0,.65), 0 0 40px ${PRIMARY}25`,
              border: `1px solid ${PRIMARY}40`, position: "relative"
            }}>
              <img
                src="/images/green_hero_market.png"
                alt="Green Vibe Local Vendor Store"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(20,26,21,0.7) 0%, transparent 60%)" }} />
            </div>

            {/* Floating Badge 1 (Express Delivery) */}
            <motion.div
              animate={{ y: [0, -8, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute", bottom: 20, left: -20,
                background: "rgba(20,26,21,0.92)", backdropFilter: "blur(14px)",
                borderRadius: 20, padding: "14px 18px", display: "flex", gap: 12, alignItems: "center",
                border: `1px solid ${PRIMARY}55`, boxShadow: "0 20px 50px rgba(0,0,0,.5)"
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 14, background: `${PRIMARY}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: PRIMARY, fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: ON_SURFACE }}>Express Delivery</div>
                <div style={{ fontSize: 11, color: PRIMARY, fontWeight: 700 }}>⚡ Arrives in 18 mins</div>
              </div>
            </motion.div>

            {/* Floating Badge 2 (Top Rated) */}
            <motion.div
              animate={{ y: [0, 8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              style={{
                position: "absolute", top: 20, right: -20,
                background: "rgba(20,26,21,0.92)", backdropFilter: "blur(14px)",
                borderRadius: 20, padding: "12px 18px", display: "flex", gap: 10, alignItems: "center",
                border: `1px solid ${SECONDARY}55`, boxShadow: "0 20px 50px rgba(0,0,0,.5)"
              }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 12, background: `rgba(243,181,140,0.2)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: SECONDARY, fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: ON_SURFACE }}>Top Rated</div>
                <div style={{ fontSize: 11, color: ON_SURFACE_VAR }}>4.9 · 50k+ orders</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          WHY BAZAAR — 4 FEATURE STRIP
      ═══════════════════════════════════════ */}
      <section style={{ maxWidth: 1280, margin: "0 auto 72px", padding: "0 40px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16,
          padding: 24, borderRadius: 28, background: SURFACE_C, border: `1px solid ${SURFACE_CH}`
        }}>
          {HIGHLIGHT_FEATURES.map((feat) => (
            <div key={feat.title} style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{
                width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                background: `rgba(116,143,112,0.18)`, border: `1px solid ${PRIMARY}40`,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: PRIMARY, fontVariationSettings: "'FILL' 1" }}>{feat.icon}</span>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: ON_SURFACE }}>{feat.title}</div>
                <div style={{ fontSize: 12, color: ON_SURFACE_VAR, marginTop: 2 }}>{feat.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SHOP BY CATEGORY
      ═══════════════════════════════════════ */}
      <section style={{ maxWidth: 1280, margin: "0 auto 80px", padding: "0 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: PRIMARY, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Curated Curation</div>
            <h2 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: ON_SURFACE, letterSpacing: "-0.02em" }}>Shop by Category</h2>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["left", "right"].map(dir => (
              <button key={dir} onClick={() => scroll(dir as "left" | "right")}
                style={{
                  width: 44, height: 44, borderRadius: 14, border: `1px solid ${SURFACE_CH}`,
                  background: SURFACE_C, color: ON_SURFACE, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{dir === "left" ? "arrow_back" : "arrow_forward"}</span>
              </button>
            ))}
          </div>
        </div>

        <div ref={catScrollRef} style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
          {cats.map((cat, i) => (
            <Link key={cat.name} href={`/customer/search?category=${encodeURIComponent(cat.name)}`}
              style={{ textDecoration: "none", flexShrink: 0 }}
            >
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: 120,
                cursor: "pointer"
              }}
                onMouseEnter={e => {
                  const el = e.currentTarget.querySelector(".cat-icon-box") as HTMLElement;
                  if (el) { el.style.transform = "translateY(-6px)"; el.style.borderColor = PRIMARY; el.style.boxShadow = `0 12px 30px ${PRIMARY}40`; }
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget.querySelector(".cat-icon-box") as HTMLElement;
                  if (el) { el.style.transform = "none"; el.style.borderColor = SURFACE_CH; el.style.boxShadow = "none"; }
                }}
              >
                <div className="cat-icon-box" style={{
                  width: 96, height: 96, borderRadius: 26,
                  background: `linear-gradient(135deg, ${SURFACE_C}, ${SURFACE_CH})`,
                  border: `1px solid ${SURFACE_CH}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all .3s ease"
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 40, color: [PRIMARY, SECONDARY, "#a78bfa", "#60a5fa", "#34d399", "#f97316", PRIMARY][i % 7], fontVariationSettings: "'FILL' 1" }}>
                    {cat.icon}
                  </span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: ON_SURFACE, textAlign: "center", lineHeight: 1.3 }}>{cat.name}</span>
              </div>
            </Link>
          ))}

          {/* View All */}
          <Link href="/customer/search" style={{ textDecoration: "none", flexShrink: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: 120 }}>
              <div style={{
                width: 96, height: 96, borderRadius: 26,
                background: SURFACE_CH, border: `1px dashed ${PRIMARY}66`,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: PRIMARY }}>apps</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>View All</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          AI VOICE SHOPPER BANNER
      ═══════════════════════════════════════ */}
      <section style={{ maxWidth: 1280, margin: "0 auto 80px", padding: "0 40px" }}>
        <Link href="/customer/chat" style={{ textDecoration: "none" }}>
          <div style={{
            borderRadius: 32, padding: "36px 44px",
            background: `linear-gradient(135deg, ${SURFACE_C} 0%, rgba(116,143,112,0.22) 50%, rgba(243,181,140,0.15) 100%)`,
            border: `1px solid ${PRIMARY}55`,
            display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap",
            boxShadow: `0 12px 48px rgba(0,0,0,.45)`, cursor: "pointer",
            transition: "all .3s ease"
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.borderColor = PRIMARY; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.borderColor = `${PRIMARY}55`; }}
          >
            <div style={{
              width: 68, height: 68, borderRadius: 22, flexShrink: 0,
              background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 10px 30px ${PRIMARY}66`
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 34, color: "#fff", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: PRIMARY, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Bazaar AI Assistant</div>
              <h3 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: ON_SURFACE, letterSpacing: "-0.01em" }}>Shop Naturally with Voice & AI</h3>
              <p style={{ margin: "6px 0 0", fontSize: 15, color: ON_SURFACE_VAR, lineHeight: 1.5 }}>Just speak your shopping list — AI finds nearby stores, checks prices, and adds items directly to your cart.</p>
            </div>

            <div style={{
              flexShrink: 0, display: "flex", alignItems: "center", gap: 10,
              padding: "16px 28px", borderRadius: 16, fontWeight: 800, fontSize: 14,
              background: PRIMARY, color: "#fff", boxShadow: `0 6px 24px ${PRIMARY}66`
            }}>
              Launch AI Shopper
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
            </div>
          </div>
        </Link>
      </section>

      {/* ═══════════════════════════════════════
          STORES NEAR YOU
      ═══════════════════════════════════════ */}
      <section style={{ maxWidth: 1280, margin: "0 auto 80px", padding: "0 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: PRIMARY, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Local Merchants</div>
            <h2 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: ON_SURFACE, letterSpacing: "-0.02em" }}>Neighborhood Stores</h2>
          </div>
          <Link href="/customer/stores" style={{ display: "flex", alignItems: "center", gap: 6, color: PRIMARY, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
            View Map & All Stores
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
          </Link>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 260, borderRadius: 28, background: SURFACE_C, animation: "shimmer 1.4s ease infinite" }} />
            ))}
          </div>
        ) : (
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}
          >
            {data?.nearbyStores.map(store => (
              <motion.div key={store.id} variants={fadeUp}>
                <StoreCard {...store} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* ═══════════════════════════════════════
          FRESH FINDS
      ═══════════════════════════════════════ */}
      <section style={{ maxWidth: 1280, margin: "0 auto 80px", padding: "0 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: PRIMARY, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Direct From Local Vendors</div>
          <h2 style={{ margin: 0, fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, color: ON_SURFACE, letterSpacing: "-0.02em" }}>Fresh Finds Near You</h2>
          <p style={{ margin: "8px 0 0", fontSize: 15, color: ON_SURFACE_VAR }}>Handpicked products from local merchants in your immediate vicinity</p>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ aspectRatio: "3/4", borderRadius: 28, background: SURFACE_C, animation: "shimmer 1.4s ease infinite" }} />
            ))}
          </div>
        ) : (
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}
          >
            {data?.freshFinds.map(prod => (
              <motion.div key={prod.id} variants={fadeUp}>
                <ProductCard {...prod} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* ═══════════════════════════════════════
          COMMUNITY & MERCHANT BANNER
      ═══════════════════════════════════════ */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px 80px" }}>
        <div style={{
          borderRadius: 40, padding: "56px 64px",
          background: `linear-gradient(135deg, ${SURFACE_C} 0%, rgba(36,48,38,0.95) 100%)`,
          border: `1px solid ${SURFACE_CH}`,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.05), 0 32px 80px rgba(0,0,0,.45)",
          display: "flex", gap: 48, alignItems: "center", flexWrap: "wrap",
          position: "relative", overflow: "hidden"
        }}>
          <div style={{ position: "absolute", right: -64, top: -64, width: 300, height: 300, borderRadius: "50%", background: `${SECONDARY}15`, filter: "blur(60px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", right: 120, bottom: -40, width: 200, height: 200, borderRadius: "50%", background: `${PRIMARY}18`, filter: "blur(40px)", pointerEvents: "none" }} />

          <div style={{ flex: 1, minWidth: 260, position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 800, color: SECONDARY, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>favorite</span>
              Community First & Empowering Local Merchants
            </div>
            <h2 style={{ margin: 0, fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, color: ON_SURFACE, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
              Loved by your local<br />neighborhood.
            </h2>
            <p style={{ margin: "16px 0 0", fontSize: 15, color: ON_SURFACE_VAR, lineHeight: 1.6, maxWidth: 460 }}>
              Support local vendors, sweet shops, and bakers while enjoying instant 20-minute delivery. The authentic Indian street market experience — digitised for your convenience.
            </p>
          </div>

          <div style={{ flexShrink: 0, position: "relative" }}>
            <Link href="/customer/discover" style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "18px 36px", borderRadius: 20, fontWeight: 800, fontSize: 15,
              background: PRIMARY, color: "#fff", textDecoration: "none",
              boxShadow: `0 14px 40px ${PRIMARY}66`, border: "1px solid rgba(255,255,255,0.15)"
            }}>
              Discover Stories & Offers
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
            </Link>
            <div style={{ marginTop: 12, fontSize: 12, color: ON_SURFACE_VAR, textAlign: "center", fontWeight: 600 }}>Join 50,000+ happy neighborhood shoppers</div>
          </div>
        </div>
      </section>
    </div>
  );
}
