"use client";

import { motion } from "framer-motion";
import { Menu, Search, Bell, HelpCircle, Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const [merchantName, setMerchantName] = useState("Sri Lakshmi Stores");
  
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("merchant_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.name) {
          setMerchantName(user.name);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("merchant_token");
    localStorage.removeItem("merchant_user");
    router.push("/login");
  };

  return (
    <header className="h-20 glass-panel sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onMenuClick}
          className="md:hidden p-2.5 text-on-surface-variant hover:text-on-surface bg-surface-container rounded-xl shadow-sm border border-outline-variant/30 transition-all"
        >
          <Menu size={20} />
        </motion.button>
        
        <div className="max-w-xl w-full hidden sm:block">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-outline group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search products, orders, customers..."
              className="block w-full pl-11 pr-4 py-3 bg-surface-container/50 border border-outline-variant/60 rounded-2xl text-sm placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-surface-container-lowest transition-all duration-300 shadow-inner"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-[10px] font-medium bg-surface-container-lowest border border-outline-variant/60 text-outline px-2 py-1 rounded-md shadow-sm">⌘K</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <motion.button 
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary bg-surface-container-lowest border border-outline-variant/30 rounded-full shadow-sm hidden sm:flex"
        >
          <HelpCircle size={18} />
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary bg-surface-container-lowest border border-outline-variant/30 rounded-full shadow-sm hidden sm:flex"
        >
          <Settings size={18} />
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary bg-surface-container-lowest border border-outline-variant/30 rounded-full shadow-sm"
        >
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 block h-2.5 w-2.5 rounded-full bg-error ring-2 ring-surface-container-lowest animate-pulse-soft" />
        </motion.button>
        
        <div className="flex items-center gap-3 pl-2 sm:pl-5 sm:border-l border-outline-variant/40">
          <div className="hidden lg:block text-right">
            <p className="text-sm font-bold text-on-surface tracking-tight">{merchantName}</p>
            <p className="text-xs font-medium text-primary">Merchant Admin</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-secondary text-on-primary flex items-center justify-center font-bold text-sm border-2 border-surface-container-lowest premium-shadow"
          >
            {merchantName.substring(0, 2).toUpperCase()}
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="ml-2 w-10 h-10 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-500/10 bg-surface-container-lowest border border-outline-variant/30 rounded-full shadow-sm transition-all"
            title="Log Out"
          >
            <LogOut size={18} />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
