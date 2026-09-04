"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { customerApi } from "../../services/customerApi";

export interface CartItem {
  id: string;
  productId?: string;
  title: string;
  price: number;
  originalPrice?: number;
  weight?: string;
  image?: string;
  storeName: string;
  quantity: number;
}

export interface Coupon {
  code: string;
  discountPercentage?: number;
  discountAmount?: number;
  description: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  taxAmount: number;
  grandTotal: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/** Maps raw Prisma cart rows (with nested product/store) to CartItem shape */
function mapCartRow(raw: any): CartItem {
  return {
    id: raw.id ?? raw.productId ?? String(Math.random()),
    productId: raw.productId,
    title: raw.product?.name ?? raw.title ?? "Unknown Item",
    price: Number(raw.product?.price ?? raw.price ?? 0),
    originalPrice: raw.product?.originalPrice
      ? Number(raw.product.originalPrice)
      : raw.originalPrice
      ? Number(raw.originalPrice)
      : undefined,
    weight: raw.product?.unit ?? raw.weight,
    image: raw.product?.imageUrl ?? raw.image,
    storeName: raw.store?.name ?? raw.storeName ?? "Unknown Store",
    quantity: Number(raw.qty ?? raw.quantity ?? 1),
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("bazaar_customer_cart");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to load saved cart", e);
      }
    }
    return [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>({
    code: "BAZAAR100",
    discountAmount: 100,
    description: "₹100 Flat discount on neighborhood orders"
  });

  // Sync with backend — maps Prisma shape to CartItem shape
  const refreshCart = useCallback(async () => {
    try {
      const items = await customerApi.getCart();
      if (Array.isArray(items)) {
        const mapped = items.map(mapCartRow);
        setCartItems(mapped);
      }
    } catch (e) {
      console.error("Failed to refresh cart from API", e);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("bazaar_customer_cart", JSON.stringify(cartItems));
      } catch (e) {
        console.warn("Failed to persist cart", e);
      }
    }
  }, [cartItems]);

  const addToCart = (newItem: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === newItem.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += newItem.quantity || 1;
        return updated;
      }
      return [...prev, { ...newItem, quantity: newItem.quantity || 1 }];
    });
    // Fire-and-forget API call, then sync from DB to ensure accuracy
    customerApi.addToCart(newItem).then(() => refreshCart()).catch(() => {});
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    customerApi.removeFromCart(id);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev =>
      prev
        .map(item => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
    customerApi.updateCartQuantity(id, delta);
  };

  const clearCart = () => setCartItems([]);

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 500 || subtotal === 0 ? 0 : 25;

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountAmount) discount = appliedCoupon.discountAmount;
    else if (appliedCoupon.discountPercentage) discount = Math.round((subtotal * appliedCoupon.discountPercentage) / 100);
  }

  const taxAmount = Math.round(subtotal * 0.05);
  const grandTotal = Math.max(0, subtotal + deliveryFee + taxAmount - discount);

  const applyCoupon = (code: string) => {
    const formatted = code.trim().toUpperCase();
    if (formatted === "WELCOME50" || formatted === "BAZAAR50") {
      setAppliedCoupon({ code: formatted, discountAmount: 50, description: "₹50 Discount applied" });
      return true;
    }
    if (formatted === "BAZAAR100" || formatted === "FIRST100") {
      setAppliedCoupon({ code: formatted, discountAmount: 100, description: "₹100 Discount applied" });
      return true;
    }
    if (formatted === "FREEDEL") {
      setAppliedCoupon({ code: formatted, discountAmount: deliveryFee, description: "Free Delivery applied" });
      return true;
    }
    return false;
  };

  const removeCoupon = () => setAppliedCoupon(null);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        deliveryFee,
        discount,
        taxAmount,
        grandTotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
