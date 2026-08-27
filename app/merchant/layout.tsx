"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { GlobalVoiceFab } from "@/components/GlobalVoiceFab";
import { OnboardingVoiceAgent } from "../../agent/components/OnboardingVoiceAgent";

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      const token = localStorage.getItem("merchant_token");
      if (!token) {
        router.push("/login");
        return;
      }
      
      setIsAuthenticated(true);
      
      // Check if they need onboarding (i.e. no stores)
      try {
        const res = await fetch("/api/merchant/stores", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
          const isOnboardingRoute = pathname.includes("/merchant-onboarding");
          if (data.data.length === 0 && !isOnboardingRoute) {
            router.push("/merchant/merchant-onboarding/business-details");
            return; // Exit early, don't set checkingOnboarding to false yet
          } else if (data.data.length > 0) {
            // They have a store, store the first one's ID for app usage if not set
            if (!localStorage.getItem("merchant_store_id")) {
              localStorage.setItem("merchant_store_id", data.data[0].id);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkAuthAndOnboarding();
  }, [router, pathname]);

  if (!isAuthenticated || checkingOnboarding) {
    return <div className="min-h-screen bg-surface flex items-center justify-center">Loading...</div>;
  }

  const isOnboarding = pathname.includes("/merchant-onboarding");

  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-[#F2F7F2] font-sans relative">
        <OnboardingVoiceAgent />
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-surface font-sans overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto bg-transparent p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      
      <GlobalVoiceFab />
    </div>
  );
}
