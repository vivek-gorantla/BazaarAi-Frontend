"use client";

import React from "react";
import { AgentAuditStream } from "@/app/components/ui/AgentAuditStream";

export default function CustomerAuditLogsPage() {
  return (
    <div className="flex flex-col w-full max-w-[1200px] mx-auto p-6 md:p-8 gap-8 min-h-[calc(100vh-80px)]">
      <div className="flex flex-col gap-2 relative z-10">
        <h1 className="font-display-lg text-display-lg text-on-surface">Agent & System Activity</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Observe how the Bazaar AI Shopper processes your requests in real time. 
          Transparency is key—see exactly what tools the agent uses to assist you.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-primary">Live Agent Stream</h2>
          <p className="text-sm text-on-surface-variant mb-2">
            Watch the AI agent orchestrator route your queries and execute tasks.
          </p>
          <AgentAuditStream topic="agent-logs" title="Customer Agent Reasoning" height={400} />
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-secondary">Live System Audit Logs</h2>
          <p className="text-sm text-on-surface-variant mb-2">
            Standard API logs and latency metrics for your customer session.
          </p>
          <AgentAuditStream topic="system-logs" title="System API Logs" height={300} />
        </div>
      </div>
    </div>
  );
}
