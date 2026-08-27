import React from 'react';
import { getAIGrowthCenterData } from '@/services/merchantApi';

export default async function AIGrowthCenter() {
  const data = await getAIGrowthCenterData();

  return (
    <>
      <div className="flex flex-col w-full relative group">
        <div className="relative w-full h-[400px] rounded-3xl overflow-hidden mb-12 flex items-center justify-end p-12 bg-gradient-to-br from-surface-container-low via-inverse-on-surface to-primary/10 shadow-sm border border-outline-variant/20">
          <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-multiply">
            <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient cx="50%" cy="50%" fx="50%" fy="50%" id="grad1" r="50%">
                  <stop className="text-secondary-fixed/30" offset="0%" stopColor="currentColor"></stop>
                  <stop className="text-secondary-fixed/0" offset="100%" stopColor="currentColor"></stop>
                </radialGradient>
                <radialGradient cx="50%" cy="50%" fx="50%" fy="50%" id="grad2" r="50%">
                  <stop className="text-primary-fixed/40" offset="0%" stopColor="currentColor"></stop>
                  <stop className="text-primary-fixed/0" offset="100%" stopColor="currentColor"></stop>
                </radialGradient>
              </defs>
              <circle className="animate-[pulse_8s_ease-in-out_infinite]" cx="20%" cy="30%" fill="url(#grad1)" r="40%"></circle>
              <circle className="animate-[pulse_10s_ease-in-out_infinite_reverse]" cx="80%" cy="70%" fill="url(#grad2)" r="50%"></circle>
            </svg>
          </div>
          <div className="absolute left-0 top-0 w-1/2 h-full p-12 flex flex-col justify-center z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full font-label-md text-label-md w-max mb-6 shadow-sm ring-1 ring-secondary/20">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              Bazaar AI Intelligence
            </div>
            <h1 className="font-display-lg text-display-lg text-on-surface mb-4 leading-tight tracking-tight">{data.header.title}</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">{data.header.description}</p>
          </div>
          <div className="relative w-1/2 h-full z-10 rounded-2xl overflow-hidden shadow-xl ring-1 ring-white/50" data-alt="A highly detailed, modern illustration of a local merchant thoughtfully examining a holographic, soft-glowing growth graph that rises upwards. The setting is a cozy yet contemporary shop interior. The color palette features sage greens, warm apricots, and soft creams, conveying a premium, optimistic, and approachable technological atmosphere. Lighting is soft and diffused." >
            <div className="absolute inset-0 bg-gradient-to-r from-surface-container-low/80 via-transparent to-transparent mix-blend-overlay"></div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[32px]">lightbulb</span>
              Active Opportunities
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Found {data.opportunities.length} high-impact actions for you today.</p>
          </div>
          <button className="font-label-md text-label-md text-primary flex items-center gap-2 hover:bg-surface-container px-4 py-2 rounded-full transition-colors">
            View All History <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {data.opportunities.map(opportunity => (
            <div key={opportunity.id} className={`group relative ${opportunity.bgClass} rounded-[24px] p-card-padding shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/10 flex flex-col overflow-hidden isolate`}>
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full -z-10 transition-colors ${opportunity.blurClass}`}></div>
              <div className="flex items-start justify-between mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${opportunity.iconBgClass}`}>
                  <span className={`material-symbols-outlined text-[24px] ${opportunity.iconColorClass}`}>{opportunity.icon}</span>
                </div>
                <span className={`font-label-md text-label-md uppercase tracking-widest px-3 py-1 rounded-full ${opportunity.typeLabelClass}`}>{opportunity.type}</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{opportunity.title}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6 flex-1">{opportunity.description}</p>
              
              {opportunity.type === 'Revenue' && (
                <div className="bg-surface-container-low rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-label-md text-label-md text-outline">Potential Uplift</span>
                    <span className={`font-stats-number text-stats-number ${opportunity.typeClass} text-[24px]`}>{opportunity.upliftAmount}</span>
                  </div>
                  <div className="w-full bg-surface-variant h-2 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full rounded-full" style={{ width: opportunity.upliftPercentage }}></div>
                  </div>
                  <p className="text-[12px] font-medium text-outline-variant mt-2 text-right">Monthly est.</p>
                </div>
              )}

              {opportunity.type === 'Inventory' && opportunity.inventoryItem && (
                <div className="bg-surface-container-low rounded-xl p-4 mb-6 flex items-center gap-4">
                  <div className="w-16 h-16 bg-surface-container-high rounded-lg overflow-hidden shrink-0">
                    <div className="w-full h-full bg-cover bg-center" data-alt={`A close up product shot of ${opportunity.inventoryItem.name}`} ></div>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">{opportunity.inventoryItem.name}</p>
                    <p className={`font-body-md text-body-md ${opportunity.typeClass} font-medium flex items-center gap-1 mt-1`}><span className="material-symbols-outlined text-[16px]">warning</span> {opportunity.inventoryItem.warning}</p>
                  </div>
                </div>
              )}

              {opportunity.type === 'Promotion' && opportunity.promotionTarget && opportunity.promotionTags && (
                <div className="bg-surface-container-low rounded-xl p-4 mb-6 relative overflow-hidden">
                  <div className="absolute right-[-20px] top-[-20px] opacity-10">
                    <span className={`material-symbols-outlined text-[100px] ${opportunity.typeClass}`}>sell</span>
                  </div>
                  <p className="font-label-md text-label-md text-outline mb-1">Target Audience</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">group</span>
                    <span className="font-body-md text-body-md text-on-surface font-medium">{opportunity.promotionTarget}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {opportunity.promotionTags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-surface-variant rounded-md text-[12px] font-medium text-on-surface-variant">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              <button className={`w-full h-14 font-label-md text-label-md rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm ${opportunity.actionButtonClass}`}>
                {opportunity.actionText} <span className="material-symbols-outlined text-[20px]">{opportunity.actionIcon}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}