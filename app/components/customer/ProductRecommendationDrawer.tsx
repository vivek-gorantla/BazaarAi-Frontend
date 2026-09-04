"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../contexts/CartContext";

const PRIMARY = "#748F70";
const SECONDARY = "#F3B58C";
const SURFACE = "#141A15";
const SURFACE_C = "#1A231C";
const SURFACE_CH = "#243026";
const SURFACE_CHH = "#2E3D30";
const ON_SURFACE = "#F2F7F2";
const ON_SURFACE_VAR = "#C2D6C0";

export interface RecommendedProduct {
  id: string;
  name: string;
  price: number;
  unit?: string;
  image?: string;
  storeName?: string;
  storeId?: string;
  category?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  products: RecommendedProduct[];
}

function ProductTile({ product, onAdded }: { product: RecommendedProduct; onAdded?: () => void }) {
  const { addToCart, cartItems } = useCart();
  const [added, setAdded] = useState(false);
  const inCart = cartItems.find(i => i.id === product.id || i.productId === product.id);

  const handleAdd = () => {
    addToCart({
      id: product.id,
      productId: product.id,
      title: product.name,
      price: product.price,
      image: product.image,
      storeName: product.storeName ?? "Nearby Store",
      weight: product.unit,
    });
    setAdded(true);
    onAdded?.();
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      background: SURFACE_C, borderRadius: 20,
      border: `1px solid ${SURFACE_CH}`, overflow: "hidden",
      transition: "transform .25s ease, box-shadow .25s ease"
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,.4)`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Image */}
      <div style={{ width: "100%", aspectRatio: "1", background: SURFACE_CH, position: "relative", overflow: "hidden" }}>
        {product.image ? (
          <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: `${ON_SURFACE_VAR}40` }}>grocery</span>
          </div>
        )}
        {product.category && (
          <span style={{
            position: "absolute", top: 8, left: 8,
            background: "rgba(20,26,21,.85)", backdropFilter: "blur(8px)",
            color: PRIMARY, fontSize: 10, fontWeight: 700,
            padding: "3px 8px", borderRadius: 999,
            border: `1px solid ${PRIMARY}30`
          }}>
            {product.category}
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {product.storeName && (
          <span style={{ fontSize: 10, fontWeight: 700, color: PRIMARY, textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 3 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>store</span>
            {product.storeName}
          </span>
        )}
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: ON_SURFACE, lineHeight: 1.35, WebkitLineClamp: 2, overflow: "hidden", display: "-webkit-box", WebkitBoxOrient: "vertical" as any }}>
          {product.name}
        </p>
        {product.unit && <p style={{ margin: 0, fontSize: 11, color: ON_SURFACE_VAR }}>{product.unit}</p>}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: PRIMARY }}>₹{product.price}</span>
          <button type="button" onClick={handleAdd}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "6px 12px", borderRadius: 999,
              background: added ? "rgba(74,222,128,.15)" : inCart ? `${PRIMARY}25` : PRIMARY,
              color: added ? "#4ade80" : inCart ? PRIMARY : "#fff",
              border: `1px solid ${added ? "rgba(74,222,128,.4)" : inCart ? `${PRIMARY}40` : PRIMARY}`,
              fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all .2s",
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{added ? "check" : inCart ? "shopping_cart" : "add"}</span>
            {added ? "Added!" : inCart ? `${inCart.quantity} in cart` : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductRecommendationDrawer({ open, onClose, products }: Props) {
  const { itemCount } = useCart();
  const [addedCount, setAddedCount] = useState(0);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(0,0,0,.65)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div key="drawer"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 80,
              display: "flex", flexDirection: "column",
              background: SURFACE, borderTop: `1px solid ${SURFACE_CH}`,
              borderRadius: "28px 28px 0 0",
              boxShadow: "0 -20px 60px rgba(0,0,0,.5)",
              maxHeight: "85vh"
            }}
          >
            {/* Drag handle */}
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
              <div style={{ width: 40, height: 4, borderRadius: 4, background: SURFACE_CHH }} />
            </div>

            {/* Header */}
            <div style={{
              flexShrink: 0, padding: "12px 20px 16px",
              borderBottom: `1px solid ${SURFACE_CH}`,
              background: SURFACE_C
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 4px 16px ${PRIMARY}40`
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#fff", fontVariationSettings: "'FILL' 1" }}>shopping_basket</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: ON_SURFACE }}>Recommended For You</div>
                    <div style={{ fontSize: 12, color: ON_SURFACE_VAR }}>{products.length} products · curated by AI</div>
                  </div>
                </div>

                <button type="button" onClick={onClose}
                  style={{
                    width: 36, height: 36, borderRadius: 10, background: SURFACE_CH,
                    border: `1px solid ${SURFACE_CHH}`, display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: ON_SURFACE_VAR, fontFamily: "inherit"
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                </button>
              </div>

              {/* Badges */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "#4ade80", background: "rgba(74,222,128,.1)", border: "1px solid rgba(74,222,128,.25)", padding: "4px 10px", borderRadius: 999 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>bolt</span>
                  AI-curated picks
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: PRIMARY, background: `${PRIMARY}15`, border: `1px solid ${PRIMARY}30`, padding: "4px 10px", borderRadius: 999 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>store</span>
                  Local stores only
                </span>
                {addedCount > 0 && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: SECONDARY, background: `${SECONDARY}15`, border: `1px solid ${SECONDARY}30`, padding: "4px 10px", borderRadius: 999 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>check_circle</span>
                    {addedCount} added
                  </span>
                )}
              </div>
            </div>

            {/* Product grid */}
            <div style={{ flex: 1, overflowY: "auto", padding: 16, scrollbarWidth: "thin", scrollbarColor: `${SURFACE_CH} transparent` }}>
              {products.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: 12, color: ON_SURFACE_VAR }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 40, opacity: 0.3 }}>search_off</span>
                  <p style={{ margin: 0, fontSize: 14 }}>No products to show</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
                  {products.map(product => (
                    <ProductTile key={product.id} product={product} onAdded={() => setAddedCount(c => c + 1)} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ flexShrink: 0, padding: "14px 16px", borderTop: `1px solid ${SURFACE_CH}`, background: SURFACE_C, display: "flex", gap: 12 }}>
              <Link href="/customer/cart" onClick={onClose}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "14px", borderRadius: 16, fontWeight: 700, fontSize: 14,
                  background: PRIMARY, color: "#fff", textDecoration: "none",
                  boxShadow: `0 4px 20px ${PRIMARY}40`
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>shopping_cart</span>
                View Cart {itemCount > 0 && `(${itemCount})`}
              </Link>
              <button type="button" onClick={onClose}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "14px 20px", borderRadius: 16, fontWeight: 600, fontSize: 14,
                  background: SURFACE_CH, color: ON_SURFACE_VAR, border: `1px solid ${SURFACE_CHH}`,
                  cursor: "pointer", fontFamily: "inherit"
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chat</span>
                Chat
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
