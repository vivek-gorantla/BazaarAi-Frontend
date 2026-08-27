import React from 'react';
import { getStoreProfileData } from '@/services/merchantApi';

export default async function StoreProfile() {
  const profile = await getStoreProfileData();

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="relative w-full h-[320px] rounded-2xl overflow-hidden shadow-xl mb-12">
          <div className="absolute inset-0 bg-cover bg-center w-full h-full" style={{backgroundImage: `url(${profile.heroImage})`}}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface-inverse/80 via-surface-inverse/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full p-card-padding flex items-end justify-between">
            <div className="flex items-end gap-6">
              <div className="w-32 h-32 rounded-2xl bg-surface-container-lowest p-2 shadow-lg flex items-center justify-center -mb-8 relative z-10">
                <img className="w-full h-full object-contain rounded-xl" src={profile.logo} alt={profile.name} />
              </div>
              <div className="pb-2 text-on-surface">
                <h1 className="font-display-lg text-display-lg text-on-surface mb-2 drop-shadow-md bg-surface-container-lowest px-4 py-1 rounded-lg inline-block">{profile.name}</h1>
                <div className="flex items-center gap-4 drop-shadow-sm bg-surface-container-lowest/90 backdrop-blur-md px-4 py-2 rounded-full inline-flex mt-2">
                  <div className="flex items-center gap-1 text-secondary">
                    <span className="material-symbols-outlined text-[20px]" >star</span>
                    <span className="font-label-md text-label-md">{profile.rating}</span>
                    <span className="font-body-md text-body-md text-on-surface-variant ml-1">{profile.reviews}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-outline-variant"></div>
                  <div className="flex items-center gap-1 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    <span className="font-body-md text-body-md">{profile.location}</span>
                  </div>
                </div>
              </div>
            </div>
            <button className="bg-primary text-on-primary font-label-md text-label-md h-14 px-8 rounded-xl shadow-md hover:shadow-lg hover:bg-primary-container transition-all flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined">edit</span>
              Edit Profile
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-gutter px-4 mb-section-gap">
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-gutter">
            <div className="bg-surface-container-lowest rounded-[24px] p-card-padding shadow-[0_10px_30px_rgba(31,41,35,0.04)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                  <span className="material-symbols-outlined">info</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface">Business Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <span className="font-label-md text-label-md text-outline uppercase tracking-widest">Category</span>
                  <div className="flex items-center gap-2 font-body-lg text-body-lg text-on-surface">
                    <span className="material-symbols-outlined text-tertiary">local_mall</span>
                    {profile.category}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-label-md text-label-md text-outline uppercase tracking-widest">Owner Name</span>
                  <div className="flex items-center gap-2 font-body-lg text-body-lg text-on-surface">
                    <span className="material-symbols-outlined text-tertiary">person</span>
                    {profile.ownerName}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-label-md text-label-md text-outline uppercase tracking-widest">Phone Number</span>
                  <div className="flex items-center gap-2 font-body-lg text-body-lg text-on-surface">
                    <span className="material-symbols-outlined text-tertiary">call</span>
                    {profile.phone}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-label-md text-label-md text-outline uppercase tracking-widest">Email Address</span>
                  <div className="flex items-center gap-2 font-body-lg text-body-lg text-on-surface">
                    <span className="material-symbols-outlined text-tertiary">mail</span>
                    {profile.email}
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-outline-variant/30">
                <div className="flex flex-col gap-2">
                  <span className="font-label-md text-label-md text-outline uppercase tracking-widest mb-2">About Store</span>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed max-w-3xl">
                    {profile.about}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-[24px] p-card-padding shadow-[0_10px_30px_rgba(31,41,35,0.04)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                  <span className="material-symbols-outlined">settings</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface">Store Operations</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface rounded-xl p-6 hover:bg-surface-container transition-colors group cursor-pointer relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="material-symbols-outlined text-[120px]">schedule</span>
                  </div>
                  <div className="flex flex-col relative z-10">
                    <span className="font-label-md text-label-md text-on-surface-variant mb-1">Operating Hours</span>
                    <span className="font-headline-md text-headline-md text-primary mb-2">{profile.operations.hours}</span>
                    <span className="font-body-md text-body-md text-outline">{profile.operations.hoursSub}</span>
                  </div>
                </div>
                <div className="bg-surface rounded-xl p-6 hover:bg-surface-container transition-colors group cursor-pointer relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="material-symbols-outlined text-[120px]">my_location</span>
                  </div>
                  <div className="flex flex-col relative z-10">
                    <span className="font-label-md text-label-md text-on-surface-variant mb-1">Delivery Radius</span>
                    <span className="font-headline-md text-headline-md text-secondary mb-2">{profile.operations.deliveryRadius}</span>
                    <span className="font-body-md text-body-md text-outline">{profile.operations.deliverySub}</span>
                  </div>
                </div>
                <div className="bg-surface rounded-xl p-6 hover:bg-surface-container transition-colors group cursor-pointer relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="material-symbols-outlined text-[120px]">payments</span>
                  </div>
                  <div className="flex flex-col relative z-10">
                    <span className="font-label-md text-label-md text-on-surface-variant mb-1">Minimum Order</span>
                    <span className="font-headline-md text-headline-md text-primary mb-2">{profile.operations.minimumOrder}</span>
                    <span className="font-body-md text-body-md text-outline">{profile.operations.minimumSub}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-gutter">
            <div className="bg-surface-container-lowest rounded-[24px] p-card-padding shadow-[0_10px_30px_rgba(31,41,35,0.04)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container/20 rounded-bl-full -mr-10 -mt-10 blur-2xl"></div>
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h2 className="font-headline-md text-headline-md text-on-surface">Store Preview</h2>
                <button className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors">
                  <span className="material-symbols-outlined">open_in_new</span>
                </button>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6 relative z-10">
                This is how your store appears to customers on the Bazaar app. Ensure your imagery and details are up to date to attract more local buyers.
              </p>
              <div className="bg-inverse-surface rounded-2xl p-4 shadow-xl relative z-10 mx-auto max-w-[280px] w-full">
                <div className="bg-surface-container-lowest rounded-xl overflow-hidden flex flex-col h-[400px]">
                  <div className="h-32 bg-cover bg-center w-full" style={{backgroundImage: `url(${profile.preview.image})`}}></div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-headline-md text-headline-md text-on-surface leading-tight text-lg">{profile.name}</h3>
                      <div className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]" >star</span> {profile.rating}
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-4">{profile.category} • {profile.preview.distance}</p>
                    <div className="flex gap-2 mb-4 overflow-x-auto custom-scrollbar pb-1">
                      {profile.preview.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-surface-container rounded-md text-xs whitespace-nowrap text-on-surface">{tag}</span>
                      ))}
                    </div>
                    <div className="mt-auto space-y-2">
                      <div className="h-12 bg-surface-container-highest rounded-lg animate-pulse"></div>
                      <div className="h-12 bg-surface-container-highest rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-center relative z-10">
                <button className="text-primary font-label-md text-label-md hover:text-primary-container transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  View Full Preview
                </button>
              </div>
            </div>

            <div className="bg-secondary rounded-[24px] p-card-padding shadow-lg text-on-secondary relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/90 to-on-secondary-fixed/50 z-0"></div>
              <svg className="absolute -bottom-10 -right-10 w-48 h-48 text-secondary-container opacity-20 z-0 transform rotate-12" fill="currentColor" viewBox="0 0 200 200">
                <path d="M45.7,-76.4C58.9,-69.3,69.5,-55.4,78.2,-41.2C86.9,-27,93.6,-13.5,91.8,-1.1C90.1,11.3,79.9,22.6,71.2,33.5C62.5,44.4,55.3,55.1,44.7,63.1C34.1,71.1,20.1,76.5,5.1,68.4C-9.9,60.3,-26.1,38.7,-38.4,22.8C-50.7,6.9,-59,-3.3,-58.5,-12.3C-58.1,-21.3,-48.9,-29.1,-39.7,-36.8C-30.5,-44.5,-21.3,-52.1,-9.4,-57.4C2.5,-62.7,14.9,-65.7,29.1,-70.7C43.3,-75.7,32.5,-83.5,45.7,-76.4Z" transform="translate(100 100)"></path>
              </svg>
              <div className="relative z-10 flex flex-col items-start">
                <div className="w-12 h-12 bg-on-secondary/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[24px]">campaign</span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-2">Boost Your Reach</h3>
                <p className="font-body-md text-body-md text-on-secondary/90 mb-6">
                  Run localized promotions to reach more customers within your 5km radius.
                </p>
                <button className="bg-on-secondary text-secondary font-label-md text-label-md h-12 px-6 rounded-xl hover:bg-surface-container-lowest transition-colors w-full shadow-sm">
                  Create Promotion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}