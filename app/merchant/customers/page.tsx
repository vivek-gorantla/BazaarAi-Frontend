import React from 'react';
import { getCustomersData } from '@/services/merchantApi';

export default async function Customers() {
  const data = await getCustomersData();

  return (
    <>
      <div className="flex flex-col w-full gap-section-gap pb-16 relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-fixed opacity-30 rounded-full blur-[120px] pointer-events-none -z-10 -mt-32 -mr-32"></div>
        <div className="absolute top-[40%] left-0 w-[400px] h-[400px] bg-secondary-fixed opacity-20 rounded-full blur-[100px] pointer-events-none -z-10 -ml-20"></div>

        <header className="flex flex-col gap-2 pt-8">
          <h1 className="text-display-lg font-display-lg text-on-surface">Your customers</h1>
          <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl">Understand the people who keep your store growing.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter w-full">
          {data.metrics.map(metric => (
            <div key={metric.id} className={`${metric.isProgressBar ? 'bg-primary text-on-primary shadow-[0px_15px_40px_rgba(73,98,70,0.2)]' : 'bg-surface-container-lowest shadow-[0px_10px_30px_rgba(31,41,35,0.04)]'} rounded-[24px] p-card-padding flex flex-col gap-4 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}>
              {metric.isProgressBar && <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary-container/20 to-transparent"></div>}
              <div className="flex justify-between items-start relative z-10">
                <span className={`text-label-md font-label-md ${metric.isProgressBar ? 'text-on-primary/80' : 'text-outline'} uppercase tracking-widest`}>{metric.label}</span>
                <div className={`w-10 h-10 rounded-full ${metric.iconBgClass} flex items-center justify-center ${metric.iconColorClass}`}>
                  <span className="material-symbols-outlined text-[20px]">{metric.icon}</span>
                </div>
              </div>
              <div className="flex items-baseline gap-3 mt-2 relative z-10">
                <span className={`text-stats-number font-stats-number ${metric.isProgressBar ? 'text-on-primary' : 'text-on-surface'}`}>{metric.value}</span>
                <span className={`text-label-md font-label-md ${metric.isProgressBar ? 'text-primary-fixed' : 'text-primary'}`}>{metric.trend}</span>
              </div>

              {metric.isProgressBar ? (
                <div className="w-full bg-on-primary/20 rounded-full h-2 mt-4 relative z-10 overflow-hidden">
                  <div className="bg-on-primary h-full rounded-full" style={{ width: metric.progressValue }}></div>
                </div>
              ) : (
                <svg className={`w-full h-8 mt-2 ${metric.svgColorClass}`} fill="none" preserveAspectRatio="none" viewBox="0 0 100 24">
                  <path d={metric.id === "2" ? "M0 22 L 20 18 L 40 20 L 60 12 L 80 16 L 100 8" : metric.id === "3" ? "M0 15 Q 20 5, 40 15 T 80 10 T 100 5" : "M0 20 Q 10 15, 20 22 T 40 18 T 60 10 T 80 15 T 100 4"} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  {metric.id === "1" && <path d="M0 20 Q 10 15, 20 22 T 40 18 T 60 10 T 80 15 T 100 4 V 24 H 0 Z" fill="currentColor" fillOpacity="0.1"></path>}
                </svg>
              )}
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-6 w-full -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-lg font-headline-lg text-on-surface">Your regulars</h2>
            <button className="text-label-md font-label-md text-primary hover:text-primary-container transition-colors flex items-center gap-1">
              View all <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
          <div className="flex overflow-x-auto gap-gutter pb-6 -mb-6 snap-x custom-scrollbar">
            {data.regulars.map(customer => (
              <div key={customer.id} className="snap-start shrink-0 w-[280px] bg-surface-container-lowest rounded-[24px] p-card-padding shadow-[0px_10px_30px_rgba(31,41,35,0.04)] flex flex-col items-center text-center gap-4 hover:-translate-y-1 transition-transform">
                {customer.image ? (
                  <img className="w-24 h-24 rounded-full object-cover shadow-sm bg-surface-variant" src={customer.image} alt={customer.name} />
                ) : (
                  <div className={`w-24 h-24 rounded-full shadow-sm flex items-center justify-center text-display-lg font-display-lg ${customer.initialBgClass}`}>
                    {customer.initial}
                  </div>
                )}
                <div className="flex flex-col items-center gap-1">
                  <h3 className="text-headline-md font-headline-md text-on-surface">{customer.name}</h3>
                  <p className="text-body-md font-body-md text-on-surface-variant">{customer.orders}</p>
                </div>
                <span className={`text-label-md font-label-md px-4 py-1.5 rounded-full mt-2 ${customer.badgeClass}`}>{customer.badge}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6 w-full mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-md font-headline-md text-on-surface">Customer Directory</h2>
            <div className="flex gap-4">
              <div className="bg-surface-container rounded-full px-4 py-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-outline text-[18px]">filter_list</span>
                <span className="text-label-md font-label-md text-on-surface-variant">Filter</span>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col gap-2">
            <div className="grid grid-cols-12 px-6 py-2 text-label-md font-label-md text-outline uppercase tracking-widest">
              <div className="col-span-4">Customer</div>
              <div className="col-span-2 text-center">Orders</div>
              <div className="col-span-2 text-right">Total Spend</div>
              <div className="col-span-2 text-center">Favorite Category</div>
              <div className="col-span-2 text-right">Type</div>
            </div>

            {data.directory.map(customer => (
              <div key={customer.id} className="grid grid-cols-12 px-6 py-5 bg-surface-container-lowest hover:bg-surface-container transition-colors duration-200 rounded-[16px] items-center shadow-[0px_5px_15px_rgba(31,41,35,0.02)]">
                <div className="col-span-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${customer.initialBgClass} flex items-center justify-center ${customer.initialColorClass} font-headline-md`}>
                    {customer.initial}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-body-md font-headline-md text-on-surface">{customer.name}</span>
                    <span className="text-label-md font-label-md text-on-surface-variant">{customer.email}</span>
                  </div>
                </div>
                <div className="col-span-2 text-center text-body-md font-body-md text-on-surface">{customer.orders}</div>
                <div className="col-span-2 text-right text-body-md font-headline-md text-on-surface">{customer.spend}</div>
                <div className="col-span-2 text-center text-body-md font-body-md text-on-surface-variant">{customer.category}</div>
                <div className="col-span-2 flex justify-end">
                  <span className={`text-label-md font-label-md px-3 py-1 rounded-full ${customer.badgeClass}`}>{customer.badge}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}