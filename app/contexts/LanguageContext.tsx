"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "../locales/en.json";
import hi from "../locales/hi.json";
import te from "../locales/te.json";

type Language = "en" | "hi" | "te";

const translations: Record<Language, any> = {
  en,
  hi,
  te,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  // Load saved language from localStorage if available, prioritizing user preference
  useEffect(() => {
    let userPref: Language | null = null;
    try {
      const merchantStr = localStorage.getItem("merchant_user");
      if (merchantStr) {
        const user = JSON.parse(merchantStr);
        if (user.translateContent === false) {
          userPref = "en";
        } else if (user.preferredLanguage) {
          userPref = user.preferredLanguage;
        }
      } else {
        const customerStr = localStorage.getItem("customer_user");
        if (customerStr) {
          const user = JSON.parse(customerStr);
          if (user.translateContent === false) {
            userPref = "en";
          } else if (user.preferredLanguage) {
            userPref = user.preferredLanguage;
          }
        }
      }
    } catch (e) {
      // Ignore parse errors
    }

    const savedLanguage = localStorage.getItem("language") as Language;
    
    if (userPref && ["en", "hi", "te"].includes(userPref)) {
      setLanguage(userPref);
    } else if (savedLanguage && ["en", "hi", "te"].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);

    // Also update the stored user preference so it doesn't revert on reload
    try {
      const merchantStr = localStorage.getItem("merchant_user");
      if (merchantStr) {
        const user = JSON.parse(merchantStr);
        user.preferredLanguage = lang;
        localStorage.setItem("merchant_user", JSON.stringify(user));
      }
      
      const customerStr = localStorage.getItem("customer_user");
      if (customerStr) {
        const user = JSON.parse(customerStr);
        user.preferredLanguage = lang;
        localStorage.setItem("customer_user", JSON.stringify(user));
      }
    } catch (e) {
      // Ignore
    }
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let current: any = translations[language];
    for (const k of keys) {
      if (current && current[k] !== undefined) {
        current = current[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // Fallback
      }
    }
    return typeof current === "string" ? current : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}