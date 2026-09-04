"use client";

import React, { useState } from "react";

export default function CustomerHelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How fast is express delivery in my neighborhood?",
      a: "Bazaar pairs orders directly with local vendors, sweet shops, and specialty stores within a 3 km radius. Express delivery typically takes 15 to 25 minutes."
    },
    {
      q: "What happens if an item is out of stock at the store?",
      a: "The merchant will notify you immediately via the app or call to suggest an identical replacement or issue an instant refund to your Bazaar Wallet."
    },
    {
      q: "How do I cancel or modify an active order?",
      a: "You can cancel an order within 60 seconds of placing it directly from the Live Tracking screen or Live Chat support."
    },
    {
      q: "What payment methods are supported on Bazaar?",
      a: "We accept all major UPI apps (Google Pay, PhonePe, Paytm), Credit/Debit cards, Net banking, Bazaar Pay Wallet, and Cash on Delivery (COD)."
    }
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-8 min-h-screen">
      {/* Help Hero & Search Header */}
      <div className="bg-gradient-to-br from-primary via-primary-container to-tertiary text-on-primary rounded-3xl p-8 sm:p-12 mb-10 text-center shadow-xl">
        <span className="bg-black/30 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
          24/7 Customer Care
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold mb-3">How can we help you today?</h1>
        <p className="text-sm opacity-90 max-w-md mx-auto mb-6">
          Find instant answers about your local orders, delivery, refunds, or talk to our live support team.
        </p>

        {/* Help Search Input */}
        <div className="relative max-w-lg mx-auto">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search help topics, refunds, delivery..."
            className="w-full h-12 pl-12 pr-4 bg-surface-container text-on-surface rounded-full text-sm placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary shadow-lg"
          />
        </div>
      </div>

      {/* Support Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <div className="bg-surface-container-low rounded-3xl p-6 border border-surface-container-high shadow-xs text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-2xl">chat</span>
          </div>
          <h4 className="font-bold text-sm text-on-surface mb-1">24/7 Live Chat</h4>
          <p className="text-xs text-on-surface-variant mb-4">Connect with a live support executive in &lt; 2 mins</p>
          <button
            type="button"
            onClick={() => alert("Connecting to Live Support Chat...")}
            className="px-5 py-2 bg-tertiary text-on-tertiary font-bold text-xs rounded-full shadow-xs cursor-pointer hover:bg-tertiary-container transition-colors"
          >
            Start Chat
          </button>
        </div>

        <div className="bg-surface-container rounded-3xl p-6 border border-surface-container-high shadow-xs text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-2xl">call</span>
          </div>
          <h4 className="font-bold text-sm text-on-surface mb-1">Phone Support</h4>
          <p className="text-xs text-on-surface-variant mb-4">Speak directly to our customer helpline</p>
          <a
            href="tel:1800123456"
            className="px-5 py-2 bg-primary text-on-primary font-bold text-xs rounded-full shadow-xs hover:bg-primary-container transition-colors"
          >
            1800-123-456
          </a>
        </div>

        <div className="bg-surface-container rounded-3xl p-6 border border-surface-container-high shadow-xs text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-2xl">mail</span>
          </div>
          <h4 className="font-bold text-sm text-on-surface mb-1">Email Care</h4>
          <p className="text-xs text-on-surface-variant mb-4">Send detailed inquiry or report a issue</p>
          <a
            href="mailto:support@bazaar.local"
            className="px-5 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs rounded-full border border-surface-container-high transition-colors"
          >
            Email Support
          </a>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-surface-container-low rounded-3xl p-6 border border-surface-container-high shadow-xs">
        <h3 className="font-headline-md text-xl font-bold text-on-surface mb-6">Frequently Asked Questions</h3>

        <div className="divide-y divide-surface-container-high">
          {filteredFaqs.map((faq, idx) => (
            <div key={idx} className="py-4 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left font-bold text-sm text-on-surface hover:text-primary transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className="material-symbols-outlined text-on-surface-variant text-[20px] ml-2">
                  {openFaq === idx ? "remove" : "add"}
                </span>
              </button>

              {openFaq === idx && (
                <p className="text-xs text-on-surface-variant mt-3 leading-relaxed animate-in fade-in duration-200">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
