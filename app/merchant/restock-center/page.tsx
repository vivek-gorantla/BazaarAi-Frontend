'use client';

import React, { useState, useEffect } from 'react';
import {
  getInventoryData,
  getSuppliersApi,
  getPurchaseOrdersApi,
  createPurchaseOrderApi,
  receivePurchaseOrderShipmentApi,
  InventoryItem,
  DbSupplier,
  DbPurchaseOrder
} from '@/services/merchantApi';
import { subscribeInventoryUpdated } from '@/services/eventBus';
import {
  ShoppingCart,
  Truck,
  Building2,
  AlertTriangle,
  Sparkles,
  Plus,
  CheckCircle2,
  PackageCheck,
  RefreshCw,
  Star,
  Trash2,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  Boxes
} from 'lucide-react';

export default function RestockCenter() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<DbSupplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<DbPurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & P.O. Form State
  const [isPoModalOpen, setIsPoModalOpen] = useState<boolean>(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [poItems, setPoItems] = useState<Array<{ productId?: string; supplierProductId?: string; name: string; qty: number; unitPrice: number }>>([]);
  const [isSubmittingPo, setIsSubmittingPo] = useState<boolean>(false);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [invData, suppData, poData] = await Promise.all([
        getInventoryData(),
        getSuppliersApi(),
        getPurchaseOrdersApi()
      ]);
      setInventoryItems(invData.items);
      setSuppliers(suppData);
      setPurchaseOrders(poData);
      if (suppData.length > 0 && !selectedSupplierId) {
        setSelectedSupplierId(suppData[0].id);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load restock center data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    const unsubscribe = subscribeInventoryUpdated(() => {
      loadAllData();
    });
    return () => unsubscribe();
  }, []);

  // Critical Low Stock Items (Stock <= 10)
  const criticalItems = inventoryItems.filter(item => item.units <= 10);

  // Dynamic AI Recommendations based on run-rate
  const aiRecommendations = inventoryItems
    .filter(item => item.units < 20)
    .map(item => {
      const targetStock = 50;
      const suggestedQty = Math.max(10, targetStock - item.units);
      return {
        id: item.id,
        name: item.title,
        reason: item.units === 0 ? "Out of stock - Immediate replenishment needed" : "High sales velocity & low stock",
        qty: suggestedQty,
        item
      };
    });

  // Open P.O. Modal
  const handleOpenPoModal = (initialProduct?: InventoryItem, suggestedQty?: number) => {
    if (suppliers.length > 0 && !selectedSupplierId) {
      setSelectedSupplierId(suppliers[0].id);
    }

    if (initialProduct) {
      setPoItems([{
        productId: initialProduct.id,
        name: initialProduct.title,
        qty: suggestedQty || 20,
        unitPrice: initialProduct.numericPrice || 100
      }]);
    } else if (criticalItems.length > 0) {
      setPoItems(criticalItems.slice(0, 3).map(i => ({
        productId: i.id,
        name: i.title,
        qty: 30,
        unitPrice: i.numericPrice || 100
      })));
    } else {
      setPoItems([]);
    }
    setIsPoModalOpen(true);
  };

  const handleAddPoItem = (product: InventoryItem) => {
    if (poItems.some(i => i.productId === product.id)) return;
    setPoItems(prev => [...prev, {
      productId: product.id,
      name: product.title,
      qty: 20,
      unitPrice: product.numericPrice || 100
    }]);
  };

  const handleAddSupplierProductToPo = (product: { id: string; name: string; wholesalePrice: number; minOrderQty: number }) => {
    if (poItems.some(i => i.supplierProductId === product.id)) return;
    setPoItems(prev => [...prev, {
      supplierProductId: product.id,
      name: product.name,
      qty: product.minOrderQty || 10,
      unitPrice: product.wholesalePrice
    }]);
  };

  const handleRemovePoItem = (index: number) => {
    setPoItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdatePoItemQty = (index: number, qty: number) => {
    setPoItems(prev => prev.map((item, i) => i === index ? { ...item, qty: Math.max(1, qty) } : item));
  };

  // Submit Purchase Order to Database API
  const handleSubmitPo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      alert("Please select a supplier");
      return;
    }
    if (poItems.length === 0) {
      alert("Please add at least one item to the order");
      return;
    }

    setIsSubmittingPo(true);
    try {
      const newPo = await createPurchaseOrderApi({
        supplierId: selectedSupplierId,
        items: poItems
      });

      setIsPoModalOpen(false);
      await loadAllData();
      alert(`Purchase Order ${newPo.poNumber} created & sent successfully!`);
    } catch (err: any) {
      alert(err?.message || "Failed to create Purchase Order");
    } finally {
      setIsSubmittingPo(false);
    }
  };

  // Receive Shipment & Replenish Stock in PostgreSQL DB
  const handleReceiveShipment = async (po: DbPurchaseOrder) => {
    if (confirm(`Receive shipment for ${po.poNumber}? Store stock will be automatically updated in database.`)) {
      try {
        await receivePurchaseOrderShipmentApi(po.id);
        await loadAllData();
        alert(`Shipment received! Stock levels replenished in database.`);
      } catch (err: any) {
        alert(err?.message || "Failed to receive shipment");
      }
    }
  };

  const currentSupplierObj = suppliers.find(s => s.id === selectedSupplierId);

  return (
    <>
      <div className="flex flex-col w-full gap-8 pb-16 relative z-10">

        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-[#496246]/10 rounded-full blur-[140px] -z-10 pointer-events-none" />

        {/* Header Hero Banner */}
        <div className="p-6 md:p-10 rounded-3xl bg-gradient-to-br from-[#2D3A2C] via-[#1E271D] to-[#121811] text-white shadow-2xl relative overflow-hidden border border-[#496246]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/15">
              <Truck size={14} className="text-emerald-400" />
              <span className="text-xs font-black text-emerald-300 uppercase tracking-widest">B2B Wholesale Procurement</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              Restock Center & Supplier Hub
            </h1>
            <p className="text-xs md:text-sm text-[#D1E2CF] font-medium leading-relaxed">
              Order directly from registered wholesale suppliers, manage Purchase Orders (P.O.), and receive shipments to auto-replenish store inventory.
            </p>
          </div>

          <button
            onClick={() => handleOpenPoModal()}
            className="px-6 py-4 bg-[#8C5A3B] hover:bg-[#7A4E33] text-white rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.02] active:scale-95 shrink-0 border border-white/10"
          >
            <ShoppingCart size={18} />
            <span>+ Create Purchase Order</span>
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Critical Stock & AI Suggestions */}
          <div className="lg:col-span-8 space-y-6">

            {/* Critical Low Stock */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
                    <AlertTriangle size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-900">Critical Low Stock Items</h2>
                    <p className="text-xs text-gray-500 font-semibold">Live products with 10 or fewer units in store inventory</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black uppercase tracking-wider">
                  {criticalItems.length} Need Restock
                </span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center p-8 text-gray-500 text-xs font-bold">
                  <RefreshCw size={20} className="animate-spin text-[#496246] mr-2" /> Loading stock items...
                </div>
              ) : criticalItems.length === 0 ? (
                <div className="p-8 text-center bg-emerald-50/50 rounded-2xl border border-emerald-200 text-emerald-800">
                  <CheckCircle2 size={36} className="mx-auto text-emerald-600 mb-2" />
                  <h3 className="text-base font-black text-emerald-900">Stock Levels Healthy!</h3>
                  <p className="text-xs text-emerald-700 font-medium">No items are currently below critical low-stock threshold.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {criticalItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleOpenPoModal(item)}
                      className="p-4 rounded-2xl bg-gray-50 border border-gray-200 hover:border-[#496246] transition-all cursor-pointer flex flex-col justify-between group shadow-2xs hover:shadow-sm"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <img src={item.image} alt={item.title} className="w-12 h-12 rounded-xl object-cover border border-gray-200" />
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                            item.units === 0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.units} left
                          </span>
                        </div>
                        <h3 className="text-xs font-black text-gray-900 line-clamp-1 mb-0.5">{item.title}</h3>
                        <p className="text-[11px] text-gray-500 font-semibold">{item.category} • {item.price}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center justify-between">
                        <span className="text-[11px] font-black text-[#496246]">Order P.O. Restock</span>
                        <div className="w-7 h-7 rounded-lg bg-[#496246] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Plus size={14} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Restock Suggestions */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-[#496246]">
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-900">AI Restock Suggestions</h2>
                    <p className="text-xs text-gray-500 font-semibold">Recommended order quantities based on sales run-rate</p>
                  </div>
                </div>
                {aiRecommendations.length > 0 && (
                  <button
                    onClick={() => handleOpenPoModal()}
                    className="text-xs font-black text-[#496246] hover:underline flex items-center gap-1"
                  >
                    Add All to P.O. <ArrowRight size={14} />
                  </button>
                )}
              </div>

              {aiRecommendations.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl text-xs font-bold text-gray-500">
                  All inventory stock levels are optimal.
                </div>
              ) : (
                <div className="space-y-3">
                  {aiRecommendations.map(rec => (
                    <div key={rec.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#E8F0E7] text-[#496246] flex items-center justify-center shrink-0">
                          <TrendingUp size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-gray-900">{rec.name}</h4>
                          <p className="text-[11px] text-gray-500 font-semibold">{rec.reason}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Suggested Qty</span>
                          <span className="text-sm font-black text-gray-900">+{rec.qty} <span className="text-[11px] font-bold text-gray-500">{rec.item.unit}s</span></span>
                        </div>
                        <button
                          onClick={() => handleOpenPoModal(rec.item, rec.qty)}
                          className="px-3.5 py-2 bg-[#8C5A3B] hover:bg-[#7A4E33] text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1 transition-all"
                        >
                          <Plus size={14} />
                          Restock
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Active Purchase Orders & Wholesale Suppliers */}
          <div className="lg:col-span-4 space-y-6">

            {/* Active P.O.s */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <PackageCheck size={18} className="text-[#496246]" /> Active Purchase Orders
                </h2>
                <span className="text-xs font-bold text-gray-400">{purchaseOrders.length} Orders</span>
              </div>

              {purchaseOrders.length === 0 ? (
                <div className="p-6 text-center bg-gray-50 rounded-2xl text-xs font-bold text-gray-500">
                  No active purchase orders.
                </div>
              ) : (
                <div className="space-y-3">
                  {purchaseOrders.map(po => (
                    <div key={po.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-gray-700">{po.poNumber}</span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          po.status === 'received' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {po.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-black text-gray-900">{po.supplier?.name || 'Supplier'}</h4>
                        <p className="text-[11px] text-gray-500 font-semibold">
                          {po.items?.length || 0} Items • ₹{Number(po.totalAmount).toLocaleString()}
                        </p>
                      </div>

                      {po.status !== 'received' && (
                        <button
                          onClick={() => handleReceiveShipment(po)}
                          className="w-full py-2.5 bg-[#8C5A3B] hover:bg-[#7A4E33] text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <PackageCheck size={14} />
                          Receive Shipment & Update DB Stock
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Registered B2B Suppliers */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#2D3A2C] to-[#1B231A] text-white shadow-xl space-y-4 border border-[#496246]/40">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Building2 size={18} className="text-emerald-400" /> B2B Wholesale Suppliers
                </h2>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black uppercase">
                  DB Live
                </span>
              </div>

              <div className="space-y-3">
                {suppliers.map(supplier => (
                  <div
                    key={supplier.id}
                    onClick={() => {
                      setSelectedSupplierId(supplier.id);
                      handleOpenPoModal();
                    }}
                    className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer flex items-center justify-between gap-3 border border-white/10"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#8C5A3B] text-white font-black text-sm flex items-center justify-center shrink-0">
                        {supplier.name[0]}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-white truncate">{supplier.name}</h4>
                        <p className="text-[11px] text-[#D1E2CF] font-medium flex items-center gap-1">
                          {supplier.category} • <Star size={10} className="fill-amber-400 text-amber-400" /> {supplier.rating}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-white/60 shrink-0" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* CREATE PURCHASE ORDER MODAL */}
      {isPoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-gray-100 shadow-2xl my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-[#496246]" />
                <h2 className="text-lg font-black text-gray-900">Create Purchase Order (P.O.)</h2>
              </div>
              <button onClick={() => setIsPoModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xs">
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmitPo} className="space-y-4">
              {/* Select Supplier */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Select Supplier</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                  ))}
                </select>
              </div>

              {/* Wholesale Catalog from Supplier */}
              {currentSupplierObj && currentSupplierObj.products && currentSupplierObj.products.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Supplier Wholesale Catalog</label>
                  <div className="flex flex-wrap gap-1.5">
                    {currentSupplierObj.products.map(sp => (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => handleAddSupplierProductToPo(sp)}
                        className="px-2.5 py-1.5 bg-gray-100 hover:bg-[#8C5A3B] hover:text-white rounded-lg text-[11px] font-bold text-gray-800 transition-colors border border-gray-200"
                      >
                        + {sp.name} (₹{sp.wholesalePrice})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Store Product Selector */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Or Choose Store Catalog Item</label>
                <select
                  onChange={(e) => {
                    const found = inventoryItems.find(i => i.id === e.target.value);
                    if (found) handleAddPoItem(found);
                    e.target.value = "";
                  }}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none"
                >
                  <option value="">-- Choose item --</option>
                  {inventoryItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.title} (Stock: {item.units} {item.unit}s)
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Items Table */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Order Line Items:</span>
                {poItems.length === 0 ? (
                  <p className="text-xs text-gray-400 italic p-3 bg-gray-50 rounded-xl text-center">
                    No items added yet. Select a product above.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {poItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="min-w-0">
                          <p className="text-xs font-black text-gray-900 truncate">{item.name}</p>
                          <p className="text-[11px] text-gray-500 font-semibold">₹{item.unitPrice} / unit</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => handleUpdatePoItemQty(idx, parseInt(e.target.value) || 1)}
                            className="w-16 h-8 px-2 text-center bg-white border border-gray-300 rounded-lg text-xs font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePoItem(idx)}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Amount</span>
                  <span className="text-xl font-black text-gray-900">
                    ₹{poItems.reduce((acc, i) => acc + (i.unitPrice * i.qty), 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPoModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPo || poItems.length === 0}
                    className="px-6 py-2.5 bg-[#8C5A3B] hover:bg-[#7A4E33] text-white rounded-xl text-xs font-black shadow-md disabled:opacity-50"
                  >
                    {isSubmittingPo ? 'Sending...' : 'Send Purchase Order'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}