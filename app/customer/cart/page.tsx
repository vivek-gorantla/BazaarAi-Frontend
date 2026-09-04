"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../../contexts/CartContext";

export default function CustomerCartPage() {
  const router = useRouter();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryFee,
    discount,
    taxAmount,
    grandTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [deliveryNote, setDeliveryNote] = useState("");

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const success = applyCoupon(couponInput);
    if (success) {
      setCouponMsg({ text: `Coupon ${couponInput.toUpperCase()} applied successfully!`, isError: false });
      setCouponInput("");
    } else {
      setCouponMsg({ text: "Invalid coupon code. Try WELCOME100 or BAZAAR50", isError: true });
    }
  };

  const freeDeliveryThreshold = 500;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 flex flex-col items-center justify-center text-center min-h-[60vh]">
        <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center text-primary/40 mb-6">
          <span className="material-symbols-outlined text-5xl">shopping_bag</span>
        </div>
        <h2 className="font-headline-lg text-2xl font-bold text-on-surface mb-2">Your Cart is Empty</h2>
        <p className="text-sm text-on-surface-variant max-w-sm mb-8">
          Explore local stores, sweet shops, and artisan bakeries nearby to add daily essentials to your cart.
        </p>
        <Link
          href="/customer"
          className="px-8 py-3.5 bg-primary text-on-primary font-bold text-sm rounded-full shadow-md hover:bg-primary-container transition-all"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 min-h-screen">
      <div className="mb-8">
        <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">Your Shopping Cart</h1>
        <p className="text-sm text-on-surface-variant mt-1">Review items from neighborhood stores before checkout</p>
      </div>

      {/* Free Delivery Banner */}
      <div className="mb-8 p-4 bg-tertiary-fixed/30 border border-tertiary-fixed rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[20px]">local_shipping</span>
          </div>
          <div>
            <p className="font-bold text-sm text-on-tertiary-fixed">
              {remainingForFreeDelivery === 0
                ? "🎉 You've unlocked FREE Express Delivery!"
                : `Add ₹${remainingForFreeDelivery} more to get FREE Express Delivery!`}
            </p>
            <div className="w-full sm:w-64 bg-surface-container/60 h-2 rounded-full overflow-hidden mt-1.5 border border-tertiary-fixed">
              <div
                className="bg-tertiary h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
        {remainingForFreeDelivery > 0 && (
          <Link
            href="/customer/search"
            className="text-xs font-bold text-tertiary hover:underline flex items-center gap-1 flex-shrink-0"
          >
            Add More Items
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container rounded-3xl p-6 border border-surface-container-high shadow-xs">
            <h3 className="font-headline-md text-base font-bold text-on-surface mb-6 flex items-center justify-between">
              <span>Items ({cartItems.length})</span>
              <span className="text-xs font-normal text-on-surface-variant">Grouped by store</span>
            </h3>

            <div className="divide-y divide-surface-container-high">
              {cartItems.map((item) => (
                <div key={item.id} className="py-5 first:pt-0 last:pb-0 flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-2xl bg-surface-container overflow-hidden flex-shrink-0 border border-surface-container-high">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary/40">
                        <span className="material-symbols-outlined text-2xl">shopping_bag</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                      {item.storeName}
                    </span>
                    <h4 className="font-semibold text-sm text-on-surface truncate">{item.title}</h4>
                    {item.weight && <p className="text-xs text-on-surface-variant mt-0.5">{item.weight}</p>}

                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-bold text-base text-primary">₹{item.price * item.quantity}</span>
                      {item.originalPrice && (
                        <span className="text-xs text-on-surface-variant line-through opacity-60">
                          ₹{item.originalPrice * item.quantity}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Adjustment Controls */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-surface-container-high bg-surface-container-low rounded-full px-2 py-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">remove</span>
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-on-surface">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 rounded-full hover:bg-error-container/20 text-on-surface-variant hover:text-error flex items-center justify-center transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Note Box */}
          <div className="bg-surface-container rounded-3xl p-6 border border-surface-container-high shadow-xs">
            <h4 className="font-bold text-sm text-on-surface mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">edit_note</span>
              Delivery Instructions for Rider
            </h4>
            <input
              type="text"
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              placeholder="e.g. Leave at front door, don't ring doorbell..."
              className="w-full h-11 px-4 bg-surface-container-low border border-surface-container-high rounded-2xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Summary Column */}
        <div className="space-y-6 lg:sticky lg:top-36">
          {/* Coupon Code Card */}
          <div className="bg-surface-container rounded-3xl p-6 border border-surface-container-high shadow-xs">
            <h4 className="font-bold text-sm text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">local_offer</span>
              Coupons & Promos
            </h4>

            {appliedCoupon ? (
              <div className="bg-tertiary-fixed/30 border border-tertiary-fixed p-3.5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-tertiary font-mono">{appliedCoupon.code}</p>
                  <p className="text-[11px] text-on-surface-variant">{appliedCoupon.description}</p>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs font-bold text-error hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter code (e.g. WELCOME100)"
                  className="flex-1 h-10 px-3 bg-surface-container-low border border-surface-container-high rounded-full text-xs font-mono uppercase text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="px-5 h-10 bg-primary text-on-primary font-bold text-xs rounded-full hover:bg-primary-container transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>
            )}

            {couponMsg && (
              <p
                className={`text-xs mt-2 font-medium ${
                  couponMsg.isError ? "text-error" : "text-tertiary"
                }`}
              >
                {couponMsg.text}
              </p>
            )}
          </div>

          {/* Bill Summary */}
          <div className="bg-surface-container rounded-3xl p-6 border border-surface-container-high shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-on-surface mb-4">Bill Summary</h4>

            <div className="flex justify-between text-xs text-on-surface-variant">
              <span>Item Subtotal</span>
              <span className="font-semibold text-on-surface">₹{subtotal}</span>
            </div>

            <div className="flex justify-between text-xs text-on-surface-variant">
              <span>Delivery Fee</span>
              <span>
                {deliveryFee === 0 ? (
                  <span className="text-tertiary font-bold">FREE</span>
                ) : (
                  <span className="font-semibold text-on-surface">₹{deliveryFee}</span>
                )}
              </span>
            </div>

            <div className="flex justify-between text-xs text-on-surface-variant">
              <span>Taxes & Partner Fee</span>
              <span className="font-semibold text-on-surface">₹{taxAmount}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-xs text-tertiary font-medium">
                <span>Coupon Discount</span>
                <span className="font-bold">-₹{discount}</span>
              </div>
            )}

            <div className="border-t border-surface-container-high pt-3 flex justify-between items-center font-bold text-base text-on-surface">
              <span>Grand Total</span>
              <span className="text-primary text-xl">₹{grandTotal}</span>
            </div>

            <button
              type="button"
              onClick={() => router.push("/customer/checkout")}
              className="w-full py-4 bg-primary text-on-primary font-bold text-sm rounded-full shadow-lg hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <span>Proceed to Checkout</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
