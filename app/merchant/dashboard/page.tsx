"use client";

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { 
  Package, 
  PlusCircle, 
  Wallet, 
  ShoppingBag, 
  Users, 
  ReceiptText, 
  TrendingUp, 
  ChevronDown, 
  ArrowRight, 
  ArrowUp,
  Sparkles,
  Zap
} from 'lucide-react';
import { getDashboardData, DashboardData } from '@/services/merchantApi';

const iconMap: Record<string, React.ElementType> = {
  'wallet': Wallet,
  'shopping-bag': ShoppingBag,
  'users': Users,
  'receipt-text': ReceiptText,
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDashboardData();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col w-full min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="flex flex-col w-full min-h-screen pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* 1. Full-Width Parallax Hero Banner */}
      <div className="relative w-full h-[380px] rounded-3xl overflow-hidden shadow-2xl mb-8 group">
        {/* Parallax Background */}
        <motion.div 
          style={{ y: heroY }}
          className="absolute inset-0 z-0 scale-[1.1]"
        >
          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=2000&auto=format&fit=crop')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-surface/95 via-surface/60 to-transparent"></div>
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-8 lg:px-12 w-full max-w-3xl">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-white/40 mb-6 self-start">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="font-label-md text-xs uppercase tracking-widest text-on-surface">Store is Live</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="font-display-lg text-5xl lg:text-6xl text-on-surface mb-4 tracking-tight drop-shadow-md">
            Good morning, <span className="premium-gradient font-black">Ravi.</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="font-body-lg text-lg text-on-surface-variant max-w-xl leading-relaxed mb-8 drop-shadow-sm font-medium">
            Your store is buzzing today! Orders are up 12% this week, and your new fresh produce line is driving significant traffic.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
            <button className="h-[56px] px-8 rounded-2xl bg-primary text-on-primary font-label-md flex items-center justify-center gap-2 premium-shadow hover:scale-105 transition-transform duration-300">
              <Package size={20} />
              View Orders
            </button>
            <button className="h-[56px] px-8 rounded-2xl glass-panel text-on-surface font-label-md flex items-center justify-center gap-2 hover:bg-white transition-colors duration-300 shadow-lg">
              <PlusCircle size={20} className="text-secondary" />
              Add Product
            </button>
          </motion.div>
        </div>
      </div>

      {/* 2. Overlapping Floating Metrics Row (-mt-24 pulls them up over the banner) */}
      <motion.div 
        variants={containerVariants} 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 lg:px-0 -mt-24 z-20 relative mb-12"
      >
        {data.metrics.map((stat, i) => {
          const IconComponent = iconMap[stat.iconKey] || Wallet;
          return (
          <motion.div key={i} variants={itemVariants} className="glass-card rounded-[24px] p-6 flex flex-col justify-between group overflow-hidden relative shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-transform duration-500 border border-white/60">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-container/40 rounded-bl-full -z-10 group-hover:scale-125 transition-transform duration-700 blur-2xl`}></div>
            <div className={`absolute bottom-0 left-0 w-24 h-24 bg-white/40 rounded-tr-full -z-10 group-hover:scale-150 transition-transform duration-700 blur-xl`}></div>
            
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-label-md text-xs uppercase tracking-widest text-outline">{stat.title}</h3>
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-container/80 backdrop-blur-md flex items-center justify-center text-${stat.color} shadow-inner group-hover:rotate-12 transition-transform duration-500`}>
                <IconComponent size={22} />
              </div>
            </div>
            <div>
              <div className="font-stats-number text-4xl text-on-surface mb-3 tracking-tight">{stat.value}</div>
              <div className="flex items-center gap-3">
                <span className={`font-label-md text-xs text-${stat.color} bg-${stat.color}-container/50 px-2 py-1 rounded-md flex items-center gap-1 backdrop-blur-sm border border-${stat.color}/10`}>
                  <TrendingUp size={14} />
                  {stat.inc}
                </span>
                <svg className={`w-full h-6 text-${stat.color} flex-1 opacity-40 group-hover:opacity-100 transition-opacity duration-500`} fill="none" viewBox="0 0 100 24" preserveAspectRatio="none">
                  <path d="M0 24C20 24 30 8 50 8C70 8 80 16 100 0" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5"></path>
                </svg>
              </div>
            </div>
          </motion.div>
        )})}
      </motion.div>

      {/* Main Content Area */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        
        {/* Chart Section */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-7 glass-card rounded-[32px] p-8 border border-white/50">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="font-headline-md text-2xl text-on-surface mb-1">Revenue Overview</h2>
              <p className="font-body-md text-on-surface-variant">Performance across all active channels</p>
            </div>
            <button className="flex items-center gap-2 bg-surface-container/50 px-4 py-2.5 rounded-xl hover:bg-white transition-colors border border-outline-variant/30 shadow-sm">
              <span className="font-label-md text-sm text-on-surface">This Week</span>
              <ChevronDown size={18} className="text-outline" />
            </button>
          </div>
          <div className="w-full h-[320px] relative mt-4">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent rounded-b-[2rem] opacity-70"></div>
            <svg className="w-full h-full overflow-visible" fill="none" preserveAspectRatio="none" viewBox="0 0 800 200">
              <path d="M0 50H800" stroke="var(--color-outline-variant)" strokeDasharray="4 4" strokeWidth="1" opacity="0.5"></path>
              <path d="M0 100H800" stroke="var(--color-outline-variant)" strokeDasharray="4 4" strokeWidth="1" opacity="0.5"></path>
              <path d="M0 150H800" stroke="var(--color-outline-variant)" strokeDasharray="4 4" strokeWidth="1" opacity="0.5"></path>
              
              {/* Animated Path */}
              <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="drop-shadow-[0_12px_16px_rgba(92,129,87,0.4)]" 
                d="M0 180 C 100 180, 150 120, 200 120 C 300 120, 350 160, 400 160 C 500 160, 550 60, 600 60 C 700 60, 750 20, 800 20" 
                stroke="var(--color-primary)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5">
              </motion.path>
              
              {/* Points */}
              <circle cx="200" cy="120" fill="#ffffff" r="6" stroke="var(--color-primary)" strokeWidth="3" className="animate-pulse-soft"></circle>
              <circle cx="400" cy="160" fill="#ffffff" r="6" stroke="var(--color-primary)" strokeWidth="3" className="animate-pulse-soft" style={{animationDelay: "0.2s"}}></circle>
              <circle cx="600" cy="60" fill="#ffffff" r="6" stroke="var(--color-primary)" strokeWidth="3" className="animate-pulse-soft" style={{animationDelay: "0.4s"}}></circle>
              <circle cx="800" cy="20" fill="#ffffff" r="8" stroke="var(--color-primary)" strokeWidth="4" className="animate-pulse-soft" style={{animationDelay: "0.6s"}}></circle>
            </svg>
            <div className="absolute -bottom-8 left-0 right-0 flex justify-between px-2 font-label-md text-xs text-outline uppercase tracking-widest">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span className="text-primary font-bold">Sun</span>
            </div>
          </div>
        </motion.div>

        {/* 3. Enhanced Top Movers with Rich Imagery */}
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-5 glass-card rounded-[32px] p-8 border border-white/50 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline-md text-2xl text-on-surface">Trending Products</h2>
            <button className="w-10 h-10 rounded-full bg-surface-container/50 hover:bg-white flex items-center justify-center transition-colors">
              <ArrowRight size={20} className="text-on-surface-variant" />
            </button>
          </div>
          <div className="flex flex-col gap-4 flex-1 justify-center">
            {data.trendingProducts.map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center gap-4 p-3 rounded-2xl bg-white/40 hover:bg-white border border-white/60 transition-all cursor-pointer shadow-sm group"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-sm border border-outline-variant/30 relative">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                  <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={item.img} alt={item.title} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-label-md text-sm text-on-surface truncate mb-1">{item.title}</h4>
                  <p className="font-body-md text-xs text-outline">{item.sales}</p>
                </div>
                <div className="flex flex-col items-end shrink-0 gap-1">
                  <span className="font-label-md text-sm text-on-surface">{item.price}</span>
                  <span className="font-label-md text-xs text-primary flex items-center gap-0.5 bg-primary-container/80 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    <ArrowUp size={12} />
                    {item.inc}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* 4. Full-Width Dynamic AI Insight */}
      <motion.div variants={itemVariants} className="w-full rounded-[32px] overflow-hidden relative premium-shadow group">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-fixed via-secondary-container to-primary-container"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        
        {/* Glowing Orbs */}
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-white/40 blur-[80px] rounded-full"
        ></motion.div>
        <motion.div 
          animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/20 blur-[80px] rounded-full"
        ></motion.div>

        <div className="relative z-10 p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-xl border border-white/40">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 mb-4 bg-white/30 px-3 py-1.5 rounded-full border border-white/50 backdrop-blur-md">
              <Zap className="text-secondary" size={16} />
              <span className="font-label-md text-xs uppercase tracking-widest text-on-secondary-container">AI Growth Insight</span>
            </div>
            <h2 className="font-display-lg text-3xl lg:text-4xl text-on-secondary-container mb-3 tracking-tight">Unlock Hidden Revenue</h2>
            <p className="font-body-lg text-lg text-on-secondary-container/80 max-w-2xl leading-relaxed">
              Customers buying <strong>Artisan Forest Honey</strong> frequently search for <strong>Premium Green Tea</strong>. Bundling these items with a 10% discount is projected to increase your average order value by ₹120.
            </p>
          </div>
          
          <div className="shrink-0">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="h-[64px] px-10 rounded-full bg-on-secondary-container text-white font-label-md text-lg flex items-center justify-center gap-3 shadow-[0_20px_40px_-10px_rgba(71,38,21,0.4)] hover:bg-secondary-fixed-variant transition-colors group"
            >
              <Sparkles size={22} className="group-hover:animate-spin" />
              Create Bundle Offer
            </motion.button>
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
}