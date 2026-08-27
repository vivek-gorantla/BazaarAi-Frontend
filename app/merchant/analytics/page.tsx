import React from 'react';
import { getAnalyticsData } from '@/services/merchantApi';

export default async function Analytics() {
  const data = await getAnalyticsData();

  return (
    <>
      <div className="flex flex-col w-full">

        <div className="flex flex-col gap-2 mb-section-gap relative z-10">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Business analytics</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Turn your store data into better decisions.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter w-full">

          <div className="lg:col-span-8 bg-surface-container-lowest rounded-[24px] p-card-padding shadow-xl shadow-on-surface/5 flex flex-col group transition-transform duration-500 hover:shadow-2xl hover:shadow-primary/5">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Revenue Overview</h2>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Last 30 Days</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary shadow-sm shadow-primary/40"></span>
                  <span className="font-body-md text-body-md text-on-surface">Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-secondary opacity-70"></span>
                  <span className="font-body-md text-body-md text-on-surface-variant">Previous</span>
                </div>
              </div>
            </div>
            <div className="flex items-baseline gap-4 mb-8">
              <span className="font-display-lg text-display-lg text-on-surface">{data.revenue.total}</span>
              <span className="font-label-md text-label-md text-on-primary-container bg-primary-container px-3 py-1 rounded-full shadow-sm">{data.revenue.increase}</span>
            </div>

            <div className="relative w-full h-64 mt-auto">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 200">
                <line className="text-surface-variant" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="800" y1="50" y2="50"></line>
                <line className="text-surface-variant" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="800" y1="100" y2="100"></line>
                <line className="text-surface-variant" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="800" y1="150" y2="150"></line>

                <path className="text-secondary opacity-50" d="M0,180 C100,160 200,190 300,150 C400,110 500,140 600,90 C700,40 800,100 800,100" fill="none" stroke="currentColor" strokeDasharray="6 6" strokeLinecap="round" strokeWidth="3"></path>

                <path className="text-primary" d="M0,150 C100,130 200,160 300,110 C400,60 500,90 600,40 C700,-10 800,30 800,30" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>

                <circle className="text-secondary shadow-lg" cx="600" cy="40" fill="currentColor" r="6"></circle>
                <circle className="text-secondary opacity-20 animate-pulse" cx="600" cy="40" fill="currentColor" r="14"></circle>
              </svg>

              <div className="absolute top-[10px] left-[550px] bg-inverse-surface text-inverse-on-surface p-4 rounded-xl shadow-xl flex flex-col gap-1">
                <span className="font-label-md text-label-md text-inverse-primary uppercase">Peak Day</span>
                <span className="font-body-lg text-body-lg">{data.revenue.peakDay}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-secondary-container rounded-[24px] p-card-padding shadow-xl shadow-secondary/10 flex flex-col relative overflow-hidden group">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-secondary-fixed rounded-full blur-3xl opacity-60 group-hover:scale-110 transition-transform duration-700"></div>
            <h2 className="font-headline-md text-headline-md text-on-secondary-container mb-6 relative z-10">{data.insight.title}</h2>
            <div className="w-full h-48 bg-cover bg-center rounded-xl mb-6 shadow-md relative z-10 transform group-hover:-translate-y-1 transition-transform duration-500" data-alt="A soft, modern flat-vector illustration of a sun rising over a bustling local market stand, using warm apricot and soft sage green tones. The style is organic, friendly, and minimalist with gentle curves and no harsh outlines." ></div>
            <p 
              className="font-body-lg text-body-lg text-on-secondary-container relative z-10 mb-8 leading-relaxed" 
              dangerouslySetInnerHTML={{ __html: data.insight.descriptionHtml }}
            ></p>
            <button className="mt-auto w-full h-[56px] bg-secondary text-on-secondary font-label-md text-label-md rounded-xl shadow-lg shadow-secondary/30 hover:bg-on-secondary-container hover:text-on-secondary transition-colors relative z-10 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">campaign</span>
              Draft Promotion
            </button>
          </div>

          <div className="lg:col-span-7 bg-surface-container-lowest rounded-[24px] p-card-padding shadow-xl shadow-on-surface/5 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-headline-md text-headline-md text-on-surface">Top Products</h2>
              <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined">more_horiz</span>
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {data.topProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between p-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container transition-colors group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-cover bg-center rounded-lg shadow-sm" style={{backgroundImage: `url(${product.image})`}}></div>
                    <div>
                      <h3 className="font-body-lg text-body-lg text-on-surface font-semibold group-hover:text-primary transition-colors">{product.title}</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant">{product.subtitle}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="font-headline-md text-headline-md text-on-surface">{product.revenue}</span>
                    <span className={`font-label-md text-label-md ${product.trendClass} px-2 py-0.5 rounded-md flex items-center gap-1`}>
                      <span className="material-symbols-outlined text-[16px]">{product.trendIcon}</span> {product.trendValue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-gutter">
            <div className="bg-surface-container-lowest rounded-[24px] p-card-padding shadow-xl shadow-on-surface/5 flex-1 flex flex-col group">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Order Volume</h2>
              <div className="flex-1 w-full flex items-end justify-between gap-2 h-32 mt-auto">
                <div className="w-1/6 bg-surface-container hover:bg-primary-container transition-colors rounded-t-md h-[40%]"></div>
                <div className="w-1/6 bg-surface-container hover:bg-primary-container transition-colors rounded-t-md h-[55%]"></div>
                <div className="w-1/6 bg-surface-container hover:bg-primary-container transition-colors rounded-t-md h-[30%]"></div>
                <div className="w-1/6 bg-surface-container hover:bg-primary-container transition-colors rounded-t-md h-[70%]"></div>
                <div className="w-1/6 bg-primary rounded-t-md h-[90%] shadow-lg shadow-primary/20 relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 font-label-md text-label-md text-primary whitespace-nowrap">Peak</div>
                </div>
                <div className="w-1/6 bg-surface-container hover:bg-primary-container transition-colors rounded-t-md h-[60%]"></div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-[24px] p-card-padding shadow-xl shadow-on-surface/5 flex-1 flex items-center justify-between group">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Customers</h2>
                <p className="font-stats-number text-stats-number text-on-surface mb-1">{data.customers.total}</p>
                <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span> {data.customers.newPercentage}
                </p>
              </div>
              <div className="w-24 h-24 relative">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-surface-container-high" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                  <path className="drop-shadow-md" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="68, 100" strokeWidth="4"></path>
                  <path className="text-secondary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="32, 100" strokeDashoffset="-68" strokeWidth="4"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}