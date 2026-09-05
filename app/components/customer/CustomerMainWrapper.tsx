"use client";

import React from "react";
import { usePathname } from "next/navigation";

export function CustomerMainWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isChat = pathname === "/customer/chat";

  if (isChat) {
    return (
      <main
        style={{
          position: "fixed",
          top: 128,
          left: 0,
          right: 0,
          bottom: 0,
          height: "calc(100dvh - 128px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 10,
        }}
      >
        {children}
      </main>
    );
  }

  return (
    <main
      style={{
        flex: 1,
        minHeight: 0,
        width: "100%",
        paddingTop: 128,
        boxSizing: "border-box",
      }}
    >
      {children}
    </main>
  );
}