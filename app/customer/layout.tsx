import React from "react";
import { CustomerAuthProvider } from "../contexts/CustomerAuthContext";
import { CartProvider } from "../contexts/CartContext";
import { WishlistProvider } from "../contexts/WishlistContext";
import { CustomerHeader } from "../components/customer/CustomerHeader";
import { CustomerNavbar } from "../components/customer/CustomerNavbar";
import { MobileNavigation } from "../components/customer/MobileNavigation";
import { CustomerFooter } from "../components/customer/CustomerFooter";
import { CustomerChatWidget } from "../components/customer/CustomerChatWidget";

import { CustomerMainWrapper } from "../components/customer/CustomerMainWrapper";

import { CustomerLayoutContainer } from "../components/customer/CustomerLayoutContainer";

export default function CustomerPortalLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <CustomerAuthProvider>
      <CartProvider>
        <WishlistProvider>
          <CustomerLayoutContainer>
            <CustomerHeader />
            <CustomerNavbar />
            <CustomerMainWrapper>{children}</CustomerMainWrapper>
            <CustomerFooter />
            <MobileNavigation />
            <CustomerChatWidget />
          </CustomerLayoutContainer>
        </WishlistProvider>
      </CartProvider>
    </CustomerAuthProvider>
  );
}
