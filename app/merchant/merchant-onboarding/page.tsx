import React from 'react';

export default function MerchantOnboarding() {
  return (
    <>
      <div className="flex flex-col w-full h-full relative">
<div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
<svg className="absolute -top-[20%] -right-[10%] w-[80%] h-auto text-primary-fixed-dim/20 mix-blend-multiply" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<path d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,89.1,-0.5C88.1,15.3,83.5,30.6,75.2,43.6C66.9,56.6,54.9,67.3,41.2,74.5C27.5,81.7,13.7,85.5,-0.3,86.1C-14.3,86.6,-28.7,83.9,-41.8,76.9C-54.9,69.9,-66.8,58.7,-75.1,45.2C-83.3,31.7,-88.1,15.8,-88.7,-0.3C-89.3,-16.5,-85.7,-33,-77.3,-46.3C-68.9,-59.6,-55.8,-69.7,-41.7,-77C-27.6,-84.3,-13.8,-88.7,0.6,-89.7C15.1,-90.6,30.3,-83.6,44.7,-76.4Z" fill="currentColor" transform="translate(100 100)"></path>
</svg>
<svg className="absolute -bottom-[20%] -left-[10%] w-[60%] h-auto text-secondary-container/20 mix-blend-multiply" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<path d="M37.3,-62.7C48.2,-55.8,56.8,-44.6,63.9,-32.1C71,-19.6,76.5,-5.8,74.5,7C72.6,19.8,63.2,31.6,53,41.3C42.8,51,31.8,58.6,19.3,64.4C6.7,70.2,-7.4,74.3,-20.9,71.6C-34.4,68.9,-47.3,59.4,-57.4,47.3C-67.6,35.2,-74.9,20.5,-77.8,4.7C-80.7,-11.1,-79,-28,-70.7,-40.7C-62.5,-53.4,-47.7,-61.9,-33.5,-67.2C-19.3,-72.5,-5.6,-74.6,6.7,-74C19,-73.4,31,-70,41.6,-61.7L37.3,-62.7Z" fill="currentColor" transform="translate(100 100)"></path>
</svg>
</div>
<div className="relative z-10 flex flex-col gap-section-gap max-w-7xl mx-auto w-full">
<header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-12 pb-8">
<div className="flex flex-col gap-2 max-w-2xl">
<div className="flex items-center gap-3 mb-2">
<span className="px-3 py-1 bg-surface-variant text-on-surface-variant rounded-full text-label-md font-label-md uppercase tracking-widest">Store Setup</span>
<span className="flex items-center gap-1 text-primary text-label-md font-label-md bg-primary/10 px-3 py-1 rounded-full">
<span className="material-symbols-outlined text-[16px]">celebration</span> You're almost there!
                    </span>
</div>
<h1 className="text-display-lg font-display-lg text-on-surface">Complete your setup</h1>
<p className="text-body-lg font-body-lg text-on-surface-variant mt-2">Just a few more details to unlock your store's full potential and start selling to your local community.</p>
</div>
<div className="bg-surface-container-low rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col items-center justify-center min-w-[240px] relative overflow-hidden group">
<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
<div className="relative w-32 h-32 mb-4">
<svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
<circle className="text-surface-variant" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="8"></circle>
<circle className="text-primary transition-all duration-1500 ease-out drop-shadow-sm" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeDasharray="283" strokeDashoffset="79" strokeWidth="8"></circle>
</svg>
<div className="absolute inset-0 flex items-center justify-center flex-col">
<span className="text-stats-number font-stats-number text-primary">72<span className="text-headline-md">%</span></span>
</div>
</div>
<p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-widest">Overall Progress</p>
</div>
</header>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
<div className="lg:col-span-8 flex flex-col gap-8">
<div className="relative">
<div className="absolute left-8 top-12 bottom-12 w-0.5 bg-surface-variant/50 z-0 hidden sm:block"></div>
<div className="flex flex-col gap-6 relative z-10">
<div className="flex gap-4 sm:gap-8 opacity-60 hover:opacity-100 transition-opacity group">
<div className="hidden sm:flex flex-col items-center mt-2 relative z-10">
<div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-sm text-on-primary">
<span className="material-symbols-outlined text-[28px]">check</span>
</div>
</div>
<div className="flex-1 bg-surface-container-low rounded-2xl p-card-padding shadow-sm group-hover:shadow-md transition-shadow">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
<div>
<p className="text-label-md font-label-md text-primary mb-1 uppercase tracking-widest">Step 1</p>
<h3 className="text-headline-md font-headline-md text-on-surface">Business Details</h3>
</div>
<span className="bg-surface-variant text-on-surface-variant px-4 py-1.5 rounded-full text-label-md font-label-md self-start sm:self-auto">Completed</span>
</div>
<p className="text-body-md font-body-md text-on-surface-variant">Legal name, tax information, and primary contact details set.</p>
</div>
</div>
<div className="flex gap-4 sm:gap-8 opacity-60 hover:opacity-100 transition-opacity group">
<div className="hidden sm:flex flex-col items-center mt-2 relative z-10">
<div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-sm text-on-primary">
<span className="material-symbols-outlined text-[28px]">check</span>
</div>
</div>
<div className="flex-1 bg-surface-container-low rounded-2xl p-card-padding shadow-sm group-hover:shadow-md transition-shadow">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
<div>
<p className="text-label-md font-label-md text-primary mb-1 uppercase tracking-widest">Step 2</p>
<h3 className="text-headline-md font-headline-md text-on-surface">Store Identity</h3>
</div>
<span className="bg-surface-variant text-on-surface-variant px-4 py-1.5 rounded-full text-label-md font-label-md self-start sm:self-auto">Completed</span>
</div>
<p className="text-body-md font-body-md text-on-surface-variant">Logo, branding colors, and merchant description finalized.</p>
</div>
</div>
<div className="flex gap-4 sm:gap-8 opacity-60 hover:opacity-100 transition-opacity group">
<div className="hidden sm:flex flex-col items-center mt-2 relative z-10">
<div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-sm text-on-primary">
<span className="material-symbols-outlined text-[28px]">check</span>
</div>
</div>
<div className="flex-1 bg-surface-container-low rounded-2xl p-card-padding shadow-sm group-hover:shadow-md transition-shadow">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
<div>
<p className="text-label-md font-label-md text-primary mb-1 uppercase tracking-widest">Step 3</p>
<h3 className="text-headline-md font-headline-md text-on-surface">Location &amp; Delivery</h3>
</div>
<span className="bg-surface-variant text-on-surface-variant px-4 py-1.5 rounded-full text-label-md font-label-md self-start sm:self-auto">Completed</span>
</div>
<p className="text-body-md font-body-md text-on-surface-variant">Store coordinates mapped and local delivery radius configured to 5km.</p>
</div>
</div>
<div className="flex gap-4 sm:gap-8 relative z-10 transform sm:-translate-x-2 transition-transform duration-300">
<div className="hidden sm:flex flex-col items-center mt-2">
<div className="w-20 h-20 rounded-full bg-surface-container-lowest border-4 border-primary flex items-center justify-center shadow-lg relative">
<span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full animate-pulse"></span>
<span className="material-symbols-outlined text-[32px] text-primary">inventory_2</span>
</div>
</div>
<div className="flex-1 bg-surface-container-lowest rounded-3xl p-card-padding shadow-[0_10px_30px_rgba(73,98,70,0.12)] border border-primary/20 relative overflow-hidden group">
<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary-container/10 opacity-50 pointer-events-none"></div>
<div className="relative z-10">
<div className="flex flex-col sm:flex-row justify-between gap-6 mb-6">
<div>
<p className="text-label-md font-label-md text-secondary mb-2 uppercase tracking-widest flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-secondary"></span> Current Step
                                            </p>
<h3 className="text-display-lg font-display-lg text-on-surface leading-none -ml-1">Product Catalog</h3>
</div>
<div className="text-right flex flex-col items-start sm:items-end">
<span className="text-headline-lg font-headline-lg text-primary">45<span className="text-body-lg text-on-surface-variant">/50</span></span>
<span className="text-label-md font-label-md text-on-surface-variant">Minimum items required</span>
</div>
</div>
<p className="text-body-lg font-body-lg text-on-surface-variant mb-8 max-w-lg">Upload your core inventory. A diverse starting catalog helps attract initial local customers searching for daily essentials.</p>
<div className="mb-8">
<div className="h-3 bg-surface-variant rounded-full overflow-hidden mb-3">
<div className="h-full bg-primary rounded-full transition-all duration-1000 ease-in-out relative" >
<div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" ></div>
</div>
</div>
<div className="flex justify-between text-label-md font-label-md text-on-surface-variant">
<span>Just 5 more items to go!</span>
<span className="text-primary font-bold">90% Complete</span>
</div>
</div>
<div className="flex flex-col sm:flex-row gap-4">
<button className="h-14 px-8 bg-primary hover:bg-primary-fixed-variant text-on-primary rounded-xl font-headline-md text-[18px] transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 transform hover:-translate-y-1">
<span className="material-symbols-outlined">add_circle</span> Add Product
                                        </button>
<button className="h-14 px-8 bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-on-secondary rounded-xl font-headline-md text-[18px] transition-all flex items-center justify-center gap-2">
<span className="material-symbols-outlined">upload_file</span> Bulk Import CSV
                                        </button>
</div>
</div>
<div className="absolute -right-12 -bottom-12 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>
</div>
</div>
<div className="flex gap-4 sm:gap-8 opacity-50 group">
<div className="hidden sm:flex flex-col items-center mt-2 relative z-10">
<div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-outline">
<span className="text-headline-md font-headline-md">5</span>
</div>
</div>
<div className="flex-1 bg-surface-container border border-outline-variant/30 rounded-2xl p-card-padding transition-all">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
<div>
<p className="text-label-md font-label-md text-outline mb-1 uppercase tracking-widest">Step 5</p>
<h3 className="text-headline-md font-headline-md text-on-surface-variant">Payments &amp; Bank</h3>
</div>
<span className="bg-surface-variant text-on-surface-variant px-4 py-1.5 rounded-full text-label-md font-label-md self-start sm:self-auto border border-outline-variant/30">Pending</span>
</div>
<p className="text-body-md font-body-md text-on-surface-variant">Link your business bank account to receive daily payouts from local orders.</p>
</div>
</div>
<div className="flex gap-4 sm:gap-8 opacity-50 group">
<div className="hidden sm:flex flex-col items-center mt-2 relative z-10">
<div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-outline">
<span className="text-headline-md font-headline-md">6</span>
</div>
</div>
<div className="flex-1 bg-surface-container border border-outline-variant/30 rounded-2xl p-card-padding transition-all">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
<div>
<p className="text-label-md font-label-md text-outline mb-1 uppercase tracking-widest">Step 6</p>
<h3 className="text-headline-md font-headline-md text-on-surface-variant">Staff Setup</h3>
</div>
<span className="bg-surface-variant text-on-surface-variant px-4 py-1.5 rounded-full text-label-md font-label-md self-start sm:self-auto border border-outline-variant/30">Pending</span>
</div>
<p className="text-body-md font-body-md text-on-surface-variant">Add employee accounts and set till access permissions.</p>
</div>
</div>
<div className="flex gap-4 sm:gap-8 opacity-40 grayscale group">
<div className="hidden sm:flex flex-col items-center mt-2 relative z-10">
<div className="w-16 h-16 rounded-full bg-surface-variant flex items-center justify-center text-outline-variant">
<span className="material-symbols-outlined">lock</span>
</div>
</div>
<div className="flex-1 bg-surface border border-outline-variant/20 rounded-2xl p-card-padding border-dashed">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
<div>
<h3 className="text-headline-md font-headline-md text-outline">Go Live!</h3>
</div>
<span className="flex items-center gap-2 text-outline text-label-md font-label-md self-start sm:self-auto">
<span className="material-symbols-outlined text-[16px]">lock</span> Locked
                                    </span>
</div>
<p className="text-body-md font-body-md text-outline">Complete all previous steps to activate your storefront on the Bazaar local app.</p>
</div>
</div>
</div>
</div>
</div>
<div className="lg:col-span-4 flex flex-col gap-6 sticky top-28">
<div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/10 overflow-hidden relative group">
<div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container/20 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
<div className="flex items-center gap-4 mb-4">
<div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center text-on-secondary-container">
<span className="material-symbols-outlined text-[24px]">support_agent</span>
</div>
<div>
<h4 className="text-headline-md font-headline-md text-on-surface">Need help?</h4>
<p className="text-body-md font-body-md text-on-surface-variant">Your local rep is here.</p>
</div>
</div>
<div className="flex items-center gap-3 bg-surface p-3 rounded-xl border border-outline-variant/20 mb-4">
<img className="w-10 h-10 rounded-full object-cover shadow-sm" data-alt="A warm, professional headshot of a friendly customer support representative with a soft sage green background. They are wearing a neat collared shirt and smiling reassuringly." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIoXlxZTK5uA5JNvjk3TzKtMGJ33kd--rlU-BS1R08flXEj0cijZm_JSYHMU5x_DRMBCmTTe2eCQs6PlX6TVdeMxnNralq-saA1iig5SNFUe8mlGpliVzEiTA0vNBRek8HGaNts4EIED1ma8cgkPTSe4oDsBDLso2ynIFZgTqTnPe-gI8QwQhCaGtXqXByYpWA9fEoQRGVWMIguolqhJqSXghkzrIRMqz6IcNqmHz_veU9fJcquUVh" />
<div>
<p className="text-label-md font-label-md text-on-surface">Sarah Jenkins</p>
<p className="text-xs text-on-surface-variant">Onboarding Specialist</p>
</div>
</div>
<button className="w-full h-12 bg-surface-variant hover:bg-surface-container-highest text-on-surface rounded-xl font-label-md text-label-md transition-colors flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-[18px]">chat</span> Chat with Sarah
                    </button>
</div>
<div className="bg-inverse-surface text-inverse-on-surface rounded-3xl p-8 relative overflow-hidden">
<div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-luminosity" data-alt="A bustling local farmers market setting bathed in golden hour sunlight. Fresh produce displayed neatly in wooden crates. Soft, warm atmosphere conveying community commerce." ></div>
<div className="relative z-10">
<span className="inline-block px-3 py-1 bg-inverse-primary/20 text-inverse-primary rounded-full text-[12px] font-bold tracking-widest uppercase mb-4">Merchant Tip</span>
<h4 className="text-headline-md font-headline-md text-surface-container-lowest mb-3">High-quality photos boost local sales by 40%</h4>
<p className="text-body-md font-body-md text-inverse-on-surface/80 mb-6">When adding your final 5 products, make sure they are well-lit and clearly show the packaging. Local buyers trust visuals.</p>
<a className="inline-flex items-center gap-2 text-inverse-primary hover:text-primary-fixed transition-colors font-label-md text-label-md border-b border-inverse-primary pb-0.5" href="#">
                            Read photography guide <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</a>
</div>
</div>
<div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 flex flex-col gap-3">
<h4 className="text-label-md font-label-md text-outline uppercase tracking-widest mb-2">Recently Added Products</h4>
<div className="flex items-center gap-3 p-2 hover:bg-surface-container transition-colors rounded-xl cursor-pointer">
<div className="w-12 h-12 rounded-lg bg-surface-variant flex-shrink-0 overflow-hidden">
<img className="w-full h-full object-cover" data-alt="A clean, minimalist product shot of a beautifully packaged artisanal sourdough bread loaf wrapped in brown paper, sitting on a light gray stone surface." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2pWT8fFHo9u1jWizHbv9WkSWwKyGFrrCe-9eJRdR-AE-38vscfPYiywj1WUQWWXR8rkuq-KH61bKh6uK362fhDf3rka2mXikGnbl6hQSkbXaoXirmiFpOMnIEEiTV9cr0K-x3F7qJ-zBJBGHov1MMj0RrE6zZK4hL6ZLRxoJUmkCsuJOjPwE9ulRrzQMQ5YFeXHCqYOC2VwDHM5DqVFYwBs8uVnxKIHDqrLmuT-wvZkQ3xvz-HWUW" />
</div>
<div className="flex-1 min-w-0">
<p className="text-body-md font-body-md text-on-surface truncate">Artisanal Sourdough Loaf</p>
<p className="text-label-md font-label-md text-on-surface-variant">$6.50 • In Stock</p>
</div>
</div>
<div className="flex items-center gap-3 p-2 hover:bg-surface-container transition-colors rounded-xl cursor-pointer">
<div className="w-12 h-12 rounded-lg bg-surface-variant flex-shrink-0 overflow-hidden">
<img className="w-full h-full object-cover" data-alt="A clean, minimalist product shot of a jar of locally sourced organic honey with a minimalist white label, set against a soft sage green backdrop." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlcneuFd6ZiYGt89XxSyxYak0CMnWHhUVet1Qd_7_76SSrhJUOtbTkHiWM6GR024oWKsXYB8QA25-pMdni4DD4UVSWV8vKzsvdOP6xQ5i13QH36wsjTSeubQ0JkzLbVfR6G763COOJbYAIX-g3XUWpfb3wx6KRouyt-cWeW4zwCVGioJlvld7AS5TgCj8zkgXg5YJiM9LkeL0_a9XpJMFRT2M0j_cmCGuTTKC51ZE7qKTCCCge8eVQ" />
</div>
<div className="flex-1 min-w-0">
<p className="text-body-md font-body-md text-on-surface truncate">Local Organic Honey 500g</p>
<p className="text-label-md font-label-md text-on-surface-variant">$12.00 • In Stock</p>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
    </>
  );
}