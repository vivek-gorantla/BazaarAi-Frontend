import React from 'react';
import { getAuditTrailData } from '@/services/merchantApi';

export default async function AuditTrail() {
  const data = await getAuditTrailData();

  return (
    <>
      <div className="flex flex-col w-full min-h-screen">
        <div className="mb-12">
          <h1 className="font-display-lg text-display-lg text-on-surface mb-2">Audit Trail</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Complete history of system changes, agent activities, and manual operations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
          {data.metrics.map(metric => (
            <div key={metric.id} className={`${metric.bgClass} rounded-[24px] p-card-padding flex flex-col justify-between relative overflow-hidden group shadow-sm hover:shadow-md transition-all`}>
              <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-2xl transition-colors ${metric.blurClass}`}></div>
              <div className="flex items-center justify-between mb-8 relative z-10">
                <span className={`font-label-md text-label-md uppercase tracking-widest ${metric.labelClass}`}>{metric.label}</span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${metric.iconBgClass} ${metric.iconColorClass}`}>
                  <span className="material-symbols-outlined text-[20px]">{metric.icon}</span>
                </div>
              </div>
              <div className="relative z-10">
                <div className={`font-stats-number text-stats-number mb-2 ${metric.id === '3' ? 'text-on-primary-container' : metric.id === '5' ? 'text-on-error-container' : 'text-on-surface'}`}>{metric.value}</div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${metric.trendClass}`}>
                    <span className="material-symbols-outlined text-[14px]">{metric.trendDirection}</span> {metric.trend}
                  </span>
                  {metric.trendText && <span className="font-body-md text-body-md text-outline text-sm">{metric.trendText}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-surface-container rounded-[24px] p-6 mb-8 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {data.filters.map((filter, index) => (
              <React.Fragment key={filter.id}>
                {filter.isPrimary ? (
                  <button className="px-4 py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md transition-colors shadow-sm">{filter.label}</button>
                ) : (
                  <button className="px-4 py-2 rounded-full bg-surface hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-colors flex items-center gap-2">
                    {filter.icon && <span className="material-symbols-outlined text-[18px]">{filter.icon}</span>} {filter.label}
                  </button>
                )}
                {index === 3 && <div className="w-px h-6 bg-outline-variant/30 mx-2 self-center"></div>}
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center gap-3 bg-surface px-4 py-2 rounded-xl">
            <span className="material-symbols-outlined text-outline">calendar_today</span>
            <span className="font-body-md text-body-md text-on-surface">Today, Oct 24</span>
            <span className="material-symbols-outlined text-outline">arrow_drop_down</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-[24px] p-card-padding shadow-sm relative z-0">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-8">Activity Timeline</h2>
          <div className="relative pl-6">
            <div className="absolute left-[38px] top-4 bottom-4 w-px bg-outline-variant/30 z-0"></div>
            
            {data.timeline.map(log => (
              <div key={log.id} className="relative z-10 flex gap-6 mb-10 group cursor-pointer" >
                <div className="w-24 shrink-0 pt-3 text-right">
                  <span className="font-label-md text-label-md text-on-surface-variant">{log.time}</span>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm ring-4 ring-surface-container-lowest relative group-hover:scale-110 transition-transform ${log.actorBgClass}`}>
                  <span className="material-symbols-outlined">{log.actorIcon}</span>
                </div>
                <div className={`flex-1 rounded-2xl p-4 transition-colors shadow-[0_4px_20px_rgba(31,41,35,0.02)] ${log.cardBgClass}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className={`font-label-md text-label-md mr-2 ${log.actorType}`}>{log.actor}</span>
                      <span className="font-body-md text-body-md text-on-surface-variant">{log.action}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full font-label-md text-xs uppercase tracking-wider ${log.statusClass}`}>{log.status}</span>
                  </div>
                  <p className="font-body-lg text-body-lg text-on-surface font-medium flex items-center gap-3" dangerouslySetInnerHTML={{ __html: log.message }}></p>
                  {log.detailsText && (
                    <div className={`mt-3 flex items-center gap-2 text-sm ${log.status === 'Failed' ? 'text-error' : 'text-on-surface-variant'}`}>
                      {log.detailsIcon && <span className="material-symbols-outlined text-[16px]">{log.detailsIcon}</span>}
                      <span>{log.detailsText}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button className="px-6 py-3 rounded-xl bg-surface-container hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-colors flex items-center gap-2">
              Load More Activity <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
          </div>
        </div>

        <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-[60] hidden opacity-0 transition-opacity duration-300" id="auditDrawerBackdrop" ></div>
        <div className="fixed top-0 right-0 h-full w-[480px] bg-surface-container-lowest z-[70] shadow-2xl translate-x-full transition-transform duration-300 ease-in-out flex flex-col" id="auditDrawer">
          <div className="px-8 py-6 flex items-center justify-between bg-surface-container-lowest relative z-10">
            <h3 className="font-headline-md text-headline-md text-on-surface">Activity Details</h3>
            <button className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors" >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">
            <div className="flex items-center gap-4 mb-8 bg-surface-container p-4 rounded-2xl">
              <div className="w-14 h-14 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 shadow-inner">
                <span className="material-symbols-outlined text-[24px]">{data.activityDetail.actorIcon}</span>
              </div>
              <div>
                <div className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">{data.activityDetail.actor}</div>
                <div className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mt-1">{data.activityDetail.actorType}</div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <div className="font-label-md text-label-md text-outline uppercase tracking-widest mb-2">Timestamp</div>
                <div className="font-body-lg text-body-lg text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant">schedule</span>
                  {data.activityDetail.timestamp}
                </div>
              </div>

              <div>
                <div className="font-label-md text-label-md text-outline uppercase tracking-widest mb-2">Action &amp; Status</div>
                <div className="flex items-center gap-4">
                  <div className="font-body-lg text-body-lg text-on-surface bg-surface px-4 py-2 rounded-xl inline-block">{data.activityDetail.action}</div>
                  <span className="px-4 py-2 rounded-full bg-inverse-on-surface text-primary font-label-md text-sm uppercase tracking-wider inline-flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span> {data.activityDetail.status}
                  </span>
                </div>
              </div>

              <div>
                <div className="font-label-md text-label-md text-outline uppercase tracking-widest mb-4">Resource Affected</div>
                <div className="bg-surface rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined">inventory_2</span>
                  </div>
                  <div>
                    <div className="font-body-lg text-body-lg text-on-surface font-medium">{data.activityDetail.resourceName}</div>
                    <div className="font-body-md text-body-md text-outline text-sm">{data.activityDetail.resourceSku}</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="font-label-md text-label-md text-outline uppercase tracking-widest mb-4">Value Changes</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-error-container/10 p-4 rounded-2xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-error/30"></div>
                    <div className="font-label-md text-label-md text-outline mb-1">Previous</div>
                    <div className="font-stats-number text-stats-number text-on-surface line-through opacity-60">{data.activityDetail.oldValue}</div>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-2xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary"></div>
                    <div className="font-label-md text-label-md text-outline mb-1">New</div>
                    <div className="font-stats-number text-stats-number text-primary">{data.activityDetail.newValue}</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="font-label-md text-label-md text-outline uppercase tracking-widest mb-2">Reason / Context</div>
                <div className="bg-surface rounded-2xl p-4 font-body-md text-body-md text-on-surface italic">
                  {data.activityDetail.reason}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-surface-container-lowest border-t border-outline-variant/20 mt-auto">
            <button className="w-full h-14 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[20px]">undo</span> Revert Change
            </button>
          </div>
        </div>
      </div>
    </>
  );
}