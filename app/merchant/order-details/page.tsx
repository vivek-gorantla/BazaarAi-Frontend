import React from 'react';
import { getOrderDetailsData } from '@/services/merchantApi';

export default async function OrderDetails() {
  const details = await getOrderDetailsData();

  return (
    <>
      <div className="flex flex-col w-full h-full text-on-surface">
        <div className="flex flex-col xl:flex-row gap-6 h-full">
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex items-center justify-between bg-surface-container-low rounded-3xl p-card-padding shadow-[0_8px_24px_rgba(31,41,35,0.02)]">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-headline-lg text-headline-lg text-on-surface">Order #{details.orderId}</h1>
                  <span className="px-3 py-1 bg-secondary-container/50 text-on-secondary-container font-label-md text-label-md rounded-full">
                    {details.status}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span> {details.time}
                </p>
              </div>
              <div className="flex gap-4">
                <button className="h-[56px] px-8 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md rounded-xl transition-all flex items-center gap-2 shadow-[0_4px_12px_rgba(31,41,35,0.03)]">
                  <span className="material-symbols-outlined">print</span> Print Receipt
                </button>
                <button className="h-[56px] px-8 bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md rounded-xl transition-all flex items-center gap-2 shadow-[0_10px_20px_rgba(73,98,70,0.15)]">
                  <span className="material-symbols-outlined">check_circle</span> Mark Ready
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-container-lowest rounded-3xl p-card-padding shadow-[0_10px_30px_rgba(31,41,35,0.04)]">
                <h2 className="font-headline-md text-headline-md mb-6 flex items-center gap-3 text-primary">
                  <span className="material-symbols-outlined w-10 h-10 flex items-center justify-center bg-primary-fixed text-on-primary-fixed rounded-full text-[20px]">person</span>
                  Customer Details
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-surface-variant overflow-hidden shrink-0">
                      <img className="w-full h-full object-cover" src={details.customer.image} alt={details.customer.name} />
                    </div>
                    <div>
                      <p className="font-headline-md text-[20px] leading-tight text-on-surface mb-1">{details.customer.name}</p>
                      <div className="flex items-center gap-2 text-on-surface-variant font-body-md text-body-md">
                        <span className="material-symbols-outlined text-[18px]">call</span>
                        <span>{details.customer.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-outline-variant/30 flex items-start gap-3 text-on-surface-variant font-body-md text-body-md">
                    <span className="material-symbols-outlined text-[20px] text-outline mt-0.5">location_on</span>
                    <p dangerouslySetInnerHTML={{ __html: details.customer.address }}></p>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-3xl p-card-padding shadow-[0_10px_30px_rgba(31,41,35,0.04)]">
                <h2 className="font-headline-md text-headline-md mb-6 flex items-center gap-3 text-secondary">
                  <span className="material-symbols-outlined w-10 h-10 flex items-center justify-center bg-secondary-fixed text-on-secondary-fixed rounded-full text-[20px]">timeline</span>
                  Order Timeline
                </h2>
                <div className="relative pl-6 space-y-6 before:absolute before:inset-y-0 before:left-3 before:w-px before:bg-outline-variant/50">
                  {details.timeline.map((item, index) => {
                    if (item.type === 'completed') {
                      return (
                        <div key={index} className="relative">
                          <div className={`absolute -left-[23px] ${index === 0 ? '-left-6 w-3 h-3' : 'w-2.5 h-2.5'} rounded-full bg-primary ring-4 ring-surface-container-lowest`}></div>
                          <p className="font-label-md text-label-md text-primary mb-1">{item.time}</p>
                          <p className="font-body-md text-body-md text-on-surface">{item.title}</p>
                        </div>
                      );
                    } else if (item.type === 'current') {
                      return (
                        <div key={index} className="relative">
                          <div className="absolute -left-[25px] w-3.5 h-3.5 rounded-full bg-secondary ring-4 ring-secondary/20 shadow-[0_0_10px_rgba(254,191,149,0.5)] animate-pulse"></div>
                          <p className="font-label-md text-label-md text-secondary mb-1">{item.time}</p>
                          <p className="font-body-md text-body-md text-on-surface font-medium">{item.title}</p>
                        </div>
                      );
                    } else {
                      return (
                        <div key={index} className="relative opacity-40">
                          <div className="absolute -left-[23px] w-2.5 h-2.5 rounded-full bg-outline ring-4 ring-surface-container-lowest"></div>
                          <p className="font-label-md text-label-md text-outline mb-1">{item.time}</p>
                          <p className="font-body-md text-body-md text-on-surface">{item.title}</p>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-3xl p-card-padding shadow-[0_10px_30px_rgba(31,41,35,0.04)]">
              <h2 className="font-headline-md text-headline-md mb-6 text-on-surface">Order Items</h2>
              <div className="space-y-4">
                {details.items.map((item, index) => (
                  <div key={item.id} className={`flex items-center justify-between py-4 group ${index !== details.items.length - 1 ? 'border-b border-outline-variant/30' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-surface-container overflow-hidden">
                        <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
                      </div>
                      <div>
                        <p className="font-body-lg text-body-lg text-on-surface font-medium">{item.name}</p>
                        <p className="font-body-md text-body-md text-on-surface-variant">{item.details}</p>
                      </div>
                    </div>
                    <p className="font-body-lg text-body-lg text-on-surface font-medium">{item.total}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full xl:w-[400px] flex flex-col gap-6 shrink-0">
            <div className="bg-surface-container-lowest rounded-3xl p-card-padding shadow-[0_10px_30px_rgba(31,41,35,0.04)] relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-fixed/20 rounded-full blur-2xl"></div>
              <h2 className="font-headline-md text-headline-md mb-6 relative text-on-surface">Payment Summary</h2>
              <div className="space-y-4 font-body-md text-body-md text-on-surface-variant relative">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-on-surface">{details.summary.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="text-on-surface">{details.summary.delivery}</span>
                </div>
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>{details.summary.discount}</span>
                </div>
                <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-end mt-4">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Amount</span>
                  <span className="font-stats-number text-stats-number text-primary">{details.summary.total}</span>
                </div>
              </div>
            </div>

            <div className="bg-secondary-fixed/30 rounded-3xl p-card-padding shadow-sm border border-secondary-container/20 text-center">
              <div className="w-16 h-16 bg-surface-container-lowest rounded-full mx-auto mb-4 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[28px] text-secondary">moped</span>
              </div>
              <h3 className="font-headline-md text-[20px] text-on-surface mb-2">Assign Delivery</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">Order is currently being prepared. Assign a delivery partner to ensure swift dispatch.</p>
              <button className="w-full h-[56px] bg-secondary hover:bg-secondary/90 text-on-secondary font-label-md text-label-md rounded-xl transition-all shadow-md shadow-secondary/20">
                Assign Partner
              </button>
            </div>

            <div className="bg-surface-container rounded-3xl p-6 shadow-inner text-center">
              <p className="font-label-md text-label-md text-outline uppercase tracking-wider mb-2">Merchant Notes</p>
              <p className="font-body-md text-body-md text-on-surface-variant italic">{details.notes}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}