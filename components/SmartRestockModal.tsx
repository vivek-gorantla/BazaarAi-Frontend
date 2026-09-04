"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Camera,
  FileSpreadsheet,
  MessageSquare,
  X,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Send,
  Sparkles,
  Bot,
  Package,
  Boxes,
  Truck,
  Plus,
  Edit,
  ChevronDown,
  RefreshCw,
  TrendingUp
} from "lucide-react";
import {
  processAgentApi,
  createProductApi,
  updateProductApi,
  bulkCreateProductsApi,
  getProducts,
  getDynamicProductImage,
  AgentProcessResponse,
  Product
} from "@/services/merchantApi";
import { dispatchInventoryUpdated } from "@/services/eventBus";

export interface BatchProductItem {
  id: string;
  name: string;
  category: string;
  price: string;
  stockQty: string;
  unit: string;
  description: string;
  selected: boolean;
}

interface SmartRestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "voice" | "camera" | "csv" | "text";
}

type AgentTarget = "auto" | "product" | "inventory" | "supplier" | "growth";

// Agent Details & Capabilities Mapping
const AGENT_CONFIGS: Record<AgentTarget, {
  name: string;
  badge: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  capabilities: string[];
  samplePrompts: string[];
}> = {
  auto: {
    name: "Auto (Smart Intent Routing)",
    badge: "Smart Orchestrator",
    icon: Sparkles,
    color: "text-[#496246]",
    bgColor: "bg-[#F2F7F2]",
    borderColor: "border-[#DCE8DC]",
    description: "Automatically analyzes your voice, image, CSV, or text prompt and routes to Product, Inventory, or Supplier agent.",
    capabilities: [
      "Auto-detects whether you want to manage Catalog, Stock, or Suppliers",
      "Fills product forms in real-time from speech or photos",
      "Executes stock updates and supplier purchase orders seamlessly"
    ],
    samplePrompts: [
      "Add 25 bags of Basmati Rice 5kg at ₹120/kg",
      "Decrease stock of Wheat Flour by 5 packs",
      "Create supplier Ramesh Wholesale phone 9876543210"
    ]
  },
  product: {
    name: "Product Catalog Agent",
    badge: "Catalog Management",
    icon: Package,
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "Manages your store product catalog. Creates new products, updates pricing, categories, units, and descriptions.",
    capabilities: [
      "Create new catalog products with custom price, SKU, category & unit",
      "Edit product titles, descriptions, and active storefront visibility",
      "Auto-fill new product details directly from voice notes or shelf photos"
    ],
    samplePrompts: [
      "Create product Organic Sourdough Bread price 80 unit piece category Bakery",
      "Update price of Basmati Rice to 135 rupees per kg",
      "Add new beverage Coconut Water price 50 stock 30"
    ]
  },
  inventory: {
    name: "Inventory & Stock Agent",
    badge: "Stock Control",
    icon: Boxes,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    description: "Manages live stock quantities. Adds received stock, records sales, tracks low-stock alerts, and audits inventory.",
    capabilities: [
      "Add or reduce stock quantities for existing products",
      "Query low stock or out-of-stock items across your store",
      "Log inventory count adjustments with audit timestamps"
    ],
    samplePrompts: [
      "Restock 50 kg Basmati Rice",
      "Show out of stock items in grocery category",
      "Reduce stock of Organic Whole Milk by 12 bottles"
    ]
  },
  supplier: {
    name: "Supplier & P.O. Agent",
    badge: "Procurement",
    icon: Truck,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "Manages database suppliers, vendor contact information, purchase orders (P.O.), and receiving shipments.",
    capabilities: [
      "Register new suppliers with category, phone, and address",
      "Create & issue B2B Purchase Orders for stock replenishment",
      "Receive supplier shipments and automatically update DB stock"
    ],
    samplePrompts: [
      "Create new supplier Amul Dairy category Dairy phone 9876543210",
      "Issue purchase order to Ramesh Wholesale for 100 kg Rice",
      "List active purchase orders pending shipment"
    ]
  },
  growth: {
    name: "Growth & Revenue Agent",
    badge: "Revenue Operations",
    icon: TrendingUp,
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    description: "Grows store revenue by orchestrating campaigns, creating upsells, and conversational checkout.",
    capabilities: [
      "Launch targeted promotional campaigns",
      "Find upsell and cross-sell opportunities",
      "Convert conversational queries into direct orders"
    ],
    samplePrompts: [
      "Start a 10% off campaign on all dairy products for the weekend",
      "Suggest an upsell for customers buying coffee",
      "Customer 9876543210 wants to buy 2 packs of milk"
    ]
  }
};

