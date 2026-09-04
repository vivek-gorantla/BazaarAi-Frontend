"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { customerApi } from "../../services/customerApi";

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  weight?: string;
  image?: string;
  storeName: string;
  rating?: number;
  inStock?: boolean;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
}

const defaultWishlist: WishlistItem[] = [
  {
    id: "wish-1",
    title: "Organic Cold Pressed Virgin Coconut Oil",
    price: 450,
    originalPrice: 520,
    weight: "500 ml",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAuyPhhaVPCxg9ckGA7lC-5xKb_1wBLCkikqaFBsaSMEBlK6Mbk0M6dymW1LtRMrmsOfSd8sYUv_b2eaARvPZtFkTq_MuqBVixYgGAIX8BYz_olydyutn_kcWpyzG41OQKJqhcDijsHl30T10lLofr4no8C3faqlmINNrSB41zDWBbsuUhxsfDOI6ueh-0sKc737uPDU4o0hbLZq1cX_ijAm1bC2YkV7PWD2r1G0Et6Zzc8to1B8X8",
    storeName: "Sri Lakshmi Stores",
    rating: 4.9,
    inStock: true
  }
];

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("bazaar_customer_wishlist");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to load saved wishlist", e);
      }
    }
    return defaultWishlist;
  });

  // Sync with backend API on mount
  useEffect(() => {
    customerApi.getWishlist().then(items => {
      if (items && items.length > 0) {
        setWishlistItems(items);
      }
    });
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("bazaar_customer_wishlist", JSON.stringify(wishlistItems));
      } catch (e) {
        console.warn("Failed to persist wishlist", e);
      }
    }
  }, [wishlistItems]);

  const toggleWishlist = (item: WishlistItem) => {
    setWishlistItems(prev => {
      const exists = prev.some(i => i.id === item.id);
      if (exists) {
        customerApi.removeFromWishlist(item.id);
        return prev.filter(i => i.id !== item.id);
      }
      customerApi.addToWishlist(item);
      return [...prev, item];
    });
  };

  const isInWishlist = (id: string) => wishlistItems.some(i => i.id === id);

  const removeFromWishlist = (id: string) => {
    setWishlistItems(prev => prev.filter(i => i.id !== id));
    customerApi.removeFromWishlist(id);
  };

  const clearWishlist = () => setWishlistItems([]);

  return (
    <WishlistContext.Provider
      value={{ wishlistItems, toggleWishlist, isInWishlist, removeFromWishlist, clearWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
