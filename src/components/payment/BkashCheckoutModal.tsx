"use client";

import React, { useState, useEffect } from "react";
import {
  X, Check, AlertCircle, RefreshCw, ShieldCheck,
  Smartphone, Lock, CheckCircle2, ArrowRight
} from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

interface BkashCheckoutModalProps {
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
  onClose: () => void;
  onSuccess: (trxData: any) => void;
}

export default function BkashCheckoutModal({
  plan,
  isAnnual,
  couponCode,
  discountAmount = 0,
  payerEmail,
  onClose,
  onSuccess
}: BkashCheckoutModalProps) {
  const { showToast } = useToast();

  const [step, setStep] = useState<"phone" | "otp" | "pin" | "processing" | "success">("phone");
  const [walletNumber, setWalletNumber] = useState("01770618575");
  const [otp, setOtp] = useState("123456");
  const [pin, setPin] = useState("12121");
  const [agreed, setAgreed] = useState(true);
  const [resendTimer, setResendTimer] = useState(60);

  const [paymentSession, setPaymentSession] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedTrx, setCompletedTrx] = useState<any | null>(null);

  const rawAmount = isAnnual ? plan.annualPrice * 12 : plan.monthlyPrice;
  const totalAmount = Math.max(0, rawAmount - discountAmount);
  const invoiceNumber = `INV-${Date.now().toString().slice(-7)}`;

  // OTP Resend Timer countdown
  useEffect(() => {
    let interval: any;
    if (step === "otp" && resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Step 1: Submit Phone & Initialize Payment Session
  const handleProceedPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = walletNumber.replace(/[\s-]/g, "");
    if (!cleanNumber || cleanNumber.length < 11) {
      setErrorMsg("Please enter a valid 11-digit Bangladeshi bKash account number (e.g. 017XXXXXXXX).");
      return;
    }
    if (!agreed) {
      setErrorMsg("Please accept the terms and conditions to proceed.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const cycle = isAnnual ? "annual" : "monthly";
      const session = await api.createBkashPayment(plan.id, cycle, cleanNumber, couponCode);
      setPaymentSession(session);
      setStep("otp");
      setResendTimer(60);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initiate bKash payment gateway session.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Submit OTP
  const handleProceedOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 4) {
      setErrorMsg("Please enter the 6-digit verification code (OTP) sent to your bKash number.");
      return;
    }
    setErrorMsg("");
    setStep("pin");
  };

  // Step 3: Submit PIN & Finalize Payment
  const handleProceedPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length < 4) {
      setErrorMsg("Please enter your 5-digit secret bKash PIN.");
      return;
    }

    if (walletNumber === "01823074817") {
      setErrorMsg("Transaction Failed: Insufficient balance in your bKash wallet.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);
    setStep("processing");

    try {
      const cycle = isAnnual ? "annual" : "monthly";
      const paymentId = paymentSession?.paymentID || `BK_${Date.now()}`;
      const execRes = await api.executeBkashPayment(paymentId, plan.id, cycle, couponCode, payerEmail);

      setCompletedTrx(execRes);
      setStep("success");
      showToast(
        "bKash Payment Verified",
        `Payment of ৳${totalAmount.toLocaleString()} BDT confirmed. TrxID: ${execRes.trxID}`,
        "success"
      );
      onSuccess(execRes);
    } catch (err: any) {
      setStep("pin");
      setErrorMsg(err.message || "bKash Payment execution failed. Please verify your PIN and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 flex flex-col relative text-xs animate-in zoom-in-95">
        
        {/* Official bKash Brand Header */}
        <div className="bg-[#e2136e] text-white p-5 relative select-none">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white text-[#e2136e] flex items-center justify-center font-black text-2xl shadow-lg shadow-pink-900/30 shrink-0">
              ৳
            </div>
            <div>
              <div className="text-[10px] font-extrabold tracking-widest text-pink-100 uppercase flex items-center gap-1.5">
                <span>bKash Payment Gateway</span>
              </div>
              <h2 className="text-base font-black tracking-tight leading-none text-white mt-0.5">
                PADMA AI-AS-A-SERVICE
              </h2>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-pink-400/40 flex justify-between items-baseline">
            <div>
              <div className="text-[10px] text-pink-100 font-medium">Invoice: {invoiceNumber}</div>
              <div className="font-bold text-white text-xs">{plan.name} {isAnnual ? "(Annual)" : "(Monthly)"}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-pink-100 font-medium">Total Amount</div>
              <div className="text-lg font-black text-white font-mono">
                ৳{totalAmount.toLocaleString()} <span className="text-[10px] font-normal">BDT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: OFFICIAL PHONE NUMBER ENTRY */}
          {step === "phone" && (
            <form onSubmit={handleProceedPhone} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5 flex items-center justify-between">
                  <span>Your bKash Account Number</span>
                  <span className="text-[10px] text-[#e2136e] font-bold">Bangladeshi Wallet</span>
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    required
                    maxLength={11}
                    value={walletNumber}
                    onChange={e => setWalletNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-bold text-sm outline-none focus:border-[#e2136e] focus:bg-white transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-center gap-2 text-[11px] text-slate-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="rounded text-[#e2136e] focus:ring-[#e2136e]"
                />
                <span>I agree to the <strong>terms and conditions</strong></span>
              </label>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  CLOSE
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 bg-[#e2136e] hover:bg-[#c00f5c] text-white font-bold rounded-xl shadow-md shadow-pink-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <span>CONFIRM</span>
                  )}
                </button>
              </div>

              <div className="text-[10px] text-slate-400 text-center pt-1">
                Sandbox Test Mode: You may test with <code>01770618575</code>
              </div>
            </form>
          )}

          {/* STEP 2: OFFICIAL OTP VERIFICATION */}
          {step === "otp" && (
            <form onSubmit={handleProceedOtp} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="text-[11px] text-slate-500">
                  Verification code sent to <strong className="text-slate-800 font-mono">{walletNumber}</strong>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5 text-center">
                  bKash Verification Code (OTP)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center tracking-widest text-lg font-mono font-black py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#e2136e] focus:bg-white shadow-xs"
                />
              </div>

              <div className="flex justify-between items-center text-[10.5px] text-slate-500 px-1">
                <span>Didn&apos;t receive code?</span>
                {resendTimer > 0 ? (
                  <span className="font-mono text-slate-400 font-semibold">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setResendTimer(60);
                      showToast("OTP Resent", `New verification code sent to ${walletNumber}`, "info");
                    }}
                    className="text-[#e2136e] font-bold hover:underline cursor-pointer"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  CLOSE
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-[#e2136e] hover:bg-[#c00f5c] text-white font-bold rounded-xl shadow-md shadow-pink-600/25 transition-all cursor-pointer"
                >
                  CONFIRM
                </button>
              </div>

              <div className="text-[10px] text-slate-400 text-center pt-0.5">
                Sandbox Test Code: <code>123456</code>
              </div>
            </form>
          )}

          {/* STEP 3: OFFICIAL PIN ENTRY */}
          {step === "pin" && (
            <form onSubmit={handleProceedPin} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="text-[11px] text-slate-500">
                  Enter your bKash PIN to confirm <strong>৳{totalAmount.toLocaleString()} BDT</strong>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5 text-center">
                  Enter bKash PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    maxLength={5}
                    required
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder="•••••"
                    className="w-full pl-9 pr-3 text-center tracking-widest text-lg font-mono font-black py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#e2136e] focus:bg-white shadow-xs"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[10.5px] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Never share your secret PIN or OTP with anyone.</span>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  CLOSE
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 bg-[#e2136e] hover:bg-[#c00f5c] text-white font-bold rounded-xl shadow-md shadow-pink-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Authorizing...</span>
                    </>
                  ) : (
                    <span>CONFIRM</span>
                  )}
                </button>
              </div>

              <div className="text-[10px] text-slate-400 text-center pt-0.5">
                Sandbox Test PIN: <code>12121</code>
              </div>
            </form>
          )}

          {/* STEP 4: PROCESSING SPINNER */}
          {step === "processing" && (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 border-3 border-[#e2136e] border-t-transparent rounded-full animate-spin mx-auto shadow-md" />
              <div className="font-extrabold text-slate-900 text-sm">
                Authorizing bKash Transaction...
              </div>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Validating with bKash PGW and provisioning your isolated tenant workspace. Please do not refresh.
              </p>
            </div>
          )}

          {/* STEP 5: OFFICIAL SUCCESS RECEIPT */}
          {step === "success" && completedTrx && (
            <div className="py-3 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">
                  Payment Successful!
                </h3>
                <p className="text-[11px] text-slate-500">
                  Your payment has been received and verified by bKash PGW.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2 font-medium text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="font-mono font-bold text-[#e2136e]">{completedTrx.trxID}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-mono font-bold text-slate-900">৳{totalAmount.toLocaleString()} BDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer Wallet:</span>
                  <span className="font-mono font-bold text-slate-800">{walletNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Plan Activated:</span>
                  <span className="font-bold text-emerald-700">{plan.name}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Launch & Access Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

        {/* Official Footer Banner */}
        <div className="bg-slate-50 px-6 py-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 select-none">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit SSL Encrypted</span>
          </div>
          <div className="font-semibold text-slate-500">Official bKash PGW Engine</div>
        </div>

      </div>
    </div>
  );
}
