"use client";

import React from "react";
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

interface Props {
  open: boolean;
  onClose: () => void;
  onProceedToPayment: () => void;
}

export function MicroCartDrawer({ open, onClose, onProceedToPayment }: Props) {
  const { cartItems, updateQuantity, removeFromCart, clearCart, grandTotal, itemCount } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="microcart-bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 85,
              background: "rgba(0,0,0,.7)",
              backdropFilter: "blur(4px)"
            }}
            onClick={onClose}
          />

          {/* Drawer Container */}
          <motion.div
            key="microcart-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "100%",
              maxWidth: 440,
              zIndex: 90,
              background: SURFACE,
              borderLeft: `1px solid ${SURFACE_CH}`,
              boxShadow: "-12px 0 40px rgba(0,0,0,.6)",
              display: "flex",
              flexDirection: "column",
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            {/* Header */}
            <div
              style={{
                flexShrink: 0,
                padding: "20px 24px",
                background: SURFACE_C,
                borderBottom: `1px solid ${SURFACE_CH}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: `${PRIMARY}20`,
                    border: `1px solid ${PRIMARY}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: PRIMARY
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                    shopping_cart
                  </span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: ON_SURFACE }}>
                    Your Shopping Cart
                  </h3>
                  <span style={{ fontSize: 12, color: ON_SURFACE_VAR }}>
                    {itemCount} {itemCount === 1 ? "item" : "items"} in cart
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {cartItems.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#f87171",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: SURFACE_CH,
                    border: `1px solid ${SURFACE_CHH}`,
                    color: ON_SURFACE_VAR,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    close
                  </span>
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                scrollbarWidth: "thin",
                scrollbarColor: `${SURFACE_CH} transparent`
              }}
            >
              {cartItems.length === 0 ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 16,
                    color: ON_SURFACE_VAR,
                    padding: 40,
                    textAlign: "center"
                  }}
                >
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      background: SURFACE_CH,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: `${ON_SURFACE_VAR}60`
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 36 }}>
                      remove_shopping_cart
                    </span>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: ON_SURFACE }}>
                      Your cart is empty
                    </h4>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: ON_SURFACE_VAR }}>
                      Ask the Bazaar AI Shopper to find items for you!
                    </p>
                  </div>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      background: SURFACE_C,
                      padding: 12,
                      borderRadius: 16,
                      border: `1px solid ${SURFACE_CH}`
                    }}
                  >
                    {/* Item Image */}
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 12,
                        background: SURFACE_CH,
                        overflow: "hidden",
                        flexShrink: 0
                      }}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: ON_SURFACE_VAR
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                            grocery
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Item Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: 14,
                          fontWeight: 700,
                          color: ON_SURFACE,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {item.title}
                      </h4>
                      {item.storeName && (
                        <span style={{ fontSize: 11, color: PRIMARY, fontWeight: 600 }}>
                          {item.storeName}
                        </span>
                      )}
                      <div style={{ fontSize: 13, fontWeight: 800, color: PRIMARY, marginTop: 4 }}>
                        ₹{item.price * item.quantity}
                        {item.quantity > 1 && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 400,
                              color: ON_SURFACE_VAR,
                              marginLeft: 6
                            }}
                          >
                            (₹{item.price} each)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: SURFACE,
                        padding: "4px 8px",
                        borderRadius: 999,
                        border: `1px solid ${SURFACE_CH}`
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          item.quantity > 1
                            ? updateQuantity(item.id, item.quantity - 1)
                            : removeFromCart(item.id)
                        }
                        style={{
                          background: "transparent",
                          border: "none",
                          color: ON_SURFACE_VAR,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                          {item.quantity === 1 ? "delete" : "remove"}
                        </span>
                      </button>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: ON_SURFACE,
                          minWidth: 16,
                          textAlign: "center"
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: PRIMARY,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                          add
                        </span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout Button */}
            {cartItems.length > 0 && (
              <div
                style={{
                  flexShrink: 0,
                  padding: "20px 24px",
                  background: SURFACE_C,
                  borderTop: `1px solid ${SURFACE_CH}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, color: ON_SURFACE_VAR, fontWeight: 600 }}>
                    Total Payable
                  </span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: PRIMARY }}>
                    ₹{grandTotal}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onProceedToPayment();
                  }}
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: 16,
                    background: `linear-gradient(135deg, ${PRIMARY}, #496246)`,
                    color: "#fff",
                    border: "none",
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: `0 8px 24px ${PRIMARY}40`,
                    fontFamily: "inherit"
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    lock
                  </span>
                  Proceed to Payment (₹{grandTotal})
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
