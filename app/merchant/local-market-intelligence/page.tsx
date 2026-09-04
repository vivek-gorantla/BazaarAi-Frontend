import React from 'react';
import { getLocalMarketIntelligenceData } from '@/services/merchantApi';

export default async function LocalMarketIntelligence() {
  const data = await getLocalMarketIntelligenceData();

  return (
    <>
      <div className="flex flex-col w-full gap-section-gap">
        <div className="flex flex-col gap-6 w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 w-full">
            <div className="flex flex-col gap-2">
              <h1 className="text-display-lg font-display-lg text-on-surface tracking-tight">Local Market Intelligence</h1>
              <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl">Understand what your neighborhood is buying.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {data.filters.map(filter => (
                <button key={filter.id} className="flex items-center gap-2 px-4 py-3 bg-surface-container hover:bg-surface-container-high rounded-full transition-colors text-label-md font-label-md text-on-surface shadow-sm">
                  <span className="material-symbols-outlined text-outline text-[20px]">{filter.icon}</span>
                  <span>{filter.text}</span>
                  <span className="material-symbols-outlined text-outline text-[20px]">expand_more</span>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full relative rounded-3xl overflow-hidden shadow-md h-[400px] md:h-[500px]">
            <div className="absolute inset-0 w-full h-full">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${data.location.lng - 0.015}%2C${data.location.lat - 0.015}%2C${data.location.lng + 0.015}%2C${data.location.lat + 0.015}&layer=mapnik&marker=${data.location.lat}%2C${data.location.lng}`}
                style={{ filter: "invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)", pointerEvents: "auto" }}
              ></iframe>
            </div>
            <div className="absolute inset-0 bg-surface/10 pointer-events-none mix-blend-multiply"></div>
            <div className="absolute inset-0 z-10 pointer-events-none">
              <svg className="w-full h-full opacity-60" preserveAspectRatio="none" viewBox="0 0 100 100">
                <circle className="text-primary-container blur-2xl opacity-40 animate-pulse" cx="50" cy="50" fill="currentColor" r="10"></circle>
                <circle className="text-secondary-container blur-3xl opacity-30" cx="65" cy="40" fill="currentColor" r="15"></circle>
              </svg>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-xl shadow-primary/30 ring-4 ring-white/50 relative">
                <span className="material-symbols-outlined text-on-primary" >store</span>
                <div className="absolute -inset-2 bg-primary/20 rounded-full animate-ping"></div>
              </div>
              <div className="mt-2 px-3 py-1 bg-surface/90 backdrop-blur-md rounded-full shadow-sm">
                <span className="text-label-md font-label-md text-on-surface">Your Store</span>
              </div>
            </div>
            <div className="absolute top-6 right-6 z-20 flex flex-col gap-2">
              <button className="w-10 h-10 bg-surface/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm hover:bg-surface transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">layers</span>
              </button>
              <div className="flex flex-col bg-surface/90 backdrop-blur-md rounded-full shadow-sm mt-2 overflow-hidden">
                <button className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant">add</span>
                </button>
                <div className="w-full h-px bg-outline-variant/30"></div>
                <button className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant">remove</span>
                </button>
              </div>
            </div>
            <div className="absolute bottom-6 left-6 z-20 bg-surface/90 backdrop-blur-md p-4 rounded-2xl shadow-lg flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-container"></div>
                <span className="text-label-md font-label-md text-on-surface-variant">High Demand</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary-container"></div>
                <span className="text-label-md font-label-md text-on-surface-variant">Medium Demand</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full -mt-4 relative z-30">
            {data.metrics.map(metric => (
              <div key={metric.id} className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant/10 flex flex-col gap-1 hover:shadow-md transition-shadow">
                <span className="text-label-md font-label-md text-outline">{metric.label}</span>
                <span className="text-stats-number font-stats-number text-on-surface">{metric.value}</span>
                <div className={`flex items-center gap-1 ${metric.trendClass} mt-2`}>
                  <span className="material-symbols-outlined text-[16px]">{metric.trendIcon}</span>
                  <span className="text-sm font-semibold">{metric.trendValue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-secondary-container rounded-3xl p-card-padding shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 z-0 opacity-20 transition-transform duration-700 group-hover:scale-105" data-alt="A warm, vibrant abstract pattern with flowing lines and glowing apricot and golden hues, suggesting dynamic energy and opportunity, soft lighting, modern organic style." ></div>
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="flex flex-col gap-4 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-white/50 backdrop-blur-sm rounded-full text-label-md font-label-md text-on-secondary-container">🔥 Opportunity detected</span>
              </div>
              <h2 className="text-headline-lg font-headline-lg text-on-secondary-container tracking-tight">{data.opportunity.title}</h2>
              <p className="text-body-lg font-body-lg text-on-secondary-container/80" dangerouslySetInnerHTML={{ __html: data.opportunity.descriptionHtml }}></p>
            </div>
            <button className="whitespace-nowrap px-8 py-4 h-[56px] bg-on-secondary-container text-secondary-container hover:bg-on-secondary-container/90 rounded-xl font-label-md text-label-md shadow-lg transition-transform active:scale-95 flex items-center gap-2">
              <span className="material-symbols-outlined">inventory</span>
              Review Inventory
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          <div className="bg-surface rounded-3xl p-card-padding shadow-sm border border-outline-variant/10 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-headline-md font-headline-md text-on-surface">Popular Nearby</h3>
              <button className="text-primary hover:text-primary-container transition-colors"><span className="material-symbols-outlined">more_horiz</span></button>
            </div>
            <div className="flex flex-col gap-5">
              {data.popularNearby.map(item => (
                <div key={item.id} className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="text-body-md font-body-md text-on-surface font-medium">{item.name}</span>
                    <span className="text-label-md font-label-md text-primary">{item.percentageText}</span>
                  </div>
                  <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                    <div className={`h-full ${item.barClass} rounded-full transition-all duration-1000`} style={{ width: item.percentageValue }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface rounded-3xl p-card-padding shadow-sm border border-outline-variant/10 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-headline-md font-headline-md text-on-surface">Fast Growing Categories</h3>
              <span className="material-symbols-outlined text-outline">trending_up</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.growingCategories.map(category => (
                <div key={category.id} className="p-4 bg-surface-container-low rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${category.iconBgClass} flex items-center justify-center`}>
                      <span className={`material-symbols-outlined ${category.iconColorClass}`}>{category.icon}</span>
                    </div>
                    <span className="text-body-md font-body-md text-on-surface font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 ${category.trendClass} rounded-md text-xs font-bold`}>{category.trend}</span>
                    <span className="text-sm text-outline">vs last week</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}