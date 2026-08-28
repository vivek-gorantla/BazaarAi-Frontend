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

export default function RestockCenter() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<DbSupplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<DbPurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
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
      if (suppData.length > 0) {
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
  }, []);

  // Critical Low Stock Items (Stock <= 10)
  const criticalItems = inventoryItems.filter(item => item.units <= 10);

  // AI Recommendations based on run-rate
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
    if (confirm(`Receive shipment for ${po.poNumber}? Merchant stock will be automatically updated in PostgreSQL.`)) {
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
      <div className="flex flex-col w-full space-y-section-gap pb-12">
        {/* Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-surface-container-low rounded-[32px] p-card-padding shadow-[0_10px_30px_rgba(31,41,35,0.02)] border border-outline/10">
          <div>
            <h1 className="font-display-lg text-display-lg text-on-surface mb-2">B2B Procurement & Restock Center</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Connect with registered database suppliers, issue Purchase Orders, and replenish inventory.
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex gap-4 flex-wrap">
            <button
              onClick={() => handleOpenPoModal()}
              className="h-14 px-8 rounded-full bg-primary hover:bg-primary/90 text-on-primary transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
              <span className="font-label-md text-label-md uppercase tracking-widest font-semibold">Create P.O.</span>
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          
          {/* Left Column: Critical Stock & AI Suggestions */}
          <div className="lg:col-span-8 flex flex-col space-y-gutter">
            
            {/* Critical Low Stock */}
            <section className="bg-surface-container-lowest rounded-[32px] p-card-padding shadow-[0_10px_30px_rgba(31,41,35,0.04)] relative overflow-hidden border border-outline/10">
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-error-container text-[24px]">warning</span>
                  </div>
                  <div>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface">Critical Low Stock</h2>
                    <p className="font-body-md text-[13px] text-on-surface-variant">Live products with 10 or fewer units in store inventory</p>
                  </div>
                </div>
                <span className="px-4 py-1.5 rounded-full bg-surface-container-highest font-label-md text-label-md text-on-surface-variant font-semibold">
                  {criticalItems.length} Items Need Action
                </span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center p-8 text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-[28px] animate-spin mr-2">sync</span>
                  Loading inventory...
                </div>
              ) : criticalItems.length === 0 ? (
                <div className="p-8 text-center bg-primary-container/10 rounded-2xl border border-primary/20">
                  <span className="material-symbols-outlined text-primary text-[36px] mb-1">check_circle</span>
                  <p className="font-headline-md text-on-surface text-[16px]">Stock Healthy!</p>
                  <p className="font-body-md text-on-surface-variant text-[13px]">No items are currently below critical stock threshold.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  {criticalItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleOpenPoModal(item)}
                      className="bg-surface rounded-2xl p-5 group hover:bg-surface-container transition-all cursor-pointer border border-outline/10 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div className="w-14 h-14 rounded-xl bg-surface-container-low overflow-hidden">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                          <span className={`font-label-md text-label-md px-3 py-1 rounded-full ${item.units === 0 ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'}`}>
                            {item.units} left
                          </span>
                        </div>
                        <h3 className="font-headline-md text-[16px] font-bold text-on-surface mb-1 line-clamp-1">{item.title}</h3>
                        <p className="font-body-md text-[12px] text-on-surface-variant mb-3">{item.category} • {item.price}</p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20 mt-2">
                        <span className="font-label-md text-[12px] text-primary font-semibold">Order Restock</span>
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-[18px]">add</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* AI Restock Suggestions */}
            <section className="bg-surface-container-lowest rounded-[32px] p-card-padding shadow-[0_10px_30px_rgba(31,41,35,0.04)] border border-outline/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-secondary-container text-[24px]">auto_awesome</span>
                  </div>
                  <div>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface">AI Restock Suggestions</h2>
                    <p className="font-body-md text-[13px] text-on-surface-variant">Recommended order quantities to reach target safety stock</p>
                  </div>
                </div>
                {aiRecommendations.length > 0 && (
                  <button
                    onClick={() => handleOpenPoModal()}
                    className="font-label-md text-label-md text-primary hover:underline flex items-center gap-1 font-semibold"
                  >
                    Add All to P.O. <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                  </button>
                )}
              </div>

              {aiRecommendations.length === 0 ? (
                <div className="p-8 text-center bg-surface-container-low rounded-2xl">
                  <p className="font-body-md text-on-surface-variant">All stock levels are optimal.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {aiRecommendations.map(rec => (
                    <div key={rec.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-surface hover:bg-surface-container transition-colors border border-outline/10 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px]">trending_up</span>
                        </div>
                        <div>
                          <h4 className="font-headline-md text-[16px] font-bold text-on-surface">{rec.name}</h4>
                          <p className="font-body-md text-[12px] text-on-surface-variant">{rec.reason}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-auto">
                        <div className="text-right">
                          <p className="font-label-md text-[11px] text-outline uppercase tracking-wider">Suggested Qty</p>
                          <p className="font-stats-number text-[20px] font-bold text-on-surface">+{rec.qty} <span className="text-body-md text-[12px] text-on-surface-variant font-normal">{rec.item.unit}s</span></p>
                        </div>
                        <button
                          onClick={() => handleOpenPoModal(rec.item, rec.qty)}
                          className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-[13px] hover:bg-primary/90 transition-all flex items-center gap-1 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[16px]">add</span>
                          Restock
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>

          {/* Right Column: Active Purchase Orders & Registered DB Suppliers */}
          <div className="lg:col-span-4 flex flex-col space-y-gutter">
            
            {/* Active P.O.s */}
            <section className="bg-surface-container-lowest rounded-[32px] p-card-padding shadow-[0_10px_30px_rgba(31,41,35,0.04)] border border-outline/10 flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Active Purchase Orders</h2>
                <span className="material-symbols-outlined text-outline">receipt_long</span>
              </div>

              {purchaseOrders.length === 0 ? (
                <div className="p-6 text-center bg-surface-container-low rounded-2xl">
                  <p className="font-body-md text-[13px] text-on-surface-variant">No active purchase orders.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {purchaseOrders.map(po => (
                    <div key={po.id} className="p-4 rounded-2xl border border-outline-variant/30 hover:border-primary/50 transition-colors bg-surface-container-lowest">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-label-md text-[12px] font-mono text-on-surface-variant font-bold">{po.poNumber}</span>
                        <span className={`font-label-md text-[11px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${po.status === 'received' ? 'bg-secondary-container text-on-secondary-container' : 'bg-primary-container/30 text-primary'}`}>
                          {po.status}
                        </span>
                      </div>

                      <h4 className="font-headline-md text-[16px] font-bold text-on-surface mb-1">{po.supplier?.name || 'Supplier'}</h4>
                      <p className="font-body-md text-[12px] text-on-surface-variant mb-3">
                        {po.items?.length || 0} Items • ₹{Number(po.totalAmount).toLocaleString()}
                      </p>

                      {po.status !== 'received' && (
                        <button
                          onClick={() => handleReceiveShipment(po)}
                          className="w-full py-2 rounded-xl bg-secondary text-on-secondary font-label-md text-[12px] hover:bg-secondary/90 flex items-center justify-center gap-1 transition-colors shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">inventory</span>
                          Receive Shipment & Update DB Stock
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Registered Suppliers */}
            <section className="bg-primary rounded-[32px] p-card-padding shadow-xl shadow-primary/10 relative overflow-hidden text-on-primary">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-headline-lg text-headline-lg">Registered Suppliers</h2>
                  <span className="bg-on-primary/20 text-on-primary px-3 py-1 rounded-full font-label-md text-[12px] font-bold">
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
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-on-primary/10 hover:bg-on-primary/20 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[16px] bg-on-primary text-primary">
                          {supplier.name[0]}
                        </div>
                        <div>
                          <h4 className="font-headline-md text-[15px] font-semibold">{supplier.name}</h4>
                          <p className="font-body-md text-[12px] opacity-80">{supplier.category} • ⭐ {supplier.rating}</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* CREATE PURCHASE ORDER MODAL */}
      {isPoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-[28px] max-w-xl w-full p-6 md:p-8 shadow-2xl border border-outline/10 my-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">add_shopping_cart</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Create Purchase Order (P.O.)</h2>
              </div>
              <button
                onClick={() => setIsPoModalOpen(false)}
                className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitPo} className="flex flex-col gap-4">
              {/* Select Supplier */}
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">Select Database Supplier</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-surface-container border border-outline/20 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                  ))}
                </select>
              </div>

              {/* Wholesale Products from Supplier */}
              {currentSupplierObj && currentSupplierObj.products && currentSupplierObj.products.length > 0 && (
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">Supplier Wholesale Catalog</label>
                  <div className="flex flex-wrap gap-2">
                    {currentSupplierObj.products.map(sp => (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => handleAddSupplierProductToPo(sp)}
                        className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-[12px] font-label-md transition-colors border border-outline/10 text-on-surface"
                      >
                        + {sp.name} (₹{sp.wholesalePrice})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Store Product Selector */}
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">Or Add Store Item</label>
                <select
                  onChange={(e) => {
                    const found = inventoryItems.find(i => i.id === e.target.value);
                    if (found) handleAddPoItem(found);
                    e.target.value = "";
                  }}
                  className="w-full h-11 px-4 rounded-xl bg-surface-container border border-outline/20 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Choose item from store catalog --</option>
                  {inventoryItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.title} (Stock: {item.units} {item.unit}s)
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Items Table */}
              <div className="flex flex-col gap-2 mt-2">
                <span className="font-label-md text-label-md text-on-surface font-semibold">Order Items:</span>
                {poItems.length === 0 ? (
                  <p className="font-body-md text-[13px] text-on-surface-variant italic p-3 bg-surface-container-low rounded-xl text-center">
                    No items added yet. Select a product above.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                    {poItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-surface-container rounded-xl border border-outline/10">
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-on-surface text-[14px] truncate">{item.name}</span>
                          <span className="text-[12px] text-on-surface-variant">₹{item.unitPrice} / unit</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => handleUpdatePoItemQty(idx, parseInt(e.target.value) || 1)}
                            className="w-20 h-9 px-2 text-center rounded-lg bg-surface-container-lowest border border-outline/20 font-body-md text-on-surface"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePoItem(idx)}
                            className="text-error hover:text-error/80"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-outline/10 mt-2">
                <div>
                  <span className="font-label-md text-[12px] text-outline uppercase block">Total Order Value</span>
                  <span className="font-stats-number text-[20px] font-bold text-on-surface">
                    ₹{poItems.reduce((acc, i) => acc + (i.unitPrice * i.qty), 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPoModalOpen(false)}
                    className="px-6 py-2.5 rounded-full border border-outline/30 text-on-surface font-label-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPo || poItems.length === 0}
                    className="px-8 py-2.5 rounded-full bg-primary text-on-primary font-label-md hover:bg-primary/90 shadow-md disabled:opacity-50"
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