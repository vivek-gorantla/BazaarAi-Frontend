"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Store,
  ShoppingCart,
  Package,
  Boxes,
  RefreshCcw,
  Users,
  MessageSquare,
  BarChart3,
  Map,
  Megaphone,
  Sparkles,
  CreditCard,
  DollarSign,
  Shield,
  Activity,
  CheckSquare,
  History,
  X,
  ChevronRight,
  ChevronLeft,
  Home
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navGroups = [
  {
    title: "OVERVIEW",
    items: [
      { name: "Home", href: "/merchant", icon: Home },
      { name: "Dashboard", href: "/merchant/dashboard", icon: LayoutDashboard },
      { name: "Onboarding", href: "/merchant/merchant-onboarding", icon: Store },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { name: "Orders", href: "/merchant/orders", icon: ShoppingCart },
      { name: "Products", href: "/merchant/products", icon: Package },
      { name: "Inventory", href: "/merchant/inventory", icon: Boxes },
      { name: "Restock Center", href: "/merchant/restock-center", icon: RefreshCcw },
    ],
  },
  {
    title: "CUSTOMERS",
    items: [
      { name: "Customers", href: "/merchant/customers", icon: Users },
      { name: "Reviews", href: "#", icon: MessageSquare },
    ],
  },
  {
    title: "GROWTH",
    items: [
      { name: "Analytics", href: "/merchant/analytics", icon: BarChart3 },
      { name: "Local Market", href: "/merchant/local-market-intelligence", icon: Map },
      { name: "Marketing", href: "/merchant/marketing", icon: Megaphone },
      { name: "AI Growth", href: "/merchant/ai-growth-center", icon: Sparkles },
    ],
  },
  {
    title: "FINANCE",
    items: [
      { name: "Payments", href: "/merchant/payments", icon: CreditCard },
      { name: "Profit & Loss", href: "/merchant/profit-loss", icon: DollarSign },
    ],
  },
  {
    title: "AGENTS & PERMISSIONS",
    items: [
      { name: "Agent Permissions", href: "/merchant/agent-permissions", icon: Shield },
      { name: "Agent Performance", href: "/merchant/agent-performance", icon: Activity },
      { name: "Recommendations", href: "/merchant/recommendations-approvals", icon: CheckSquare },
      { name: "Audit Trail", href: "/merchant/audit-trail", icon: History },
    ],
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [incompleteSteps, setIncompleteSteps] = useState<{name: string, href: string, icon: any}[]>([]);

  useEffect(() => {
    const storeId = localStorage.getItem("merchant_store_id");
    if (storeId) {
      fetch(`/api/merchant/stores/${storeId}`, {
        headers: {
          'x-user-id': localStorage.getItem("merchant_token") || '',
          'Authorization': `Bearer ${localStorage.getItem("merchant_token") || ''}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            const store = data.data;
            const missing = [];
            if (!store.logoUrl && !store.themeColor) {
              missing.push({ name: "Store Identity", href: "/merchant/merchant-onboarding/store-identity", icon: Store });
            }
            if (!store.lat || !store.lng || !store.city) {
              missing.push({ name: "Location & Delivery", href: "/merchant/merchant-onboarding/location-delivery", icon: Map });
            }
            if (!store.bankAccountNumber) {
              missing.push({ name: "Payments & Bank", href: "/merchant/merchant-onboarding/payments-bank", icon: CreditCard });
            }
            setIncompleteSteps(missing);
          }
        })
        .catch(console.error);
    }
  }, []);

  const sidebarClass = `
    fixed inset-y-0 left-0 z-50 glass-panel border-r border-white/40 transform transition-all duration-300 ease-in-out flex flex-col
    md:relative md:translate-x-0
    ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
    ${isCollapsed ? "w-20" : "w-72"}
  `;

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-on-surface/20 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside className={sidebarClass}>
        {/* Collapse Toggle (Desktop only) */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="hidden md:flex absolute -right-3 top-24 bg-white border border-outline-variant rounded-full p-1 z-50 shadow-sm text-on-surface hover:bg-surface-container"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Header */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-6'} h-20 shrink-0 border-b border-outline-variant/30`}>
          <Link href="/merchant" className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center premium-shadow"
            >
              <Store size={20} className="text-white" />
            </motion.div>
            {!isCollapsed && (
              <span className="text-2xl font-black text-on-surface tracking-tight whitespace-nowrap">
                BAZAAR
              </span>
            )}
          </Link>
          {onClose && !isCollapsed && (
            <button onClick={onClose} className="md:hidden text-on-surface-variant hover:text-on-surface bg-surface-container p-2 rounded-full transition-colors">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Store Status */}
        <div className={`px-6 py-4 shrink-0 transition-all ${isCollapsed ? 'hidden' : 'block'}`}>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center justify-between px-4 py-3 bg-primary-container rounded-2xl border border-primary/20 shadow-sm transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </div>
              <span className="text-sm font-semibold text-on-primary-container">Store Open</span>
            </div>
            <button className="text-xs font-bold text-on-primary-container bg-white/60 px-3 py-1 rounded-full hover:bg-white transition-colors shadow-sm">
              CLOSE
            </button>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-6 custom-scrollbar">
          
          {incompleteSteps.length > 0 && (
            <div className="px-2">
              {!isCollapsed && (
                <h3 className="mb-3 font-label-md text-[11px] text-error uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden flex items-center gap-2">
                  FINISH SETUP
                </h3>
              )}
              {isCollapsed && <div className="h-4" />}
              <ul className="space-y-1">
                {incompleteSteps.map((item) => {
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`
                          group relative flex items-center ${isCollapsed ? 'justify-center p-3' : 'justify-between px-3 py-3'} rounded-2xl text-sm font-medium transition-all duration-300
                          bg-error-container text-on-error-container border border-error/20 hover:bg-error hover:text-on-error
                        `}
                      >
                        <div className={`flex items-center relative z-10 ${isCollapsed ? 'justify-center w-full' : 'gap-3 w-full'}`} title={isCollapsed ? item.name : undefined}>
                          <item.icon
                            size={20}
                            className="shrink-0 transition-colors duration-300"
                          />
                          {!isCollapsed && (
                            <span className="font-body-md whitespace-nowrap">{item.name}</span>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {navGroups.map((group) => (
            <div key={group.title} className="px-2">
              {!isCollapsed && (
                <h3 className="mb-3 font-label-md text-[11px] text-outline uppercase tracking-[0.2em] whitespace-nowrap overflow-hidden">
                  {group.title}
                </h3>
              )}
              {isCollapsed && <div className="h-4" />}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`
                          group relative flex items-center ${isCollapsed ? 'justify-center p-3' : 'justify-between px-3 py-3'} rounded-2xl text-sm font-medium transition-all duration-300
                          ${
                            isActive
                              ? "bg-primary-container text-on-primary-container shadow-sm"
                              : "text-on-surface-variant hover:bg-surface-container-high/50 hover:text-on-surface"
                          }
                        `}
                      >
                        <div className={`flex items-center relative z-10 ${isCollapsed ? 'justify-center w-full' : 'gap-3 w-full'}`} title={isCollapsed ? item.name : undefined}>
                          <item.icon
                            size={20}
                            className={`shrink-0 transition-colors duration-300 ${isActive ? "text-primary" : "text-outline group-hover:text-primary"}`}
                          />
                          {!isCollapsed && (
                            <span className="font-body-md whitespace-nowrap">{item.name}</span>
                          )}
                        </div>
                        {isActive && !isCollapsed && (
                          <motion.div 
                            layoutId="activeIndicator"
                            className="absolute right-3"
                          >
                            <ChevronRight size={18} className="text-primary" />
                          </motion.div>
                        )}
                        {!isActive && !isCollapsed && (
                          <ChevronRight size={18} className="absolute right-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-outline" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
