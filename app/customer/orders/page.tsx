"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "../../contexts/CartContext";
import { customerApi } from "../../../services/customerApi";

export default function CustomerOrdersPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    let isMounted = true;
    customerApi.getCustomerOrders().then((data) => {
      if (isMounted) {
        setOrders(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filterTabs = ["All", "Active Orders", "Delivered", "Cancelled"];

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "Active Orders") return o.status === "In Transit" || o.status === "Preparing";
    if (activeTab === "Delivered") return o.status === "Delivered";
    if (activeTab === "Cancelled") return o.status === "Cancelled";
    return true;
  });

  const handleReorder = (order: any) => {
    order.items.forEach((it: any, idx: number) => {
      addToCart({
        id: `reorder-${order.id}-${idx}`,
        title: it.name,
        price: Math.round(it.price / it.qty),
        storeName: order.storeName,
        quantity: it.qty
      });
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 min-h-screen">
      <div className="mb-8">
        <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">Your Orders</h1>
        <p className="text-sm text-on-surface-variant mt-1">Track live orders and view order history</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-surface-container-high pb-4 mb-8 overflow-x-auto hide-scrollbar">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full font-label-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-44 bg-surface-container animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-surface-container rounded-3xl p-6 border border-surface-container-high shadow-xs hover:shadow-md transition-shadow"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container-high">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {order.storeName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-on-surface">{order.storeName}</h3>
                    <p className="text-xs text-on-surface-variant">
                      Order #{order.id} • {order.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-3.5 py-1 rounded-full ${order.statusColor || "bg-tertiary-fixed text-on-tertiary-fixed"}`}>
                    {order.status}
                  </span>
                  <span className="font-bold text-base text-primary">₹{order.totalAmount}</span>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="py-4 space-y-2">
                {order.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-xs text-on-surface">
                    <span>
                      {it.qty}x {it.name}
                    </span>
                    <span className="font-medium">₹{it.price}</span>
                  </div>
                ))}
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-surface-container-high flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-on-surface-variant font-medium">Total Items: {order.itemCount}</span>

                <div className="flex items-center gap-3">
                  {order.canTrack && (
                    <Link
                      href="/customer/tracking"
                      className="px-5 py-2 bg-primary text-on-primary font-bold text-xs rounded-full shadow-xs hover:bg-primary-container transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      Track Order
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => handleReorder(order)}
                    className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs rounded-full border border-surface-container-high transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    Reorder
                  </button>

                  <Link
                    href="/customer/help"
                    className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
                  >
                    Need Help?
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-surface-container-low rounded-3xl p-12 text-center flex flex-col items-center justify-center border border-surface-container-high">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2">
              receipt_long
            </span>
            <h3 className="font-headline-md text-base font-bold text-on-surface">No orders found</h3>
            <p className="text-xs text-on-surface-variant max-w-xs mt-1 mb-4">
              You have no {activeTab.toLowerCase()} orders at the moment.
            </p>
            <Link
              href="/customer"
              className="px-6 py-2.5 bg-primary text-on-primary text-xs font-bold rounded-full shadow-xs"
            >
              Shop Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
