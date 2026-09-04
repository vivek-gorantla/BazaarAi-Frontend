"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Mic, X, Play, Loader2, CheckCircle2, Zap, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AgentUIRegistry from "../registry/AgentUIRegistry";
import { useAgentWebSocket } from "../hooks/useAgentWebSocket";
import type { AgentField } from "../registry/types";

type AgentState = "idle" | "recording" | "transcribing" | "streaming" | "success" | "error";

export function OnboardingVoiceAgent() {
    const [isOpen, setIsOpen] = useState(false);
    const [agentState, setAgentState] = useState<AgentState>("idle");
    const [filledCount, setFilledCount] = useState(0);
    const [errorMsg, setErrorMsg] = useState("");
    const [statusLabel, setStatusLabel] = useState("");
    const [registeredFields, setRegisteredFields] = useState<AgentField[]>([]);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Refresh available UI fields whenever modal opens
    useEffect(() => {
        if (isOpen) {
            const context = AgentUIRegistry.getUIContext();
            setRegisteredFields(context.fields || []);
        }
    }, [isOpen]);

    // ─── WebSocket callbacks ──────────────────────────────────────────────────

    const handleFieldFill = useCallback((fieldId: string, value: string) => {
        const field = AgentUIRegistry.getField(fieldId);
        if (field) {
            field.setValue(value);
            setFilledCount((n) => n + 1);
            setStatusLabel(`Filling "${field.label}"…`);
        }
    }, []);

    const handleDone = useCallback((summary: string, count: number) => {
        setFilledCount(count);
        setStatusLabel(summary);
        setAgentState("success");
        setTimeout(() => handleClose(), 2500);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleAgentError = useCallback((msg: string) => {
        setErrorMsg(msg);
        setAgentState("error");
    }, []);

    const { connect } = useAgentWebSocket({
        onFieldFill: handleFieldFill,
        onDone: handleDone,
        onError: handleAgentError,
    });

    // ─── Audio recording ──────────────────────────────────────────────────────

    const startRecording = async () => {
        try {
            audioChunksRef.current = [];
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                stream.getTracks().forEach((t) => t.stop());
                uploadAndProcess();
            };

            mediaRecorderRef.current.start();
            setAgentState("recording");
        } catch {
            setErrorMsg("Microphone access denied. Please allow microphone access and try again.");
            setAgentState("error");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
    };

    const uploadAndProcess = async () => {
        setAgentState("transcribing");
        try {
            const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
            const formData = new FormData();
            formData.append("audio", audioBlob, "voice-recording.webm");

            const res = await fetch("/api/merchant/upload-audio", {
                method: "POST",
                body: formData,
                headers: {
                    "x-user-id": localStorage.getItem("merchant_token") ?? "",
                    Authorization: `Bearer ${localStorage.getItem("merchant_token") ?? ""}`,
                },
            });

            const data = await res.json().catch(() => null);
            if (!res.ok || !data?.transcription) {
                throw new Error(data?.message ?? "Transcription failed");
            }

            const transcription: string = data.transcription;
            console.log("[VoiceAgent] Transcription:", transcription);

            const uiContext = AgentUIRegistry.getUIContext();
            setAgentState("streaming");
            setFilledCount(0);
            setStatusLabel("AI agent is reading your fields…");

            connect(transcription, uiContext);
        } catch (err) {
            console.error("[VoiceAgent] Error:", err);
            setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
            setAgentState("error");
        }
    };

    // ─── Modal controls ───────────────────────────────────────────────────────

    const handleClose = () => {
        setIsOpen(false);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
        setTimeout(() => {
            setAgentState("idle");
            setFilledCount(0);
            setErrorMsg("");
            setStatusLabel("");
        }, 300);
    };

    // ─── UI helpers ───────────────────────────────────────────────────────────

    const title: Record<AgentState, string> = {
        idle: "Voice Assistant",
        recording: "Listening…",
        transcribing: "Transcribing…",
        streaming: "Filling Form…",
        success: "Done!",
        error: "Something went wrong",
    };

    const subtitle: Record<AgentState, string> = {
        idle: "Tap start and speak your details naturally.",
        recording: "Speak clearly. Tap Send when you're done.",
        transcribing: "Converting your voice to text…",
        streaming: statusLabel || "AI agent is analysing your speech…",
        success: statusLabel || "Form filled successfully.",
        error: errorMsg,
    };

    return (
        <>
            {/* Floating trigger button */}
            <div className="fixed top-20 right-8 z-[90]">
                <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20" style={{ animationDuration: "3s" }} />
                <button
                    onClick={() => setIsOpen(true)}
                    className="relative h-12 px-4 bg-white text-[#496246] rounded-full flex items-center justify-center gap-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(73,98,70,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 group border border-gray-100"
                >
                    <div className="absolute inset-0 bg-[#496246]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                    <Mic size={20} className="relative z-10 transition-transform group-hover:scale-110" />
                    <span className="text-sm font-bold relative z-10 pr-1 whitespace-nowrap">Voice Fill</span>
                </button>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={agentState === "idle" || agentState === "error" || agentState === "success" ? handleClose : undefined}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />

                        {/* Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[32px] shadow-2xl w-full max-w-md relative z-10 overflow-hidden flex flex-col items-center justify-center p-8 min-h-[420px] text-center"
                        >
                            {/* Close button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                            >
                                <X size={18} />
                            </button>

                            {/* Visual indicator */}
                            <div className="relative flex items-center justify-center mb-5 h-28 w-28">
                                {agentState === "idle" && (
                                    <div className="w-20 h-20 bg-[#E8F0E7] rounded-full flex items-center justify-center text-[#496246]">
                                        <Mic size={32} />
                                    </div>
                                )}

                                {agentState === "recording" && (
                                    <>
                                        <div className="absolute w-28 h-28 bg-[#496246]/10 rounded-full animate-ping" style={{ animationDuration: "3s" }} />
                                        <div className="absolute w-22 h-22 bg-[#496246]/20 rounded-full animate-ping" style={{ animationDuration: "2s", animationDelay: "0.5s" }} />
                                        <div className="relative w-20 h-20 bg-gradient-to-br from-[#496246] to-[#263925] rounded-full flex items-center justify-center shadow-xl shadow-[#496246]/30 gap-1 px-3 overflow-hidden">
                                            {[...Array(5)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    className="w-1.5 bg-white rounded-full"
                                                    animate={{ height: ["20%", "80%", "40%", "100%", "20%"] }}
                                                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}

                                {agentState === "transcribing" && (
                                    <div className="w-20 h-20 bg-[#E8F0E7] rounded-full flex items-center justify-center text-[#496246]">
                                        <Loader2 size={32} className="animate-spin" />
                                    </div>
                                )}

                                {agentState === "streaming" && (
                                    <>
                                        <div className="absolute w-28 h-28 bg-[#496246]/10 rounded-full animate-ping" style={{ animationDuration: "2s" }} />
                                        <div className="relative w-20 h-20 bg-gradient-to-br from-[#496246] to-[#263925] rounded-full flex items-center justify-center shadow-xl shadow-[#496246]/20">
                                            <Zap size={32} className="text-white" fill="white" />
                                        </div>
                                        {filledCount > 0 && (
                                            <motion.div
                                                key={filledCount}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#496246] text-white text-xs font-black flex items-center justify-center"
                                            >
                                                {filledCount}
                                            </motion.div>
                                        )}
                                    </>
                                )}

                                {agentState === "success" && (
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="w-20 h-20 bg-[#E8F0E7] rounded-full flex items-center justify-center text-[#496246]"
                                    >
                                        <CheckCircle2 size={40} />
                                    </motion.div>
                                )}

                                {agentState === "error" && (
                                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                                        <X size={36} />
                                    </div>
                                )}
                            </div>

                            {/* Title */}
                            <h3 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">
                                {title[agentState]}
                            </h3>

                            {/* Subtitle */}
                            <p className="text-sm font-medium text-gray-500 leading-relaxed max-w-[300px] mb-4">
                                {subtitle[agentState]}
                            </p>

                            {/* Dynamic Fields Showcase (Visible when idle or recording) */}
                            {(agentState === "idle" || agentState === "recording") && registeredFields.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-full mb-6 bg-[#F2F7F2] rounded-2xl p-3.5 border border-[#E8F0E7] text-left"
                                >
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#496246] mb-2 px-0.5">
                                        <Sparkles size={13} className="text-[#496246]" />
                                        <span>Fields you can speak ({registeredFields.length}):</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                                        {registeredFields.map((f) => (
                                            <span
                                                key={f.id}
                                                className="px-2.5 py-1 bg-white rounded-lg text-xs font-semibold text-gray-700 border border-[#DCE8DC] shadow-xs flex items-center gap-1.5"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#496246]" />
                                                {f.label}
                                                {f.required && <span className="text-red-500 font-bold text-[10px]">*</span>}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Action buttons */}
                            <div className="w-full h-[52px] flex gap-3">
                                {agentState === "idle" && (
                                    <button
                                        onClick={startRecording}
                                        className="flex-1 bg-[#496246] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#3A4E38] transition-colors shadow-md hover:shadow-lg"
                                    >
                                        <Play size={18} fill="currentColor" />
                                        Start Recording
                                    </button>
                                )}

                                {agentState === "recording" && (
                                    <button
                                        onClick={stopRecording}
                                        className="flex-1 bg-gradient-to-r from-[#496246] to-[#263925] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                    >
                                        <Mic size={18} />
                                        Send Recording
                                    </button>
                                )}

                                {agentState === "error" && (
                                    <button
                                        onClick={() => setAgentState("idle")}
                                        className="flex-1 bg-gray-100 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                )}

                                {(agentState === "transcribing" || agentState === "streaming" || agentState === "success") && (
                                    <div className="flex-1" />
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
