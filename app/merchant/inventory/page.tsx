'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  getInventoryData,
  createProductApi,
  updateProductApi,
  updateStockApi,
  deleteProductApi,
  bulkCreateProductsApi,
  InventoryData,
  InventoryItem
} from '@/services/merchantApi';

export default function Inventory() {
  const [data, setData] = useState<InventoryData>({
    summary: { total: 0, healthy: 0, lowStock: 0, outOfStock: 0 },
    items: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Modals
  const [activeModal, setActiveModal] = useState<'none' | 'product' | 'csv_import'>('none');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
  // Product Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Grocery',
    subcategory: '',
    price: '',
    unit: 'piece',
    stockQty: '',
    sku: '',
    description: '',
    imageUrl: ''
  });

  // Modal Input Modes: 'camera' (Take Photo), 'voice' (Voice Capture), and 'manual' (Manual Enter)
  const [imageTab, setImageTab] = useState<'camera' | 'voice' | 'manual'>('camera');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Voice Capture State
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  // CSV Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvParsed, setCsvParsed] = useState<any[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load Inventory Data
  const loadInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getInventoryData();
      setData(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // Cleanup camera and voice streams when modal closes or tab changes
  useEffect(() => {
    if (imageTab !== 'camera' || activeModal !== 'product') {
      stopCamera();
    }
    if (imageTab !== 'voice' || activeModal !== 'product') {
      stopVoiceCapture();
    }
  }, [imageTab, activeModal]);

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access failed", err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
        stopCamera();
      }
    }
  };

  const handleFileUploadFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({ ...prev, imageUrl: event.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Voice Capture Handler using Web Speech API
  const startVoiceCapture = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type product details manually.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListeningVoice(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setVoiceTranscript(currentTranscript);
        parseAndAutofillFromVoice(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event);
        setIsListeningVoice(false);
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error("Failed to start voice capture", err);
      setIsListeningVoice(false);
    }
  };

  const stopVoiceCapture = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListeningVoice(false);
  };

  // Smart Voice Parsing logic
  const parseAndAutofillFromVoice = (text: string) => {
    if (!text) return;
    const lower = text.toLowerCase();

    // Extract Price (e.g., "150 rupees" or "rs 150" or "price 150" or "$150")
    const priceMatch = lower.match(/(?:rs\.?|rupees?|\$|price)?\s*(\d+(?:\.\d{1,2})?)\s*(?:rupees?|rs\.?)?/);

    // Extract Stock Quantity (e.g., "20 units" or "10 items" or "stock 50")
    const stockMatch = lower.match(/(?:stock|quantity|qty|items?|units?)?\s*(\d+)\s*(?:units?|items?|pcs|pieces?)/) ||
                       lower.match(/(\d+)\s*(?:in stock|qty)/);

    // Extract Category keywords
    let foundCategory = '';
    if (lower.includes('dairy') || lower.includes('milk') || lower.includes('cheese') || lower.includes('butter')) foundCategory = 'Dairy';
    else if (lower.includes('vegetable') || lower.includes('fruit') || lower.includes('tomato') || lower.includes('onion')) foundCategory = 'Vegetables';
    else if (lower.includes('stationery') || lower.includes('pen') || lower.includes('notebook')) foundCategory = 'Stationery';
    else if (lower.includes('electronics') || lower.includes('cable') || lower.includes('bulb')) foundCategory = 'Electronics';
    else if (lower.includes('pharmacy') || lower.includes('medicine')) foundCategory = 'Pharmacy';
    else if (lower.includes('fashion') || lower.includes('shirt') || lower.includes('cloth')) foundCategory = 'Fashion';

    // Clean product name
    let cleanName = text
      .replace(/(?:rs\.?|rupees?|\$|price)?\s*\d+(?:\.\d{1,2})?\s*(?:rupees?|rs\.?)?/gi, '')
      .replace(/(?:stock|quantity|qty|items?|units?)?\s*\d+\s*(?:units?|items?|pcs|pieces?)/gi, '')
      .replace(/\b(?:category|dairy|vegetables|stationery|electronics|pharmacy|fashion|grocery)\b/gi, '')
      .trim();

    setFormData(prev => ({
      ...prev,
      name: cleanName || prev.name || text.slice(0, 40),
      price: priceMatch ? priceMatch[1] : prev.price,
      stockQty: stockMatch ? stockMatch[1] : prev.stockQty,
      category: foundCategory || prev.category
    }));
  };

  // Open Add Product Modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Grocery',
      subcategory: '',
      price: '',
      unit: 'piece',
      stockQty: '10',
      sku: '',
      description: '',
      imageUrl: ''
    });
    setImageTab('camera');
    setVoiceTranscript('');
    setActiveModal('product');
    setTimeout(() => startCamera(), 200);
  };

  // Open Edit Product Modal
  const handleOpenEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.title,
      category: item.category || 'Grocery',
      subcategory: item.subcategory || '',
      price: item.numericPrice ? String(item.numericPrice) : item.price.replace(/[^0-9.]/g, ''),
      unit: item.unit || 'piece',
      stockQty: String(item.units),
      sku: item.sku || '',
      description: item.description || '',
      imageUrl: item.image || ''
    });
    setImageTab('manual');
    setVoiceTranscript('');
    setActiveModal('product');
  };

  // Submit Add/Edit Product
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      alert("Please provide a valid product name and price.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category || 'Grocery',
        subcategory: formData.subcategory.trim() || undefined,
        price: parseFloat(formData.price),
        unit: formData.unit || 'piece',
        stockQty: parseFloat(formData.stockQty) || 0,
        sku: formData.sku.trim() || undefined,
        description: formData.description.trim() || undefined,
        imageUrl: formData.imageUrl.trim() || undefined
      };

      if (editingItem) {
        await updateProductApi(editingItem.id, payload);
      } else {
        await createProductApi(payload);
      }

      stopCamera();
      stopVoiceCapture();
      setActiveModal('none');
      await loadInventory();
    } catch (err: any) {
      alert(err.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from inventory?`)) {
      try {
        await deleteProductApi(productId);
        await loadInventory();
      } catch (err: any) {
        alert(err.message || "Failed to delete product");
      }
    }
  };

  // Quick Stock Adjustment
  const handleQuickStockUpdate = async (item: InventoryItem, delta: number) => {
    const newQty = Math.max(0, item.units + delta);
    setData(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === item.id ? { ...i, units: newQty } : i)
    }));

    try {
      await updateStockApi(item.id, newQty);
      await loadInventory();
    } catch (err: any) {
      console.error("Failed to update stock", err);
      await loadInventory();
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!data.items.length) {
      alert("No inventory items to export.");
      return;
    }
    const headers = ["ID", "Name", "Category", "Subcategory", "Price", "Unit", "Stock Qty", "SKU", "Status", "Description", "Image URL"];
    const rows = data.items.map(item => [
      `"${item.id}"`,
      `"${item.title.replace(/"/g, '""')}"`,
      `"${(item.category || '').replace(/"/g, '""')}"`,
      `"${(item.subcategory || '').replace(/"/g, '""')}"`,
      item.numericPrice || item.price.replace(/[^0-9.]/g, ''),
      `"${item.unit}"`,
      item.units,
      `"${item.sku}"`,
      `"${item.status}"`,
      `"${(item.description || '').replace(/"/g, '""')}"`,
      `"${item.image}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const templateContent = "Name,Category,Subcategory,Price,Unit,StockQty,SKU,Description,ImageUrl\n" +
      "Organic Basmati Rice,Grocery,Rice & Grains,120,kg,50,GRC-RICE-01,Premium long grain basmati rice,https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500\n" +
      "Fresh Farm Milk,Dairy,Milk,60,litre,25,DRY-MILK-02,Pure farm fresh cow milk,https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500\n";
    
    const blob = new Blob([templateContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sample_inventory_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV File
  const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCsvError(null);
    setCsvParsed([]);
    if (!file) return;
    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
          setCsvError("CSV file must contain a header row and at least one data row.");
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"(.*)"$/, '$1').toLowerCase());
        const requiredFields = ['name', 'price'];
        const missing = requiredFields.filter(rf => !headers.includes(rf));
        if (missing.length > 0) {
          setCsvError(`Missing required CSV header columns: ${missing.join(', ')}. Please use our sample template.`);
          return;
        }

        const parsedItems: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const rowValues = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
          if (!rowValues || rowValues.length === 0) continue;

          const rowObj: any = {};
          headers.forEach((h, index) => {
            let val = rowValues[index] ? rowValues[index].trim() : '';
            if (val.startsWith('"') && val.endsWith('"')) {
              val = val.slice(1, -1).replace(/""/g, '"');
            }
            rowObj[h] = val;
          });

          if (rowObj.name && rowObj.price) {
            parsedItems.push({
              name: rowObj.name,
              category: rowObj.category || 'Grocery',
              subcategory: rowObj.subcategory || undefined,
              price: parseFloat(rowObj.price) || 0,
              unit: rowObj.unit || 'piece',
              stockQty: parseFloat(rowObj.stockqty || rowObj['stock qty'] || rowObj.stock) || 0,
              sku: rowObj.sku || undefined,
              description: rowObj.description || undefined,
              imageUrl: rowObj.imageurl || rowObj['image url'] || rowObj.image || undefined
            });
          }
        }

        if (parsedItems.length === 0) {
          setCsvError("Could not parse valid products from CSV. Ensure name and price columns are populated.");
        } else {
          setCsvParsed(parsedItems);
        }
      } catch (err: any) {
        setCsvError("Failed to parse CSV file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Submit CSV Bulk Import
  const handleImportCSVSubmit = async () => {
    if (!csvParsed.length) return;
    setIsSubmitting(true);
    try {
      await bulkCreateProductsApi(csvParsed);
      setActiveModal('none');
      setCsvFile(null);
      setCsvParsed([]);
      await loadInventory();
    } catch (err: any) {
      setCsvError(err.message || "Bulk import failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const uniqueCategories = Array.from(new Set(data.items.map(i => i.category || 'Grocery')));

  // Filter Items
  const filteredItems = data.items.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Healthy Stock' && item.status === 'Healthy') ||
      (statusFilter === 'Low Stock' && item.status === 'Low Stock') ||
      (statusFilter === 'Out of Stock' && item.status === 'Out of Stock');

    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <>
      <div className="flex flex-col w-full gap-section-gap pb-12 relative z-10">

        {/* Dynamic Glow Background */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none transform -translate-y-1/2 translate-x-1/4"></div>

        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
          <div className="flex flex-col gap-1 max-w-2xl">
            <h1 className="font-display-lg text-display-lg text-on-surface">Inventory Management</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Manage product stock, capture photos, record voice details, and import/export CSV inventory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="h-12 px-5 rounded-full border border-outline/30 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md text-label-md transition-all shadow-sm flex items-center gap-2"
              title="Export Inventory to CSV"
            >
              <span className="material-symbols-outlined text-[20px] text-primary">download</span>
              Export CSV
            </button>

            <button
              onClick={() => {
                setCsvFile(null);
                setCsvParsed([]);
                setCsvError(null);
                setActiveModal('csv_import');
              }}
              className="h-12 px-5 rounded-full border border-primary/30 bg-primary-container/20 hover:bg-primary-container/40 text-primary font-label-md text-label-md transition-all shadow-sm flex items-center gap-2"
              title="Import Products from CSV"
            >
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
              Import CSV
            </button>

            <button
              onClick={handleOpenAddModal}
              className="h-12 px-6 rounded-full bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add Product
            </button>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter w-full">
          <div
            onClick={() => setStatusFilter('All')}
            className={`bg-surface-container-lowest rounded-[24px] p-card-padding shadow-[0_10px_30px_rgba(31,41,35,0.04)] flex flex-col gap-4 group transition-all duration-300 cursor-pointer border-2 ${statusFilter === 'All' ? 'border-primary/50' : 'border-transparent hover:-translate-y-1'}`}
          >
            <div className="flex justify-between items-start">
              <span className="font-label-md text-label-md text-outline uppercase tracking-widest">Total Products</span>
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">inventory_2</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-stats-number text-stats-number text-on-surface">{data.summary.total}</span>
              <span className="font-body-md text-body-md text-on-surface-variant mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">trending_up</span> Across all categories
              </span>
            </div>
          </div>

          <div
            onClick={() => setStatusFilter('Healthy Stock')}
            className={`bg-surface-container-lowest rounded-[24px] p-card-padding shadow-[0_10px_30px_rgba(31,41,35,0.04)] flex flex-col gap-4 group transition-all duration-300 cursor-pointer border-2 ${statusFilter === 'Healthy Stock' ? 'border-primary' : 'border-transparent hover:-translate-y-1'}`}
          >
            <div className="flex justify-between items-start">
              <span className="font-label-md text-label-md text-outline uppercase tracking-widest">Healthy Stock</span>
              <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">check_circle</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-stats-number text-stats-number text-on-surface">{data.summary.healthy}</span>
              <span className="font-body-md text-body-md text-primary mt-1">&gt; 10 units in stock</span>
            </div>
          </div>

          <div
            onClick={() => setStatusFilter('Low Stock')}
            className={`bg-surface-container-lowest rounded-[24px] p-card-padding shadow-[0_10px_30px_rgba(31,41,35,0.04)] flex flex-col gap-4 group transition-all duration-300 cursor-pointer border-2 ${statusFilter === 'Low Stock' ? 'border-secondary' : 'border-transparent hover:-translate-y-1'}`}
          >
            <div className="flex justify-between items-start">
              <span className="font-label-md text-label-md text-outline uppercase tracking-widest">Low Stock</span>
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container">warning</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-stats-number text-stats-number text-secondary">{data.summary.lowStock}</span>
              <span className="font-body-md text-body-md text-secondary mt-1">1 - 10 units left</span>
            </div>
          </div>

          <div
            onClick={() => setStatusFilter('Out of Stock')}
            className={`bg-surface-container-lowest rounded-[24px] p-card-padding shadow-[0_10px_30px_rgba(31,41,35,0.04)] flex flex-col gap-4 group transition-all duration-300 cursor-pointer border-2 ${statusFilter === 'Out of Stock' ? 'border-error' : 'border-transparent hover:-translate-y-1'}`}
          >
            <div className="flex justify-between items-start">
              <span className="font-label-md text-label-md text-outline uppercase tracking-widest">Out of Stock</span>
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-error-container">error</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-stats-number text-stats-number text-error">{data.summary.outOfStock}</span>
              <span className="font-body-md text-body-md text-error mt-1">0 units remaining</span>
            </div>
          </div>
        </div>

        {/* Low Stock Alert Banner */}
        {data.summary.lowStock > 0 && (
          <div className="w-full bg-secondary-container rounded-[24px] p-card-padding flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[0_10px_30px_rgba(31,41,35,0.04)] overflow-hidden relative">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-secondary/10 to-transparent pointer-events-none"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[28px] text-on-secondary-container">assignment_late</span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-secondary-container mb-1">Restock Attention Required</h3>
                <p className="font-body-lg text-body-lg text-on-secondary-container/80">
                  {data.summary.lowStock} products are running low on stock and need replenishment soon.
                </p>
              </div>
            </div>
            <button
              onClick={() => setStatusFilter('Low Stock')}
              className="h-[48px] px-6 rounded-full bg-secondary text-on-secondary font-label-md text-label-md hover:bg-secondary/90 transition-colors shadow-md flex items-center gap-2 relative z-10 whitespace-nowrap"
            >
              Filter Low Stock
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
            </button>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col w-full gap-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-2">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name, SKU, or category..."
                className="w-full bg-surface-container-lowest h-12 pl-12 pr-4 rounded-full font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 border border-outline/20 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Category Filter Dropdown */}
              <div className="flex items-center bg-surface-container-lowest border border-outline/20 rounded-full px-4 h-12 shadow-sm">
                <span className="material-symbols-outlined text-outline mr-2 text-[20px]">category</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-transparent font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer pr-2"
                >
                  <option value="All">All Categories</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center bg-surface-container-lowest border border-outline/20 rounded-full p-1 shadow-sm">
                {['All', 'Healthy Stock', 'Low Stock', 'Out of Stock'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-full font-label-md text-[13px] transition-colors ${statusFilter === st ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}`}
                  >
                    {st === 'Healthy Stock' ? 'Healthy' : st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-container-low rounded-xl items-center text-outline">
            <div className="col-span-4 font-label-md text-label-md uppercase tracking-widest">Product Details</div>
            <div className="col-span-2 font-label-md text-label-md uppercase tracking-widest">Price</div>
            <div className="col-span-3 font-label-md text-label-md uppercase tracking-widest">Stock Level</div>
            <div className="col-span-2 font-label-md text-label-md uppercase tracking-widest">Status</div>
            <div className="col-span-1 font-label-md text-label-md uppercase tracking-widest text-right">Actions</div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-2xl border border-outline/10">
              <span className="material-symbols-outlined text-primary text-[36px] animate-spin mb-3">sync</span>
              <p className="font-body-md text-on-surface-variant">Loading live inventory from store catalog...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-error-container/30 border border-error/20 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-error">error</span>
                <span className="font-body-md text-on-surface">{error}</span>
              </div>
              <button
                onClick={loadInventory}
                className="px-4 py-2 bg-error text-on-error rounded-full font-label-md text-label-md hover:bg-error/90"
              >
                Retry
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-2xl border border-dashed border-outline/30 text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4 text-outline">
                <span className="material-symbols-outlined text-[32px]">inventory_2</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-1">No products found</h3>
              <p className="font-body-md text-on-surface-variant mb-6 max-w-md">
                No items matched your current search or filter criteria. Try clearing filters or add a new product.
              </p>
              <button
                onClick={handleOpenAddModal}
                className="h-11 px-6 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add New Product
              </button>
            </div>
          ) : (
            /* Product Rows */
            <div className="flex flex-col gap-2">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className={`grid grid-cols-12 gap-4 p-4 bg-surface-container-lowest rounded-2xl items-center shadow-[0_4px_20px_rgba(31,41,35,0.02)] transition-all hover:bg-surface-container-low/50 border border-outline/10 ${item.isGrayscale ? 'opacity-85' : ''}`}
                >
                  {/* Column 1: Image & Title */}
                  <div className="col-span-4 flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-surface-container overflow-hidden shadow-inner shrink-0 relative group ${item.isGrayscale ? 'grayscale' : ''}`}>
                      <img className="w-full h-full object-cover" src={item.image} alt={item.title} />
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Change Photo"
                      >
                        <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                      </button>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-headline-md text-[18px] leading-tight text-on-surface truncate font-semibold">
                        {item.title}
                      </span>
                      <span className="font-body-md text-[13px] text-on-surface-variant truncate">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Column 2: Price */}
                  <div className="col-span-2 flex flex-col">
                    <span className="font-stats-number text-[18px] font-semibold text-on-surface">{item.price}</span>
                    <span className="font-body-md text-[12px] text-on-surface-variant">per {item.unit}</span>
                  </div>

                  {/* Column 3: Stock Quick Adjust */}
                  <div className="col-span-3 flex items-center gap-3">
                    <button
                      onClick={() => handleQuickStockUpdate(item, -1)}
                      className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors shrink-0"
                      title="Decrease Stock"
                    >
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>

                    <div className="flex flex-col items-center min-w-[60px]">
                      <span className={`font-stats-number text-[20px] leading-none font-bold ${item.unitColorClass}`}>
                        {item.units}
                      </span>
                      <span className="font-body-md text-[11px] text-on-surface-variant mt-0.5">{item.unit}s</span>
                    </div>

                    <button
                      onClick={() => handleQuickStockUpdate(item, 1)}
                      className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors shrink-0"
                      title="Increase Stock"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>

                  {/* Column 4: Status Badge */}
                  <div className="col-span-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full ${item.statusClass} font-label-md text-[11px] uppercase tracking-wider font-medium`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Column 5: Action Buttons */}
                  <div className="col-span-1 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="w-10 h-10 rounded-full bg-surface-container hover:bg-primary hover:text-on-primary flex items-center justify-center transition-colors text-on-surface-variant"
                      title="Edit Product Details"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(item.id, item.title)}
                      className="w-10 h-10 rounded-full bg-surface-container hover:bg-error hover:text-on-error flex items-center justify-center transition-colors text-on-surface-variant"
                      title="Delete Product"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT PRODUCT MODAL (TAKE PHOTO, VOICE CAPTURE, MANUAL ENTER)         */}
      {/* ========================================================================= */}
      {activeModal === 'product' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-[28px] max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-outline/10 relative my-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">{editingItem ? 'edit_note' : 'add_box'}</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">
                  {editingItem ? 'Edit Product' : 'Add New Inventory Product'}
                </h2>
              </div>
              <button
                onClick={() => {
                  stopCamera();
                  stopVoiceCapture();
                  setActiveModal('none');
                }}
                className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="flex flex-col gap-5">
              {/* Product Capture Tabs: TAKE PHOTO, VOICE CAPTURE & MANUAL ENTER */}
              <div className="flex flex-col gap-3 p-4 bg-surface-container-low rounded-2xl border border-outline/10">
                <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">photo_camera</span>
                  Product Capture Mode
                </label>

                {/* Pill Selector: TAKE PHOTO, VOICE CAPTURE & MANUAL ENTER */}
                <div className="flex items-center bg-surface-container-lowest rounded-full p-1.5 border border-outline/20 shadow-sm">
                  <button
                    type="button"
                    onClick={() => {
                      stopVoiceCapture();
                      setImageTab('camera');
                      startCamera();
                    }}
                    className={`flex-1 py-2 rounded-full font-label-md text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      imageTab === 'camera'
                        ? 'bg-primary text-on-primary shadow-md'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                    Take Photo
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setImageTab('voice');
                    }}
                    className={`flex-1 py-2 rounded-full font-label-md text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      imageTab === 'voice'
                        ? 'bg-primary text-on-primary shadow-md'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">mic</span>
                    Voice Capture
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      stopVoiceCapture();
                      setImageTab('manual');
                    }}
                    className={`flex-1 py-2 rounded-full font-label-md text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      imageTab === 'manual'
                        ? 'bg-primary text-on-primary shadow-md'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">edit_note</span>
                    Manual Enter
                  </button>
                </div>

                {/* Tab 1: TAKE PHOTO (WebCam Live Stream & Snap) */}
                {imageTab === 'camera' && (
                  <div className="flex flex-col items-center gap-3 pt-2">
                    <div className="relative w-full max-w-md aspect-video bg-black rounded-2xl overflow-hidden shadow-md flex items-center justify-center border border-outline/20">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      {!cameraActive && (
                        <div className="flex flex-col items-center gap-2 text-white/70">
                          <span className="material-symbols-outlined text-[36px] animate-pulse">videocam</span>
                          <span className="text-xs">Initializing camera feed...</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        disabled={!cameraActive}
                        className="px-6 py-2.5 rounded-full bg-secondary text-on-secondary font-label-md text-label-md hover:bg-secondary/90 flex items-center gap-2 shadow-sm disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                        Snap Photo Now
                      </button>

                      <label className="px-4 py-2.5 rounded-full border border-outline/30 bg-surface-container-lowest font-label-md text-label-md text-on-surface hover:bg-surface-container cursor-pointer flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">upload</span>
                        Upload Gallery Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUploadFallback}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                )}

                {/* Tab 2: VOICE CAPTURE (Speech-to-Text & Auto-Fill) */}
                {imageTab === 'voice' && (
                  <div className="flex flex-col items-center gap-4 py-4 px-2 text-center bg-surface-container-lowest rounded-2xl border border-outline/10">
                    <div className="relative flex items-center justify-center">
                      {isListeningVoice && (
                        <div className="absolute w-20 h-20 rounded-full bg-primary/20 animate-ping"></div>
                      )}
                      <button
                        type="button"
                        onClick={isListeningVoice ? stopVoiceCapture : startVoiceCapture}
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform hover:scale-105 ${
                          isListeningVoice ? 'bg-error animate-pulse' : 'bg-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[32px]">
                          {isListeningVoice ? 'mic' : 'mic_none'}
                        </span>
                      </button>
                    </div>

                    <div className="flex flex-col gap-1 max-w-sm">
                      <h4 className="font-headline-md text-[16px] text-on-surface font-semibold">
                        {isListeningVoice ? 'Listening... Speak details now' : 'Tap Microphone to Speak'}
                      </h4>
                      <p className="font-body-md text-[12px] text-on-surface-variant">
                        Say: <span className="font-semibold text-primary font-mono">"Fresh Organic Milk, 60 rupees, 25 units, Dairy"</span>
                      </p>
                    </div>

                    {voiceTranscript && (
                      <div className="w-full p-3 bg-surface-container-low rounded-xl border border-outline/10 text-left">
                        <span className="font-label-md text-[11px] uppercase tracking-wider text-outline block mb-1">
                          Speech Transcript:
                        </span>
                        <p className="font-body-md text-[13px] text-on-surface italic">"{voiceTranscript}"</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: MANUAL ENTER */}
                {imageTab === 'manual' && (
                  <div className="flex flex-col gap-2 pt-2">
                    <label className="font-label-md text-[12px] font-medium text-on-surface-variant">Image URL (Optional):</label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://example.com/product-image.jpg"
                      className="w-full h-11 px-4 rounded-xl bg-surface-container-lowest border border-outline/20 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="font-body-md text-[12px] text-on-surface-variant/80 italic">
                      Fill out the product details manually in the fields below.
                    </p>
                  </div>
                )}

                {/* Captured Image Preview Display */}
                {formData.imageUrl && (
                  <div className="flex items-center gap-3 mt-1 p-2 bg-surface-container-lowest rounded-xl border border-primary/30">
                    <img src={formData.imageUrl} alt="Captured Product" className="w-12 h-12 rounded-lg object-cover border border-outline/10" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-label-md text-[12px] font-semibold text-primary">Product Image Attached</span>
                      <span className="font-body-md text-[11px] text-on-surface-variant truncate">Image linked successfully</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                      className="text-error hover:text-error/80 p-1"
                    >
                      <span className="material-symbols-outlined text-[20px]">cancel</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Product Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">
                    Product Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Organic Whole Milk"
                    className="w-full h-11 px-4 rounded-xl bg-surface-container border border-outline/20 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl bg-surface-container border border-outline/20 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {['Grocery', 'Dairy', 'Vegetables', 'Stationery', 'Electronics', 'Hardware', 'Pharmacy', 'Fashion', 'Other'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">
                    Price (₹) <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="e.g. 150"
                    className="w-full h-11 px-4 rounded-xl bg-surface-container border border-outline/20 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl bg-surface-container border border-outline/20 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {['piece', 'kg', 'gram', 'litre', 'ml', 'meter', 'cm', 'pack', 'box', 'pair', 'set', 'dozen', 'bottle', 'other'].map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">Initial Stock Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQty}
                    onChange={(e) => setFormData(prev => ({ ...prev, stockQty: e.target.value }))}
                    placeholder="e.g. 20"
                    className="w-full h-11 px-4 rounded-xl bg-surface-container border border-outline/20 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">SKU (Stock Keeping Unit)</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="e.g. GRC-1024"
                    className="w-full h-11 px-4 rounded-xl bg-surface-container border border-outline/20 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional product details or specs..."
                  className="w-full p-3 rounded-xl bg-surface-container border border-outline/20 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline/10">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    stopVoiceCapture();
                    setActiveModal('none');
                  }}
                  className="h-11 px-6 rounded-full border border-outline/30 text-on-surface font-label-md text-label-md hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-8 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">check</span>
                      {editingItem ? 'Update Product' : 'Save Product'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CSV IMPORT MODAL                                                         */}
      {/* ========================================================================= */}
      {activeModal === 'csv_import' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-[28px] max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-outline/10 relative my-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">upload_file</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Bulk CSV Inventory Import</h2>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl border border-outline/10">
                <div>
                  <h4 className="font-label-md text-label-md font-semibold text-on-surface">Need the CSV Template?</h4>
                  <p className="font-body-md text-[13px] text-on-surface-variant">Download our standard formatted CSV template with required columns.</p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 rounded-full border border-primary text-primary font-label-md text-label-md hover:bg-primary/10 flex items-center gap-1.5 shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">file_download</span>
                  Template
                </button>
              </div>

              {/* Upload Drop Zone */}
              <div className="flex flex-col items-center justify-center p-8 bg-surface-container border-2 border-dashed border-outline/30 rounded-2xl text-center relative hover:border-primary/50 transition-colors">
                <span className="material-symbols-outlined text-[48px] text-primary mb-2">csv</span>
                <h3 className="font-headline-md text-[16px] text-on-surface font-semibold mb-1">
                  {csvFile ? csvFile.name : 'Select or Drag CSV File'}
                </h3>
                <p className="font-body-md text-[13px] text-on-surface-variant mb-4">
                  File must contain Name, Price, Category, and StockQty headers.
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <button className="px-6 py-2 rounded-full bg-surface-container-lowest border border-outline/20 font-label-md text-label-md text-on-surface shadow-xs pointer-events-none">
                  Browse Files
                </button>
              </div>

              {/* CSV Error */}
              {csvError && (
                <div className="p-4 bg-error-container/30 border border-error/20 rounded-xl flex items-center gap-3 text-error">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                  <span className="font-body-md text-[13px]">{csvError}</span>
                </div>
              )}

              {/* CSV Preview */}
              {csvParsed.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Parsed Products ({csvParsed.length} ready to import):
                    </span>
                  </div>
                  <div className="max-h-40 overflow-y-auto border border-outline/20 rounded-xl bg-surface-container-lowest p-2 flex flex-col gap-1">
                    {csvParsed.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 bg-surface-container rounded-lg">
                        <span className="font-semibold text-on-surface truncate max-w-[200px]">{item.name}</span>
                        <span className="text-on-surface-variant">{item.category}</span>
                        <span className="text-primary font-bold">₹{item.price}</span>
                        <span className="text-on-surface">{item.stockQty} {item.unit}s</span>
                      </div>
                    ))}
                    {csvParsed.length > 5 && (
                      <p className="text-center font-body-md text-[12px] text-on-surface-variant pt-1">
                        ...and {csvParsed.length - 5} more items.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline/10">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="h-11 px-6 rounded-full border border-outline/30 text-on-surface font-label-md text-label-md hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportCSVSubmit}
                  disabled={!csvParsed.length || isSubmitting}
                  className="h-11 px-8 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                      Importing...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">publish</span>
                      Import {csvParsed.length} Products
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}