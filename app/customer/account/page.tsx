"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { customerApi, CustomerProfile } from "../../../services/customerApi";
import { useCustomerAuth } from "../../contexts/CustomerAuthContext";
import { CustomerProfileModal } from "../../components/customer/CustomerProfileModal";

export default function CustomerAccountPage() {
  const router = useRouter();
  const { customerUser, isAuthenticated, openAuthModal, logoutCustomer } = useCustomerAuth();

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(1250);
  const [isAddingFunds, setIsAddingFunds] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      customerApi.getProfile().then((data) => {
        if (data) {
          setProfile(data);
          setWalletBalance(data.walletBalance || 1250);
        }
      });
    }
  }, [isAuthenticated]);

  const handleAddMoney = () => {
    setIsAddingFunds(true);
    setTimeout(() => {
      setWalletBalance((prev) => prev + 500);
      setIsAddingFunds(false);
    }, 800);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold mb-4">
          lock
        </div>
        <h2 className="font-headline-lg text-2xl font-bold text-on-surface mb-2">
          Sign In to Access Account
        </h2>
        <p className="text-xs text-on-surface-variant max-w-sm mb-6">
          Log in with your mobile phone number to manage saved addresses, view order history, and use Bazaar Pay wallet.
        </p>
        <button
          type="button"
          onClick={() => openAuthModal("/customer/account")}
          className="px-8 py-4 bg-primary text-on-primary font-bold text-sm rounded-full shadow-lg hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer"
        >
          Sign In or Register
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-8 min-h-screen">
      <div className="mb-8">
        <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">Account & Settings</h1>
        <p className="text-sm text-on-surface-variant mt-1">Manage your profile, wallet balance and delivery addresses</p>
      </div>

      {/* User Profile Card */}
      <div className="bg-surface-container rounded-3xl p-6 border border-surface-container-high shadow-xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-full bg-primary text-on-primary font-bold text-2xl flex items-center justify-center shadow-md">
            {customerUser?.name ? customerUser.name.charAt(0) : "C"}
          </div>
          <div>
            <h2 className="font-bold text-xl text-on-surface">{customerUser?.name || "Vivek Sharma"}</h2>
            <p className="text-xs text-on-surface-variant">{customerUser?.phone}</p>
            <p className="text-xs text-primary font-semibold mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {profile?.address?.line1 || "Flat 402, Royal Residency"}, {profile?.address?.city || "Hyderabad"}
            </p>
            <span className="inline-block bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-2">
              Bazaar Gold Member ⭐
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-full shadow-md hover:bg-primary-container transition-all cursor-pointer"
        >
          Edit Address & Profile
        </button>
      </div>

      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-r from-primary via-primary-container to-tertiary text-on-primary rounded-3xl p-6 mb-8 shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-primary-fixed uppercase tracking-wider">Bazaar Pay Wallet</span>
          <p className="font-display text-3xl font-extrabold mt-1">₹{walletBalance}</p>
          <p className="text-[11px] opacity-80 mt-0.5">Instant refunds & 1-tap checkout</p>
        </div>

        <button
          type="button"
          disabled={isAddingFunds}
          onClick={handleAddMoney}
          className="px-6 py-3 bg-surface-container text-primary font-bold text-xs rounded-full shadow-md hover:bg-primary-fixed transition-all cursor-pointer disabled:opacity-50"
        >
          {isAddingFunds ? "Adding ₹500..." : "+ Add Money"}
        </button>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/customer/orders"
          className="p-5 bg-surface-container rounded-3xl border border-surface-container-high shadow-xs hover:shadow-md transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">receipt_long</span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-on-surface">My Orders</h4>
            <p className="text-xs text-on-surface-variant">View live orders & past order receipts</p>
          </div>
        </Link>

        <Link
          href="/customer/wishlist"
          className="p-5 bg-surface-container rounded-3xl border border-surface-container-high shadow-xs hover:shadow-md transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">favorite</span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-on-surface">Saved Wishlist</h4>
            <p className="text-xs text-on-surface-variant">View your saved favorite products</p>
          </div>
        </Link>
      </div>

      {/* Account Settings List */}
      <div className="bg-surface-container rounded-3xl p-6 border border-surface-container-high shadow-xs divide-y divide-surface-container-high">
        <h3 className="font-bold text-base text-on-surface pb-4">Settings & Support</h3>

        <Link
          href="/customer/help"
          className="py-4 flex items-center justify-between text-sm text-on-surface hover:text-primary transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">help_center</span>
            <span>Help Center & Customer Support</span>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
        </Link>

        <Link
          href="/customer/offers"
          className="py-4 flex items-center justify-between text-sm text-on-surface hover:text-primary transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">local_offer</span>
            <span>Promotions & Referral Rewards</span>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
        </Link>

        <button
          type="button"
          onClick={logoutCustomer}
          className="w-full py-4 flex items-center gap-3 text-sm text-error font-bold text-left cursor-pointer hover:bg-error-container/10 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Log Out of Account
        </button>
      </div>

      {/* Customer Profile Modal */}
      <CustomerProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newProfile) => setProfile(newProfile)}
      />
    </div>
  );
}
