import React from 'react';
import { getOrders } from '@/services/merchantApi';

export default async function Orders() {
  const orders = await getOrders();

  return (
    <>
      <div className="flex flex-col w-full h-full gap-section-gap pb-section-gap">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="flex flex-col gap-2 max-w-2xl">
            <h1 className="font-display-lg text-display-lg text-on-surface">Orders</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Manage every Bazaar order from one place.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="h-14 px-8 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-fixed-dim hover:text-on-primary-fixed transition-colors shadow-sm flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[20px]">visibility</span>
              View active orders
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-gutter px-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar">
            <button className="h-10 px-6 rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md whitespace-nowrap transition-colors hover:bg-surface-variant flex items-center gap-2">
              All
            </button>
            <button className="h-10 px-6 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md whitespace-nowrap transition-colors hover:bg-surface-container-high flex items-center gap-2">
              New <span className="bg-primary text-on-primary px-2 py-0.5 rounded-full text-xs">4</span>
            </button>
            <button className="h-10 px-6 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md whitespace-nowrap transition-colors hover:bg-surface-container-high flex items-center gap-2">
              Preparing <span className="bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded-full text-xs">12</span>
            </button>
            <button className="h-10 px-6 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md whitespace-nowrap transition-colors hover:bg-surface-container-high flex items-center gap-2">
              Ready <span className="bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded-full text-xs">3</span>
            </button>
            <button className="h-10 px-6 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md whitespace-nowrap transition-colors hover:bg-surface-container-high flex items-center gap-2">
              Delivered
            </button>
            <button className="h-10 px-6 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md whitespace-nowrap transition-colors hover:bg-surface-container-high flex items-center gap-2">
              Cancelled
            </button>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl p-card-padding shadow-md shadow-primary/5 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-headline-md text-on-surface">Recent Orders</h2>
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-variant text-on-surface-variant transition-colors">
                  <span className="material-symbols-outlined text-[20px]">filter_list</span>
                </button>
                <button className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-variant text-on-surface-variant transition-colors">
                  <span className="material-symbols-outlined text-[20px]">sort</span>
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left min-w-[1000px] border-collapse">
                <thead>
                  <tr className="text-label-md font-label-md text-outline uppercase tracking-widest border-b border-surface-variant">
                    <th className="py-4 pl-4 pr-6 rounded-tl-xl font-medium">Order ID</th>
                    <th className="py-4 px-6 font-medium">Customer</th>
                    <th className="py-4 px-6 font-medium">Products</th>
                    <th className="py-4 px-6 font-medium text-right">Total</th>
                    <th className="py-4 px-6 font-medium text-center">Payment</th>
                    <th className="py-4 px-6 font-medium text-center">Status</th>
                    <th className="py-4 px-6 font-medium">Time</th>
                    <th className="py-4 pr-4 pl-6 rounded-tr-xl font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface align-middle">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-surface-container-low transition-colors group cursor-pointer border-b border-surface-container">
                      <td className="py-4 pl-4 pr-6 whitespace-nowrap">
                        <span className="font-headline-md text-[18px] text-primary">{order.id}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${order.customerColorClass} flex items-center justify-center font-bold text-[14px]`}>
                            {order.customerInitials}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-on-surface">{order.customerName}</span>
                            <span className="text-[14px] text-on-surface-variant">{order.customerPhone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-[200px]">
                        <p className="truncate text-on-surface-variant">{order.productsSummary}</p>
                        <p className="text-[12px] text-outline mt-1">{order.itemsCount}</p>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <span className="font-stats-number text-[20px] text-on-surface">{order.total}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center justify-center bg-surface-container px-3 py-1 rounded-full gap-1">
                          <span className={`material-symbols-outlined text-[16px] ${order.paymentIconColor}`}>{order.paymentIcon}</span>
                          <span className="text-[13px] font-medium text-on-surface-variant">{order.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center justify-center ${order.statusClass} px-3 py-1 rounded-full text-[13px] font-bold tracking-wide`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-on-surface-variant">
                        {order.time}
                      </td>
                      <td className="py-4 pr-4 pl-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-variant text-on-surface-variant flex items-center justify-center transition-colors">
                            <span className="material-symbols-outlined text-[20px]">print</span>
                          </button>
                          {order.status === 'PREPARING' && (
                            <button className="w-10 h-10 rounded-full bg-primary text-on-primary hover:bg-primary-fixed-dim hover:text-on-primary-fixed flex items-center justify-center transition-colors">
                              <span className="material-symbols-outlined text-[20px]">check</span>
                            </button>
                          )}
                          {order.status === 'NEW' && (
                            <button className="w-10 h-10 rounded-full bg-primary text-on-primary hover:bg-primary-fixed-dim hover:text-on-primary-fixed flex items-center justify-center transition-colors">
                              <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                            </button>
                          )}
                          {order.status === 'READY' && (
                            <button className="w-10 h-10 rounded-full bg-secondary text-on-secondary hover:bg-secondary-container hover:text-on-secondary-container flex items-center justify-center transition-colors">
                              <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="hidden bg-surface-container-lowest rounded-3xl p-card-padding shadow-md shadow-primary/5 flex-col items-center justify-center py-20 text-center">
            <div className="w-48 h-48 mb-6 relative">
              <svg className="w-full h-full text-surface-container-highest" fill="currentColor" viewBox="0 0 200 200">
                <path className="text-surface-variant" d="M40,70 L160,70 L170,170 C170.552,175.523 166.477,180 160.941,180 L39.059,180 C33.523,180 29.448,175.523 30,170 L40,70 Z"></path>
                <path className="text-surface-dim" d="M70,70 C70,40 130,40 130,70" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="12"></path>
                <circle className="text-primary-fixed-dim" cx="100" cy="110" opacity="0.5" r="20"></circle>
              </svg>
            </div>
            <h3 className="font-headline-lg text-headline-lg text-on-surface mb-2">No orders right now</h3>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">When customers place new orders, they will appear here. Enjoy the calm while it lasts!</p>
          </div>
        </div>
      </div>
    </>
  );
}