import React from 'react';
import { getProducts } from '@/services/merchantApi';

export default async function Products() {
  const products = await getProducts();

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-display-lg text-display-lg text-on-surface mb-2 tracking-tight">Products</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">Manage everything you sell. Keep track of your inventory, pricing, and performance.</p>
          </div>
          <button className="bg-primary hover:bg-primary/90 text-on-primary h-14 px-8 rounded-full flex items-center justify-center font-label-md text-label-md transition-all shadow-lg shadow-primary/20 shrink-0">
            <span className="material-symbols-outlined mr-2">add</span>
            Add Product
          </button>
        </div>
        
        <div className="bg-surface-container-lowest p-6 rounded-[24px] shadow-[0_10px_30px_rgba(31,41,35,0.04)] mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input className="w-full bg-surface-container h-14 pl-12 pr-4 rounded-xl font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary transition-shadow" placeholder="Search by name, category, or SKU..." type="text" />
            </div>
            <div className="flex items-center gap-2">
              <button className="h-14 px-6 bg-surface-container hover:bg-surface-container-high rounded-xl flex items-center font-label-md text-label-md text-on-surface-variant transition-colors">
                Categories
                <span className="material-symbols-outlined ml-2 text-[20px]">expand_more</span>
              </button>
              <button className="h-14 px-6 bg-surface-container hover:bg-surface-container-high rounded-xl flex items-center font-label-md text-label-md text-on-surface-variant transition-colors">
                Stock Status
                <span className="material-symbols-outlined ml-2 text-[20px]">expand_more</span>
              </button>
            </div>
          </div>
          <button className="h-14 px-6 border border-outline-variant rounded-xl flex items-center font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-colors shrink-0">
            <span className="material-symbols-outlined mr-2">sort</span>
            Sort by: Newest
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-surface-container-lowest rounded-[24px] p-4 shadow-[0_10px_30px_rgba(31,41,35,0.04)] group hover:shadow-[0_20px_40px_rgba(31,41,35,0.08)] transition-all duration-300 flex flex-col relative overflow-hidden">
              <div className="absolute top-6 left-6 z-10 flex gap-2">
                <span className={product.status === "Healthy Stock" ? "bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md text-[12px]" : "bg-error/10 text-error px-3 py-1 rounded-full font-label-md text-[12px]"}>
                  {product.status}
                </span>
              </div>
              <button className="absolute top-6 right-6 z-10 w-10 h-10 bg-surface-container-lowest/80 backdrop-blur-md rounded-full flex items-center justify-center text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary">
                <span className="material-symbols-outlined">edit</span>
              </button>
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-surface-container-low">
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={product.image} alt={product.title} />
              </div>
              <div className="flex-1 flex flex-col">
                <p className="font-label-md text-label-md text-outline mb-1 uppercase tracking-wider">{product.category}</p>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2 line-clamp-1">{product.title}</h3>
                <div className="flex items-end justify-between mt-auto pt-4">
                  <div>
                    <p className="font-stats-number text-stats-number text-on-surface">{product.price}</p>
                    <p className="font-body-md text-body-md text-on-surface-variant">{product.unit}</p>
                  </div>
                  <div className={`flex items-center ${product.trendType === 'up' ? 'text-primary bg-primary/10' : 'text-secondary bg-secondary/10'} px-3 py-1.5 rounded-lg`}>
                    <span className="material-symbols-outlined text-[16px] mr-1">
                      {product.trendType === 'up' ? 'trending_up' : 'trending_down'}
                    </span>
                    <span className="font-label-md text-label-md">{product.trendValue}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}