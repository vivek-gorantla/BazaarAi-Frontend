'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { subscribeInventoryUpdated, dispatchInventoryUpdated } from '@/services/eventBus';
import { SmartRestockModal } from '@/components/SmartRestockModal';
import {
  Package,
  Plus,
  Minus,
  Mic,
  Camera,
  UploadCloud,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Grid,
  List,
  Sparkles,
  Edit2,
  Trash2,
  RefreshCw,
  Boxes,
  Tag,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

export default function Inventory() {
  const [data, setData] = useState<InventoryData>({
    summary: { total: 0, healthy: 0, lowStock: 0, outOfStock: 0 },
    items: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // View Mode: 'grid' (Visual Cards) or 'table' (Compact List)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Modals
  const [activeModal, setActiveModal] = useState<'none' | 'product' | 'csv_import' | 'smart_restock'>('none');
  const [smartRestockInitialTab, setSmartRestockInitialTab] = useState<'voice' | 'camera' | 'csv' | 'text'>('voice');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Product Form State
  const [formData, setFormData] = useState({
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
    const unsubscribe = subscribeInventoryUpdated(() => {
      loadInventory();
    });
    return () => unsubscribe();
  }, []);

  // Open Smart Restock Assistant
  const openSmartAssistant = (tab: 'voice' | 'camera' | 'csv' | 'text' = 'voice') => {
    setSmartRestockInitialTab(tab);
    setActiveModal('smart_restock');
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
    setActiveModal('product');
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
    setActiveModal('product');
  };

  // Submit Add/Edit Product Form
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      alert("Please enter a valid product name and price.");
      return;
    }
    setIsSubmitting(true);
    try {
      const numericPrice = parseFloat(formData.price) || 0;
      const stockQty = parseFloat(formData.stockQty) || 0;
      const payload = {
        name: formData.name.trim(),
        category: formData.category || 'Grocery',
        subcategory: formData.subcategory.trim() || undefined,
        price: numericPrice,
        unit: formData.unit || 'piece',
        stockQty: stockQty,
        sku: formData.sku.trim() || undefined,
        description: formData.description.trim() || undefined,
        imageUrl: formData.imageUrl.trim() || undefined
      };

      if (editingItem) {
        // Optimistically update existing item in local UI state without page reload
        setData(prev => {
          const updatedItems = prev.items.map(item => {
            if (item.id === editingItem.id) {
              const status = stockQty > 10 ? "Healthy" : stockQty > 0 ? "Low Stock" : "Out of Stock";
              return {
                ...item,
                title: payload.name,
                category: payload.category,
                subcategory: payload.subcategory || "",
                price: `₹${numericPrice}`,
                numericPrice: numericPrice,
                unit: payload.unit,
                units: stockQty,
                sku: payload.sku || "",
                description: payload.description || "",
                image: payload.imageUrl || item.image,
                status: status
              };
            }
            return item;
          });
          return {
            ...prev,
            summary: {
              total: updatedItems.length,
              healthy: updatedItems.filter(i => i.units > 10).length,
              lowStock: updatedItems.filter(i => i.units > 0 && i.units <= 10).length,
              outOfStock: updatedItems.filter(i => i.units <= 0).length
            },
            items: updatedItems
          };
        });

        await updateProductApi(editingItem.id, payload);
      } else {
        await createProductApi(payload);
        await loadInventory();
      }

      setActiveModal('none');
      dispatchInventoryUpdated();
    } catch (err: any) {
      alert(err.message || "Operation failed");
      await loadInventory();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Product with zero latency local UI removal and no page reload
  const handleDeleteProduct = async (productId: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from store inventory?`)) {
      // 1. Instant local optimistic UI removal
      setData(prev => {
        const updatedItems = prev.items.filter(i => i.id !== productId);
        return {
          ...prev,
          summary: {
            total: updatedItems.length,
            healthy: updatedItems.filter(i => i.units > 10).length,
            lowStock: updatedItems.filter(i => i.units > 0 && i.units <= 10).length,
            outOfStock: updatedItems.filter(i => i.units <= 0).length
          },
          items: updatedItems
        };
      });

      // 2. Perform API delete in background
      try {
        await deleteProductApi(productId);
        dispatchInventoryUpdated();
      } catch (err: any) {
        alert(err.message || "Failed to delete product");
        await loadInventory();
      }
    }
  };

  // One-Tap Quick Stock Increment / Decrement
  const handleQuickStockUpdate = async (item: InventoryItem, delta: number) => {
    const newQty = Math.max(0, item.units + delta);

    // Optimistic UI Update for zero latency feel
    setData(prev => ({
      ...prev,
      summary: {
        ...prev.summary,
        healthy: prev.items.filter(i => (i.id === item.id ? newQty : i.units) > 10).length,
        lowStock: prev.items.filter(i => {
          const q = i.id === item.id ? newQty : i.units;
          return q > 0 && q <= 10;
        }).length,
        outOfStock: prev.items.filter(i => (i.id === item.id ? newQty : i.units) <= 0).length
      },
      items: prev.items.map(i => i.id === item.id ? {
        ...i,
        units: newQty,
        status: newQty > 10 ? "Healthy" : newQty > 0 ? "Low Stock" : "Out of Stock"
      } : i)
    }));

    try {
      await updateStockApi(item.id, newQty);
    } catch (err: any) {
      console.error("Failed to update stock quantity", err);
      await loadInventory();
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!data.items.length) {
      alert("No inventory items to export.");
      return;
    }
    const headers = ["ID", "Name", "Category", "Subcategory", "Price", "Unit", "Stock Qty", "SKU", "Status", "Description"];
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
      `"${(item.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `store_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV File Upload Handler
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
          setCsvError("CSV file must contain a header row and data rows.");
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"(.*)"$/, '$1').toLowerCase());
        const parsedItems: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const rowValues = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
          if (!rowValues || rowValues.length === 0) continue;

          const rowObj: any = {};
          headers.forEach((h, index) => {
            let val = rowValues[index] ? rowValues[index].trim() : '';
            if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1).replace(/""/g, '"');
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
              description: rowObj.description || undefined
            });
          }
        }

        if (parsedItems.length === 0) {
          setCsvError("Could not parse valid products from CSV. Ensure name and price columns are present.");
        } else {
          setCsvParsed(parsedItems);
        }
      } catch (err: any) {
        setCsvError("Failed to parse CSV: " + err.message);
      }
    };
    reader.readAsText(file);
  };

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
      (statusFilter === 'Healthy Stock' && item.units > 10) ||
      (statusFilter === 'Low Stock' && item.units > 0 && item.units <= 10) ||
      (statusFilter === 'Out of Stock' && item.units <= 0);

    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <>
      <div className="flex flex-col w-full gap-6 pb-16 relative z-10">

        {/* Ambient Glow Backdrop */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#496246]/10 rounded-full blur-[120px] -z-10 pointer-events-none transform -translate-y-1/3 translate-x-1/4" />

        {/* 1. Low-Literacy Hero Voice & Camera Action Bar */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#734828] via-[#4D3524] to-[#253627] text-white shadow-2xl relative overflow-hidden border border-[#8C5A3B]/40">
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-[#496246]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/15">
                <Sparkles size={14} className="text-[#E8F0E7]" />
                <span className="text-xs font-bold text-[#E8F0E7] uppercase tracking-wider">Super Simple Store Assistant</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Live Inventory & One-Tap Stock Control
              </h1>
              <p className="text-xs sm:text-sm text-[#D1E2CF] font-medium leading-relaxed">
                Speak to update stock, take a shelf picture, or tap <strong className="text-white">+</strong> / <strong className="text-white">-</strong> directly on item cards below.
              </p>
            </div>

            {/* Large One-Tap Assistant Action Buttons for Merchants */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
              <button
                onClick={() => openSmartAssistant('voice')}
                className="flex-1 sm:flex-none px-6 py-3.5 bg-[#8C5A3B] hover:bg-[#7A4E33] text-white rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.03] active:scale-95 border border-white/10"
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Mic size={18} className="animate-pulse text-white" />
                </div>
                <span>Speak Stock Update</span>
              </button>

              <button
                onClick={() => openSmartAssistant('camera')}
                className="flex-1 sm:flex-none px-6 py-3.5 bg-[#8C5A3B] hover:bg-[#7A4E33] text-white rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.03] active:scale-95 border border-white/10"
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Camera size={18} className="text-white" />
                </div>
                <span>Snap Photo of Shelf</span>
              </button>
            </div>
          </div>

          {/* Spoken Voice Hint Chips */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs font-bold text-[#D1E2CF]">
            <span className="text-white/60 text-[11px] uppercase tracking-wider">Try Speaking:</span>
            <button onClick={() => openSmartAssistant('voice')} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-[11px] font-semibold border border-white/15 transition-all">
              ⚡ "Add 25 bags of Rice"
            </button>
            <button onClick={() => openSmartAssistant('voice')} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-[11px] font-semibold border border-white/15 transition-all">
              ⚡ "Decrease Milk by 5 bottles"
            </button>
            <button onClick={() => openSmartAssistant('voice')} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-[11px] font-semibold border border-white/15 transition-all">
              ⚡ "Restock Wheat Flour"
            </button>
          </div>
        </div>

        {/* 2. Visual Metric Summary Cards (Simplified Low-Literacy Terms) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => setStatusFilter('All')}
            className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-sm hover:shadow-md ${statusFilter === 'All' ? 'border-[#496246] ring-2 ring-[#496246]/20 bg-[#E8F0E7]/30' : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Total Items in Shop</span>
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
                <Boxes size={18} />
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900 tracking-tight">{data.summary.total}</p>
            <p className="text-[11px] text-gray-500 font-semibold mt-1">Across all shop categories</p>
          </div>

          <div
            onClick={() => setStatusFilter('Healthy Stock')}
            className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-sm hover:shadow-md ${statusFilter === 'Healthy Stock' ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50' : 'border-gray-200 hover:border-emerald-200'
              }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider">🟢 Fully Stocked</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <p className="text-3xl font-black text-emerald-800 tracking-tight">{data.summary.healthy}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">&gt; 10 units in stock</p>
          </div>

          <div
            onClick={() => setStatusFilter('Low Stock')}
            className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-sm hover:shadow-md ${statusFilter === 'Low Stock' ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50' : 'border-gray-200 hover:border-amber-200'
              }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider">🟡 Running Low</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                <AlertTriangle size={18} />
              </div>
            </div>
            <p className="text-3xl font-black text-amber-800 tracking-tight">{data.summary.lowStock}</p>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">1 - 10 units left on shelf</p>
          </div>

          <div
            onClick={() => setStatusFilter('Out of Stock')}
            className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-sm hover:shadow-md ${statusFilter === 'Out of Stock' ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/50' : 'border-gray-200 hover:border-rose-200'
              }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black text-rose-700 uppercase tracking-wider">🔴 Sold Out / Empty</span>
              <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
                <XCircle size={18} />
              </div>
            </div>
            <p className="text-3xl font-black text-rose-800 tracking-tight">{data.summary.outOfStock}</p>
            <p className="text-[11px] text-rose-600 font-semibold mt-1">0 units remaining</p>
          </div>
        </div>

        {/* 3. Low Stock Restock Alert Banner */}
        {data.summary.lowStock > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={22} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white">Stock Restock Alert ({data.summary.lowStock} Items)</h3>
                <p className="text-xs text-white/90 font-medium">Some items are running low. Tap below to filter and restock them.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => setStatusFilter('Low Stock')}
                className="px-4 py-2 bg-white text-amber-900 rounded-xl text-xs font-bold shadow-md hover:bg-amber-50 transition-all"
              >
                Filter Low Stock
              </button>
              <button
                onClick={() => openSmartAssistant('voice')}
                className="px-4 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <Mic size={14} /> Voice Restock
              </button>
            </div>
          </div>
        )}

        {/* 4. Controls Toolbar (Search, Filter, View Switcher & Action Buttons) */}
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items by name, SKU, or category..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#496246] transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-700">
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <Tag size={16} className="text-gray-400 mr-2" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-gray-800 focus:outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              {['All', 'Healthy Stock', 'Low Stock', 'Out of Stock'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === st ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {st === 'Healthy Stock' ? '🟢 Good' : st === 'Low Stock' ? '🟡 Low' : st === 'Out of Stock' ? '🔴 Empty' : 'All'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-[#496246] shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                title="Visual Picture Cards"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-[#496246] shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                title="Compact List Table"
              >
                <List size={18} />
              </button>
            </div>

            {/* CSV Export Button */}
            <button
              onClick={handleExportCSV}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition-colors border border-gray-200 flex items-center gap-1.5"
              title="Export CSV"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* CSV Import Button */}
            <button
              onClick={() => {
                setCsvFile(null);
                setCsvParsed([]);
                setCsvError(null);
                setActiveModal('csv_import');
              }}
              className="p-2.5 bg-[#E8F0E7] text-[#496246] hover:bg-[#496246] hover:text-white rounded-xl font-bold text-xs transition-all border border-[#496246]/20 flex items-center gap-1.5"
              title="Import CSV"
            >
              <UploadCloud size={16} />
              <span className="hidden sm:inline">Import CSV</span>
            </button>

            {/* Add Product Button */}
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-[#496246] hover:bg-[#3A4E38] text-white rounded-xl font-black text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus size={18} />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* 5. Main Product Content View (Grid Cards vs Compact Table) */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-gray-200 shadow-xs">
            <RefreshCw size={36} className="animate-spin text-[#496246] mb-3" />
            <p className="text-sm font-bold text-gray-700">Loading live inventory from store catalog...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} />
              <span className="text-sm font-bold">{error}</span>
            </div>
            <button onClick={loadInventory} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700">
              Retry
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-dashed border-gray-300 text-center shadow-xs">
            <Boxes size={48} className="text-gray-300 mb-3" />
            <h3 className="text-lg font-black text-gray-900 mb-1">No items found</h3>
            <p className="text-xs text-gray-500 max-w-md mb-6 font-medium">
              No store items matched your search or status filter. Try clearing search or add a new product item.
            </p>
            <button onClick={handleOpenAddModal} className="px-6 py-3 bg-[#496246] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#3A4E38]">
              + Add New Item
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* VISUAL PICTURE CARD GRID (Merchant Low-Literacy Friendly View) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredItems.map(item => {
              const isHealthy = item.units > 10;
              const isLow = item.units > 0 && item.units <= 10;
              const isOut = item.units <= 0;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group ${isOut ? 'border-rose-200 bg-rose-50/20' : isLow ? 'border-amber-200 bg-amber-50/10' : 'border-gray-200'
                    }`}
                >
                  {/* Top Status & Action Bar */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${isHealthy ? 'bg-emerald-100 text-emerald-800' : isLow ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-rose-100 text-rose-800'
                      }`}>
                      {isHealthy ? '🟢 GOOD STOCK' : isLow ? '🟡 RUNNING LOW' : '🔴 SOLD OUT'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenEditModal(item);
                        }}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs transition-colors"
                        title="Edit Details"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteProduct(item.id, item.title);
                        }}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Product Image */}
                  <div className="w-full h-36 rounded-xl overflow-hidden bg-gray-50 mb-3 border border-gray-100 relative">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <span className="absolute bottom-2 left-2 bg-black/70 text-white font-black text-xs px-2.5 py-0.5 rounded-md backdrop-blur-xs">
                      {item.price}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="mb-4">
                    <h3 className="text-base font-black text-gray-900 leading-snug line-clamp-1">{item.title}</h3>
                    <p className="text-[11px] text-gray-500 font-semibold truncate mt-0.5">
                      {item.category} {item.sku ? `• SKU: ${item.sku}` : ''}
                    </p>
                  </div>

                  {/* ONE-TAP QUICK STOCK COUNTER (High Usability for Shopkeepers) */}
                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between bg-gray-50 -mx-4 -mb-4 p-3 rounded-b-2xl">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block leading-none">Stock on Shelf</span>
                      <span className={`text-lg font-black ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-[#496246]'}`}>
                        {item.units} <span className="text-xs font-bold text-gray-500">{item.unit}s</span>
                      </span>
                    </div>

                    {/* Plus / Minus Quick Counter Buttons */}
                    <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl p-1 shadow-2xs">
                      <button
                        onClick={() => handleQuickStockUpdate(item, -1)}
                        disabled={item.units <= 0}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center font-black transition-all active:scale-95 disabled:opacity-40"
                        title="Decrease 1 Unit"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-black text-sm text-gray-900">{item.units}</span>
                      <button
                        onClick={() => handleQuickStockUpdate(item, 1)}
                        className="w-8 h-8 rounded-lg bg-[#496246] hover:bg-[#3A4E38] text-white flex items-center justify-center font-black transition-all active:scale-95 shadow-2xs"
                        title="Increase 1 Unit"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* COMPACT LIST TABLE VIEW */
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black text-gray-500 uppercase tracking-wider">
                    <th className="p-4">Item Details</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock Level</th>
                    <th className="p-4 text-center">One-Tap Stock Counter</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map(item => {
                    const isHealthy = item.units > 10;
                    const isLow = item.units > 0 && item.units <= 10;
                    const isOut = item.units <= 0;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={item.image} alt={item.title} className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0" />
                            <div>
                              <p className="text-xs font-black text-gray-900">{item.title}</p>
                              {item.sku && <p className="text-[10px] text-gray-400 font-mono">SKU: {item.sku}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-xs font-bold text-gray-600">{item.category}</td>
                        <td className="p-4 text-xs font-black text-gray-900">{item.price}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${isHealthy ? 'bg-emerald-100 text-emerald-800' : isLow ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                            {item.units} {item.unit}s ({item.status})
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleQuickStockUpdate(item, -1)}
                              disabled={item.units <= 0}
                              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center font-bold disabled:opacity-30"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-10 text-center font-black text-xs">{item.units}</span>
                            <button
                              onClick={() => handleQuickStockUpdate(item, 1)}
                              className="w-7 h-7 rounded-lg bg-[#496246] hover:bg-[#3A4E38] text-white flex items-center justify-center font-bold shadow-2xs"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleOpenEditModal(item);
                              }}
                              className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                              title="Edit Product"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteProduct(item.id, item.title);
                              }}
                              className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                              title="Delete Product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 6. Smart Restock Modal Trigger */}
      <SmartRestockModal
        isOpen={activeModal === 'smart_restock'}
        onClose={() => setActiveModal('none')}
        initialTab={smartRestockInitialTab}
      />

      {/* 7. Add / Edit Catalog Item Modal */}
      {activeModal === 'product' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-gray-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900">
                {editingItem ? 'Edit Store Product Item' : '+ Add New Store Product Item'}
              </h2>
              <button onClick={() => setActiveModal('none')} className="text-gray-400 hover:text-gray-600 font-bold text-xs">
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Organic Basmati Rice 5kg"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#496246]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none"
                  >
                    {['Grocery', 'Dairy', 'Vegetables', 'Stationery', 'Electronics', 'Pharmacy', 'Fashion', 'Other'].map(cat => (
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
                    placeholder="e.g. 120"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#496246]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQty}
                    onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
                    placeholder="e.g. 25"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#496246]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none"
                  >
                    {['piece', 'kg', 'gram', 'litre', 'ml', 'pack', 'box', 'bag', 'other'].map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">SKU Code (Optional)</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g. GRC-RICE-01"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#496246] hover:bg-[#3A4E38] text-white rounded-xl text-xs font-black shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Product Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. CSV Import Modal */}
      {activeModal === 'csv_import' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-gray-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <FileSpreadsheet size={20} className="text-[#496246]" /> Bulk Import Inventory CSV
              </h2>
              <button onClick={() => setActiveModal('none')} className="text-gray-400 hover:text-gray-600 font-bold text-xs">
                Cancel
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 text-center space-y-2">
                <UploadCloud size={32} className="mx-auto text-[#496246]" />
                <p className="text-xs font-bold text-gray-800">Select or drop inventory CSV sheet</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVFileChange}
                  className="text-xs text-gray-600 block w-full mx-auto"
                />
              </div>

              {csvError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
                  ⚠️ {csvError}
                </div>
              )}

              {csvParsed.length > 0 && (
                <div className="p-3 bg-[#E8F0E7] border border-[#496246]/20 rounded-xl text-[#496246] text-xs font-bold">
                  ✅ Successfully parsed {csvParsed.length} valid product items! Ready to import into database.
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportCSVSubmit}
                  disabled={isSubmitting || csvParsed.length === 0}
                  className="px-6 py-2.5 bg-[#496246] hover:bg-[#3A4E38] text-white rounded-xl text-xs font-black shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Importing...' : `Import All ${csvParsed.length} Products`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}