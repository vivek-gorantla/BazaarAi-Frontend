"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Camera, X, Upload, Loader2, CheckCircle2, AlertCircle, Sparkles, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AgentUIRegistry, { type RegisteredAgentField } from "../registry/AgentUIRegistry";

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentState = "idle" | "uploading" | "analyzing" | "filling" | "partial" | "success" | "error";

interface ParsedObject {
    name: string;
    description?: string;
    category?: string;
    brand?: string | null;
    attributes?: Array<{ name: string; value: string }>;
    text?: string[];
    quantity?: number;
    confidence?: number;
}

interface OrchestratorResponse {
    success: boolean;
    uploadType?: string;
    parsedObservation?: {
        imageType?: string;
        objects?: ParsedObject[];
        overallDescription?: string;
        warnings?: string[];
    };
    selectedAgent?: string;
    reply?: string;
    error?: string;
}

interface FieldFill {
    fieldId: string;
    value: string;
}

interface MerchantImageAgentProps {
    /** Optional callback when agent successfully fills fields */
    onFilled?: (fills: FieldFill[], partial: boolean) => void;
    /** Optionally restrict to a category filter (e.g. "food") */
    categoryFilter?: string;
    /** Button label override */
    label?: string;
    /** Custom CSS class for the trigger button */
    className?: string;
}

// ─── Food / product categories to include (filter rack/shelf from background) ─
const FOOD_CATEGORIES = [
    "food", "beverage", "drink", "grocery", "produce", "dairy", "meat",
    "seafood", "bakery", "snack", "confectionery", "spice", "condiment",
    "sauce", "oil", "grain", "rice", "flour", "sugar", "salt", "tea",
    "coffee", "juice", "water", "soda", "alcohol", "fruit", "vegetable",
    "herb", "nut", "seed", "legume", "pulse", "cereal", "pasta", "noodle",
];

const NON_PRODUCT_LABELS = [
    "rack", "shelf", "shelving", "display", "fixture", "container", "bin",
    "basket", "trolley", "cart", "crate", "tray", "pallet", "furniture",
    "background", "floor", "wall", "ceiling", "lighting", "sign", "label", "tag",
];

/**
 * Determines if a detected object is an actual product (not a rack/shelf/fixture).
 * When imageType is "rack" or multiple objects exist, we filter to food-category items only.
 */
function isProductObject(obj: ParsedObject, imageType?: string): boolean {
    const name = (obj.name || "").toLowerCase();
    const category = (obj.category || "").toLowerCase();
    const desc = (obj.description || "").toLowerCase();

    // Explicitly reject non-product physical objects
    const isNonProduct = NON_PRODUCT_LABELS.some(
        (label) => name.includes(label) || desc.includes(label)
    );
    if (isNonProduct) return false;

    // If image has multiple items or is a rack/shelf, only keep food items
    const isRackLike =
        (imageType || "").toLowerCase().includes("rack") ||
        (imageType || "").toLowerCase().includes("shelf") ||
        (imageType || "").toLowerCase().includes("multiple");

    if (isRackLike) {
        return FOOD_CATEGORIES.some(
            (cat) => category.includes(cat) || name.includes(cat) || desc.includes(cat)
        );
    }

    return true; // single-product image → trust the observation
}

/**
 * Maps a ParsedObject to AgentUIRegistry field fills.
 * Only fills fields that are actually registered on the current page.
 */
