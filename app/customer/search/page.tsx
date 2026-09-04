"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "../../components/customer/ProductCard";
import { customerApi, Product } from "../../../services/customerApi";

function CustomerSearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || searchParams.get("category") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    customerApi
      .searchProducts({
        q: query,
        category: selectedCategory,
        minRating: selectedRating,
        maxPrice
      })
      .then((data) => {
        if (isMounted) {
          setProducts(data);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [query, selectedCategory, selectedRating, maxPrice]);

  const categories = ["All", "Groceries", "Fresh Produce", "Dairy & Milk", "Beverages", "Bakery & Treats"];

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 min-h-screen">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-surface-container-high">
        <div>
          <h1 className="font-headline-lg text-2xl lg:text-3xl font-bold text-on-surface">
            {query ? `Search results for "${query}"` : "All Products"}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Found {sortedProducts.length} items from nearby stores
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-surface-container rounded-full text-xs font-semibold text-on-surface border border-surface-container-high cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filters
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-on-surface-variant hidden sm:inline">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-surface-container border border-surface-container-high rounded-full px-4 py-2 text-xs font-semibold text-on-surface focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0 bg-surface-container-low p-6 rounded-3xl border border-surface-container-high shadow-xs sticky top-36">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-md text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
              Filters
            </h3>
            {(selectedCategory !== "All" || selectedRating > 0 || maxPrice < 1000) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedRating(0);
                  setMaxPrice(1000);
                }}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
              Category
            </h4>
            <div className="space-y-2">
              {categories.map((cat) => (
                <label key={cat} className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                    className="accent-primary"
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Max Price Slider */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Max Price
              </h4>
              <span className="text-xs font-bold text-primary">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="50"
              max="1000"
              step="25"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* Minimum Rating */}
          <div>
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
              Minimum Rating
            </h4>
            <div className="space-y-2">
              {[0, 4.5, 4.0, 3.5].map((stars) => (
                <label key={stars} className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={selectedRating === stars}
                    onChange={() => setSelectedRating(stars)}
                    className="accent-primary"
                  />
                  <span>{stars === 0 ? "All Ratings" : `${stars}+ Stars ⭐`}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Results Grid */}
        <div className="flex-1 w-full">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-72 bg-surface-container animate-pulse rounded-3xl" />
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-low rounded-3xl p-12 text-center flex flex-col items-center justify-center border border-surface-container-high">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-3">
                search_off
              </span>
              <h3 className="font-headline-md text-lg text-on-surface mb-1">
                No matching products found
              </h3>
              <p className="text-xs text-on-surface-variant max-w-sm mb-6">
                Try adjusting your search terms or clearing price and category filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelectedCategory("All");
                  setSelectedRating(0);
                  setMaxPrice(1000);
                }}
                className="px-6 py-2.5 bg-primary text-on-primary text-xs font-semibold rounded-full hover:bg-primary-container transition-colors shadow-xs"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CustomerSearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12 text-center text-sm font-bold text-gray-500">Loading search...</div>}>
      <CustomerSearchContent />
    </Suspense>
  );
}
