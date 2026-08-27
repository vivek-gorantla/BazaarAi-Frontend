import React from 'react';
import { getRestockCenterData } from '@/services/merchantApi';

export default async function RestockCenter() {
  const data = await getRestockCenterData();

  return (
    <>
      <div className="flex flex-col w-full space-y-section-gap pb-section-gap">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface-container-low rounded-[32px] p-card-padding shadow-[0_10px_30px_rgba(31,41,35,0.02)]">
          <div>
            <h1 className="font-display-lg text-display-lg text-on-surface mb-2">Restock Center</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Manage your procurement pipeline, review AI-driven restock recommendations, and track active purchase orders.</p>
          </div>
          <div className="mt-6 md:mt-0 flex gap-4">
            <button className="h-14 px-8 rounded-full bg-secondary-container hover:bg-secondary-fixed transition-colors flex items-center justify-center gap-2 group shadow-sm">
              <span className="material-symbols-outlined text-on-secondary-container transition-transform group-hover:scale-110">local_shipping</span>
              <span className="font-label-md text-label-md text-on-secondary-container uppercase tracking-widest">View Suppliers</span>
            </button>
            <button className="h-14 px-8 rounded-full bg-primary hover:bg-primary-fixed-dim transition-colors flex items-center justify-center gap-2 group shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-on-primary group-hover:text-on-primary-fixed-variant transition-colors">add_shopping_cart</span>
              <span className="font-label-md text-label-md text-on-primary group-hover:text-on-primary-fixed-variant uppercase tracking-widest transition-colors">Create P.O.</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-8 flex flex-col space-y-gutter">
            <section className="bg-surface-container-lowest rounded-[32px] p-card-padding shadow-[0_10px_30px_rgba(31,41,35,0.04)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-error-container rounded-full blur-3xl opacity-20 -mr-32 -mt-32 pointer-events-none"></div>
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-error-container text-[24px]">warning</span>
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">Critical Low Stock</h2>
                </div>
                <span className="px-4 py-1.5 rounded-full bg-surface-container-highest font-label-md text-label-md text-on-surface-variant">{data.criticalStock.countText}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                {data.criticalStock.items.map(item => (
                  <div key={item.id} className="bg-surface rounded-2xl p-6 group hover:bg-surface-container transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-16 h-16 rounded-xl bg-surface-container-low overflow-hidden" style={{backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                      <span className="font-label-md text-label-md text-error bg-error-container px-3 py-1 rounded-full">{item.unitsLeft}</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-1">{item.name}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-4">{item.sku}</p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/20">
                      <p className="font-label-md text-label-md text-outline">{item.expected}</p>
                      <button className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-on-primary text-[18px]">add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded-[32px] p-card-padding shadow-[0_10px_30px_rgba(31,41,35,0.04)] relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-container rounded-full blur-3xl opacity-10 pointer-events-none"></div>
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-secondary-container text-[24px]">auto_awesome</span>
                  </div>
                  <div>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface">AI Recommendations</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Based on 30-day sales velocity and seasonal trends.</p>
                  </div>
                </div>
                <button className="font-label-md text-label-md text-primary hover:text-primary-fixed-dim transition-colors flex items-center gap-1">
                  Accept All <span className="material-symbols-outlined text-[18px]">check_circle</span>
                </button>
              </div>
              <div className="space-y-4 relative z-10">
                {data.aiRecommendations.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.iconColorClass}`}>
                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-headline-md text-headline-md text-on-surface text-[18px]">{item.name}</h4>
                        <p className="font-body-md text-body-md text-on-surface-variant text-sm">{item.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-label-md text-label-md text-outline">Suggested Qty</p>
                        <p className="font-stats-number text-[24px] text-on-surface">{item.qty} <span className="text-body-md font-body-md text-on-surface-variant ml-1">units</span></p>
                      </div>
                      <button className="w-10 h-10 rounded-xl bg-surface-variant hover:bg-primary hover:text-on-primary text-on-surface-variant flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 flex flex-col space-y-gutter">
            <section className="bg-surface-container-lowest rounded-[32px] p-card-padding shadow-[0_10px_30px_rgba(31,41,35,0.04)] flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Active P.O.s</h2>
                <span className="material-symbols-outlined text-outline">receipt_long</span>
              </div>
              <div className="space-y-4">
                {data.activePos.items.map(po => (
                  <div key={po.id} className="p-4 rounded-2xl border border-outline-variant/30 hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-label-md text-label-md text-on-surface-variant">{po.poId}</span>
                      <span className={`font-label-md text-label-md px-2 py-0.5 rounded-full ${po.statusClass}`}>{po.status}</span>
                    </div>
                    <h4 className="font-headline-md text-[18px] text-on-surface mb-1">{po.supplier}</h4>
                    <div className="flex justify-between items-center mt-4">
                      <p className="font-body-md text-body-md text-outline text-sm">{po.summary}</p>
                      <p className="font-label-md text-label-md text-on-surface-variant text-sm flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">{po.actionIcon}</span> {po.dateOrAction}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors font-label-md text-label-md text-on-surface flex items-center justify-center gap-2">
                View All Orders <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </section>

            <section className="bg-primary rounded-[32px] p-card-padding shadow-xl shadow-primary/10 relative overflow-hidden text-on-primary">
              <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-primary-fixed-dim rounded-full blur-3xl opacity-40"></div>
              <div className="absolute -top-16 -left-16 w-48 h-48 bg-primary-fixed rounded-full blur-3xl opacity-20"></div>
              <div className="relative z-10">
                <h2 className="font-headline-lg text-headline-lg mb-6">Key Suppliers</h2>
                <div className="space-y-4">
                  {data.keySuppliers.items.map(supplier => (
                    <div key={supplier.id} className="flex items-center justify-between p-4 rounded-2xl bg-on-primary/10 hover:bg-on-primary/20 transition-colors backdrop-blur-sm cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-headline-md ${supplier.initialClass}`}>{supplier.initial}</div>
                        <div>
                          <h4 className="font-headline-md text-[16px]">{supplier.name}</h4>
                          <p className={`font-body-md text-sm ${supplier.balanceClass}`}>{supplier.balance}</p>
                        </div>
                      </div>
                      <button className="w-8 h-8 rounded-full bg-on-primary/20 flex items-center justify-center hover:bg-on-primary hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[18px]">mail</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}