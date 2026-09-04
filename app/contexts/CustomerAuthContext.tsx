"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  role: "customer";
  email?: string;
  address?: any;
}

interface CustomerAuthContextType {
  customerUser: CustomerUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  returnPath: string | null;
  openAuthModal: (returnPath?: string) => void;
  closeAuthModal: () => void;
  loginCustomer: (phone: string) => Promise<boolean>;
  signupCustomer: (data: { name: string; phone: string; address?: any }) => Promise<boolean>;
  logoutCustomer: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedUser = localStorage.getItem("bazaar_customer_user");
        if (savedUser) return JSON.parse(savedUser);
      } catch (e) {
        console.warn("Failed to load saved customer user", e);
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("bazaar_customer_token");
      } catch (e) {
        console.warn("Failed to load saved token", e);
      }
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [returnPath, setReturnPath] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if (customerUser) {
          localStorage.setItem("bazaar_customer_user", JSON.stringify(customerUser));
          localStorage.setItem("buyer_user", JSON.stringify(customerUser));
        } else {
          localStorage.removeItem("bazaar_customer_user");
          localStorage.removeItem("buyer_user");
        }

        if (token) {
          localStorage.setItem("bazaar_customer_token", token);
          localStorage.setItem("buyer_token", token);
        } else {
          localStorage.removeItem("bazaar_customer_token");
          localStorage.removeItem("buyer_token");
        }
      } catch (e) {
        console.warn("Failed to persist customer auth state", e);
      }
    }
  }, [customerUser, token]);

  const openAuthModal = (path?: string) => {
    if (path) setReturnPath(path);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setReturnPath(null);
  };

  const loginCustomer = async (phone: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, role: "customer" })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setToken(json.data.token);
          setCustomerUser(json.data.user);
          closeAuthModal();
          return true;
        }
      }
    } catch (e) {
      console.warn("Auth login API fallback active", e);
    }

    // Mock Login Fallback
    const mockUser: CustomerUser = {
      id: `cust-${Date.now()}`,
      name: "Vivek Sharma",
      phone,
      role: "customer"
    };
    setToken(mockUser.id);
    setCustomerUser(mockUser);
    closeAuthModal();
    return true;
  };

  const signupCustomer = async (data: { name: string; phone: string; address?: any }): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: data.phone,
          name: data.name,
          role: "customer"
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setToken(json.data.token);
          setCustomerUser({ ...json.data.user, address: data.address });
          closeAuthModal();
          return true;
        }
      }
    } catch (e) {
      console.warn("Auth signup API fallback active", e);
    }

    // Mock Signup Fallback
    const newUser: CustomerUser = {
      id: `cust-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      role: "customer",
      address: data.address
    };
    setToken(newUser.id);
    setCustomerUser(newUser);
    closeAuthModal();
    return true;
  };

  const logoutCustomer = () => {
    setCustomerUser(null);
    setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("bazaar_customer_user");
      localStorage.removeItem("bazaar_customer_token");
      localStorage.removeItem("buyer_user");
      localStorage.removeItem("buyer_token");
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customerUser,
        token,
        isAuthenticated: !!token && !!customerUser,
        isAuthModalOpen,
        returnPath,
        openAuthModal,
        closeAuthModal,
        loginCustomer,
        signupCustomer,
        logoutCustomer
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
}
