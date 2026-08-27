"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Megaphone, 
  Gift, 
  HandHeart, 
  Sparkles, 
  MoreVertical, 
  TrendingUp, 
  PieChart 
} from 'lucide-react';
import { getMarketingData, MarketingData } from '@/services/merchantApi';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Marketing() {
  const [data, setData] = useState<MarketingData | null>(null);

  useEffect(() => {
    getMarketingData().then(setData);
  }, []);

  if (!data) return <div className="p-8">Loading...</div>;

  return (
    <motion.div 
      className="flex flex-col w-full"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="grid grid-cols-12 gap-gutter mb-section-gap pt-4">
        <div className="col-span-12 lg:col-span-8 flex flex-col justify-center">
          <h1 className="font-display-lg text-display-lg text-on-surface mb-2 tracking-tight">{data.header.titlePrefix} <span className="premium-gradient">{data.header.titleHighlight}</span></h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">{data.header.subtitle}</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-12 gap-gutter mb-section-gap relative">
        <div className="col-span-12 rounded-[32px] bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative min-h-[450px] flex items-center p-8 lg:p-14 border border-white/40 backdrop-blur-3xl">
          <div className="absolute inset-0 z-0">
            <div className="w-full h-full bg-cover bg-center opacity-70 mix-blend-multiply" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCa9CCP04-XvbxC8MJ6zlrqBgDm6v8q5dsBQbJJ-fLj9KgZ6TOaEolA__1xUe_O8KBf_oiev0Jh0smjeUa_domNj0LNehE_iOSvrbyboQWXpsSeXgao-o1nwXakjqzrPFcV1JuZf7Knx-po1Y41ESN-ym4TThzBX6RkDX5hfNrIhXKrwpojXBq8PUOpCZdJOPIs3Z5Z6VU6sshlXM5R682qzS7-2b6ESB4nM-PvFtFvfvWuCwW1CIZZ')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-surface/90 via-surface/70 to-transparent"></div>
          </div>
          
          <div className="relative z-10 max-w-xl glass-panel p-8 lg:p-10 rounded-[24px] shadow-2xl border-l-4 border-l-primary" >
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4 leading-tight">{data.hero.title}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-8 leading-relaxed">{data.hero.subtitle}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-primary hover:bg-primary-fixed-variant text-on-primary transition-colors rounded-xl h-14 font-label-md text-label-md flex items-center justify-center gap-2 premium-shadow"
              >
                <Megaphone size={18} /> Create Promotion
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-surface-container hover:bg-white text-on-surface transition-colors rounded-xl h-14 font-label-md text-label-md flex items-center justify-center gap-2 shadow-sm border border-outline-variant/30"
              >
                <Gift size={18} className="text-secondary" /> Send Festival Offer
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-surface-container hover:bg-white text-on-surface transition-colors rounded-xl h-14 font-label-md text-label-md flex items-center justify-center gap-2 shadow-sm border border-outline-variant/30"
              >
                <HandHeart size={18} className="text-primary" /> Re-engagement
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-surface-container hover:bg-white text-on-surface transition-colors rounded-xl h-14 font-label-md text-label-md flex items-center justify-center gap-2 shadow-sm border border-outline-variant/30"
              >
                <Sparkles size={18} className="text-secondary" /> Product Announcement
              </motion.button>
            </div>
          </div>
          
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute right-12 bottom-12 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white flex items-center gap-4 z-10 hidden md:flex"
          >
            <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center text-secondary">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="font-label-md text-sm text-outline uppercase tracking-wider">Estimated Lift</p>
              <p className="font-stats-number text-2xl text-on-surface">{data.hero.lift}</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-8">
        <h3 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center shadow-inner">
            <PieChart className="text-primary" size={20} />
          </div>
          Active Campaigns
        </h3>
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-12 gap-gutter">
        {data.campaigns.map(campaign => (
          <motion.div key={campaign.id} variants={itemVariants} className="col-span-12 lg:col-span-6 glass-card rounded-[24px] p-card-padding relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-40 h-40 ${campaign.bgClass} rounded-bl-full -z-10 group-hover:scale-125 transition-transform duration-700`}></div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full ${campaign.badgeClass} font-label-md text-xs uppercase tracking-widest mb-3 backdrop-blur-sm shadow-sm border`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${campaign.badgeDotClass} mr-2`}></span> {campaign.badge}
                </span>
                <h4 className="font-headline-md text-headline-md text-on-surface">{campaign.title}</h4>
                <p className="font-body-md text-body-md text-outline mt-1">{campaign.description}</p>
              </div>
              <button className="w-10 h-10 rounded-full bg-surface-container hover:bg-white flex items-center justify-center text-on-surface-variant transition-colors shadow-sm">
                <MoreVertical size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 border-t border-outline-variant/30 pt-6 mt-2 relative z-10">
              <div>
                <p className="font-label-md text-label-md text-outline mb-1 uppercase tracking-wider">Reach</p>
                <p className="font-stats-number text-3xl text-on-surface">{campaign.stats.reach}</p>
              </div>
              <div>
                <p className="font-label-md text-label-md text-outline mb-1 uppercase tracking-wider">Clicks</p>
                <p className="font-stats-number text-3xl text-on-surface">{campaign.stats.clicks}</p>
              </div>
              <div>
                <p className="font-label-md text-label-md text-outline mb-1 uppercase tracking-wider">Conv.</p>
                <div className="flex items-end gap-2">
                  <p className={`font-stats-number text-3xl ${campaign.stats.conversionClass}`}>{campaign.stats.conversion}</p>
                  {campaign.stats.conversionIcon && <TrendingUp size={16} className={`${campaign.stats.conversionClass} mb-2`} />}
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-surface-container-high h-2.5 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${campaign.progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`bg-gradient-to-r ${campaign.progressClass} h-full rounded-full relative`}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)50%,rgba(255,255,255,0.2)75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]"></div>
                  </motion.div>
                </div>
                {campaign.footerText && <p className={`font-label-md text-xs ${campaign.footerClass}`}>{campaign.footerText}</p>}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide {
          from { background-position: 0 0; }
          to { background-position: 20px 0; }
        }
      `}} />
    </motion.div>
  );
}