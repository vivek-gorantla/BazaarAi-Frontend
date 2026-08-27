import React from 'react';
import { getInventoryData } from '@/services/merchantApi';

export default async function Inventory() {
  const data = await getInventoryData();
  const { summary, items } = data;

  return (
    <>
      <div className="flex flex-col w-full gap-section-gap pb-12 relative z-10">

        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none transform -translate-y-1/2 translate-x-1/4"></div>

        <div className="flex flex-col gap-2 max-w-2xl mt-4">
          <h1 className="font-display-lg text-display-lg text-on-surface">Inventory</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Know what’s selling, what’s running low, and what needs restocking.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter w-full">
          <div className="bg-surface-container-lowest rounded-[24px] p-card-padding shadow-[0_10px_30px_rgba(31,41,35,0.04)] flex flex-col gap-4 group transition-transform hover:-translate-y-1 duration-300">
            <div className="flex justify-between items-start">
              <span className="font-label-md text-label-md text-outline uppercase tracking-widest">Total Products</span>
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">inventory_2</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-stats-number text-stats-number text-on-surface">{summary.total}</span>
              <span className="font-body-md text-body-md text-on-surface-variant mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">trending_up</span> Across all categories
              </span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-[24px] p-card-padding shadow-[0_10px_30px_rgba(31,41,35,0.04)] flex flex-col gap-4 group transition-transform hover:-translate-y-1 duration-300">
            <div className="flex justify-between items-start">
              <span className="font-label-md text-label-md text-outline uppercase tracking-widest">Healthy Stock</span>
              <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">check_circle</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-stats-number text-stats-number text-on-surface">{summary.healthy}</span>
              <span className="font-body-md text-body-md text-primary mt-1">Ready to sell</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-[24px] p-card-padding shadow-[0_10px_30px_rgba(31,41,35,0.04)] flex flex-col gap-4 group transition-transform hover:-translate-y-1 duration-300">
            <div className="flex justify-between items-start">
              <span className="font-label-md text-label-md text-outline uppercase tracking-widest">Low Stock</span>
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container">warning</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-stats-number text-stats-number text-secondary">{summary.lowStock}</span>
              <span className="font-body-md text-body-md text-secondary mt-1">Requires attention</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-[24px] p-card-padding shadow-[0_10px_30px_rgba(31,41,35,0.04)] flex flex-col gap-4 group transition-transform hover:-translate-y-1 duration-300">
            <div className="flex justify-between items-start">
              <span className="font-label-md text-label-md text-outline uppercase tracking-widest">Out of Stock</span>
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-error-container">error</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-stats-number text-stats-number text-error">{summary.outOfStock}</span>
              <span className="font-body-md text-body-md text-error mt-1">Lost revenue potential</span>
            </div>
          </div>
        </div>

        <div className="w-full bg-secondary-container rounded-[24px] p-card-padding flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[0_10px_30px_rgba(31,41,35,0.04)] overflow-hidden relative">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-secondary/10 to-transparent pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[28px] text-on-secondary-container">assignment_late</span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-secondary-container mb-1">Running low?</h3>
              <p className="font-body-lg text-body-lg text-on-secondary-container/80">{summary.lowStock} products may need restocking soon to meet incoming demand.</p>
            </div>
          </div>
          <button className="h-[56px] px-8 rounded-full bg-secondary text-on-secondary font-label-md text-label-md hover:bg-secondary/90 transition-colors shadow-md flex items-center gap-2 relative z-10 whitespace-nowrap">
            Review &amp; Order
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>

        <div className="flex flex-col w-full gap-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Current Inventory</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-surface-container-lowest rounded-full px-4 h-12 shadow-sm">
                <span className="material-symbols-outlined text-outline mr-2">filter_list</span>
                <span className="font-label-md text-label-md text-on-surface">Filter by Status</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-surface-container-low rounded-xl items-center">
            <div className="col-span-5 font-label-md text-label-md text-outline uppercase tracking-widest">Product</div>
            <div className="col-span-2 font-label-md text-label-md text-outline uppercase tracking-widest">Stock Level</div>
            <div className="col-span-2 font-label-md text-label-md text-outline uppercase tracking-widest">Velocity</div>
            <div className="col-span-2 font-label-md text-label-md text-outline uppercase tracking-widest">Status</div>
            <div className="col-span-1 font-label-md text-label-md text-outline uppercase tracking-widest text-right">Action</div>
          </div>

          <div className="flex flex-col gap-2">
            {items.map(item => (
              <div key={item.id} className={`grid grid-cols-12 gap-4 p-4 bg-surface-container-lowest rounded-2xl items-center shadow-[0_4px_20px_rgba(31,41,35,0.02)] transition-colors hover:bg-surface-container-low/50 group cursor-pointer ${item.isGrayscale ? 'opacity-80' : ''}`}>
                <div className="col-span-5 flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl bg-surface-container overflow-hidden shadow-inner ${item.isGrayscale ? 'grayscale' : ''}`}>
                    <img className="w-full h-full object-cover" src={item.image} alt={item.title} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-headline-md text-[20px] leading-tight text-on-surface truncate">{item.title}</span>
                    <span className="font-body-md text-body-md text-on-surface-variant truncate">{item.subtitle}</span>
                  </div>
                </div>
                <div className="col-span-2 flex flex-col">
                  <span className={`font-stats-number text-[24px] leading-none ${item.unitColorClass}`}>{item.units}</span>
                  <span className={`font-body-md text-[14px] ${item.unitColorClass === 'text-error' ? 'text-error/80' : 'text-on-surface-variant'}`}>Units</span>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <span className={item.velocityIcon ? 'font-body-lg text-body-lg text-on-surface' : 'font-body-lg text-body-lg text-on-surface-variant'}>{item.velocity}</span>
                  {item.velocityIcon && (
                    <span className={`material-symbols-outlined text-[16px] ${item.velocityColorClass}`}>{item.velocityIcon}</span>
                  )}
                </div>
                <div className="col-span-2">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full ${item.statusClass} font-label-md text-[12px] uppercase tracking-wider`}>
                    {item.status}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button className={`w-12 h-12 rounded-full bg-surface-container flex items-center justify-center ${item.actionHoverClass} transition-colors text-on-surface-variant relative`}>
                    {item.hasNotification && (
                      <span className="absolute top-0 right-0 w-3 h-3 bg-error border-2 border-surface-container-lowest rounded-full"></span>
                    )}
                    <span className="material-symbols-outlined">{item.actionIcon}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}