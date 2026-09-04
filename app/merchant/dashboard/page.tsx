"use client";

import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
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
  Zap,
  Mic,
  Camera,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Bot,
  Star,
  RefreshCw,
  Eye,
  Sliders,
  Store
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getDashboardData, DashboardData } from '@/services/merchantApi';
import { subscribeInventoryUpdated } from '@/services/eventBus';

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
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } }
};

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'orders' | 'inventory'>('all');
  const [approvedActionIds, setApprovedActionIds] = useState<string[]>([]);

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

  useEffect(() => {
    fetchData();
    const unsubscribe = subscribeInventoryUpdated(() => {
      fetchData();
    });
    return () => unsubscribe();
  }, []);

  const handleApproveAIAction = (id: string) => {
    setApprovedActionIds(prev => [...prev, id]);
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col w-full min-h-screen items-center justify-center bg-[#141A15] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F3B58C] mb-4"></div>
        <p className="text-sm font-bold text-[#C2D6C0] animate-pulse">Loading Live Merchant Dashboard...</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="flex flex-col w-full min-h-screen pb-16 text-white font-sans"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* 1. Hero Command & Store Health Launchpad */}
      <div className="relative w-full rounded-[32px] overflow-hidden shadow-2xl mb-8 border border-[#2E3D30] bg-gradient-to-r from-[#734828] via-[#4D3524] to-[#253627] p-8 lg:p-10">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#8C5A3B]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-white">Live Storefront Active</span>
              </div>

              {data.fulfillmentHealth && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8C5A3B]/40 border border-[#F3B58C]/30 text-xs font-bold text-[#F3B58C]">
                  <Star size={12} className="fill-[#F3B58C]" />
                  <span>{data.fulfillmentHealth.customerRating} Rating</span>
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-3">
              Good day, <span className="text-[#F3B58C]">{data.storeName || "Merchant"}</span>
            </h1>
            
            <p className="text-sm sm:text-base text-[#C2D6C0] font-medium leading-relaxed max-w-xl">
              Your store is performing at peak velocity. <strong className="text-white">128 transactions</strong> processed with an average fulfillment speed of <strong className="text-white">14 minutes</strong>.
            </p>

            {/* Health Indicators */}
            {data.fulfillmentHealth && (
              <div className="mt-6 flex flex-wrap items-center gap-4 pt-4 border-t border-white/10 text-xs font-bold text-[#C2D6C0]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-400" /> Speed: <span className="text-white">{data.fulfillmentHealth.speedScore}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={15} className="text-[#F3B58C]" /> On-Time: <span className="text-white">{data.fulfillmentHealth.onTimeDelivery}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} className="text-sky-400" /> Active Deliveries: <span className="text-white">{data.fulfillmentHealth.activeDeliveries} drivers out</span>
                </span>
              </div>
            )}
          </div>

          {/* Quick Voice & Action Hub */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full lg:w-auto shrink-0">
            <button 
              onClick={() => router.push('/merchant/inventory')}
              className="px-6 py-4 bg-[#8C5A3B] hover:bg-[#784B2E] text-white rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition-all border border-[#F3B58C]/30 hover:scale-[1.02] active:scale-95"
            >
              <Mic size={18} className="animate-pulse text-[#F3B58C]" />
              <span>Speak Stock Update</span>
            </button>

            <button 
              onClick={() => router.push('/merchant/products')}
              className="px-6 py-4 bg-[#1A231C] hover:bg-[#243026] text-white rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition-all border border-[#2E3D30] hover:scale-[1.02] active:scale-95"
            >
              <PlusCircle size={18} className="text-[#F3B58C]" />
              <span>+ Add Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Floating Stat Metrics Grid */}
      <motion.div 
        variants={containerVariants} 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
      >
        {data.metrics.map((stat, i) => {
          const IconComponent = iconMap[stat.iconKey] || Wallet;
          const isError = stat.color === 'error';
          return (
            <motion.div 
              key={i} 
              variants={itemVariants} 
              className={`rounded-[24px] p-6 flex flex-col justify-between relative overflow-hidden shadow-xl border transition-all duration-300 hover:-translate-y-1 ${
                isError 
                  ? 'bg-[#2A1517] border-rose-900/60 hover:border-rose-500/50' 
                  : 'bg-[#1A231C] border-[#2E3D30] hover:border-[#8C5A3B]/40'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#C2D6C0]/70">{stat.title}</h3>
                  {stat.subtext && <p className="text-[11px] text-[#C2D6C0]/50 font-medium mt-0.5">{stat.subtext}</p>}
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${
                  isError ? 'bg-rose-950 text-rose-400 border-rose-800/40' : 'bg-[#243026] text-[#F3B58C] border-[#3A4E38]'
                }`}>
                  <IconComponent size={22} />
                </div>
              </div>

              <div>
                <div className="text-3xl font-black text-white mb-2 tracking-tight">{stat.value}</div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border ${
                    isError 
                      ? 'bg-rose-950/80 text-rose-300 border-rose-800/40' 
                      : 'bg-[#243026] text-emerald-400 border-[#3A4E38]'
                  }`}>
                    <TrendingUp size={13} />
                    {stat.inc}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 3. Main Content Split: Live Orders Stream & Low Stock Action Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        
        {/* Left 7 Columns: Live Orders Stream */}
        <motion.div variants={itemVariants} className="lg:col-span-7 bg-[#1A231C] rounded-[32px] p-6 lg:p-8 border border-[#2E3D30] shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#2E3D30]">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <ShoppingBag size={22} className="text-[#F3B58C]" />
                  Live Order Activity
                </h2>
                <p className="text-xs text-[#C2D6C0] font-medium mt-1">Real-time store orders requiring fulfillment</p>
              </div>

              <button 
                onClick={() => router.push('/merchant/orders')}
                className="px-4 py-2 bg-[#243026] hover:bg-[#2A382C] text-[#F3B58C] rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors border border-[#3A4E38]"
              >
                <span>View All ({data.recentOrders?.length || 0})</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-4">
              {data.recentOrders && data.recentOrders.length > 0 ? (
                data.recentOrders.map(order => (
                  <div key={order.id} className="p-4 rounded-2xl bg-[#141A15] border border-[#2E3D30] hover:border-[#8C5A3B]/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#243026] text-[#F3B58C] font-black text-sm flex items-center justify-center border border-white/5 shrink-0">
                        {order.customerName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">{order.customerName}</h4>
                          <span className="text-xs font-mono text-[#F3B58C] bg-[#3D2618] px-2 py-0.5 rounded-full border border-[#8C5A3B]/40">{order.id}</span>
                        </div>
                        <p className="text-xs text-[#C2D6C0]/80 mt-0.5 truncate max-w-xs">{order.productsSummary}</p>
                        <p className="text-[11px] text-[#C2D6C0]/50 font-mono mt-0.5">{order.customerPhone} • {order.itemsCount} items</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 border-t sm:border-t-0 border-[#2E3D30] pt-2 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <span className="text-base font-black text-white">{order.total}</span>
                        <div className="flex items-center gap-1 text-[11px] font-bold mt-0.5">
                          <span className={`px-2 py-0.5 rounded-md uppercase tracking-wider text-[10px] ${
                            order.status === 'PREPARING' ? 'bg-amber-950 text-amber-300 border border-amber-800/40' :
                            order.status === 'READY' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' :
                            'bg-[#243026] text-[#C2D6C0]'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <button 
                        onClick={() => router.push('/merchant/orders')}
                        className="p-2.5 rounded-xl bg-[#243026] hover:bg-[#8C5A3B] text-white transition-all group-hover:scale-105"
                        title="View order details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-[#C2D6C0]/50">
                  <ShoppingBag size={40} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-bold">No active orders right now</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right 5 Columns: Low Stock Alerts & Quick Restock Rail */}
        <motion.div variants={itemVariants} className="lg:col-span-5 bg-[#1A231C] rounded-[32px] p-6 lg:p-8 border border-[#2E3D30] shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#2E3D30]">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <AlertTriangle size={22} className="text-rose-400" />
                  Low Stock Rail
                </h2>
                <p className="text-xs text-[#C2D6C0] font-medium mt-1">Items running low in your store catalog</p>
              </div>

              <button 
                onClick={() => router.push('/merchant/inventory')}
                className="px-3.5 py-1.5 bg-[#243026] text-[#F3B58C] hover:text-white rounded-xl text-xs font-bold transition-colors border border-[#3A4E38]"
              >
                Inventory
              </button>
            </div>

            <div className="space-y-4">
              {data.lowStockItems && data.lowStockItems.length > 0 ? (
                data.lowStockItems.map(item => (
                  <div key={item.id} className="p-3.5 rounded-2xl bg-[#141A15] border border-rose-900/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#243026] overflow-hidden shrink-0 border border-white/10">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm truncate max-w-[160px]">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-black text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-800/40">
                            {item.stockQty} {item.unit}s left
                          </span>
                          <span className="text-xs font-bold text-[#F3B58C]">{item.price}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => router.push('/merchant/inventory')}
                      className="px-3 py-2 bg-[#8C5A3B] hover:bg-[#784B2E] text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1"
                    >
                      <RefreshCw size={13} />
                      Restock
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-[#C2D6C0]/50">
                  <CheckCircle2 size={40} className="mx-auto mb-2 text-emerald-400 opacity-60" />
                  <p className="text-sm font-bold">All catalog inventory levels healthy!</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#2E3D30]">
            <button 
              onClick={() => router.push('/merchant/restock-center')}
              className="w-full py-3 bg-[#243026] hover:bg-[#2A382C] text-[#F3B58C] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-[#3A4E38]"
            >
              <Sliders size={16} />
              Open Restock Command Center
            </button>
          </div>
        </motion.div>
      </div>

      {/* 4. AI Agent Autopilot Approvals & Local Market Demand Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        
        {/* Left 7 Columns: AI Agent Suggested Approvals */}
        <motion.div variants={itemVariants} className="lg:col-span-7 bg-[#1A231C] rounded-[32px] p-6 lg:p-8 border border-[#2E3D30] shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#2E3D30]">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Bot size={22} className="text-[#F3B58C]" />
                AI Agent Autopilot Suggestions
              </h2>
              <p className="text-xs text-[#C2D6C0] font-medium mt-1">1-click optimization suggestions generated by your store agent</p>
            </div>

            <span className="px-3 py-1 bg-[#3D2618] text-[#F3B58C] rounded-full text-xs font-bold border border-[#8C5A3B]/40">
              Autopilot Active
            </span>
          </div>

          <div className="space-y-4">
            {data.aiAgentActions && data.aiAgentActions.map(action => {
              const isApproved = approvedActionIds.includes(action.id);
              return (
                <div key={action.id} className="p-5 rounded-2xl bg-[#141A15] border border-[#2E3D30] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-[#8C5A3B]/30 text-[#F3B58C] rounded-full border border-[#8C5A3B]/40">
                        {action.badge}
                      </span>
                      <span className="text-xs font-bold text-emerald-400">{action.impact}</span>
                    </div>
                    <h4 className="font-bold text-white text-base mb-1">{action.title}</h4>
                    <p className="text-xs text-[#C2D6C0]/80 leading-relaxed">{action.description}</p>
                  </div>

                  <button
                    onClick={() => handleApproveAIAction(action.id)}
                    disabled={isApproved}
                    className={`px-5 py-3 rounded-xl font-bold text-xs transition-all shadow-md shrink-0 flex items-center gap-2 ${
                      isApproved 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40 opacity-90'
                        : 'bg-[#8C5A3B] hover:bg-[#784B2E] text-white hover:scale-105'
                    }`}
                  >
                    {isApproved ? (
                      <>
                        <CheckCircle2 size={16} />
                        Approved & Applied
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        {action.actionLabel}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Right 5 Columns: Local Market Demand & Neighborhood Searches */}
        <motion.div variants={itemVariants} className="lg:col-span-5 bg-[#1A231C] rounded-[32px] p-6 lg:p-8 border border-[#2E3D30] shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#2E3D30]">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <MapPin size={22} className="text-sky-400" />
                Neighborhood Search Trends
              </h2>
              <p className="text-xs text-[#C2D6C0] font-medium mt-1">High search query demand near your store location</p>
            </div>
          </div>

          <div className="space-y-4">
            {data.localMarketDemand && data.localMarketDemand.map((trend, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#141A15] border border-[#2E3D30] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{trend.query}</h4>
                  <p className="text-xs text-[#C2D6C0]/60 mt-0.5">{trend.category} • {trend.searchCount} local shoppers searching</p>
                </div>

                <span className="text-xs font-bold text-emerald-400 bg-[#243026] px-3 py-1 rounded-full border border-[#3A4E38]">
                  {trend.growth}
                </span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => router.push('/merchant/local-market-intelligence')}
            className="w-full mt-6 py-3 bg-[#243026] hover:bg-[#2A382C] text-[#F3B58C] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-[#3A4E38]"
          >
            Explore Full Market Intelligence
            <ArrowRight size={14} />
          </button>
        </motion.div>
      </div>

      {/* 5. Trending Products & Sales Performance Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        
        {/* Left 7 Columns: Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-7 bg-[#1A231C] rounded-[32px] p-6 lg:p-8 border border-[#2E3D30] shadow-2xl">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#2E3D30]">
            <div>
              <h2 className="text-2xl font-black text-white">Weekly Revenue Trajectory</h2>
              <p className="text-xs text-[#C2D6C0] font-medium mt-1">Live sales breakdown across offline till & online orders</p>
            </div>
            <div className="flex items-center gap-2 bg-[#141A15] px-3 py-1.5 rounded-xl border border-[#2E3D30] text-xs font-bold text-[#F3B58C]">
              <span>This Week</span>
              <ChevronDown size={14} />
            </div>
          </div>

          <div className="w-full h-[260px] relative mt-4">
            <div className="absolute inset-0 bg-gradient-to-t from-[#8C5A3B]/20 to-transparent rounded-b-[2rem] opacity-70"></div>
            <svg className="w-full h-full overflow-visible" fill="none" preserveAspectRatio="none" viewBox="0 0 800 200">
              <path d="M0 50H800" stroke="#2E3D30" strokeDasharray="4 4" strokeWidth="1" opacity="0.5"></path>
              <path d="M0 100H800" stroke="#2E3D30" strokeDasharray="4 4" strokeWidth="1" opacity="0.5"></path>
              <path d="M0 150H800" stroke="#2E3D30" strokeDasharray="4 4" strokeWidth="1" opacity="0.5"></path>
              
              <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                d="M0 170 C 100 170, 150 110, 200 110 C 300 110, 350 150, 400 150 C 500 150, 550 50, 600 50 C 700 50, 750 20, 800 20" 
                stroke="#F3B58C" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
              </motion.path>

              <circle cx="200" cy="110" fill="#141A15" r="5" stroke="#F3B58C" strokeWidth="3"></circle>
              <circle cx="400" cy="150" fill="#141A15" r="5" stroke="#F3B58C" strokeWidth="3"></circle>
              <circle cx="600" cy="50" fill="#141A15" r="5" stroke="#F3B58C" strokeWidth="3"></circle>
              <circle cx="800" cy="20" fill="#141A15" r="7" stroke="#F3B58C" strokeWidth="4"></circle>
            </svg>
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-2 text-xs font-bold text-[#C2D6C0]/50 uppercase tracking-widest">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span className="text-[#F3B58C]">Sun</span>
            </div>
          </div>
        </motion.div>

        {/* Right 5 Columns: Trending Products */}
        <motion.div variants={itemVariants} className="lg:col-span-5 bg-[#1A231C] rounded-[32px] p-6 lg:p-8 border border-[#2E3D30] shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#2E3D30]">
              <h2 className="text-2xl font-black text-white">Top Performing Catalog</h2>
              <button 
                onClick={() => router.push('/merchant/products')}
                className="w-9 h-9 rounded-full bg-[#243026] hover:bg-[#2A382C] flex items-center justify-center transition-colors border border-[#3A4E38]"
              >
                <ArrowRight size={18} className="text-[#F3B58C]" />
              </button>
            </div>

            <div className="space-y-3">
              {data.trendingProducts.map((item, i) => (
                <div 
                  key={item.id || i}
                  className="flex items-center gap-4 p-3 rounded-2xl bg-[#141A15] border border-[#2E3D30] hover:border-[#8C5A3B]/40 transition-all cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10 relative">
                    <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={item.img} alt={item.title} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-white truncate mb-0.5">{item.title}</h4>
                    <p className="text-xs text-[#C2D6C0]/70">{item.sales}</p>
                  </div>
                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <span className="font-black text-sm text-white">{item.price}</span>
                    <span className="text-xs font-bold text-emerald-400 bg-[#243026] px-2 py-0.5 rounded-md border border-[#3A4E38] flex items-center gap-0.5">
                      <ArrowUp size={11} />
                      {item.inc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* 6. Full-Width Dynamic AI Insight Banner (Full Brown) */}
      <motion.div variants={itemVariants} className="w-full rounded-[32px] overflow-hidden relative shadow-2xl group border border-[#8C5A3B]/40">
        <div className="absolute inset-0 bg-gradient-to-r from-[#5C3A21] via-[#734828] to-[#8C5A3B]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 mix-blend-overlay"></div>
        
        <motion.div 
          animate={{ x: [0, 80, 0], y: [0, -40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-[#F3B58C]/20 blur-[80px] rounded-full pointer-events-none"
        ></motion.div>

        <div className="relative z-10 p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-md text-white">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 mb-4 bg-white/15 px-3.5 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
              <Zap className="text-[#F3B58C]" size={16} />
              <span className="font-label-md text-xs font-bold uppercase tracking-widest text-[#F3B58C]">AI Growth Insight</span>
            </div>
            <h2 className="font-display-lg text-3xl lg:text-4xl text-white mb-3 tracking-tight font-black">Unlock Hidden Revenue</h2>
            <p className="font-body-lg text-lg text-white/90 max-w-2xl leading-relaxed font-medium">
              Customers buying <strong className="text-white font-bold">Artisan Forest Honey</strong> frequently search for <strong className="text-white font-bold">Premium Green Tea</strong>. Bundling these items with a 10% discount is projected to increase your average order value by ₹120.
            </p>
          </div>
          
          <div className="shrink-0">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/merchant/marketing')}
              className="h-[64px] px-10 rounded-full bg-white text-[#5C3A21] font-label-md text-lg font-black flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(0,0,0,0.3)] hover:bg-[#FFF0E5] transition-all group"
            >
              <Sparkles size={22} className="group-hover:animate-spin text-[#8C5A3B]" />
              Create Bundle Offer
            </motion.button>
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
}