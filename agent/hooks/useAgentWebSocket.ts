"use client";

import { useRef, useCallback } from "react";
import type { AgentUIContext } from "../../agent/registry/types";

export type FieldFillCallback = (fieldId: string, value: string) => void;
export type DoneCallback = (summary: string, filledCount: number) => void;
export type ErrorCallback = (message: string) => void;

interface UseAgentWebSocketOptions {
    onFieldFill: FieldFillCallback;
    onDone: DoneCallback;
    onError: ErrorCallback;
}

const WS_URL =
    typeof window !== "undefined"
        ? `ws://${window.location.hostname}:3000/ws/agent`
        : "ws://localhost:3000/ws/agent";

/**
 * Manages the WebSocket connection lifecycle for the onboarding agent.
 * Call `connect(transcription, uiContext)` after getting a transcription.
 * The hook fires onFieldFill for each field the agent extracts, then onDone.
 */
export function useAgentWebSocket({
    onFieldFill,
    onDone,
    onError,
}: UseAgentWebSocketOptions) {
    const wsRef = useRef<WebSocket | null>(null);

    const disconnect = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    }, []);

    const connect = useCallback(
        (transcription: string, uiContext: AgentUIContext) => {
            // Close any existing connection
            disconnect();

            const token = localStorage.getItem("merchant_token") ?? "";
            const url = `${WS_URL}?token=${encodeURIComponent(token)}`;

            console.log("[AgentWebSocket] Connecting to", url);
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log("[AgentWebSocket] Connected, sending fill_request");
                ws.send(
                    JSON.stringify({
                        type: "fill_request",
                        transcription,
                        uiContext,
                    })
                );
            };

            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data as string);
                    console.log("[AgentWebSocket] Received:", msg);

                    switch (msg.type) {
                        case "field_fill":
                            onFieldFill(msg.fieldId as string, msg.value as string);
                            break;
                        case "done":
                            onDone(msg.summary as string, msg.filledCount as number);
                            disconnect();
                            break;
                        case "error":
                            onError(msg.message as string);
                            disconnect();
                            break;
                        default:
                            console.warn("[AgentWebSocket] Unknown message type:", msg.type);
                    }
                } catch (err) {
                    console.error("[AgentWebSocket] Failed to parse message:", err);
                    onError("Failed to parse agent response");
                }
            };

            ws.onerror = (event) => {
                console.error("[AgentWebSocket] Connection error:", event);
                onError("Failed to connect to AI agent. Please try again.");
                disconnect();
            };

            ws.onclose = (event) => {
                console.log("[AgentWebSocket] Connection closed:", event.code, event.reason);
                wsRef.current = null;
            };
        },
        [onFieldFill, onDone, onError, disconnect]
    );

    return { connect, disconnect };
}
