"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/WishlistContext";

const PRIMARY = "#748F70";
const SURFACE = "#141A15";
const SURFACE_C = "#1A231C";
const SURFACE_CH = "#243026";
const ON_SURFACE = "#F2F7F2";
const ON_SURFACE_VAR = "#C2D6C0";

export interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  weight?: string;
  image?: string;
  storeName: string;
  rating?: number;
  discountBadge?: string;
  inStock?: boolean;
}

export function ProductCard(props: ProductCardProps) {
  const { id, title, price, originalPrice, weight, image, storeName, rating, discountBadge } = props;
  const { addToCart, cartItems } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [addedAnimation, setAddedAnimation] = useState(false);
  const inWishlist = isInWishlist(id);
  const existingInCart = cartItems.find(item => item.id === id || item.productId === id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ id, title, price, originalPrice, weight, image, storeName, quantity: 1 });
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist({ id, title, price, originalPrice, weight, image, storeName, rating });
  };

  const discountPercent = discountBadge || (originalPrice && originalPrice > price
    ? `${Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF`
    : null);

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      background: SURFACE_C, borderRadius: 24,
      border: `1px solid ${SURFACE_CH}`, overflow: "hidden",
      transition: "transform .3s ease, box-shadow .3s ease",
      position: "relative"
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,.4), 0 4px 16px ${PRIMARY}20`;
        e.currentTarget.style.borderColor = `${PRIMARY}50`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = SURFACE_CH;
      }}
    >
      {/* Discount badge */}
      {discountPercent && (
        <div style={{
          position: "absolute", top: 12, left: 12, zIndex: 5,
          background: "linear-gradient(135deg, #ef4444, #f97316)",
          color: "#fff", fontSize: 10, fontWeight: 800,
          padding: "4px 10px", borderRadius: 999,
          boxShadow: "0 4px 12px rgba(239,68,68,.4)"
        }}>
          {discountPercent}
        </div>
      )}

      {/* Wishlist button */}
      <button type="button" onClick={handleWishlist}
        style={{
          position: "absolute", top: 12, right: 12, zIndex: 5,
          width: 34, height: 34, borderRadius: "50%",
          background: "rgba(20,26,21,.8)", backdropFilter: "blur(8px)",
          border: `1px solid ${SURFACE_CH}`, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform .2s", fontFamily: "inherit"
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.15)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "none")}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: inWishlist ? "#f87171" : ON_SURFACE_VAR, fontVariationSettings: inWishlist ? "'FILL' 1" : "'FILL' 0" }}>
          favorite
        </span>
      </button>

      {/* Image */}
      <Link href={`/customer/products/${id}`} style={{ display: "block", textDecoration: "none" }}>
        <div style={{ width: "100%", aspectRatio: "1", background: SURFACE_CH, overflow: "hidden", position: "relative" }}>
          {image ? (
            <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .6s ease" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "none")}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: `${ON_SURFACE_VAR}30` }}>grocery</span>
            </div>
          )}
          {/* gradient overlay */}
          <div style={{ position: "absolute", bottom: 0, inset: "auto 0 0", height: 48, background: "linear-gradient(to top, rgba(26,35,28,.7), transparent)", pointerEvents: "none" }} />
        </div>
      </Link>

      {/* Info */}
      <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: `${PRIMARY}cc`, textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 3 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>store</span>
          {storeName}
        </span>

        <Link href={`/customer/products/${id}`} style={{ textDecoration: "none" }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: ON_SURFACE, lineHeight: 1.35, WebkitLineClamp: 2, overflow: "hidden", display: "-webkit-box", WebkitBoxOrient: "vertical" as any }}>
            {title}
          </p>
        </Link>

        {weight && <p style={{ margin: 0, fontSize: 11, color: ON_SURFACE_VAR }}>{weight}</p>}

        {/* Price row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, gap: 8 }}>
          <div>
            {originalPrice && originalPrice > price && (
              <div style={{ fontSize: 11, color: `${ON_SURFACE_VAR}70`, textDecoration: "line-through" }}>₹{originalPrice}</div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: PRIMARY }}>₹{price}</span>
              {rating && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 2,
                  fontSize: 10, fontWeight: 700, color: ON_SURFACE,
                  background: SURFACE_CH, padding: "2px 6px", borderRadius: 6,
                  border: `1px solid ${SURFACE_CH}`
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 12, color: "#facc15", fontVariationSettings: "'FILL' 1" }}>star</span>
                  {rating}
                </span>
              )}
            </div>
          </div>

          <button type="button" onClick={handleAdd}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4,
              padding: "8px 14px", borderRadius: 999, flexShrink: 0,
              background: addedAnimation ? "rgba(74,222,128,.15)" : existingInCart ? `${PRIMARY}25` : PRIMARY,
              color: addedAnimation ? "#4ade80" : existingInCart ? PRIMARY : "#fff",
              border: `1px solid ${addedAnimation ? "rgba(74,222,128,.4)" : existingInCart ? `${PRIMARY}40` : PRIMARY}`,
              fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .2s",
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              {addedAnimation ? "check" : existingInCart ? "shopping_cart" : "add"}
            </span>
            <span>{addedAnimation ? "Added!" : existingInCart ? `${existingInCart.quantity}` : "Add"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
