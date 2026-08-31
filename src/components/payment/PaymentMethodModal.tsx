"use client";

import React, { useState } from "react";
import {
  X, Check, ShieldCheck, ArrowRight, RefreshCw, AlertCircle,
  CreditCard, Smartphone, Building2, Sparkles, Lock, CheckCircle2
} from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import BkashCheckoutModal from "./BkashCheckoutModal";

interface PaymentMethodModalProps {
  plan: {
    id: string;
    name: string;
    monthlyPrice: number;
    annualPrice: number;
    tokens?: string;
  };
  isAnnual: boolean;
  couponCode?: string;
  discountAmount?: number;
  payerEmail?: string;
  payerName?: string;
  onClose: () => void;
  onSuccess: (trxData: any) => void;
}

export default function PaymentMethodModal({
  plan,
  isAnnual,
  couponCode,
  discountAmount = 0,
  payerEmail = "",
  payerName = "",
  onClose,
  onSuccess
}: PaymentMethodModalProps) {
  const { showToast } = useToast();

  const [selectedGateway, setSelectedGateway] = useState<"bkash" | "eps">("bkash");
  const [showBkashModal, setShowBkashModal] = useState(false);
  const [isSubmittingEps, setIsSubmittingEps] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Customer Details Form for EPS
  const [customerName, setCustomerName] = useState(payerName || "Valued Customer");
  const [customerEmail, setCustomerEmail] = useState(payerEmail || "");
  const [customerPhone, setCustomerPhone] = useState("01700000000");
  const [customerAddress, setCustomerAddress] = useState("Dhaka, Bangladesh");

  const rawAmount = isAnnual ? plan.annualPrice * 12 : plan.monthlyPrice;
  const totalAmount = Math.max(0, rawAmount - discountAmount);

  // If user selected bKash and confirmed, switch to dedicated BkashCheckoutModal
  if (showBkashModal) {
    return (
      <BkashCheckoutModal
        plan={plan}
        isAnnual={isAnnual}
        couponCode={couponCode}
        discountAmount={discountAmount}
        payerEmail={payerEmail}
        onClose={() => {
          setShowBkashModal(false);
          onClose();
        }}
        onSuccess={onSuccess}
      />
    );
  }

  const handleProceed = async () => {
    setErrorMsg("");

    if (selectedGateway === "bkash") {
      setShowBkashModal(true);
      return;
    }

    if (selectedGateway === "eps") {
      setIsSubmittingEps(true);
      try {
        const cycle = isAnnual ? "annual" : "monthly";
        const session = await api.createEpsPayment(
          plan.id,
          cycle,
          {
            name: customerName,
            email: customerEmail || undefined,
            phone: customerPhone,
            address: customerAddress
          },
          couponCode
        );

        if (session && session.redirectURL) {
          showToast("Redirecting to EPS", "Launching secure EPS Checkout Portal...", "info");
          window.location.href = session.redirectURL;
        } else {
          setErrorMsg("Failed to initialize EPS payment session.");
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to connect with EPS Payment Gateway.");
      } finally {
        setIsSubmittingEps(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 flex flex-col relative text-xs animate-in zoom-in-95">

        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 relative select-none">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Select Payment Method
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight text-white mt-2">
            {plan.name} Package Checkout
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Choose your preferred Bangladeshi payment gateway for instant automated provisioning.
          </p>

          <div className="mt-4 pt-3.5 border-t border-slate-800 flex justify-between items-baseline">
            <div>
              <div className="text-[10px] text-slate-400">Billing Duration</div>
              <div className="font-bold text-slate-200">{isAnnual ? "Annual (12 Months)" : "Monthly"}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400">Payable Amount (BDT)</div>
              <div className="text-xl font-black text-emerald-400 font-mono">
                ৳{totalAmount.toLocaleString()} <span className="text-[11px] font-semibold text-slate-400">BDT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Payment Gateway Options Grid */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              Available Payment Gateways:
            </div>

            {/* 1. bKash Direct Option */}
            <div
              onClick={() => setSelectedGateway("bkash")}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                selectedGateway === "bkash"
                  ? "border-[#e2136e] bg-pink-50/40 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#e2136e] text-white flex items-center justify-center font-black text-2xl shadow-md shadow-pink-600/20 shrink-0">
                  ৳
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">bKash (বিকাশ)</span>
                    <span className="text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded bg-pink-100 text-[#e2136e]">
                      Instant Tokenized
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pay directly using your bKash personal account / wallet.
                  </p>
                </div>
              </div>

              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedGateway === "bkash"
                  ? "border-[#e2136e] bg-[#e2136e] text-white"
                  : "border-slate-300"
              }`}>
                {selectedGateway === "bkash" && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>

            {/* 2. EPS Payment Gateway Option */}
            <div
              onClick={() => setSelectedGateway("eps")}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                selectedGateway === "eps"
                  ? "border-emerald-600 bg-emerald-50/40 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">EPS (Easy Payment System)</span>
                    <span className="text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Multi-Channel
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Cards (Visa/Mastercard/Amex), Nagad, Rocket, Upay & Net Banking.
                  </p>
                </div>
              </div>

              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedGateway === "eps"
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-300"
              }`}>
                {selectedGateway === "eps" && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
          </div>

          {/* EPS Customer Info Fields (if EPS selected) */}
          {selectedGateway === "eps" && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 animate-in fade-in">
              <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" /> Billing Information for EPS Invoice:
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10.5px] text-slate-600 font-semibold mb-0.5">Full Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 outline-none focus:border-emerald-500"
                    placeholder="Customer Name"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] text-slate-600 font-semibold mb-0.5">Mobile Phone</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-900 outline-none focus:border-emerald-500"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleProceed}
              disabled={isSubmittingEps}
              className={`w-2/3 py-2.5 font-bold text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                selectedGateway === "bkash"
                  ? "bg-[#e2136e] hover:bg-[#c00f5c] shadow-pink-600/20"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
              }`}
            >
              {isSubmittingEps ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting EPS...</span>
                </>
              ) : (
                <>
                  <span>PROCEED WITH {selectedGateway === "bkash" ? "bKash" : "EPS"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 select-none">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit SSL Encrypted Multi-PGW</span>
          </div>
          <div className="font-semibold text-slate-500">Official Settlement in BDT (৳)</div>
        </div>

      </div>
    </div>
  );
}
