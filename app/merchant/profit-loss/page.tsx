import React from 'react';
import { getProfitLossData } from '@/services/merchantApi';

export default async function ProfitLoss() {
  const data = await getProfitLossData();

  return (
    <>
      <div className="flex flex-col w-full gap-section-gap">
        <div className="flex flex-col gap-2">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Profit &amp; Loss</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Overview of your financial performance for the current month. Track revenue, expenses, and margins to stay on top of your business health.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <div className="bg-surface-container-lowest p-card-padding rounded-[24px] shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
            <div className="flex items-center justify-between z-10">
              <span className="font-label-md text-label-md text-outline uppercase tracking-widest">{data.metrics.revenue.title}</span>
              <div className={`w-10 h-10 rounded-full ${data.metrics.revenue.iconBgClass} flex items-center justify-center`}>
                <span className={`material-symbols-outlined ${data.metrics.revenue.iconColorClass}`}>{data.metrics.revenue.icon}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 z-10">
              <span className="font-stats-number text-stats-number text-on-surface">{data.metrics.revenue.value}</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${data.metrics.revenue.iconColorClass} flex items-center`}><span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>{data.metrics.revenue.trend}</span>
                <span className="text-sm text-on-surface-variant">{data.metrics.revenue.trendText}</span>
              </div>
            </div>
            <div className="h-12 w-full mt-2 opacity-60 z-10">
              <svg className="w-full h-full preserve-3d" preserveAspectRatio="none" viewBox="0 0 100 30">
                <path className="text-primary opacity-50" d="M0,25 Q10,20 20,22 T40,15 T60,18 T80,5 T100,2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2"></path>
                <path className="text-primary/10" d="M0,30 L0,25 Q10,20 20,22 T40,15 T60,18 T80,5 T100,2 L100,30 Z" fill="currentColor"></path>
              </svg>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-card-padding rounded-[24px] shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-error/5 rounded-full blur-2xl group-hover:bg-error/10 transition-colors"></div>
            <div className="flex items-center justify-between z-10">
              <span className="font-label-md text-label-md text-outline uppercase tracking-widest">{data.metrics.expenses.title}</span>
              <div className={`w-10 h-10 rounded-full ${data.metrics.expenses.iconBgClass} flex items-center justify-center`}>
                <span className={`material-symbols-outlined ${data.metrics.expenses.iconColorClass}`}>{data.metrics.expenses.icon}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 z-10">
              <span className="font-stats-number text-stats-number text-on-surface">{data.metrics.expenses.value}</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${data.metrics.expenses.iconColorClass} flex items-center`}><span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>{data.metrics.expenses.trend}</span>
                <span className="text-sm text-on-surface-variant">{data.metrics.expenses.trendText}</span>
              </div>
            </div>
            <div className="h-12 w-full mt-2 opacity-60 z-10">
              <svg className="w-full h-full preserve-3d" preserveAspectRatio="none" viewBox="0 0 100 30">
                <path className="text-error opacity-50" d="M0,15 Q10,20 20,18 T40,25 T60,20 T80,28 T100,25" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2"></path>
                <path className="text-error/10" d="M0,30 L0,15 Q10,20 20,18 T40,25 T60,20 T80,28 T100,25 L100,30 Z" fill="currentColor"></path>
              </svg>
            </div>
          </div>

          <div className="bg-primary p-card-padding rounded-[24px] shadow-lg shadow-primary/20 flex flex-col gap-4 relative overflow-hidden group hover:shadow-xl transition-shadow text-on-primary">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <svg fill="none" height="200" viewBox="0 0 200 200" width="200" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" fill="currentColor" r="100"></circle>
                <circle cx="100" cy="100" fill="var(--bg-primary)" r="75"></circle>
                <circle cx="100" cy="100" fill="currentColor" r="50"></circle>
              </svg>
            </div>
            <div className="flex items-center justify-between z-10">
              <span className="font-label-md text-label-md text-primary-fixed-dim uppercase tracking-widest">Estimated Profit</span>
              <div className="w-10 h-10 rounded-full bg-on-primary/20 flex items-center justify-center backdrop-blur-sm">
                <span className="material-symbols-outlined text-on-primary">account_balance_wallet</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 z-10">
              <span className="font-stats-number text-stats-number text-on-primary">{data.metrics.profit.value}</span>
              <div className="flex items-center gap-2 mt-2">
                <div className="bg-on-primary text-primary px-3 py-1 rounded-full text-sm font-bold flex items-center shadow-inner">
                  {data.metrics.profit.margin}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          <div className="lg:col-span-2 flex flex-col gap-gutter">
            <div className="bg-surface-container-lowest p-card-padding rounded-[24px] shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-md text-headline-md text-on-surface">Expenses Breakdown</h2>
                <button className="flex items-center gap-2 text-primary font-label-md text-label-md hover:bg-surface-container px-4 py-2 rounded-full transition-colors">
                  <span className="material-symbols-outlined text-[20px]">download</span> Export Report
                </button>
              </div>

              <div className="w-full flex flex-col gap-2">
                <div className="w-full h-8 flex rounded-full overflow-hidden shadow-inner bg-surface-container-high">
                  {data.expensesBreakdown.items.map((item, index) => (
                    <div key={item.id} className={`${item.dotClass} h-full transition-all duration-1000 ease-out delay-${index * 100}`} title={`${item.name}: ${item.percentage}`}></div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-outline font-medium px-2">
                  <span>₹0</span>
                  <span>{data.expensesBreakdown.total}</span>
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-4">
                {data.expensesBreakdown.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-container transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full ${item.iconBgClass} flex items-center justify-center`}>
                        <span className={`material-symbols-outlined ${item.iconColorClass}`}>{item.icon}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-body-lg text-body-lg text-on-surface font-semibold">{item.name}</span>
                        <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${item.dotClass}`}></span> {item.percentage} of total
                        </span>
                      </div>
                    </div>
                    <span className="font-headline-md text-headline-md text-on-surface">{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col gap-gutter">
            <div className="bg-surface-container-low p-card-padding rounded-[24px] shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 w-full h-full bg-cover bg-center opacity-20 mix-blend-multiply pointer-events-none" data-alt="A subtle, abstract geometric pattern in light sage green and warm apricot colors, creating a sense of upward movement and growth, soft lighting, modern organic style." ></div>
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant">track_changes</span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">Monthly Goal</h2>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-end justify-between">
                    <span className="font-stats-number text-stats-number text-on-surface leading-none">{data.monthlyGoal.target}</span>
                    <span className="font-label-md text-label-md text-primary bg-primary-fixed px-3 py-1 rounded-full">{data.monthlyGoal.reachedPercentage}</span>
                  </div>
                  <p className="font-body-md text-body-md text-outline">Target Revenue for October</p>
                </div>

                <div className="flex justify-center my-4 relative">
                  <svg className="transform -rotate-90" height="160" viewBox="0 0 160 160" width="160">
                    <circle className="text-surface-container-high" cx="80" cy="80" fill="none" r="70" stroke="currentColor" strokeWidth="12"></circle>
                    <circle className="text-primary drop-shadow-[0_4px_10px_rgba(73,98,70,0.3)]" cx="80" cy="80" fill="none" r="70" stroke="currentColor" strokeDasharray="439.8" strokeDashoffset="114.3" strokeLinecap="round" strokeWidth="12"></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="font-headline-md text-headline-md text-on-surface">{data.monthlyGoal.remaining}</span>
                    <span className="text-xs text-outline font-medium uppercase tracking-wider">Remaining</span>
                  </div>
                </div>
                <button className="w-full h-14 bg-secondary text-on-secondary rounded-xl font-label-md text-label-md hover:bg-secondary/90 transition-colors shadow-md flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">rocket_launch</span> Boost Sales
                </button>
              </div>
            </div>

            <div className="bg-inverse-surface text-inverse-on-surface p-card-padding rounded-[24px] shadow-sm flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <span className="material-symbols-outlined text-[120px]">lightbulb</span>
              </div>
              <div className="relative z-10">
                <span className="font-label-md text-label-md text-inverse-primary uppercase tracking-widest mb-2 block">AI Insight</span>
                <p className="font-body-lg text-body-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: data.aiInsight }}></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}