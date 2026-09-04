"use client";

import React, { useState } from "react";
import { useCustomerAuth } from "../../contexts/CustomerAuthContext";

export function CustomerAuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginCustomer, signupCustomer } = useCustomerAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<"phone" | "otp" | "details">("phone");

  const [phone, setPhone] = useState("+91 98765 43210");
  const [otp, setOtp] = useState("1234");
  const [name, setName] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isAuthModalOpen) return null;

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setErrorMsg("Please enter a valid phone number");
      return;
    }
    setErrorMsg("");
    setStep("otp");
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== "1234" && otp.length !== 4) {
      setErrorMsg("Enter 4-digit code (Use 1234 for testing)");
      return;
    }

    setIsSubmitting(true);
    if (mode === "login") {
      const success = await loginCustomer(phone);
      setIsSubmitting(false);
      if (!success) setStep("details");
    } else {
      setStep("details");
      setIsSubmitting(false);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter your name");
      return;
    }
    setIsSubmitting(true);
    await signupCustomer({
      name,
      phone,
      address: { line1: addressLine || "Banjara Hills", city: "Hyderabad" }
    });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-surface-container-high relative">
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl mb-3">
            B
          </div>
          <h3 className="font-headline-md text-xl font-bold text-on-surface">
            {mode === "login" ? "Welcome Back to Bazaar" : "Create Customer Account"}
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">
            {step === "phone" && "Enter your phone number to sign in or register"}
            {step === "otp" && `Enter 4-digit verification code sent to ${phone}`}
            {step === "details" && "Complete your customer profile & address"}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-error-container/40 text-on-error-container rounded-2xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Step 1: Phone */}
        {step === "phone" && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1">
                Mobile Phone Number
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  smartphone
                </span>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full h-11 pl-11 pr-4 bg-surface-container-low border border-surface-container-high rounded-2xl text-xs font-semibold text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-primary text-on-primary font-bold text-xs rounded-full shadow-md hover:bg-primary-container transition-all cursor-pointer"
            >
              Get Verification Code
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1">
                Enter 4-Digit OTP
              </label>
              <input
                type="text"
                maxLength={4}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="1234"
                className="w-full h-12 text-center text-xl font-bold tracking-widest bg-surface-container-low border border-surface-container-high rounded-2xl text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-[11px] text-on-surface-variant text-center mt-1">
                Demo code: <span className="font-bold text-primary">1234</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-primary text-on-primary font-bold text-xs rounded-full shadow-md hover:bg-primary-container transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Verifying..." : "Verify & Continue"}
            </button>
          </form>
        )}

        {/* Step 3: Details (Signup) */}
        {step === "details" && (
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vivek Sharma"
                className="w-full h-11 px-4 bg-surface-container-low border border-surface-container-high rounded-2xl text-xs font-semibold text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1">Default Delivery Area</label>
              <input
                type="text"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="e.g. Road No. 12, Banjara Hills"
                className="w-full h-11 px-4 bg-surface-container-low border border-surface-container-high rounded-2xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-primary text-on-primary font-bold text-xs rounded-full shadow-md hover:bg-primary-container transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Creating Account..." : "Complete Registration"}
            </button>
          </form>
        )}

        {/* Toggle Mode Footer */}
        <div className="mt-6 pt-4 border-t border-surface-container-high text-center">
          {mode === "login" ? (
            <p className="text-xs text-on-surface-variant">
              New customer?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setStep("phone");
                }}
                className="font-bold text-primary hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </p>
          ) : (
            <p className="text-xs text-on-surface-variant">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setStep("phone");
                }}
                className="font-bold text-primary hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
