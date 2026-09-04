"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const PRIMARY = "#748F70";
const SECONDARY = "#F3B58C";

export function CustomerChatWidget() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/customer/chat") return null;

  return (
    <AnimatePresence>
      <motion.button
        key="chat-fab"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 380, damping: 20 }}
        onClick={() => router.push("/customer/chat")}
        aria-label="Open AI Shopper"
        style={{
          position: "fixed", bottom: 90, right: 24,
          width: 60, height: 60, borderRadius: 18,
          background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`,
          boxShadow: `0 8px 32px ${PRIMARY}55, 0 2px 8px rgba(0,0,0,.3)`,
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 60
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 26, color: "#fff", fontVariationSettings: "'FILL' 1" }}>
          auto_awesome
        </span>
        {/* Online dot */}
        <span style={{
          position: "absolute", top: -2, right: -2,
          width: 14, height: 14, borderRadius: "50%",
          background: "#4ade80", border: "2.5px solid #141A15"
        }} />
      </motion.button>
    </AnimatePresence>
  );
}
