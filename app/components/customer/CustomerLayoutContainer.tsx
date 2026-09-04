"use client";

import React from "react";
import { usePathname } from "next/navigation";

export function CustomerLayoutContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChat = pathname === "/customer/chat";

  return (
    <div
      style={{
        height: isChat ? "100vh" : "auto",
        minHeight: "100vh",
        maxHeight: isChat ? "100vh" : "none",
        overflow: isChat ? "hidden" : "visible",
        background: "#141A15",
        color: "#F2F7F2",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Outfit', sans-serif"
      }}
    >
      {children}
    </div>
  );
}
