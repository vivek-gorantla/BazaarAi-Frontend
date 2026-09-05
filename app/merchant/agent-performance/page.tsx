import { getAgentPerformanceData } from '@/services/merchantApi';
import { AgentAuditStream } from '@/app/components/ui/AgentAuditStream';

export default async function AgentPerformance() {
  const data = await getAgentPerformanceData();

  return (
    <>
      <div className="flex flex-col w-full gap-section-gap pb-12">
        <div className="flex flex-col gap-2 relative z-10">
          <h1 className="font-display-lg text-display-lg text-on-surface">Agent Performance</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">See how your Bazaar agents are working for your store. Monitor success rates, tasks, and the real business impact of AI-driven automation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {data.metrics.map(metric => (
            <div key={metric.id} className="bg-surface-container rounded-3xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -mr-16 -mt-16 transition-transform ${metric.blurClass}`}></div>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${metric.iconBgClass} ${metric.iconColorClass}`}>
                  <span className="material-symbols-outlined">{metric.icon}</span>
                </div>
                <span className="font-label-md text-label-md text-on-surface-variant">{metric.label}</span>
              </div>
              {metric.trend ? (
                <div className="flex items-baseline gap-2">
                  <div className="font-stats-number text-stats-number text-on-surface">{metric.value}</div>
                  <span className={`text-label-md flex items-center ${metric.trendClass}`}>
                    <span className="material-symbols-outlined text-sm">{metric.trendIcon}</span> {metric.trend}
                  </span>
                </div>
              ) : (
                <div className="font-stats-number text-stats-number text-on-surface">{metric.value}</div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.agents.map(agent => (
            <div key={agent.id} className={`${agent.bgClass} rounded-[32px] p-card-padding shadow-xl shadow-on-surface/5 flex flex-col gap-6 relative overflow-hidden group`}>
              <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity duration-500 ${agent.blurClass}`}></div>
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${agent.iconBgClass} ${agent.iconColorClass}`}>
                    <span className="material-symbols-outlined text-[28px]">{agent.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">{agent.name}</h3>
                    <p className={`font-label-md text-label-md flex items-center gap-1 ${agent.statusClass}`}>
                      <span className={`w-2 h-2 rounded-full animate-pulse ${agent.statusClass.replace('text-', 'bg-')}`}></span> {agent.status}
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full font-label-md text-sm ${agent.statusClass.replace('text-', 'bg-').replace('primary', 'primary-container text-on-primary-container').replace('secondary', 'secondary-container text-on-secondary-container')}`}>
                  {agent.successRate}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="bg-surface-container-low rounded-2xl p-4">
                  <p className="font-label-md text-label-md text-on-surface-variant mb-1">Tasks Completed</p>
                  <p className="font-headline-md text-headline-md text-on-surface">{agent.stats.tasksCompleted}</p>
                </div>
                {agent.stats.revenueInfluenced && (
                  <div className="bg-surface-container-low rounded-2xl p-4">
                    <p className="font-label-md text-label-md text-on-surface-variant mb-1">Revenue Influenced</p>
                    <p className="font-headline-md text-headline-md text-on-surface">{agent.stats.revenueInfluenced}</p>
                  </div>
                )}
                {agent.stats.stockIssuesDetected && (
                  <div className="bg-surface-container-low rounded-2xl p-4">
                    <p className="font-label-md text-label-md text-on-surface-variant mb-1">Stock Issues Detected</p>
                    <p className="font-headline-md text-headline-md text-on-surface">{agent.stats.stockIssuesDetected}</p>
                  </div>
                )}
                <div className="bg-surface-container-low rounded-2xl p-4 col-span-2 flex items-center justify-between">
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant mb-1">Recommendations Accepted</p>
                    <p className="font-headline-md text-headline-md text-on-surface">{agent.stats.recommendationsAccepted}</p>
                  </div>
                  <div className="w-16 h-16 relative">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-surface-variant" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                      <path className={agent.stats.svgDasharrayClass} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${agent.stats.recommendationsAcceptedValue}, 100`} strokeWidth="3"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <button className="w-full h-14 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md rounded-xl transition-colors relative z-10 flex items-center justify-center gap-2">
                View Performance <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-surface-container">
          <AgentAuditStream topic="agent-logs" title="Live Agent Reasoning Stream" height={500} />
        </div>
      </div>
    </>
  );
}