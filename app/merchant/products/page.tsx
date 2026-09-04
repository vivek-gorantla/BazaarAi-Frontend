'use client';

import React, { useState, useEffect } from 'react';
import {
  getProducts,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  Product
} from '@/services/merchantApi';
import { subscribeInventoryUpdated } from '@/services/eventBus';
import { AgentInput } from '@/agent/components/AgentInput';
import { AgentUIRegistry } from '@/agent/registry';
import { MerchantImageAgent } from '@/agent/components/MerchantImageAgent';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'price_low' | 'price_high'>('name');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [agentEmptyFields, setAgentEmptyFields] = useState<string[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Grocery',
    subcategory: '',
    price: '',
    unit: 'piece',
    stockQty: '10',
    sku: '',
    description: '',
    imageUrl: '',
    isActive: true
  });

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load catalog products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    const unsubscribe = subscribeInventoryUpdated(() => {
      loadProducts();
    });
    return () => unsubscribe();
  }, []);

  // Register page with AgentUIRegistry so MerchantImageAgent knows which fields to fill
  useEffect(() => {
    AgentUIRegistry.registerPage('products', 'Product Catalog');
    return () => AgentUIRegistry.clear();
  }, []);

  const handleToggleActive = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const newActiveState = !product.isActive;
    // Optimistic UI update
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: newActiveState } : p));
    try {
      await updateProductApi(product.id, { isActive: newActiveState });
    } catch (err: any) {
      console.error("Failed to toggle product status", err);
      await loadProducts();
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Grocery',
      subcategory: '',
      price: '',
      unit: 'piece',
      stockQty: '10',
      sku: '',
      description: '',
      imageUrl: '',
      isActive: true
    });
    setAgentEmptyFields([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.title,
      category: product.category || 'Grocery',
      subcategory: product.subcategory || '',
      price: String(product.numericPrice || product.price.replace(/[^0-9.]/g, '')),
      unit: product.unit || 'piece',
      stockQty: String(product.stockQty),
      sku: product.sku || '',
      description: product.description || '',
      imageUrl: product.image || '',
      isActive: product.isActive
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      alert("Please enter a valid product name and price.");
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
        imageUrl: formData.imageUrl.trim() || undefined,
        isActive: formData.isActive
      };

      if (editingProduct) {
        await updateProductApi(editingProduct.id, payload);
      } else {
        await createProductApi(payload);
      }

      setIsModalOpen(false);
      await loadProducts();
    } catch (err: any) {
      alert(err?.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Deactivate product "${product.title}"?`)) {
      try {
        await deleteProductApi(product.id);
        await loadProducts();
      } catch (err: any) {
        alert(err?.message || 'Failed to delete product');
      }
    }
  };

  const uniqueCategories = Array.from(new Set(products.map(p => p.category || 'General')));

  const filteredProducts = products
    .filter(product => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && product.isActive) ||
        (statusFilter === 'Inactive' && !product.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'price_low') return a.numericPrice - b.numericPrice;
      if (sortBy === 'price_high') return b.numericPrice - a.numericPrice;
      return a.title.localeCompare(b.title);
    });

  return (
    <>
      <div className="flex flex-col w-full pb-12 relative z-10">
        {/* Glow background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display-lg text-display-lg text-on-surface mb-2 tracking-tight">Product Catalog Showcase</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Curate your store items, update pricing, organized by categories, and toggle visibility.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="bg-[#8C5A3B] hover:bg-[#7A4E33] text-white h-14 px-8 rounded-full flex items-center justify-center font-label-md text-label-md transition-all shadow-lg shadow-[#8C5A3B]/20 shrink-0 gap-2 font-bold"
          >
            <span className="material-symbols-outlined">add</span>
            Add Catalog Product
          </button>
        </div>

        {/* Page Capability Guide Banner (Rich Earthy Terracotta Brown to Forest Green Gradient) */}
        <div className="mb-8 p-6 rounded-[28px] bg-gradient-to-r from-[#734828] via-[#4D3524] to-[#253627] text-white shadow-xl relative overflow-hidden border border-[#8C5A3B]/40">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-white/10 text-[#E8F0E7] rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-white/15">
                  <span className="material-symbols-outlined text-[16px] text-emerald-400">inventory_2</span>
                  Product Catalog Hub
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">What You Can Do On This Page</h2>
              <p className="text-xs text-[#D1E2CF] mt-1 max-w-2xl leading-relaxed font-medium">
                Create & edit store catalog items, set retail pricing (₹), assign categories & units, configure SKU codes, and control online storefront availability.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 shrink-0">
              <button
                onClick={handleOpenAddModal}
                className="px-5 py-2.5 bg-[#8C5A3B] text-white hover:bg-[#7A4E33] rounded-xl font-black text-xs shadow-md transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                + Add Product
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#D1E2CF]">
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span> Set Retail Prices (₹)</span>
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span> Category & Subcategory Tagging</span>
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span> Toggle Active Storefront Visibility</span>
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span> Voice & Vision Camera Auto-Fill</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-surface-container-lowest p-6 rounded-[24px] shadow-[0_10px_30px_rgba(31,41,35,0.04)] mb-8 flex flex-wrap items-center justify-between gap-4 border border-outline/10">
          <div className="flex items-center gap-4 flex-1 flex-wrap">
            {/* Search Input */}
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, category, or SKU..."
                className="w-full bg-surface-container h-14 pl-12 pr-4 rounded-xl font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
              />
            </div>

            {/* Category Select */}
            <div className="flex items-center bg-surface-container h-14 px-4 rounded-xl">
              <span className="material-symbols-outlined text-outline mr-2 text-[20px]">category</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer pr-2"
              >
                <option value="All">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Active Status Filter */}
            <div className="flex items-center bg-surface-container h-14 p-1.5 rounded-xl border border-outline/10">
              {(['All', 'Active', 'Inactive'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-4 py-2 rounded-lg font-label-md text-[13px] transition-colors ${statusFilter === st ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By Select */}
          <div className="flex items-center bg-surface-container h-14 px-4 rounded-xl">
            <span className="material-symbols-outlined text-outline mr-2 text-[20px]">sort</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-transparent font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="name">Sort by Name</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 bg-surface-container-lowest rounded-3xl border border-outline/10">
            <span className="material-symbols-outlined text-primary text-[40px] animate-spin mb-3">sync</span>
            <p className="font-body-md text-on-surface-variant">Loading store product catalog...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-error-container/30 border border-error/20 rounded-2xl flex items-center justify-between">
            <span className="font-body-md text-on-surface">{error}</span>
            <button onClick={loadProducts} className="px-4 py-2 bg-error text-on-error rounded-full font-label-md">Retry</button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 bg-surface-container-lowest rounded-3xl border border-dashed border-outline/30 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline mb-3">inventory_2</span>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-1">No products found</h3>
            <p className="font-body-md text-on-surface-variant mb-6">Try adjusting your filters or search query.</p>
            <button onClick={handleOpenAddModal} className="px-6 py-3 bg-primary text-on-primary rounded-full font-label-md">
              Add New Product
            </button>
          </div>
        ) : (
          /* Product Catalog Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                onClick={() => handleOpenEditModal(product)}
                className={`bg-surface-container-lowest rounded-[24px] p-4 shadow-[0_10px_30px_rgba(31,41,35,0.04)] group hover:shadow-[0_20px_40px_rgba(31,41,35,0.08)] transition-all duration-300 flex flex-col relative overflow-hidden border border-outline/10 cursor-pointer ${!product.isActive ? 'opacity-65 grayscale-[30%]' : ''}`}
              >
                {/* Status Badges */}
                <div className="absolute top-6 left-6 z-10 flex flex-col gap-1 items-start">
                  <span className={product.status === "Healthy Stock" ? "bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full font-label-md text-[11px] font-semibold uppercase tracking-wider" : "bg-error-container text-on-error-container px-3 py-1 rounded-full font-label-md text-[11px] font-semibold uppercase tracking-wider"}>
                    {product.status}
                  </span>
                </div>

                {/* Active / Inactive Toggle Switch */}
                <div className="absolute top-6 right-6 z-20 flex items-center gap-2 bg-surface-container-lowest/90 backdrop-blur-md rounded-full px-3 py-1 border border-outline/20">
                  <span className="font-label-md text-[11px] font-semibold text-on-surface">
                    {product.isActive ? 'Active' : 'Hidden'}
                  </span>
                  <button
                    onClick={(e) => handleToggleActive(product, e)}
                    className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${product.isActive ? 'bg-primary' : 'bg-outline/40'}`}
                    title={product.isActive ? 'Deactivate Product' : 'Activate Product'}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${product.isActive ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </button>
                </div>

                {/* Product Image */}
                <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-surface-container-low mt-8">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={product.image}
                    alt={product.title}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col">
                  <p className="font-label-md text-label-md text-outline mb-1 uppercase tracking-wider font-semibold">{product.category}</p>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2 line-clamp-1 font-bold">{product.title}</h3>
                  {product.sku && <p className="font-body-md text-[12px] text-on-surface-variant/80 mb-2 font-mono">SKU: {product.sku}</p>}

                  <div className="flex items-end justify-between mt-auto pt-4 border-t border-outline/10">
                    <div>
                      <p className="font-stats-number text-stats-number text-on-surface font-bold">{product.price}</p>
                      <p className="font-body-md text-body-md text-on-surface-variant">per {product.unit}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenEditModal(product); }}
                      className="w-10 h-10 rounded-full bg-surface-container group-hover:bg-primary group-hover:text-on-primary flex items-center justify-center transition-colors text-on-surface-variant"
                      title="Edit Product & Pricing"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-[28px] max-w-xl w-full p-6 md:p-8 shadow-2xl border border-outline/10 my-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline/10">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                {editingProduct ? 'Edit Catalog Product' : 'Add Catalog Product'}
              </h2>
              <div className="flex items-center gap-2">
                {/* Snap & Fill with image agent */}
                <MerchantImageAgent
                  onFilled={(fills, partial) => {
                    if (partial) {
                      const filledIds = new Set(fills.map(f => f.fieldId));
                      const allFields = AgentUIRegistry.getFields();
                      setAgentEmptyFields(allFields.filter(f => !filledIds.has(f.id)).map(f => f.id));
                    } else {
                      setAgentEmptyFields([]);
                    }
                  }}
                  label="Snap & Fill"
                  className="px-4 py-2 bg-[#E8F0E7] text-[#496246] rounded-full font-label-md text-sm hover:bg-[#496246] hover:text-white transition-all flex items-center gap-2"
                />
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">
                  Product Name <span className="text-error">*</span>
                </label>
                <AgentInput
                  agentId="name"
                  agentLabel="Product Name"
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Premium Basmati Rice"
                  className={`w-full h-11 px-4 rounded-xl border font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                    agentEmptyFields.includes('name')
                      ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200'
                      : 'bg-surface-container border-outline/20'
                  }`}
                />
                {agentEmptyFields.includes('name') && (
                  <p className="mt-1 text-xs text-amber-600 font-medium">⚠ Please fill this field manually</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">Price (₹) <span className="text-error">*</span></label>
                  <AgentInput
                    agentId="price"
                    agentLabel="Price"
                    agentType="number"
                    type="number"
                    name="price"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="120"
                    className={`w-full h-11 px-4 rounded-xl border font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                      agentEmptyFields.includes('price')
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200'
                        : 'bg-surface-container border-outline/20'
                    }`}
                  />
                  {agentEmptyFields.includes('price') && (
                    <p className="mt-1 text-xs text-amber-600 font-medium">⚠ Price needed — enter manually</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl bg-surface-container border border-outline/20 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {['piece', 'kg', 'gram', 'litre', 'ml', 'meter', 'pack', 'box', 'bottle', 'other'].map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="e.g. GRC-8812"
                    className="w-full h-11 px-4 rounded-xl bg-surface-container border border-outline/20 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/product.jpg"
                  className="w-full h-11 px-4 rounded-xl bg-surface-container border border-outline/20 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">Description</label>
                <AgentInput
                  agentId="description"
                  agentLabel="Description"
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Catalog details or product specs..."
                  className="w-full h-11 px-4 rounded-xl bg-surface-container border border-outline/20 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <span className="font-body-md text-on-surface">Active on store front</span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-outline/10 mt-2">
                {editingProduct ? (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteProduct(editingProduct, e)}
                    className="px-4 py-2 text-error hover:bg-error-container/20 rounded-full font-label-md text-label-md"
                  >
                    Delete
                  </button>
                ) : <div></div>}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 rounded-full border border-outline/30 text-on-surface font-label-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-2.5 rounded-full bg-[#8C5A3B] hover:bg-[#7A4E33] text-white font-label-md shadow-md disabled:opacity-50 font-bold"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Product'}
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