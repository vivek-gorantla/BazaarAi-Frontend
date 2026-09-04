"use client";

import React from "react";
import { usePathname } from "next/navigation";

export function CustomerMainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChat = pathname === "/customer/chat";

  return (
    <main
      style={{
        flex: 1,
        minHeight: 0,
        width: "100%",
        paddingTop: 128,
        boxSizing: "border-box",
        overflow: isChat ? "hidden" : "visible",
        display: isChat ? "flex" : "block",
        flexDirection: "column"
      }}
    >
      {children}
    </main>
  );
}
