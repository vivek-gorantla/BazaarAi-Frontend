"use client";

import React from "react";
import Link from "next/link";
import { useWishlist } from "../../contexts/WishlistContext";
import { useCart } from "../../contexts/CartContext";

export default function CustomerWishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (item: (typeof wishlistItems)[0]) => {
    addToCart({
      id: item.id,
      title: item.title,
      price: item.price,
      originalPrice: item.originalPrice,
      weight: item.weight,
      image: item.image,
      storeName: item.storeName,
      quantity: 1
    });
    removeFromWishlist(item.id);
  };

  const handleMoveAllToCart = () => {
    wishlistItems.forEach((item) => {
      addToCart({
        id: item.id,
        title: item.title,
        price: item.price,
        originalPrice: item.originalPrice,
        weight: item.weight,
        image: item.image,
        storeName: item.storeName,
        quantity: 1
      });
    });
    clearWishlist();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-surface-container-high">
        <div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">Your Wishlist</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Saved items from neighborhood stores ({wishlistItems.length} items)
          </p>
        </div>

        {wishlistItems.length > 0 && (
          <button
            type="button"
            onClick={handleMoveAllToCart}
            className="px-6 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-full shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            <span>Move All to Cart</span>
          </button>
        )}
      </div>

      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container rounded-3xl p-4 border border-surface-container-high shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group"
            >
              <button
                type="button"
                onClick={() => removeFromWishlist(item.id)}
                className="absolute top-6 right-6 z-10 w-8 h-8 rounded-full bg-surface-container/80 backdrop-blur-md flex items-center justify-center text-error hover:bg-error-container transition-colors shadow-xs cursor-pointer"
                title="Remove from Wishlist"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>

              <div>
                <div className="w-full aspect-square rounded-2xl bg-surface-container mb-4 overflow-hidden relative flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-primary/40">favorite</span>
                  )}
                </div>

                <span className="text-[11px] font-bold text-primary uppercase tracking-wider block mb-1">
                  {item.storeName}
                </span>

                <h4 className="font-bold text-sm text-on-surface line-clamp-2 mb-1">{item.title}</h4>
                {item.weight && <p className="text-xs text-on-surface-variant mb-3">{item.weight}</p>}
              </div>

              <div className="pt-3 border-t border-surface-container-high flex items-center justify-between mt-4">
                <div className="flex flex-col">
                  {item.originalPrice && (
                    <span className="text-[11px] text-on-surface-variant line-through opacity-60">
                      ₹{item.originalPrice}
                    </span>
                  )}
                  <span className="font-bold text-base text-primary">₹{item.price}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleMoveToCart(item)}
                  className="px-4 py-2 bg-primary text-on-primary font-bold text-xs rounded-full shadow-xs hover:bg-primary-container transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                  Move to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface-container-low rounded-3xl p-12 text-center flex flex-col items-center justify-center border border-surface-container-high min-h-[50vh]">
          <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-primary/40 mb-4">
            <span className="material-symbols-outlined text-4xl">favorite_border</span>
          </div>
          <h3 className="font-headline-md text-xl font-bold text-on-surface mb-1">Your Wishlist is Empty</h3>
          <p className="text-xs text-on-surface-variant max-w-sm mb-6">
            Tap the heart icon on any product to save it to your wishlist for later.
          </p>
          <Link
            href="/customer"
            className="px-8 py-3 bg-primary text-on-primary font-bold text-xs rounded-full shadow-md"
          >
            Explore Products
          </Link>
        </div>
      )}
    </div>
  );
}
