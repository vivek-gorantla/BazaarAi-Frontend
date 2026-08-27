"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const features = [
    {
      id: "demand",
      title: "Neighborhood Intelligence",
      description: "Stop guessing what your community wants. Our local market analytics map demand heatspots around your store, telling you exactly when to stock artisan breads versus everyday essentials based on real-time neighborhood foot traffic and purchasing trends.",
      points: [
        "Reduce dead stock by perfectly aligning inventory with local demand.",
        "Maximize foot traffic with hyper-targeted product discovery.",
        "Gain real-time insights into changing community purchasing behaviors."
      ],
      image: "/images/landing/demand_vector.svg",
      color: "from-emerald-500/20 to-teal-500/20",
    },
    {
      id: "ai_ops",
      title: "Autonomous Restock Agents",
      description: "Automate your entire supply chain with one click. Whether it's uploading a quick audio memo, recording a video of your shelves, or dropping an excel sheet, our agents will instantly update your stock and handle the heavy lifting.",
      points: [
        "Update inventory instantly using voice notes or quick videos.",
        "Bulk import legacy data seamlessly via Excel integrations.",
        "Free up hours of manual labor, allowing shop owners to focus on growth."
      ],
      image: "/images/landing/ai_robot_vector.svg",
      color: "from-blue-500/20 to-indigo-500/20",
    },
    {
      id: "audit",
      title: "Comprehensive Audit Trail",
      description: "Keep track of every action taken by your team or autonomous agents. Maintain total visibility and security over your business operations with our detailed, immutable logs.",
      points: [
        "Every restock, sale, and adjustment is permanently logged with timestamps.",
        "Prevent internal fraud and stock shrinkage effortlessly.",
        "Essential for strict financial compliance and error-free reconciliations."
      ],
      image: "/images/landing/audit_trail_vector.svg",
      color: "from-orange-500/20 to-amber-500/20",
    },
    {
      id: "profit",
      title: "Profit & Loss Tracking",
      description: "Monitor your financial health with precision. Our automated P&L dashboards give you real-time visibility into revenue, costs, and upward trends so you can maximize margins.",
      points: [
        "Advanced predictive forecasting projects your revenue weeks in advance.",
        "Pinpoint exactly which products are driving your highest profit margins.",
        "Optimize pricing dynamically to maximize your net take-home pay."
      ],
      image: "/images/landing/profit_loss_chart.svg",
      color: "from-green-500/20 to-emerald-500/20",
    }
  ];

  return (
    <div className="min-h-screen bg-surface overflow-x-hidden">
      {/* Scroll Progress Timeline */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-[#556B2F] origin-left z-50"
        style={{ scaleX }}
      />

      {/* Hero Section */}
      <section className="relative px-6 pt-8 pb-12 mx-auto max-w-7xl">
        <div className="relative w-full min-h-[600px] rounded-[2rem] overflow-hidden flex flex-col items-center justify-center text-center px-6 py-24 shadow-2xl">
          {/* Background Image & Overlay */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2000&auto=format&fit=crop')" }}
          />
          <div className="absolute inset-0 z-0 bg-[#2C3329]/80 backdrop-blur-[2px] mix-blend-multiply" />
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#1A1F18] via-transparent to-transparent opacity-90" />

          {/* Content */}
          <div className="relative z-10 max-w-4xl flex flex-col items-center">
            {/* Pill */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-8 px-4 py-1.5 rounded-full border border-[#84A187]/30 bg-[#84A187]/20 backdrop-blur-md flex items-center gap-2 shadow-sm"
            >
              <div className="w-2 h-2 rounded-full bg-[#b5c7ba]" />
              <span className="text-[#d8e3dc] text-xs font-bold tracking-widest uppercase">
                Bazaar Merchant OS v2.0
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight mb-8"
            >
              Empower Your Business
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="text-lg md:text-xl text-white/90 max-w-3xl mb-12 leading-relaxed font-medium"
            >
              The modern business engine that combines beautiful inventory management with autonomous AI agents, bridging the gap between your physical shelves and digital success.
            </motion.p>

            {/* Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <Link href="/merchant/dashboard">
                <button className="px-8 py-3.5 bg-[#8C5A3B] text-white rounded-xl text-lg font-bold hover:bg-[#7A4E33] transition-all shadow-lg hover:shadow-[#8C5A3B]/30 hover:-translate-y-0.5 active:translate-y-0">
                  Start Free Trial
                </button>
              </Link>
              <button className="px-8 py-3.5 bg-white/10 text-white border border-white/20 rounded-xl text-lg font-bold hover:bg-white/20 transition-all backdrop-blur-md hover:-translate-y-0.5 active:translate-y-0 shadow-lg">
                Watch Demo
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Zig-Zag Features Section */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col gap-32">
        {features.map((feature, index) => {
          const isEven = index % 2 === 0;
          
          return (
            <div 
              key={feature.id} 
              className={`flex flex-col lg:flex-row items-center gap-16 lg:gap-24 ${!isEven ? 'lg:flex-row-reverse' : ''}`}
            >
              {/* Text Half */}
              <motion.div 
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex-1 space-y-6"
              >
                <h2 className="text-5xl lg:text-6xl font-black text-[#556B2F] leading-tight tracking-tight">
                  {feature.title}
                </h2>
                <p className="text-xl text-on-surface-variant leading-relaxed">
                  {feature.description}
                </p>
                {feature.points && (
                  <ul className="space-y-4 mt-8">
                    {feature.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <CheckCircle2 className="w-6 h-6 text-[#556B2F] mt-0.5 shrink-0" />
                        <span className="text-lg text-on-surface-variant/90">{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>

              {/* Image Half */}
              <motion.div 
                initial={{ opacity: 0, x: isEven ? 50 : -50, scale: 0.9 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className="flex-1 relative w-full aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-50 mix-blend-overlay z-10`} />
                <div className="absolute inset-0 bg-surface-container-highest animate-pulse-soft" />
                {/* Fallback structure while images load */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-in-out bg-white"
                  />
                </div>
              </motion.div>
            </div>
          );
        })}
      </section>

      {/* Bottom CTA */}
      <section className="py-32 px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-surface-container-high max-w-4xl mx-auto rounded-[3rem] p-12 md:p-20 shadow-2xl border border-outline-variant/30"
        >
          <h2 className="text-4xl md:text-6xl font-black text-on-surface mb-6">
            Ready to transform your store?
          </h2>
          <p className="text-xl text-on-surface-variant mb-10 max-w-2xl mx-auto">
            Join the digital revolution with Bazaar and take complete control of your retail business today.
          </p>
          <Link href="/merchant/dashboard">
            <button className="px-12 py-6 bg-on-surface text-surface rounded-full text-xl font-bold hover:bg-on-surface/90 transition-all shadow-xl hover:scale-105 active:scale-95">
              Get Started Now
            </button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}