export function SmartRestockModal({ isOpen, onClose, initialTab = "voice" }: SmartRestockModalProps) {
  const [activeTab, setActiveTab] = useState<"voice" | "camera" | "csv" | "text">(initialTab);
  const [selectedAgent, setSelectedAgent] = useState<AgentTarget>("auto");
  const [showAgentCapabilities, setShowAgentCapabilities] = useState(false);

  // Agent execution state
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentResponse, setAgentResponse] = useState<AgentProcessResponse | null>(null);
  const [queriedProducts, setQueriedProducts] = useState<Product[]>([]);

  // Multi-Product Batch Restock State
  const [batchProducts, setBatchProducts] = useState<BatchProductItem[]>([]);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

  // Form State for Adding / Updating Products
  const [showForm, setShowForm] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Grocery",
    subcategory: "",
    price: "",
    stockQty: "",
    unit: "kg",
    description: "",
    sku: "",
    imageUrl: ""
  });

  // Track which fields were auto-filled by Voice / Camera / AI
  const [filledFieldKeys, setFilledFieldKeys] = useState<string[]>([]);
  const [missingFieldKeys, setMissingFieldKeys] = useState<string[]>([]);

  // --- Voice State ---
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- Text State ---
  const [textPrompt, setTextPrompt] = useState("");

  // --- CSV State ---
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // --- Camera / Image State ---
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // --- Interactive Chat History State ---
  const [chatThread, setChatThread] = useState<{ id: string; role: 'user' | 'assistant'; text: string; agentName?: string }[]>([]);
  const [followUpText, setFollowUpText] = useState("");
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setAgentResponse(null);
      setChatThread([]);
      setFollowUpText("");
      setIsProcessing(false);
      setIsRecording(false);
      setRecordingTime(0);
      setTextPrompt("");
      setCsvFile(null);
      setImageFile(null);
      setImagePreview(null);
      setShowForm(false);
      resetForm();

      getProducts()
        .then((prods) => setCatalogProducts(prods))
        .catch(() => setCatalogProducts([]));
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  if (!isOpen) return null;

  function resetForm() {
    setFormData({
      name: "",
      category: "Grocery",
      subcategory: "",
      price: "",
      stockQty: "",
      unit: "kg",
      description: "",
      sku: "",
      imageUrl: ""
    });
    setFilledFieldKeys([]);
    setMissingFieldKeys([]);
    setBatchProducts([]);
    setEditingItem(null);
  }

  // Helper to filter out display fixtures/racks from food objects
  const isFixture = (name: string) => {
    const lower = (name || "").toLowerCase();
    return (
      lower.includes("rack") ||
      lower.includes("shelf") ||
      lower.includes("fixture") ||
      lower.includes("display") ||
      lower.includes("stand") ||
      lower.includes("counter") ||
      lower.includes("table") ||
      lower.includes("container") ||
      lower.includes("holder") ||
      lower.includes("furniture")
    );
  };

  const extractFoodItemsFromTextReply = (reply: string): BatchProductItem[] => {
    const items: BatchProductItem[] = [];
    if (!reply || typeof reply !== "string") return items;

    const lowerReply = reply.toLowerCase();
    if (
      lowerReply.includes("delete") ||
      lowerReply.includes("remove") ||
      lowerReply.includes("deleted") ||
      lowerReply.includes("removed") ||
      lowerReply.includes("cannot decrease") ||
      lowerReply.includes("does not exist") ||
      lowerReply.includes("out of stock") ||
      lowerReply.includes("insufficient") ||
      lowerReply.includes("failed to") ||
      lowerReply.includes("could not be found") ||
      lowerReply.includes("unable to") ||
      lowerReply.includes("not found") ||
      lowerReply.includes("error executing")
    ) {
      return [];
    }

    const isFixtureName = (name: string) => {
      const lower = name.toLowerCase();
      return (
        lower.includes("metal display rack") ||
        lower.includes("display rack") ||
        lower.includes("fixture") ||
        lower.includes("shelf") ||
        lower.includes("racks") ||
        lower.includes("scope of inventory") ||
        lower.includes("what the image shows") ||
        lower.includes("limitations and uncertainty") ||
        lower.includes("how this can be used") ||
        lower.includes("clarifications i need") ||
        lower.includes("product matching") ||
        lower.includes("boxed food products") ||
        lower.includes("other snack bags")
      );
    };

    // 1. Match bold markdown items like **Lay's Barbecue**: Price 30, Qty 10
    const boldMatches = Array.from(reply.matchAll(/(?:-|\*|\d+\.)\s*(?:[0-9×x\s]+)?\*\*([^*:\n]+)\*\*(?::\s*|\s*=\s*|\s*\()?([^\n]*)/gi));
    boldMatches.forEach((m, idx) => {
      const rawName = m[1].trim();
      const restText = m[2] || "";

      if (rawName && !isFixtureName(rawName) && rawName.length < 60 && rawName.length > 2) {
        const qtyMatch = restText.match(/(\d+)\s*(?:cans?|bags?|packs?|boxes?|units?|pcs|kg|bottles?)?/i) || m[0].match(/(\d+)\s*×/i);
        const priceMatch = restText.match(/(?:₹|rs\.?|price)?\s*(\d+(?:\.\d{1,2})?)/i);

        let unit = "pack";
        const lowerName = rawName.toLowerCase();
        if (lowerName.includes("can") || restText.toLowerCase().includes("can")) unit = "can";
        else if (lowerName.includes("rice") || lowerName.includes("flour") || lowerName.includes("kg")) unit = "kg";
        else if (lowerName.includes("oil") || lowerName.includes("milk") || lowerName.includes("litre")) unit = "litre";
        else if (lowerName.includes("box")) unit = "box";

        if (!items.some((i) => i.name.toLowerCase() === rawName.toLowerCase())) {
          items.push({
            id: `text-bold-${idx}-${Date.now()}`,
            name: rawName,
            category: lowerName.includes("soda") || lowerName.includes("milk") || lowerName.includes("oil") ? "Beverages" : "Grocery",
            price: priceMatch ? priceMatch[1] : "50",
            stockQty: qtyMatch ? qtyMatch[1] : "10",
            unit: unit,
            description: `Extracted from text: ${rawName}`,
            selected: true,
          });
        }
      }
    });

    // 2. Match natural speech / comma-separated lists e.g. "10 bags of Basmati Rice at 120, 5 packs of Sugar at 60, 20 bottles of Oil at 150"
    const listSegments = reply.split(/(?:,|\n|;|\band\b)/gi);
    listSegments.forEach((segment, idx) => {
      const trimmed = segment.trim();
      if (!trimmed || trimmed.length < 4) return;

      // Pattern: (\d+)\s*(bags?|packs?|bottles?|kg|units?|boxes?)?\s*(?:of)?\s*([a-zA-Z0-9\s]+?)\s*(?:at|for|price|₹|rs\.?)\s*(\d+)?
      const segmentMatch = trimmed.match(/(?:add|restock|create)?\s*(\d+)\s*(bags?|packs?|bottles?|kg|units?|pcs|boxes?|litres?)?\s*(?:of)?\s*([a-zA-Z0-9\s\.-]+?)\s*(?:at|for|price|₹|rs\.?|rupees?|\$)\s*(\d+)?/i);
      
      if (segmentMatch) {
        const qty = segmentMatch[1] || "10";
        const unitRaw = (segmentMatch[2] || "piece").toLowerCase();
        const rawName = segmentMatch[3].trim();
        const price = segmentMatch[4] || "50";

        if (rawName && rawName.length > 2 && rawName.length < 50 && !isFixtureName(rawName)) {
          let unit = "piece";
          if (unitRaw.includes("bag") || unitRaw.includes("kg")) unit = "kg";
          else if (unitRaw.includes("pack")) unit = "pack";
          else if (unitRaw.includes("bottle") || unitRaw.includes("litre")) unit = "litre";
          else if (unitRaw.includes("box")) unit = "box";

          if (!items.some((i) => i.name.toLowerCase() === rawName.toLowerCase())) {
            items.push({
              id: `text-segment-${idx}-${Date.now()}`,
              name: rawName,
              category: rawName.toLowerCase().includes("milk") || rawName.toLowerCase().includes("oil") || rawName.toLowerCase().includes("water") ? "Beverages" : "Grocery",
              price: price,
              stockQty: qty,
              unit: unit,
              description: `Speech/Text item: ${rawName}`,
              selected: true,
            });
          }
        }
      }
    });

    return items;
  };

  // --- Helper: Extract Product Fields from Agent Response & User Input ---
  const extractAndSetFormData = async (obs: any, textReply: string, userPromptText?: string, targetAgentName?: string) => {
    const filled: string[] = [];
    const missing: string[] = [];
    const newForm = { ...formData };
    const detectedItemsBatch: BatchProductItem[] = [];

    const promptRaw = userPromptText || "";
    const lowerPrompt = promptRaw.toLowerCase();
    const lowerReply = (textReply || "").toLowerCase();

    // 1. Check Delete / Error / Warning / Supplier Intent
    const isSupplierIntent =
      targetAgentName === "supplier" ||
      lowerPrompt.includes("supplier") ||
      lowerPrompt.includes("purchase order") ||
      lowerPrompt.includes("vendor") ||
      lowerReply.includes("supplier");

    const isDeleteIntent =
      lowerReply.includes("delete") ||
      lowerReply.includes("remove") ||
      lowerReply.includes("deleted") ||
      lowerReply.includes("removed") ||
      lowerPrompt.includes("delete") ||
      lowerPrompt.includes("remove");

    const isErrorOrWarning =
      lowerReply.includes("cannot decrease") ||
      lowerReply.includes("does not exist") ||
      lowerReply.includes("out of stock") ||
      lowerReply.includes("insufficient") ||
      lowerReply.includes("failed") ||
      lowerReply.includes("error") ||
      lowerReply.includes("not found");

    if (isDeleteIntent || isErrorOrWarning || isSupplierIntent) {
      setBatchProducts([]);
      setShowForm(false);
      resetForm();
      return;
    }

    // Process Vision Observation objects if available
    if (obs && obs.objects && Array.isArray(obs.objects) && obs.objects.length > 0) {
      const validFoodObjects = obs.objects.filter((o: any) => o.name && !isFixture(o.name));
      if (validFoodObjects.length > 0) {
        validFoodObjects.forEach((item: any, index: number) => {
          let unit = "piece";
          if (item.attributes && Array.isArray(item.attributes)) {
            const unitAttr = item.attributes.find((a: any) =>
              a.name?.toLowerCase().includes("size") || a.name?.toLowerCase().includes("weight")
            );
            if (unitAttr && unitAttr.value) {
              const val = String(unitAttr.value).toLowerCase();
              if (val.includes("kg")) unit = "kg";
              else if (val.includes("g") || val.includes("gram")) unit = "gram";
              else if (val.includes("litre") || val.includes("l")) unit = "litre";
              else if (val.includes("ml")) unit = "ml";
              else if (val.includes("pack")) unit = "pack";
              else if (val.includes("box")) unit = "box";
            }
          }

          detectedItemsBatch.push({
            id: `batch-${index}-${Date.now()}`,
            name: item.name,
            category: item.category || "Grocery",
            price: item.price ? String(item.price) : "20",
            stockQty: item.stockQty ? String(item.stockQty) : "5",
            unit: unit,
            description: item.description || `Detected item ${item.name}`,
            selected: true
          });
        });
      }
    }

    setBatchProducts(detectedItemsBatch);

    // 2. Extract Clean Product Name
    let extractedName = "";
    const quotedMatch = promptRaw.match(/["'“]([^"'”]+)["'”]/);
    if (quotedMatch && quotedMatch[1] && !isFixture(quotedMatch[1])) {
      extractedName = quotedMatch[1].trim();
    } else {
      const namePattern =
        promptRaw.match(/(?:create|add|update|restock)?\s*(?:a|an)?\s*product\s+([a-zA-Z0-9\s]+?)(?:\s+to\s+my|\s+to\s+store|\s+with|\s+at|\s+having|\s+stock|\s+price|\s+cost|\s+desc|$)/i) ||
        promptRaw.match(/(?:update|change|set)?\s*(?:the)?\s*(?:price|cost|stock)\s+of\s+([a-zA-Z0-9\s]+?)(?:\s+to|\s+at|\s+for|\s+is|$)/i) ||
        promptRaw.match(/(?:add|create|restock|update)\s+(\d+)\s*(?:pacs?|packs?|kgs?|g|grams?|bags?|boxes?|units?|pieces?|pcs|bottles?|litres?|l)?\s*(?:of)?\s*([a-zA-Z0-9\s]+?)(?:\s+to\s+my|\s+to\s+store|\s+with|\s+at|\s+having|\s+stock|\s+price|\s+cost|\s+each|$)/i) ||
        promptRaw.match(/(?:create|add|update)\s+([a-zA-Z0-9\s]+?)(?:\s+to\s+my|\s+to\s+store|\s+with|\s+at|\s+having|\s+stock|\s+price|\s+cost|\s+desc|$)/i);
      if (namePattern) {
        const captured = namePattern[2] || namePattern[1];
        if (captured && !isFixture(captured)) {
          extractedName = captured.trim();
        }
      }
    }

    if (extractedName) {
      extractedName = extractedName
        .replace(/^(?:a|an|the|new)\s+/i, "")
        .replace(/\s+(?:for your store|for store|to my inventory|to store|with these details|details:).*$/i, "")
        .trim();
    }

    // 3. Extract Price
    let extractedPrice = "";
    const priceMatch =
      promptRaw.match(/(?:cost|price)\s*(?:is|=|:|\s+)?\s*(?:₹|rs\.?|rupees?)?\s*(\d+(?:\.\d{1,2})?)/i) ||
      promptRaw.match(/(?:at|for|price|cost|₹|rs\.?|rupees?)\s*(\d+(?:\.\d{1,2})?)\s*(?:rupees?|rs\.?|₹|per|\/\s*kg|\/\s*pack)?/i) ||
      promptRaw.match(/(\d+(?:\.\d{1,2})?)\s*(?:rupees|rs|₹|per\s*kg|per\s*pack|each)/i);
    if (priceMatch && priceMatch[1]) {
      extractedPrice = priceMatch[1];
    }

    // 4. Extract Stock Quantity & Unit
    let extractedStock = "";
    let extractedUnit = "pack";
    const stockMatch =
      promptRaw.match(/stock\s*(?:is|=|:|\s+)?\s*(?:of)?\s*(\d+)\s*(pacs?|packs?|kgs?|g|grams?|bags?|boxes?|units?|pieces?|pcs|bottles?|litres?|l)?/i) ||
      promptRaw.match(/(\d+)\s*(pacs?|packs?|kgs?|g|grams?|bags?|boxes?|units?|pieces?|pcs|bottles?|litres?|l)/i);
    if (stockMatch) {
      if (stockMatch[1]) extractedStock = stockMatch[1];
      if (stockMatch[2]) {
        const u = stockMatch[2].toLowerCase();
        if (u.includes("bag") || u.includes("kg")) extractedUnit = "kg";
        else if (u.includes("pac") || u.includes("pack")) extractedUnit = "pack";
        else if (u.includes("box")) extractedUnit = "box";
        else if (u.includes("bottle") || u.includes("litre") || u === "l") extractedUnit = "litre";
        else if (u.includes("piece") || u.includes("pcs")) extractedUnit = "piece";
        else if (u.includes("gram") || u === "g") extractedUnit = "gram";
      }
    }

    // 5. Extract Description / Notes
    let extractedDesc = "";
    const descMatch =
      promptRaw.match(/description\s*(?:is|=|:|\s+)?\s*([^.\n]+?)(?:$|and\s+price|and\s+stock)/i) ||
      promptRaw.match(/desc\s*(?:is|=|:|\s+)?\s*([^.\n]+?)(?:$|and\s+price|and\s+stock)/i) ||
      promptRaw.match(/notes?\s*(?:is|=|:|\s+)?\s*([^.\n]+?)(?:$|and\s+price|and\s+stock)/i);
    if (descMatch && descMatch[1]) {
      extractedDesc = descMatch[1].trim();
    }

    // 6. Extract or Auto-Generate SKU
    let extractedSku = "";
    const skuMatch = promptRaw.match(/sku\s*[:=]?\s*([a-zA-Z0-9_-]+)/i);
    if (skuMatch && skuMatch[1]) {
      extractedSku = skuMatch[1].toUpperCase();
    }

    // Apply extracted values
    if (extractedName) {
      newForm.name = extractedName;
      filled.push("name");
    }
    if (extractedPrice) {
      newForm.price = extractedPrice;
      filled.push("price");
    }
    if (extractedStock) {
      newForm.stockQty = extractedStock;
      filled.push("stockQty");
    }
    newForm.unit = extractedUnit;
    if (extractedDesc) {
      newForm.description = extractedDesc;
      filled.push("description");
    }

    // Auto-generate SKU if missing and name exists
    if (!extractedSku && newForm.name) {
      const catCode = (newForm.category || "GRC").substring(0, 3).toUpperCase();
      const nameCode = newForm.name.toUpperCase().replace(/[^A-Z0-9]/g, "-").replace(/-+/g, "-").substring(0, 12);
      extractedSku = `${catCode}-${nameCode}`;
    }
    if (extractedSku) {
      newForm.sku = extractedSku;
      filled.push("sku");
    }

    // Auto-generate image preview URL if missing
    if (!newForm.imageUrl && newForm.name) {
      newForm.imageUrl = getDynamicProductImage(newForm.name, newForm.category);
    }

    // 7. Check Existing Inventory for Update Matching
    try {
      if (newForm.name || newForm.sku) {
        const existingProducts = await getProducts();
        const match = existingProducts.find(
          (p) =>
            (newForm.sku && p.sku && p.sku.toLowerCase() === newForm.sku.toLowerCase()) ||
            (newForm.name && p.title.toLowerCase() === newForm.name.toLowerCase()) ||
            (newForm.name && p.title.toLowerCase().includes(newForm.name.toLowerCase()))
        );

        if (match) {
          setEditingItem(match);
          newForm.name = match.title;
          newForm.category = match.category || newForm.category;
          newForm.sku = match.sku || newForm.sku;
          newForm.description = extractedDesc || match.description || newForm.description;
          newForm.imageUrl = match.image || newForm.imageUrl;
          if (!extractedPrice && match.numericPrice) newForm.price = String(match.numericPrice);
          if (!extractedStock) newForm.stockQty = String(match.stockQty);
          newForm.unit = match.unit || newForm.unit;
          filled.push("existing_product_matched");
        } else {
          setEditingItem(null);
        }
      }
    } catch (e) {
      console.warn("Failed to check existing products for form pre-fill", e);
    }

    // Required check
    if (!newForm.name) missing.push("name");
    if (!newForm.price) missing.push("price");
    if (!newForm.stockQty) missing.push("stockQty");

    setFormData(newForm);
    setFilledFieldKeys(filled);
    setMissingFieldKeys(missing);

    const isQueryIntent = lowerReply.includes("give me") || lowerReply.includes("show") || lowerReply.includes("list") || lowerReply.includes("get") || lowerReply.includes("search") || lowerReply.includes("find") || lowerReply.includes("which");

    const isProcessedByAgent =
      !isErrorOrWarning &&
      (targetAgentName === "supplier" ||
        targetAgentName === "inventory" ||
        targetAgentName === "product" ||
        lowerReply.includes("updated") ||
        lowerReply.includes("created") ||
        lowerReply.includes("added") ||
        lowerReply.includes("restocked") ||
        lowerReply.includes("successful") ||
        lowerReply.includes("found") ||
        lowerReply.includes("deleted"));

    const hasBatchItems = (obs && obs.objects && Array.isArray(obs.objects) && obs.objects.length > 0) || detectedItemsBatch.length > 0;

    // Open Multi-Product Batch Form IF shelf image/batch items detected, OR if manual create prompt was not processed by agent
    if (!isSupplierIntent && !isQueryIntent && !isDeleteIntent && !isErrorOrWarning && (hasBatchItems || (!isProcessedByAgent && (obs?.objects?.length || detectedItemsBatch.length)))) {
      setShowForm(true);
    } else {
      setShowForm(false);
    }

    // Realtime sidebar catalog refresh
    try {
      const prods = await getProducts();
      setCatalogProducts(prods);
    } catch (e) {}
  };

  // --- Voice Handlers ---
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await handleProcessVoice(audioBlob);
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setAgentResponse(null);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied", err);
      alert("Microphone access denied. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleProcessVoice = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setImageFile(null);
    setImagePreview(null);
    try {
      const res = await processAgentApi({
        uploadType: "voice",
        file: audioBlob,
        targetAgent: selectedAgent,
        history: chatThread.map(h => ({ role: h.role, content: h.text }))
      });
      setAgentResponse(res);
      setChatThread(prev => [...prev, { id: `agent-${Date.now()}`, role: 'assistant', text: res.reply || "", agentName: res.selectedAgent }]);
      extractAndSetFormData(res.parsedObservation, res.reply || "", typeof res.reply === "string" ? res.reply : "", res.selectedAgent);
    } catch (err: any) {
      setAgentResponse({
        success: false,
        selectedAgent: selectedAgent === "auto" ? "orchestrated" : selectedAgent,
        reply: "Failed to process voice note: " + (err?.message || "Server error"),
        error: err?.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Text Handler with Multi-turn Context Support ---
  const handleProcessText = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToSend = customPrompt || textPrompt;
    if (!promptToSend.trim() || isProcessing) return;

    // Sync main command executor text prompt with what is being executed
    setTextPrompt(promptToSend.trim());

    const userMsg = { id: `user-${Date.now()}`, role: 'user' as const, text: promptToSend.trim() };
    const currentHistory = [...chatThread, userMsg];
    setChatThread(currentHistory);

    setIsProcessing(true);
    try {
      const res = await processAgentApi({
        prompt: promptToSend.trim(),
        targetAgent: selectedAgent,
        history: chatThread.map(h => ({ role: h.role, content: h.text }))
      });
      setAgentResponse(res);
      setChatThread(prev => [...prev, { id: `agent-${Date.now()}`, role: 'assistant', text: res.reply || "", agentName: res.selectedAgent }]);
      extractAndSetFormData(res.parsedObservation, res.reply || promptToSend, promptToSend, res.selectedAgent);

      dispatchInventoryUpdated();
      try {
        const refreshedCatalog = await getProducts();
        setCatalogProducts(refreshedCatalog);
      } catch (e) {}

      const lower = promptToSend.toLowerCase();
      if (lower.includes("give me") || lower.includes("product") || lower.includes("inventory") || lower.includes("show") || lower.includes("stock") || lower.includes("list")) {
        try {
          const prods = await getProducts();
          setQueriedProducts(prods.slice(0, 10));
        } catch (e) {
          setQueriedProducts([]);
        }
      } else {
        setQueriedProducts([]);
      }
    } catch (err: any) {
      const errMsg = "Error executing command: " + (err?.message || "Server error");
      setAgentResponse({
        success: false,
        selectedAgent: selectedAgent === "auto" ? "orchestrated" : selectedAgent,
        reply: errMsg,
        error: err?.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Follow-Up Reply Handler ---
  const handleSendFollowUp = async (e?: React.FormEvent, customAnswer?: string) => {
    if (e) e.preventDefault();
    const answer = customAnswer || followUpText;
    if (!answer.trim() || isProcessing) return;

    setFollowUpText("");
    await handleProcessText(undefined, answer.trim());
  };

  // --- CSV Handler ---
  const handleProcessCsv = async (fileToUpload?: File) => {
    const file = fileToUpload || csvFile;
    if (!file) return;

    setIsProcessing(true);
    try {
      const res = await processAgentApi({
        uploadType: "csv",
        file,
        targetAgent: selectedAgent
      });
      setAgentResponse(res);
    } catch (err: any) {
      setAgentResponse({
        success: false,
        selectedAgent: selectedAgent === "auto" ? "orchestrated" : selectedAgent,
        reply: "Failed to parse CSV file: " + (err?.message || "Server error"),
        error: err?.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Image / Camera Handler ---
  const handleProcessImage = async (fileToUpload?: File) => {
    const file = fileToUpload || imageFile;
    if (!file) return;

    setIsProcessing(true);
    try {
      const res = await processAgentApi({
        uploadType: "image",
        file,
        targetAgent: selectedAgent
      });
      setAgentResponse(res);
      extractAndSetFormData(res.parsedObservation, res.reply || "", undefined, res.selectedAgent);
    } catch (err: any) {
      setAgentResponse({
        success: false,
        selectedAgent: selectedAgent === "auto" ? "orchestrated" : selectedAgent,
        reply: "Failed to analyze image: " + (err?.message || "Server error"),
        error: err?.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Submit Form to Create or Update Product & Stock in DB ---
  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter a valid Product Name");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert("Please enter a valid Price (₹)");
      return;
    }

    setIsSubmittingForm(true);
    try {
      if (editingItem) {
        await updateProductApi(editingItem.id, {
          name: formData.name.trim(),
          category: formData.category || "Grocery",
          subcategory: formData.subcategory.trim() || undefined,
          price: parseFloat(formData.price),
          stockQty: parseFloat(formData.stockQty || "0"),
          unit: formData.unit || "kg",
          sku: formData.sku.trim() || undefined,
          description: formData.description.trim() || undefined,
          imageUrl: (formData.imageUrl && formData.imageUrl.trim()) ? formData.imageUrl.trim() : getDynamicProductImage(formData.name.trim(), formData.category)
        });

        dispatchInventoryUpdated();
        try {
          const refreshedCatalog = await getProducts();
          setCatalogProducts(refreshedCatalog);
        } catch (e) {}

        setAgentResponse({
          success: true,
          selectedAgent: "inventory",
          reply: `✅ Updated product "${formData.name.trim()}" (SKU: ${formData.sku || 'N/A'}) in store catalog with ${formData.stockQty || 0} ${formData.unit} stock at ₹${formData.price}.`
        });
      } else {
        const created = await createProductApi({
          name: formData.name.trim(),
          category: formData.category || "Grocery",
          subcategory: formData.subcategory.trim() || undefined,
          price: parseFloat(formData.price),
          stockQty: parseFloat(formData.stockQty || "0"),
          unit: formData.unit || "kg",
          sku: formData.sku.trim() || undefined,
          description: formData.description.trim() || undefined,
          imageUrl: (activeTab === "camera" && imagePreview) ? imagePreview : (formData.imageUrl && formData.imageUrl.trim()) ? formData.imageUrl.trim() : getDynamicProductImage(formData.name.trim(), formData.category),
          source: activeTab === "voice" ? "voice" : activeTab === "camera" ? "image" : activeTab === "csv" ? "excel" : "manual"
        });

        dispatchInventoryUpdated();
        try {
          const refreshedCatalog = await getProducts();
          setCatalogProducts(refreshedCatalog);
        } catch (e) {}

        setAgentResponse({
          success: true,
          selectedAgent: "inventory",
          reply: `✅ Successfully created and added product "${created.name}" (SKU: ${created.sku || 'N/A'}) to store inventory with ${created.stockQty || 0} ${created.unit || 'unit'} stock at ₹${created.price}!`
        });
      }

      setShowForm(false);
      resetForm();
    } catch (err: any) {
      alert(err.message || "Failed to save product");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // --- Submit Multi-Product Batch Restock to Inventory DB ---
  const handleSaveBatchProducts = async () => {
    const selected = batchProducts.filter((p) => p.selected);
    if (selected.length === 0) {
      alert("Please select at least one detected product to restock.");
      return;
    }

    setIsSubmittingBatch(true);
    try {
      const payload = selected.map((p) => ({
        name: p.name.trim(),
        category: p.category || "Grocery",
        price: parseFloat(p.price) || 20,
        stockQty: parseFloat(p.stockQty) || 5,
        unit: p.unit || "piece",
        description: p.description || undefined,
        imageUrl: getDynamicProductImage(p.name, p.category),
        source: activeTab === "camera" ? "image" : activeTab === "voice" ? "voice" : "manual"
      }));

      await bulkCreateProductsApi(payload);

      dispatchInventoryUpdated();
      alert(`✅ Successfully restocked & saved all ${selected.length} products to store inventory!`);
      setShowForm(false);
      setBatchProducts([]);
      resetForm();
    } catch (err: any) {
      alert(err.message || "Failed to batch restock products");
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  const currentAgentConfig = AGENT_CONFIGS[selectedAgent];
  const CurrentAgentIcon = currentAgentConfig.icon;

  const tabs = [
    { id: "voice", label: "Voice Agent", icon: Mic, color: "text-[#496246]", bg: "bg-[#E8F0E7]" },
    { id: "text", label: "Text / Command", icon: MessageSquare, color: "text-amber-600", bg: "bg-amber-50" },
    { id: "csv", label: "CSV Import", icon: FileSpreadsheet, color: "text-green-600", bg: "bg-green-50" },
    { id: "camera", label: "Image Snap", icon: Camera, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-900/50 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-6xl bg-white text-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] border border-gray-100"
        >
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-[#496246]/10 text-[#496246] text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={12} /> Merchant Agent Assistant
                </span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Smart Assistant & Inventory Agent</h2>
            </div>

            {/* Agent Switcher Dropdown */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAgentCapabilities(!showAgentCapabilities)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${currentAgentConfig.bgColor} ${currentAgentConfig.color} ${currentAgentConfig.borderColor}`}
                >
                  <CurrentAgentIcon size={16} />
                  <span>{currentAgentConfig.name}</span>
                  <ChevronDown size={14} className={`transition-transform ${showAgentCapabilities ? "rotate-180" : ""}`} />
                </button>

                {/* Capabilities Dropdown Popover */}
                {showAgentCapabilities && (
                  <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-4 space-y-3">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Select Agent Profile:</p>
                    <div className="space-y-1.5">
                      {(Object.keys(AGENT_CONFIGS) as AgentTarget[]).map((key) => {
                        const cfg = AGENT_CONFIGS[key];
                        const Icon = cfg.icon;
                        const isSel = selectedAgent === key;
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              setSelectedAgent(key);
                              setShowAgentCapabilities(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl flex items-start gap-2.5 transition-colors ${
                              isSel ? `${cfg.bgColor} ${cfg.color} font-bold border ${cfg.borderColor}` : "hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            <Icon size={18} className="mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs font-bold leading-tight">{cfg.name}</p>
                              <p className="text-[10px] text-gray-500 font-normal leading-snug mt-0.5 line-clamp-2">{cfg.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 rounded-full transition-colors border border-gray-200 shadow-xs"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Detailed Capabilities Banner for Selected Agent */}
          <div className={`px-6 py-3 border-b flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${currentAgentConfig.bgColor} border-gray-100`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white shadow-xs ${currentAgentConfig.color}`}>
                <CurrentAgentIcon size={20} />
              </div>
              <div>
                <span className={`text-xs font-bold ${currentAgentConfig.color}`}>{currentAgentConfig.name}</span>
                <p className="text-xs text-gray-600 font-medium">{currentAgentConfig.description}</p>
              </div>
            </div>

            {/* Sample Action Chips */}
            <div className="flex flex-wrap gap-1.5 max-w-md">
              {currentAgentConfig.samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTextPrompt(prompt);
                    setActiveTab("text");
                    handleProcessText(undefined, prompt);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-800 rounded-lg text-[11px] font-semibold border border-gray-200 shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <span>⚡ "{prompt.slice(0, 24)}..."</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col md:flex-row gap-5">
            {/* Column 1: Far Left Docked Store Catalog Component */}
            <div className="w-full md:w-64 bg-gray-50/90 border border-gray-200/90 rounded-2xl p-3.5 flex flex-col shrink-0 space-y-3 shadow-2xs max-h-[calc(88vh-180px)] overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200/80">
                <div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Boxes size={14} className="text-[#496246]" /> Store Catalog
                  </h4>
                  <p className="text-[10px] text-gray-500 font-semibold">Available items & SKUs</p>
                </div>
                <span className="px-2 py-0.5 bg-[#496246]/10 text-[#496246] text-[10px] font-bold rounded-full">
                  {catalogProducts.length}
                </span>
              </div>

              {/* Scrollable Section of Small Product Cards */}
              <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                {catalogProducts.length === 0 ? (
                  <p className="text-xs text-gray-400 font-semibold text-center py-6">No products in inventory</p>
                ) : (
                  catalogProducts.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        setEditingItem(prod);
                        setShowForm(true);
                        setFormData({
                          name: prod.title,
                          category: prod.category || "Grocery",
                          subcategory: prod.subcategory || "",
                          price: prod.numericPrice ? String(prod.numericPrice) : prod.price.replace(/[^0-9.]/g, ""),
                          stockQty: String(prod.stockQty ?? 0),
                          unit: prod.unit || "kg",
                          sku: prod.sku || "",
                          description: prod.description || "",
                          imageUrl: prod.image || ""
                        });
                      }}
                      className="p-2.5 bg-white hover:bg-[#E8F0E7]/60 rounded-xl border border-gray-200/80 hover:border-[#496246]/40 cursor-pointer transition-all flex items-center gap-2.5 shadow-2xs group"
                      title="Click to view or edit product in form"
                    >
                      <img
                        src={prod.image || getDynamicProductImage(prod.title, prod.category)}
                        alt={prod.title}
                        className="w-10 h-10 object-cover rounded-lg shrink-0 border border-gray-100 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-bold text-gray-900 truncate leading-snug">{prod.title}</h5>
                        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                          {prod.sku && (
                            <span className="px-1.5 py-0.2 bg-gray-200 text-gray-800 text-[9px] font-mono font-bold rounded border border-gray-300">
                              {prod.sku}
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-gray-500">
                            {prod.price} • {prod.stockQty ?? 0} {prod.unit || "kg"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 2: Mode Navigation Tabs */}
            <div className="w-full md:w-52 flex flex-col gap-2 shrink-0 overflow-y-auto max-h-[calc(88vh-180px)]">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id && !showForm;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setAgentResponse(null);
                      setShowForm(false);
                    }}
                    className={`relative p-3.5 rounded-2xl flex items-center gap-3 transition-all duration-200 text-left overflow-hidden shrink-0 ${
                      isActive ? "bg-gray-900 text-white shadow-md font-bold" : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200/80 font-semibold"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? "bg-white/20 text-white" : `${tab.bg} ${tab.color}`
                    }`}>
                      <Icon size={18} />
                    </div>
                    <span className="text-xs">{tab.label}</span>
                  </button>
                );
              })}

              {/* Manual Add Form Toggle Button */}
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  if (!showForm) resetForm();
                }}
                className={`p-3.5 rounded-2xl flex items-center gap-3 transition-all text-left font-bold text-xs mt-auto border ${
                  showForm
                    ? "bg-[#496246] text-white border-[#496246]"
                    : "bg-[#E8F0E7] text-[#496246] border-[#496246]/20 hover:bg-[#496246] hover:text-white"
                }`}
              >
                <Plus size={18} />
                <span>{showForm ? "Hide Product Form" : "+ Add New Item Form"}</span>
              </button>
            </div>

            {/* Column 3: Central Interactive Content */}
            <div className="flex-1 bg-gray-50/80 rounded-3xl p-6 relative overflow-y-auto max-h-[calc(92vh-100px)] min-h-[560px] border border-gray-100 flex flex-col gap-4">
              
              {/* If Form Mode is active (Auto-filled by Voice/Camera or opened manually) */}
              {showForm ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between flex-1 relative"
                >
                  <div className="space-y-4 pb-16">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                      <div>
                        <span className="px-2.5 py-0.5 bg-[#496246]/10 text-[#496246] text-[10px] font-bold rounded-full uppercase tracking-wider">
                          Live Product & Inventory Form
                        </span>
                        <h3 className="text-lg font-black text-gray-900 mt-1">Product Details & Stock Quantity</h3>
                      </div>
                      <button
                        onClick={() => setShowForm(false)}
                        className="text-xs font-bold text-gray-400 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Pre-fill guidance banner */}
                    {filledFieldKeys.length > 0 && (
                      <div className="mb-4 p-3 bg-[#E8F0E7] border border-[#496246]/20 rounded-xl flex items-start gap-2 text-xs">
                        <Sparkles size={16} className="text-[#496246] mt-0.5 shrink-0" />
                        <div>
                          <p className="font-bold text-[#496246]">
                            AI Pre-filled {filledFieldKeys.length} field{filledFieldKeys.length !== 1 ? "s" : ""} from your input!
                          </p>
                          {missingFieldKeys.length > 0 && (
                            <p className="text-amber-700 font-semibold mt-0.5">
                              ⚠️ Please enter missing fields ({missingFieldKeys.join(", ")}) below.
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Multi-Product Batch Restock Card */}
                    {batchProducts.length > 0 && (
                      <div className="mb-6 p-4 bg-[#E8F0E7] border border-[#496246]/30 rounded-2xl space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="text-[#496246] shrink-0" size={18} />
                            <div>
                              <h4 className="text-xs font-black text-[#496246] uppercase tracking-wider">
                                {activeTab === "camera"
                                  ? `📷 Photo AI Detected ${batchProducts.length} Products`
                                  : activeTab === "voice"
                                  ? `🎙️ Voice Speech Detected ${batchProducts.length} Products`
                                  : activeTab === "csv"
                                  ? `📊 CSV Import Detected ${batchProducts.length} Products`
                                  : `✨ Extracted ${batchProducts.length} Product Details`}
                              </h4>
                              <p className="text-[11px] text-gray-600 font-medium">
                                Review detected items, edit prices/quantities, and save to store inventory.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleSaveBatchProducts}
                            disabled={isSubmittingBatch}
                            className="bg-[#8C5A3B] hover:bg-[#7A4E33] text-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                          >
                            {isSubmittingBatch ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                            Restock All {batchProducts.filter((p) => p.selected).length} Items
                          </button>
                        </div>

                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {batchProducts.map((item, idx) => (
                            <div key={item.id} className="p-3 bg-white rounded-xl border border-gray-200 flex items-center gap-3 shadow-2xs">
                              <input
                                type="checkbox"
                                checked={item.selected}
                                onChange={(e) => {
                                  const updated = [...batchProducts];
                                  updated[idx].selected = e.target.checked;
                                  setBatchProducts(updated);
                                }}
                                className="w-4 h-4 text-[#496246] rounded focus:ring-[#496246]"
                              />
                              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => {
                                    const updated = [...batchProducts];
                                    updated[idx].name = e.target.value;
                                    setBatchProducts(updated);
                                  }}
                                  className="text-xs font-bold text-gray-900 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#496246]"
                                />
                                <div className="flex items-center gap-1">
                                  <span className="text-[11px] font-bold text-gray-500">Price ₹</span>
                                  <input
                                    type="number"
                                    value={item.price}
                                    onChange={(e) => {
                                      const updated = [...batchProducts];
                                      updated[idx].price = e.target.value;
                                      setBatchProducts(updated);
                                    }}
                                    className="w-20 text-xs font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200 focus:outline-none focus:border-[#496246]"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-[11px] font-bold text-gray-500">Qty:</span>
                                  <input
                                    type="number"
                                    value={item.stockQty}
                                    onChange={(e) => {
                                      const updated = [...batchProducts];
                                      updated[idx].stockQty = e.target.value;
                                      setBatchProducts(updated);
                                    }}
                                    className="w-16 text-xs font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200 focus:outline-none focus:border-[#496246]"
                                  />
                                  <span className="text-[11px] text-gray-500 font-semibold">{item.unit}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <form id="agent-product-form" onSubmit={handleSaveProductForm} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                          Product Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Basmati Rice 5kg"
                          className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none transition-all ${
                            filledFieldKeys.includes("name")
                              ? "bg-emerald-50/50 border-emerald-300 font-bold text-emerald-900"
                              : missingFieldKeys.includes("name")
                              ? "bg-amber-50 border-amber-400 ring-2 ring-amber-200"
                              : "bg-gray-50 border-gray-200 focus:border-[#496246]"
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Category</label>
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#496246]"
                          >
                            {["Grocery", "Dairy", "Vegetables", "Spices", "Bakery", "Beverages", "Stationery", "Other"].map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                            Price (₹) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="e.g. 100"
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none transition-all ${
                              filledFieldKeys.includes("price")
                                ? "bg-emerald-50/50 border-emerald-300 font-bold text-emerald-900"
                                : missingFieldKeys.includes("price")
                                ? "bg-amber-50 border-amber-400 ring-2 ring-amber-200"
                                : "bg-gray-50 border-gray-200 focus:border-[#496246]"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                            SKU Code
                          </label>
                          <input
                            type="text"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            placeholder="e.g. GRC-BASMATI-RICE"
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none transition-all ${
                              filledFieldKeys.includes("sku")
                                ? "bg-emerald-50/50 border-emerald-300 font-bold text-emerald-900"
                                : "bg-gray-50 border-gray-200 focus:border-[#496246]"
                            }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Stock Quantity to Add</label>
                          <input
                            type="number"
                            min="0"
                            value={formData.stockQty}
                            onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
                            placeholder="e.g. 25"
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none transition-all ${
                              filledFieldKeys.includes("stockQty")
                                ? "bg-emerald-50/50 border-emerald-300 font-bold text-emerald-900"
                                : "bg-gray-50 border-gray-200 focus:border-[#496246]"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Unit</label>
                          <select
                            value={formData.unit}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#496246]"
                          >
                            {["kg", "piece", "gram", "litre", "ml", "pack", "box", "bag", "other"].map((u) => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Image URL & Live Preview Field (Requirement 2) */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                          Product Image URL
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            placeholder="e.g. https://images.unsplash.com/... or auto-generated"
                            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#496246]"
                          />
                          <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center relative shadow-2xs">
                            {formData.imageUrl || formData.name ? (
                              <img
                                src={formData.imageUrl || getDynamicProductImage(formData.name || "product", formData.category)}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Camera size={18} className="text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Description / Notes</label>
                        <input
                          type="text"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="e.g. Premium basmati rice bag, imported brand"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#496246]"
                        />
                      </div>
                    </form>
                  </div>

                  {/* Sticky Footer Bar with Prominent Submit Button */}
                  <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md pt-3 pb-2 border-t border-gray-100 flex items-center justify-between gap-3 mt-4 z-30 shadow-lg rounded-b-2xl px-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      form="agent-product-form"
                      disabled={isSubmittingForm}
                      className="px-8 py-3 bg-[#496246] hover:bg-[#3A4E38] text-white text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-95"
                    >
                      {isSubmittingForm ? <Loader2 size={16} className="animate-spin text-white" /> : <CheckCircle2 size={16} />}
                      Submit & Save Product to Inventory
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Tab Content Views */
                <AnimatePresence mode="wait">
                  {/* VOICE TAB */}
                  {activeTab === "voice" && (
                    <motion.div
                      key="voice"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="h-full flex flex-col justify-between"
                    >
                      <div className="flex-1 flex flex-col items-center justify-center text-center my-4">
                        <div className="relative mb-4 flex flex-col items-center gap-3">
                          {isRecording && (
                            <>
                              <motion.div
                                animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-[#496246]/30 rounded-full blur-xl"
                              />
                              <motion.div
                                animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                                className="absolute inset-0 bg-[#496246]/40 rounded-full blur-lg"
                              />
                            </>
                          )}
                          <button
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={isProcessing}
                            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
                              isRecording
                                ? "bg-gradient-to-br from-red-500 to-rose-600 text-white scale-105"
                                : "bg-gradient-to-br from-[#496246] to-[#2D3A2C] text-white hover:scale-105"
                            } disabled:opacity-50`}
                          >
                            {isProcessing ? (
                              <Loader2 size={40} className="animate-spin text-white" />
                            ) : (
                              <Mic size={40} className={isRecording ? "animate-pulse" : ""} />
                            )}
                          </button>

                          {/* Explicit Action Buttons */}
                          {isRecording ? (
                            <button
                              onClick={stopRecording}
                              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all animate-bounce relative z-10"
                            >
                              <Send size={14} />
                              Submit Voice Recording
                            </button>
                          ) : (
                            <button
                              onClick={startRecording}
                              disabled={isProcessing}
                              className="px-6 py-2.5 bg-[#496246] hover:bg-[#3A4E38] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50 relative z-10"
                            >
                              <Mic size={14} />
                              Start Voice Input
                            </button>
                          )}
                        </div>

                        <h3 className="text-xl font-black text-gray-900 mt-4 mb-1">
                          {isProcessing
                            ? "AI Voice Agent Processing..."
                            : isRecording
                            ? `Recording Audio (${recordingTime}s)...`
                            : "Tap Microphone or Start Voice Input"}
                        </h3>
                        <p className="text-xs text-gray-500 max-w-md">
                          {isRecording
                            ? "Speak naturally. Click 'Submit Voice Recording' when finished."
                            : "e.g. 'Add 25 bags of Basmati Rice 5kg at ₹120/kg', 'Update price of Wheat Flour to 65 rupees'"}
                        </p>
                      </div>

                      {renderAgentResponseBox(agentResponse, isProcessing)}
                    </motion.div>
                  )}

                  {/* TEXT TAB */}
                  {activeTab === "text" && (
                    <motion.div
                      key="text"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="w-full flex flex-col gap-4"
                    >
                      <div>
                        <h3 className="text-lg font-black text-gray-900 mb-1">Text Command Assistant</h3>
                        <p className="text-xs text-gray-500 mb-3">
                          Execute natural language requests for Product, Inventory, or Supplier management.
                        </p>

                        <form onSubmit={handleProcessText} className="space-y-2.5">
                          <textarea
                            rows={2}
                            value={textPrompt}
                            onChange={(e) => setTextPrompt(e.target.value)}
                            placeholder="Type prompt..."
                            className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#496246]/20 focus:border-[#496246] text-sm font-medium transition-all resize-none shadow-xs"
                          />
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={!textPrompt.trim() || isProcessing}
                              className="px-6 py-2.5 bg-[#496246] hover:bg-[#3A4E38] text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
                            >
                              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                              Execute Command
                            </button>
                          </div>
                        </form>
                      </div>

                      {renderAgentResponseBox(agentResponse, isProcessing)}
                    </motion.div>
                  )}

                  {/* CSV TAB */}
                  {activeTab === "csv" && (
                    <motion.div
                      key="csv"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="h-full flex flex-col justify-between gap-4"
                    >
                      <div>
                        <h3 className="text-lg font-black text-gray-900 mb-1">Bulk Import via CSV</h3>
                        <div
                          onClick={() => csvInputRef.current?.click()}
                          className="w-full p-6 rounded-2xl border-2 border-dashed border-gray-300 bg-white text-center hover:border-[#496246] hover:bg-[#E8F0E7]/30 transition-all cursor-pointer group shadow-xs mt-3"
                        >
                          <div className="w-14 h-14 bg-[#E8F0E7] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                            <UploadCloud size={28} className="text-[#496246]" />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900 mb-1">
                            {csvFile ? csvFile.name : "Select or Drop CSV Inventory File"}
                          </h4>
                          <div className="flex justify-center gap-2 mt-3">
                            <button
                              type="button"
                              className="bg-gray-900 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors shadow-xs"
                            >
                              {csvFile ? "Change File" : "Choose CSV File"}
                            </button>
                            {csvFile && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProcessCsv();
                                }}
                                disabled={isProcessing}
                                className="bg-[#496246] hover:bg-[#3A4E38] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                Submit CSV File
                              </button>
                            )}
                          </div>
                          <input
                            ref={csvInputRef}
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setCsvFile(file);
                                handleProcessCsv(file);
                              }
                            }}
                          />
                        </div>
                      </div>

                      {renderAgentResponseBox(agentResponse, isProcessing)}
                    </motion.div>
                  )}

                  {/* CAMERA / IMAGE TAB */}
                  {activeTab === "camera" && (
                    <motion.div
                      key="camera"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="h-full flex flex-col justify-between gap-4"
                    >
                      <div>
                        <h3 className="text-lg font-black text-gray-900 mb-1">Image & Shelf Recognition</h3>
                        <p className="text-xs text-gray-500 mb-4">
                          Upload a photo of a single product or shelf rack. Vision AI identifies food items and auto-fills product forms.
                        </p>

                        <div
                          onClick={() => imageInputRef.current?.click()}
                          className="w-full p-6 rounded-2xl border-2 border-dashed border-gray-300 bg-white text-center hover:border-purple-500 hover:bg-purple-50/30 transition-all cursor-pointer group shadow-xs"
                        >
                          {imagePreview ? (
                            <div className="relative max-h-36 overflow-hidden rounded-xl mb-3">
                              <img src={imagePreview} alt="Preview" className="w-full object-cover rounded-xl max-h-36" />
                            </div>
                          ) : (
                            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                              <Camera size={28} className="text-purple-600" />
                            </div>
                          )}
                          <h4 className="text-sm font-bold text-gray-900 mb-1">
                            {imageFile ? imageFile.name : "Select or Snap Product Photo"}
                          </h4>
                          <div className="flex justify-center gap-2 mt-3">
                            <button
                              type="button"
                              className="bg-gray-900 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors shadow-xs"
                            >
                              {imageFile ? "Change Photo" : "Upload Image"}
                            </button>
                            {imageFile && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProcessImage();
                                }}
                                disabled={isProcessing}
                                className="bg-[#496246] hover:bg-[#3A4E38] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                Submit Photo to Agent
                              </button>
                            )}
                          </div>
                          <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setImageFile(file);
                                setImagePreview(URL.createObjectURL(file));
                                handleProcessImage(file);
                              }
                            }}
                          />
                        </div>
                      </div>

                      {renderAgentResponseBox(agentResponse, isProcessing)}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  function renderAgentResponseBox(resp: AgentProcessResponse | null, loading: boolean) {
    if (loading) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-[#1E291E] via-[#2A3B28] to-[#141F14] text-white rounded-3xl p-5 border border-emerald-500/20 flex items-center justify-between shadow-xl backdrop-blur-md"
        >
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center">
              <div className="w-10 h-10 rounded-2xl bg-[#496246]/40 border border-[#496246]/60 flex items-center justify-center shadow-inner">
                <Loader2 size={22} className="animate-spin text-emerald-400" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">Processing Request</h4>
              <p className="text-xs text-gray-300 font-medium">Executing agent tools & orchestrating response...</p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 animate-pulse uppercase tracking-wider">
            AI Active
          </span>
        </motion.div>
      );
    }

    if (!resp) return null;

    const lowerReply = (resp.reply || "").toLowerCase();
    const isErrorOrWarning =
      resp.success === false ||
      !!resp.error ||
      lowerReply.includes("cannot decrease") ||
      lowerReply.includes("does not exist") ||
      lowerReply.includes("out of stock") ||
      lowerReply.includes("insufficient") ||
      lowerReply.includes("failed") ||
      lowerReply.includes("error");

    // Helper to strip markdown stars and symbols for neat text output
    const cleanText = (str: string) => {
      if (!str) return "";
      return str
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/`/g, "")
        .trim();
    };

    if (isErrorOrWarning) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5 bg-gradient-to-br from-rose-50 to-red-50/80 border border-rose-200 text-rose-900 shadow-xl space-y-3"
        >
          <div className="flex items-center justify-between border-b border-rose-200/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-rose-600 animate-bounce" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-rose-900 block">Inventory Alert</span>
                <span className="text-[10px] text-rose-600 font-semibold">Action requires verification</span>
              </div>
            </div>
            <span className="px-3 py-1 bg-rose-600 text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow-sm">
              Action Blocked
            </span>
          </div>
          <p className="text-xs font-bold text-rose-950 leading-relaxed whitespace-pre-line bg-white/70 p-3.5 rounded-2xl border border-rose-200/80 shadow-2xs">
            ⚠️ {cleanText(resp.reply || resp.error || "Operation could not be completed.")}
          </p>
        </motion.div>
      );
    }

    // Theme variations per Agent - Signature Olive Green Palette (#496246)
    const agentTheme = {
      supplier: {
        bgGradient: "from-[#496246] via-[#3A4E38] to-[#243322]",
        badgeBg: "bg-[#496246]/20 text-emerald-300 border-[#496246]/30",
        pillBg: "bg-gradient-to-r from-[#496246] to-[#2D3A2C] text-white",
        glowColor: "bg-[#8CAE88]"
      },
      product: {
        bgGradient: "from-[#496246] via-[#3A4E38] to-[#243322]",
        badgeBg: "bg-[#496246]/20 text-emerald-300 border-[#496246]/30",
        pillBg: "bg-gradient-to-r from-[#496246] to-[#2D3A2C] text-white",
        glowColor: "bg-[#8CAE88]"
      },
      inventory: {
        bgGradient: "from-[#496246] via-[#3A4E38] to-[#243322]",
        badgeBg: "bg-[#496246]/20 text-emerald-300 border-[#496246]/30",
        pillBg: "bg-gradient-to-r from-[#496246] to-[#2D3A2C] text-white",
        glowColor: "bg-[#8CAE88]"
      },
      orchestrated: {
        bgGradient: "from-[#496246] via-[#3A4E38] to-[#243322]",
        badgeBg: "bg-[#496246]/20 text-emerald-300 border-[#496246]/30",
        pillBg: "bg-gradient-to-r from-[#496246] to-[#2D3A2C] text-white",
        glowColor: "bg-[#8CAE88]"
      }
    }[resp.selectedAgent] || {
      bgGradient: "from-[#496246] via-[#3A4E38] to-[#243322]",
      badgeBg: "bg-[#496246]/20 text-emerald-300 border-[#496246]/30",
      pillBg: "bg-gradient-to-r from-[#496246] to-[#2D3A2C] text-white",
      glowColor: "bg-[#8CAE88]"
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-gray-200/80 shadow-xl bg-white overflow-hidden space-y-0"
      >
        {/* Sleek Agent Header Banner */}
        <div className={`px-5 py-3 bg-gradient-to-r ${agentTheme.bgGradient} text-white flex items-center justify-between shadow-md`}>
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <div className="w-7 h-7 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Bot size={16} className="text-white" />
              </div>
              <span className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ${agentTheme.glowColor} animate-ping`} />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-white/90 block">
                {resp.selectedAgent} Agent Response
              </span>
            </div>
          </div>

          {resp.selectedAgent !== "supplier" && (
            <button
              onClick={() => setShowForm(true)}
              className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 text-white backdrop-blur-md rounded-xl text-xs font-extrabold transition-all border border-white/20 shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <Edit size={13} />
              + Edit Product Form
            </button>
          )}
        </div>

        <div className="p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
          {/* Current Agent Output Card */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Sparkles size={15} className="text-[#496246]" />
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">Agent Output & Action Details</span>
            </div>
            
            <div className="max-h-56 overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-gray-200">
              <p className="text-xs text-gray-900 font-semibold leading-relaxed whitespace-pre-line">
                {cleanText(resp.reply || "Execution complete.")}
              </p>
            </div>

            {/* Interactive Follow-up Input Bar */}
            <form onSubmit={handleSendFollowUp} className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <input
                type="text"
                value={followUpText}
                onChange={(e) => setFollowUpText(e.target.value)}
                placeholder="Answer follow-up or reply to agent..."
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 focus:bg-white focus:border-[#496246] focus:ring-2 focus:ring-[#496246]/10 rounded-xl text-xs font-bold text-gray-900 outline-none transition-all shadow-2xs"
              />
              <button
                type="submit"
                disabled={isProcessing || !followUpText.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-[#496246] to-[#2D3A2C] hover:from-[#3A4E38] hover:to-[#222E21] text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 active:scale-95"
              >
                {isProcessing ? <Loader2 size={14} className="animate-spin text-white" /> : <Send size={14} />}
                <span>Reply</span>
              </button>
            </form>

            {/* Quick Reply Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">Quick Suggestions:</span>
              {["It's stored in kg", "It's stored in packs", "Basmati Rice 5kg", "Create as new product"].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleSendFollowUp(undefined, chip)}
                  className="px-3 py-1.5 bg-emerald-50/80 hover:bg-emerald-100 text-[#2D3A2C] rounded-xl text-[11px] font-bold border border-emerald-200/80 shadow-2xs transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-1"
                >
                  ✨ {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Live Product Cards List if User asked to see/list inventory products */}
          {queriedProducts.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-200/80">
              <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Package size={14} className="text-[#496246]" /> Store Products Found ({queriedProducts.length}):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {queriedProducts.map((p) => (
                  <div key={p.id} className="p-2.5 bg-white rounded-xl border border-gray-200 flex items-center gap-3 shadow-2xs hover:border-[#496246] transition-colors">
                    <img src={p.image} alt={p.title} className="w-10 h-10 object-cover rounded-lg shrink-0 border border-gray-100" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-900 truncate">{p.title}</p>
                      <p className="text-[11px] text-gray-500">{p.price} • Stock: <span className="font-bold text-[#496246]">{p.stockQty} {p.unit}</span></p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      p.status === 'Healthy Stock' ? 'bg-emerald-100 text-emerald-800' : p.status === 'Low Stock' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  }
}
