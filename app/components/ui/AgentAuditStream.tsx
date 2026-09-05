"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AuditLog {
  timestamp: string;
  eventType: string;
  metadata?: any;
  payload?: any;
}

interface AgentAuditStreamProps {
  topic?: "agent-logs" | "system-logs";
  title?: string;
  height?: number | string;
}

export function AgentAuditStream({ topic = "agent-logs", title = "Live Agent Audit Stream", height = 400 }: AgentAuditStreamProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const endOfStreamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect directly to the backend to bypass Next.js proxy which buffers Server-Sent Events
    const sseUrl = `http://localhost:5000/api/audit/stream?topic=${topic}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log(`[AuditStream] Connected to ${topic}`);
    };

    eventSource.onmessage = (event) => {
      try {
        const parsed: AuditLog = JSON.parse(event.data);
        setLogs((prev) => [...prev, parsed].slice(-100)); // Keep last 100 logs
      } catch (error) {
        console.error("[AuditStream] Error parsing log JSON:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("[AuditStream] SSE error:", error);
      setIsConnected(false);
      // Do not call eventSource.close() here so the browser can natively auto-reconnect
    };

    return () => {
      eventSource.close();
    };
  }, [topic]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (endOfStreamRef.current) {
      endOfStreamRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const getEventColor = (eventType: string) => {
    if (eventType === "INTENT_CLASSIFICATION") return "text-primary";
    if (eventType === "AGENT_STARTED") return "text-secondary";
    if (eventType === "TOOL_CALLED") return "text-tertiary";
    if (eventType === "TOOL_OUTPUT") return "text-success";
    if (eventType === "AGENT_COMPLETED") return "text-primary-container";
    if (eventType === "API_REQUEST") return "text-on-surface-variant";
    return "text-on-surface";
  };

  return (
    <div className="w-full flex flex-col bg-surface-container rounded-3xl overflow-hidden border border-surface-container-high shadow-lg">
      <div className="flex items-center justify-between px-6 py-4 bg-surface-container-low border-b border-surface-container-high">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-on-surface-variant">terminal</span>
          <h3 className="font-label-lg text-label-lg text-on-surface">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {isConnected ? "Live" : "Disconnected"}
          </span>
          <span className={`w-3 h-3 rounded-full ${isConnected ? "bg-success animate-pulse" : "bg-error"}`} />
        </div>
      </div>
      
      <div 
        className="p-6 overflow-y-auto font-mono text-sm leading-relaxed"
        style={{ height, backgroundColor: "#0D110E" }}
      >
        {logs.length === 0 ? (
          <div className="flex h-full items-center justify-center text-on-surface-variant/50">
            Waiting for events...
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {logs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-surface-container/20 p-4 rounded-xl border border-surface-container-high/30 break-words"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-on-surface-variant/70 text-xs">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>
                    <span className={`font-bold ${getEventColor(log.eventType)}`}>
                      {log.eventType}
                    </span>
                    {log.metadata?.agentName && (
                      <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs">
                        {log.metadata.agentName}
                      </span>
                    )}
                  </div>
                  
                  {log.payload && (
                    <pre className="mt-2 text-on-surface/80 whitespace-pre-wrap">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={endOfStreamRef} />
          </div>
        )}
      </div>
    </div>
  );
}
