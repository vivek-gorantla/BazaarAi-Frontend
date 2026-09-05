"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../contexts/CartContext";
import { useCustomerAuth } from "../../contexts/CustomerAuthContext";
import { customerApi } from "../../../services/customerApi";

const loadRazorpay = () => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CustomerCheckoutPage() {
  const router = useRouter();
  const { cartItems, grandTotal, clearCart } = useCart();
  const { isAuthenticated, openAuthModal } = useCustomerAuth();

  const [selectedAddress, setSelectedAddress] = useState("addr-1");
  const [deliverySlot, setDeliverySlot] = useState("instant");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const addresses = [
    {
      id: "addr-1",
      tag: "Home",
      name: "Vivek Sharma",
      line: "Flat 402, Royal Residency, Road No. 12",
      city: "Banjara Hills, Hyderabad, TS - 500034",
      phone: "+91 98765 43210"
    },
    {
      id: "addr-2",
      tag: "Work",
      name: "Vivek Sharma",
      line: "Building 4B, Mindspace IT Park",
      city: "Hitec City, Hyderabad, TS - 500081",
      phone: "+91 98765 43210"
    }
  ];

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      openAuthModal("/customer/checkout");
      return;
    }

    setIsPlacingOrder(true);
    const selectedAddrObj = addresses.find(a => a.id === selectedAddress);
    
    const res = await customerApi.placeOrder({
      items: cartItems,
      address: selectedAddrObj?.line,
      paymentMethod,
      totalAmount: grandTotal
    });

    if (res.success) {
      if (paymentMethod !== "cod" && res.razorpay) {
        const isLoaded = await loadRazorpay();
        if (!isLoaded) {
          alert("Razorpay SDK failed to load. Are you online?");
          setIsPlacingOrder(false);
          return;
        }
        const options = {
          key: res.razorpay.keyId,
          amount: res.razorpay.amount,
          currency: res.razorpay.currency,
          name: "Baazar",
          description: "Order Payment",
          order_id: res.razorpay.orderId,
          handler: function (response: any) {
             clearCart();
             router.push("/customer/order-confirmation");
          },
          modal: {
            ondismiss: function() {
              setIsPlacingOrder(false);
            }
          },
          prefill: {
            name: "Customer Name",
            email: "customer@example.com",
            contact: "9999999999"
          },
          theme: {
            color: "#16a34a"
          }
        };
        const rzp1 = new (window as any).Razorpay(options);
        rzp1.open();
      } else {
        clearCart();
        router.push("/customer/order-confirmation");
      }
    } else {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 min-h-screen">
      <div className="mb-8">
        <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">Checkout</h1>
        <p className="text-sm text-on-surface-variant mt-1">Complete your delivery address and payment choice</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Steps Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Address */}
          <div className="bg-surface-container rounded-3xl p-6 border border-surface-container-high shadow-xs">
            <h3 className="font-headline-md text-lg font-bold text-on-surface mb-4 flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center font-bold">
                1
              </span>
              Delivery Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddress(addr.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedAddress === addr.id
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-surface-container-high hover:bg-surface-container-low"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-primary-container text-on-primary-container text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        {addr.tag}
                      </span>
                      {selectedAddress === addr.id && (
                        <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                      )}
                    </div>
                    <p className="font-bold text-sm text-on-surface">{addr.name}</p>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{addr.line}</p>
                    <p className="text-xs text-on-surface-variant">{addr.city}</p>
                  </div>
                  <p className="text-xs font-semibold text-on-surface mt-3">{addr.phone}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Time Slot */}
          <div className="bg-surface-container rounded-3xl p-6 border border-surface-container-high shadow-xs">
            <h3 className="font-headline-md text-lg font-bold text-on-surface mb-4 flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center font-bold">
                2
              </span>
              Delivery Time Slot
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setDeliverySlot("instant")}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  deliverySlot === "instant"
                    ? "border-primary bg-primary/5 shadow-xs font-bold"
                    : "border-surface-container-high"
                }`}
              >
                <div className="flex items-center gap-1.5 text-primary text-xs font-bold mb-1">
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  Instant Express
                </div>
                <p className="text-sm text-on-surface">Within 20 mins</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Assigned nearest rider</p>
              </button>

              <button
                type="button"
                onClick={() => setDeliverySlot("evening")}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  deliverySlot === "evening"
                    ? "border-primary bg-primary/5 shadow-xs font-bold"
                    : "border-surface-container-high"
                }`}
              >
                <div className="flex items-center gap-1.5 text-on-surface-variant text-xs font-bold mb-1">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  Today Evening
                </div>
                <p className="text-sm text-on-surface">6:00 PM - 8:00 PM</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Scheduled delivery</p>
              </button>

              <button
                type="button"
                onClick={() => setDeliverySlot("tomorrow")}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  deliverySlot === "tomorrow"
                    ? "border-primary bg-primary/5 shadow-xs font-bold"
                    : "border-surface-container-high"
                }`}
              >
                <div className="flex items-center gap-1.5 text-on-surface-variant text-xs font-bold mb-1">
                  <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
                  Tomorrow Morning
                </div>
                <p className="text-sm text-on-surface">8:00 AM - 10:00 AM</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Fresh morning slot</p>
              </button>
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="bg-surface-container rounded-3xl p-6 border border-surface-container-high shadow-xs">
            <h3 className="font-headline-md text-lg font-bold text-on-surface mb-4 flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center font-bold">
                3
              </span>
              Payment Options
            </h3>

            <div className="space-y-3">
              <label
                className={`p-4 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                  paymentMethod === "upi"
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-surface-container-high"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "upi"}
                  onChange={() => setPaymentMethod("upi")}
                  className="accent-primary"
                />
                <span className="material-symbols-outlined text-primary text-[22px]">account_balance_wallet</span>
                <div>
                  <p className="font-bold text-sm text-on-surface">UPI Instant Payment (Google Pay / PhonePe / Paytm)</p>
                  <p className="text-xs text-on-surface-variant">Zero transaction fees • Instant confirmation</p>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                  paymentMethod === "card"
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-surface-container-high"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="accent-primary"
                />
                <span className="material-symbols-outlined text-primary text-[22px]">credit_card</span>
                <div>
                  <p className="font-bold text-sm text-on-surface">Credit / Debit Cards</p>
                  <p className="text-xs text-on-surface-variant">Visa, Mastercard, RuPay & American Express</p>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                  paymentMethod === "cod"
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-surface-container-high"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="accent-primary"
                />
                <span className="material-symbols-outlined text-primary text-[22px]">payments</span>
                <div>
                  <p className="font-bold text-sm text-on-surface">Cash / UPI on Delivery</p>
                  <p className="text-xs text-on-surface-variant">Pay to delivery partner upon arrival</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary & Final CTA */}
        <div className="bg-surface-container rounded-3xl p-6 border border-surface-container-high shadow-xs lg:sticky lg:top-36 space-y-4">
          <h4 className="font-bold text-base text-on-surface">Order Summary</h4>

          <div className="space-y-2 border-b border-surface-container-high pb-4 max-h-48 overflow-y-auto">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-xs text-on-surface">
                <span className="truncate pr-2">
                  {item.quantity}x {item.title}
                </span>
                <span className="font-bold">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center font-bold text-lg text-on-surface pt-2">
            <span>Total Payable</span>
            <span className="text-primary text-xl">₹{grandTotal}</span>
          </div>

          <button
            type="button"
            disabled={isPlacingOrder}
            onClick={handlePlaceOrder}
            className="w-full py-4 bg-primary text-on-primary font-bold text-sm rounded-full shadow-lg hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isPlacingOrder ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                <span>Placing Order...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">lock</span>
                <span>Place Order (₹{grandTotal})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
