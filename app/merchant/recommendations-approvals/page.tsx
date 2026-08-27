import React from 'react';
import { getRecommendationsApprovalsData } from '@/services/merchantApi';

export default async function RecommendationsApprovals() {
  const data = await getRecommendationsApprovalsData();

  return (
    <>
      <div className="flex flex-col w-full relative">
        <div className="fixed top-0 left-0 right-0 h-[512px] bg-gradient-to-b from-primary-fixed/20 to-transparent pointer-events-none -z-10"></div>
        <div className="fixed top-20 right-20 w-96 h-96 bg-secondary-fixed/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

        <header className="flex flex-col gap-unit mb-section-gap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shadow-lg shadow-primary-container/20">
              <span className="material-symbols-outlined text-on-primary-container text-[24px]">model_training</span>
            </div>
            <div>
              <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">Intelligence Center</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-1">Review AI recommendations, manage autonomous agent actions, and configure governance policies for your store.</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
          <div className="flex flex-col gap-section-gap xl:col-span-8">
            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-2">
                  Bazaar Recommendations
                  <span className="material-symbols-outlined text-primary text-[24px]">auto_awesome</span>
                </h2>
                <button className="px-4 py-2 bg-surface-container-high hover:bg-surface-variant transition-colors rounded-full text-label-md font-label-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">filter_list</span> Filter
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.recommendations.map(rec => (
                  <div key={rec.id} className={`${rec.bgClass} rounded-[24px] p-card-padding shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group relative overflow-hidden`}>
                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-[100px] -z-0 transition-transform group-hover:scale-110 ${rec.blurClass}`}></div>
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${rec.blurClass}`}>
                        <span className={`material-symbols-outlined ${rec.typeClass}`}>{rec.typeIcon}</span>
                      </div>
                      <span className={`font-label-md text-label-md uppercase tracking-widest ${rec.typeClass}`}>{rec.type}</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-2 relative z-10">{rec.title}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-6 flex-grow relative z-10">{rec.description}</p>
                    <div className="flex flex-col gap-4 relative z-10">
                      <div className="flex items-center justify-between bg-surface/50 rounded-lg p-3">
                        <span className="font-label-md text-label-md text-on-surface-variant">{rec.impactLabel}</span>
                        <span className={`font-stats-number text-[24px] font-bold ${rec.impactValueClass}`}>{rec.impactValue}</span>
                      </div>
                      <button className={`w-full py-4 transition-colors rounded-xl font-label-md text-label-md ${rec.actionClass}`}>{rec.actionText}</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">Agent Approval Queue</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">Actions requiring your sign-off before execution.</p>
                </div>
                <span className="bg-error-container text-on-error-container font-label-md text-label-md px-3 py-1 rounded-full flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span> {data.approvalQueue.length} Pending
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {data.approvalQueue.map(item => (
                  <div key={item.id} className={`bg-surface-container-lowest rounded-[24px] p-6 shadow-sm flex flex-col md:flex-row md:items-center gap-6 border-l-4 ${item.borderClass}`}>
                    <div className="flex-grow flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.agentClass.replace('text-', 'bg-').split(' ')[0]}`}>
                          <span className={`material-symbols-outlined text-[18px] ${item.agentClass.split(' ')[1]}`}>{item.agentIcon}</span>
                        </div>
                        <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">{item.agentName}</span>
                        <span className="bg-surface-variant text-on-surface-variant text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">{item.status}</span>
                      </div>
                      <h3 className="font-headline-md text-headline-md text-on-surface">{item.title}</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant">{item.description}</p>
                      <div className="flex items-center gap-6 mt-2">
                        <div className="flex items-center gap-2">
                          <span className={`material-symbols-outlined text-[18px] ${item.impactClass}`}>{item.impactIcon}</span>
                          <span className={`font-label-md text-label-md ${item.impactClass}`}>{item.impactLabel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-outline text-[18px]">schedule</span>
                          <span className="font-label-md text-label-md text-outline">{item.timeGenerated}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col gap-3 md:min-w-[140px]">
                      <button className="flex-1 py-3 px-4 bg-primary hover:bg-on-primary-fixed-variant transition-colors rounded-xl text-on-primary font-label-md text-label-md shadow-md shadow-primary/20 flex justify-center items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">check</span> Approve
                      </button>
                      <button className="flex-1 py-3 px-4 bg-surface-container-highest hover:bg-outline-variant transition-colors rounded-xl text-on-surface font-label-md text-label-md flex justify-center items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">close</span> Reject
                      </button>
                      <button className="w-full text-center py-2 text-primary hover:text-on-primary-fixed-variant transition-colors font-label-md text-label-md underline underline-offset-4">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="xl:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-container-lowest rounded-[24px] p-card-padding shadow-sm relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-40 h-40 bg-primary-fixed/20 rounded-full blur-[40px] pointer-events-none"></div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-6 relative z-10">Agent Efficacy</h3>
              <div className="flex items-end justify-between mb-8 relative z-10">
                <div>
                  <p className="font-label-md text-label-md text-outline mb-1">Actions Executed (30d)</p>
                  <p className="font-stats-number text-[48px] leading-none font-bold text-on-surface">{data.efficacy.actionsExecuted}</p>
                </div>
                <div className="flex items-center gap-1 bg-inverse-on-surface px-2 py-1 rounded text-primary font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[16px]">{data.efficacy.trendDirection}</span> {data.efficacy.trend}
                </div>
              </div>

              <div className="h-32 flex items-end gap-2 relative z-10">
                {data.efficacy.chartData.map((val, i) => (
                  <div key={i} className={`w-full ${i === data.efficacy.chartData.length - 1 ? 'bg-primary shadow-[0_0_10px_rgba(73,98,70,0.3)]' : `bg-primary/${Math.max(20, Math.min(90, val * 2))} hover:bg-primary/${Math.max(40, Math.min(90, val * 2 + 20))}`} rounded-t-sm h-[${Math.min(100, val * 2)}%] transition-colors relative group`} style={{ height: `${Math.min(100, val * 2)}%` }}>
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container text-on-surface text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">{val}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-outline font-label-md">
                {data.efficacy.labels.map((label, i) => (
                  <span key={i}>{label}</span>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-[24px] shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-6 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant">gavel</span>
                    Governance Center
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">Configure autonomy levels per category.</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant">settings</span>
                </button>
              </div>
              <div className="flex flex-col flex-grow">
                {data.governance.map((gov) => (
                  <div key={gov.id} className="p-6 border-b border-outline-variant/10 hover:bg-surface/50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${gov.iconBgClass}`}>
                        <span className={`material-symbols-outlined ${gov.iconColorClass}`}>{gov.icon}</span>
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface font-bold">{gov.name}</p>
                        <p className="text-xs text-outline mt-0.5">{gov.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold uppercase ${gov.mode === 'Auto' ? 'text-primary' : 'text-on-surface-variant'}`}>{gov.mode}</span>
                      <div className={`w-12 h-6 rounded-full p-1 cursor-pointer relative ${gov.mode === 'Auto' ? 'bg-primary' : 'bg-surface-variant'}`}>
                        <div className={`w-4 h-4 bg-surface-container-lowest rounded-full shadow-sm transform transition-transform duration-300 ${gov.mode === 'Auto' ? 'translate-x-6' : ''}`}></div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-auto p-6 bg-surface-container-low/50">
                  <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">info</span>
                    <p className="text-sm text-on-surface-variant leading-relaxed">Setting a category to <strong className="text-primary">AUTO</strong> means agents will execute actions directly without requiring your approval in the queue, saving you time on routine tasks.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}