function mapObjectToFieldFills(obj: ParsedObject): FieldFill[] {
    const fills: FieldFill[] = [];

    // name → "name" field
    if (obj.name) fills.push({ fieldId: "name", value: obj.name });

    // category → "category" field
    if (obj.category) fills.push({ fieldId: "category", value: obj.category });

    // brand → "subcategory" or "brand" field (use brand as subcategory hint)
    if (obj.brand) fills.push({ fieldId: "subcategory", value: obj.brand });

    // description → "description" field
    if (obj.description) fills.push({ fieldId: "description", value: obj.description });

    // Derive unit from attributes if possible
    const unitAttr = obj.attributes?.find(
        (a) =>
            a.name.toLowerCase().includes("weight") ||
            a.name.toLowerCase().includes("size") ||
            a.name.toLowerCase().includes("volume")
    );
    if (unitAttr) {
        const val = unitAttr.value.toLowerCase();
        if (val.includes("kg")) fills.push({ fieldId: "unit", value: "kg" });
        else if (val.includes("g") || val.includes("gram")) fills.push({ fieldId: "unit", value: "gram" });
        else if (val.includes("l") || val.includes("litre") || val.includes("liter")) fills.push({ fieldId: "unit", value: "litre" });
        else if (val.includes("ml")) fills.push({ fieldId: "unit", value: "ml" });
        else if (val.includes("pack")) fills.push({ fieldId: "unit", value: "pack" });
    }

    return fills;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MerchantImageAgent({
    onFilled,
    label = "Snap & Fill",
    className = "",
}: MerchantImageAgentProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [agentState, setAgentState] = useState<AgentState>("idle");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [agentReply, setAgentReply] = useState<string>("");
    const [filledFields, setFilledFields] = useState<FieldFill[]>([]);
    const [emptyFields, setEmptyFields] = useState<RegisteredAgentField[]>([]);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [currentlyFilling, setCurrentlyFilling] = useState<string>("");
    const [detectedObjects, setDetectedObjects] = useState<ParsedObject[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cleanup preview URL on unmount
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleFileSelect = useCallback((file: File) => {
        if (!file.type.startsWith("image/")) {
            setErrorMsg("Please select an image file.");
            setAgentState("error");
            return;
        }
        const url = URL.createObjectURL(file);
        setSelectedFile(file);
        setPreviewUrl(url);
        setAgentState("idle");
        setErrorMsg("");
        setAgentReply("");
        setFilledFields([]);
        setEmptyFields([]);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handleFileSelect(file);
        },
        [handleFileSelect]
    );

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setAgentState("uploading");
        setErrorMsg("");
        setAgentReply("");
        setFilledFields([]);
        setEmptyFields([]);

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("uploadType", "image");

            const storeId = localStorage.getItem("merchant_store_id") || "";
            if (storeId) formData.append("storeId", storeId);

            const token = localStorage.getItem("merchant_token") || "";

            setAgentState("analyzing");

            const res = await fetch("/api/agent/process", {
                method: "POST",
                headers: {
                    "x-user-id": token,
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data: OrchestratorResponse = await res.json().catch(() => ({
                success: false,
                error: "Invalid response from server",
            }));

            if (!data.success || !data.parsedObservation) {
                setAgentReply(data.reply || data.error || "Could not analyze the image.");
                setAgentState("error");
                return;
            }

            const obs = data.parsedObservation;
            const allObjects = obs.objects || [];

            // Filter to only food/product objects (not racks, shelves etc.)
            const productObjects = allObjects.filter((obj) =>
                isProductObject(obj, obs.imageType)
            );

            setDetectedObjects(productObjects);

            if (productObjects.length === 0) {
                setAgentReply(
                    data.reply ||
                    "No food or product items detected in the image. If this is a rack image, only food products will be picked up."
                );
                setAgentState("error");
                return;
            }

            // Use the highest-confidence object
            const primary = productObjects.sort(
                (a, b) => (b.confidence || 0) - (a.confidence || 0)
            )[0];

            // Map to field fills
            const fills = mapObjectToFieldFills(primary);

            // Only fill fields that are actually registered in the UI
            const registeredFieldIds = new Set(
                AgentUIRegistry.getFields().map((f) => f.id)
            );
            const applicableFills = fills.filter((f) => registeredFieldIds.has(f.fieldId));

            setAgentState("filling");

            // Stream field fills with small delay for UX animation
            const successFills: FieldFill[] = [];
            for (const fill of applicableFills) {
                const field = AgentUIRegistry.getField(fill.fieldId);
                if (field) {
                    setCurrentlyFilling(field.label);
                    field.setValue(fill.value);
                    successFills.push(fill);
                    await new Promise((r) => setTimeout(r, 150));
                }
            }

            // Find unfilled empty fields
            const allRegisteredFields = AgentUIRegistry.getFields();
            const filledIds = new Set(successFills.map((f) => f.fieldId));
            const empty = allRegisteredFields.filter(
                (f) => !filledIds.has(f.id) && (f.required || !f.value)
            );

            setFilledFields(successFills);
            setEmptyFields(empty);
            setCurrentlyFilling("");
            setAgentReply(data.reply || "");

            if (empty.length > 0) {
                setAgentState("partial");
            } else {
                setAgentState("success");
                setTimeout(() => handleClose(), 2500);
            }

            onFilled?.(successFills, empty.length > 0);
        } catch (err) {
            console.error("[MerchantImageAgent] Error:", err);
            setErrorMsg(
                err instanceof Error ? err.message : "Something went wrong. Please try again."
            );
            setAgentState("error");
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(() => {
            setAgentState("idle");
            setPreviewUrl(null);
            setSelectedFile(null);
            setAgentReply("");
            setFilledFields([]);
            setEmptyFields([]);
            setErrorMsg("");
            setCurrentlyFilling("");
            setDetectedObjects([]);
        }, 300);
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <>
            {/* Trigger button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`flex items-center justify-center gap-2 transition-all ${className}`}
            >
                <Camera size={18} />
                <span>{label}</span>
            </button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={
                                agentState === "idle" ||
                                    agentState === "error" ||
                                    agentState === "success" ||
                                    agentState === "partial"
                                    ? handleClose
                                    : undefined
                            }
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />

                        {/* Modal Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-[#E8F0E7] flex items-center justify-center text-[#496246]">
                                        <Camera size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-gray-900">Snap & Fill</h2>
                                        <p className="text-xs text-gray-400 font-medium">
                                            Upload a photo to auto-fill the form
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-5">
                                {/* Image Upload Zone */}
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={(e) => e.preventDefault()}
                                    onClick={() => !selectedFile && fileInputRef.current?.click()}
                                    className={`relative border-2 border-dashed rounded-[24px] transition-all cursor-pointer overflow-hidden
                                        ${selectedFile
                                            ? "border-[#496246]/40 bg-[#F2F7F2]"
                                            : "border-gray-200 bg-gray-50 hover:border-[#496246]/40 hover:bg-[#F2F7F2]/50"
                                        }`}
                                    style={{ minHeight: 180 }}
                                >
                                    {previewUrl ? (
                                        <div className="relative">
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="w-full object-cover rounded-[22px]"
                                                style={{ maxHeight: 240 }}
                                            />
                                            {/* Change image overlay */}
                                            {agentState === "idle" && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        fileInputRef.current?.click();
                                                    }}
                                                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-bold text-gray-700 shadow-md hover:bg-white transition-colors flex items-center gap-1.5"
                                                >
                                                    <Upload size={12} />
                                                    Change
                                                </button>
                                            )}
                                            {/* Analyzing overlay */}
                                            {(agentState === "uploading" || agentState === "analyzing" || agentState === "filling") && (
                                                <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] rounded-[22px] flex flex-col items-center justify-center gap-2">
                                                    <Loader2 size={36} className="text-white animate-spin" />
                                                    <span className="text-white text-sm font-bold">
                                                        {agentState === "uploading" && "Uploading…"}
                                                        {agentState === "analyzing" && "AI is analyzing…"}
                                                        {agentState === "filling" && (currentlyFilling ? `Filling "${currentlyFilling}"…` : "Filling form…")}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-6">
                                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                <ImageIcon size={28} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-700 mb-1">Drop an image here</p>
                                                <p className="text-xs text-gray-400">
                                                    or click to browse · JPG, PNG, WEBP
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileSelect(file);
                                            e.target.value = "";
                                        }}
                                    />
                                </div>

                                {/* Detected Objects Chips */}
                                {detectedObjects.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {detectedObjects.map((obj, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 bg-[#E8F0E7] text-[#496246] rounded-full text-xs font-semibold flex items-center gap-1.5"
                                            >
                                                <Sparkles size={11} />
                                                {obj.name}
                                                {obj.category && (
                                                    <span className="text-[#496246]/60">· {obj.category}</span>
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Success state */}
                                {agentState === "success" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-[#E8F0E7] rounded-2xl p-4 flex items-center gap-3"
                                    >
                                        <CheckCircle2 size={24} className="text-[#496246] shrink-0" />
                                        <div>
                                            <p className="font-bold text-[#496246] text-sm">Form filled successfully!</p>
                                            <p className="text-xs text-[#496246]/70 mt-0.5">
                                                {filledFields.length} field{filledFields.length !== 1 ? "s" : ""} populated from your image.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Partial fill state */}
                                {agentState === "partial" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-3"
                                    >
                                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                                            <div className="flex items-start gap-3 mb-3">
                                                <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-bold text-amber-800 text-sm">Partial fill — some fields need your input</p>
                                                    <p className="text-xs text-amber-600 mt-0.5">
                                                        {filledFields.length} field{filledFields.length !== 1 ? "s" : ""} filled · {emptyFields.length} still empty
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {emptyFields.map((f) => (
                                                    <span
                                                        key={f.id}
                                                        className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                        {f.label}
                                                        {f.required && <span className="text-red-500 font-black">*</span>}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Agent reply (when partial/error) */}
                                {agentReply && (agentState === "partial" || agentState === "error") && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Agent Note</p>
                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                            {agentReply}
                                        </p>
                                    </div>
                                )}

                                {/* Error state */}
                                {agentState === "error" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3"
                                    >
                                        <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-red-700 text-sm">Could not analyze image</p>
                                            <p className="text-xs text-red-500 mt-0.5">{errorMsg}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3 rounded-b-[32px]">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    {agentState === "partial" || agentState === "success" ? "Close & Edit" : "Cancel"}
                                </button>

                                {(agentState === "idle" || agentState === "error") && (
                                    <button
                                        type="button"
                                        onClick={agentState === "error" && selectedFile ? handleAnalyze : () => fileInputRef.current?.click()}
                                        className="px-6 py-2.5 bg-[#496246] hover:bg-[#3A4E38] text-white text-sm rounded-xl font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Upload size={16} />
                                        {selectedFile ? "Try Again" : "Choose Photo"}
                                    </button>
                                )}

                                {agentState === "idle" && selectedFile && (
                                    <button
                                        type="button"
                                        onClick={handleAnalyze}
                                        className="px-6 py-2.5 bg-[#496246] hover:bg-[#3A4E38] text-white text-sm rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
                                    >
                                        <Sparkles size={16} />
                                        Analyze & Fill
                                    </button>
                                )}

                                {agentState === "partial" && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
                                    >
                                        <Camera size={16} />
                                        Try Another Image
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
