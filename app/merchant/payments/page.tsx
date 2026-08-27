import React from 'react';
import { getPaymentsData } from '@/services/merchantApi';

export default async function Payments() {
  const data = await getPaymentsData();

  return (
    <>
      <div className="flex flex-col w-full gap-section-gap">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">

          <div className="bg-surface-container rounded-xl p-card-padding flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
            <div className="flex items-start justify-between mb-8 z-10">
              <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-on-primary-fixed">payments</span>
              </div>
              <span className="bg-inverse-primary text-on-surface-variant font-label-md text-label-md px-3 py-1 rounded-full">{data.metrics.todayRevenueTrend}</span>
            </div>
            <div className="z-10">
              <h3 className="font-body-md text-body-md text-on-surface-variant mb-1">Today's Revenue</h3>
              <p className="font-stats-number text-stats-number text-on-surface">{data.metrics.todayRevenue}</p>
            </div>
          </div>

          <div className="bg-secondary-fixed rounded-xl p-card-padding flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-secondary-container/30 rounded-full blur-3xl group-hover:bg-secondary-container/50 transition-colors"></div>
            <div className="flex items-start justify-between mb-8 z-10">
              <div className="w-12 h-12 rounded-full bg-surface/50 flex items-center justify-center shadow-sm backdrop-blur-md">
                <span className="material-symbols-outlined text-on-secondary-fixed-variant" >pending_actions</span>
              </div>
              <span className="bg-surface/50 text-on-secondary-fixed-variant font-label-md text-label-md px-3 py-1 rounded-full backdrop-blur-md">{data.metrics.pendingSettlementsSub}</span>
            </div>
            <div className="z-10">
              <h3 className="font-body-md text-body-md text-on-secondary-fixed-variant mb-1">Pending Settlements</h3>
              <p className="font-stats-number text-stats-number text-on-secondary-fixed">{data.metrics.pendingSettlements}</p>
            </div>
          </div>

          <div className="bg-surface-container rounded-xl p-card-padding flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute right-0 bottom-0 w-24 h-24 bg-tertiary-fixed/40 rounded-full blur-xl translate-x-4 translate-y-4"></div>
            <div className="flex items-start justify-between mb-8 z-10">
              <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-on-tertiary-fixed-variant">account_balance</span>
              </div>
              <span className="text-on-surface-variant font-label-md text-label-md opacity-80">{data.metrics.lastSettlementDate}</span>
            </div>
            <div className="z-10">
              <h3 className="font-body-md text-body-md text-on-surface-variant mb-1">Last Settlement</h3>
              <p className="font-stats-number text-stats-number text-on-surface">{data.metrics.lastSettlement}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">

          <div className="lg:col-span-4 flex flex-col gap-gutter">
            <div className="bg-surface-container-lowest rounded-xl p-card-padding shadow-md flex-1">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-headline-md text-headline-md text-on-surface">Settlement Schedule</h2>
                <button className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant">calendar_month</span>
                </button>
              </div>

              <div className="relative pl-6">
                <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-outline-variant/30"></div>
                <div className="relative flex flex-col gap-8">
                  {data.schedule.map(item => {
                    if (item.type === 'settled') {
                      return (
                        <div key={item.id} className="relative group">
                          <div className="absolute -left-[30px] top-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center ring-4 ring-surface-container-lowest">
                            <span className="material-symbols-outlined text-[10px] text-on-primary font-bold">check</span>
                          </div>
                          <div>
                            <p className="font-label-md text-label-md text-on-surface-variant mb-1">{item.statusText}</p>
                            <div className="bg-surface-container-low rounded-lg p-4 group-hover:bg-surface-container transition-colors">
                              <p className="font-headline-md text-headline-md text-on-surface mb-1">{item.amount}</p>
                              <p className="font-body-md text-body-md text-on-surface-variant text-sm flex items-center gap-1">
                                {item.icon && <span className="material-symbols-outlined text-[16px]">{item.icon}</span>}
                                {item.details}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    } else if (item.type === 'processing') {
                      return (
                        <div key={item.id} className="relative group">
                          <div className="absolute -left-[30px] top-1 w-4 h-4 rounded-full bg-secondary flex items-center justify-center ring-4 ring-surface-container-lowest animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-on-secondary"></div>
                          </div>
                          <div>
                            <p className="font-label-md text-label-md text-secondary mb-1">{item.statusText}</p>
                            <div className="bg-secondary-fixed/50 rounded-lg p-4 ring-1 ring-secondary/20">
                              <p className="font-headline-md text-headline-md text-on-surface mb-1">{item.amount}</p>
                              <p className="font-body-md text-body-md text-on-surface-variant text-sm">{item.details}</p>
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={item.id} className="relative group opacity-60 hover:opacity-100 transition-opacity">
                          <div className="absolute -left-[30px] top-1 w-4 h-4 rounded-full bg-outline-variant flex items-center justify-center ring-4 ring-surface-container-lowest"></div>
                          <div>
                            <p className="font-label-md text-label-md text-on-surface-variant mb-1">{item.statusText}</p>
                            <div className="border border-outline-variant/30 rounded-lg p-4 border-dashed">
                              <p className="font-headline-md text-headline-md text-on-surface mb-1">{item.amount}</p>
                              <p className="font-body-md text-body-md text-on-surface-variant text-sm">{item.details}</p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            </div>

            <div className="bg-surface-container rounded-xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-200 bg-cover bg-center opacity-10 mix-blend-multiply" data-alt="Abstract soft green and gold fluid waves, representing financial flow, ethereal lighting, high resolution, soft focus"></div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-on-primary">support_agent</span>
                </div>
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface mb-0.5">Need help with payouts?</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm">Contact merchant support</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-md overflow-hidden flex flex-col">
            <div className="p-card-padding pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface">Transaction History</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">Recent payments across all channels</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-surface-container-low px-4 py-2 rounded-full flex items-center gap-2 focus-within:ring-1 focus-within:ring-primary transition-shadow">
                  <span className="material-symbols-outlined text-outline text-[18px]">search</span>
                  <input className="bg-transparent border-none focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-outline w-32 sm:w-40" placeholder="Search ID or Amount" type="text" />
                </div>
                <button className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-colors text-on-surface-variant">
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="font-label-md text-label-md text-on-surface-variant px-6 py-4 whitespace-nowrap">Date &amp; Time</th>
                    <th className="font-label-md text-label-md text-on-surface-variant px-6 py-4 whitespace-nowrap">Order ID</th>
                    <th className="font-label-md text-label-md text-on-surface-variant px-6 py-4 whitespace-nowrap">Method</th>
                    <th className="font-label-md text-label-md text-on-surface-variant px-6 py-4 whitespace-nowrap">Status</th>
                    <th className="font-label-md text-label-md text-on-surface-variant px-6 py-4 whitespace-nowrap text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {data.transactions.map((tx, index) => (
                    <tr key={tx.id} className={`hover:bg-surface-container-lowest/50 transition-colors group cursor-pointer ${tx.isBgLowest ? 'bg-surface-container-lowest' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-body-md text-body-md text-on-surface">{tx.date}, {tx.time}</p>
                        <p className="font-body-md text-body-md text-on-surface-variant text-sm">{index < 3 ? 'Today' : 'Yesterday'}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-label-md text-label-md text-on-surface-variant">{tx.orderId}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">{tx.methodIcon}</span>
                          <span className="font-body-md text-body-md text-on-surface">{tx.method}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${tx.statusClass} font-label-md text-label-md text-xs`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${tx.statusDotClass}`}></span>
                          {tx.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right font-headline-md text-headline-md text-on-surface ${tx.amountClass || ''}`}>{tx.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 flex items-center justify-center border-t border-outline-variant/10 bg-surface-container-low/30">
              <button className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors py-2 px-6 rounded-full hover:bg-primary/5">View all transactions</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}