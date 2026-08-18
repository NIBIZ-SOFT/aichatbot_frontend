"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2, XCircle, AlertCircle, RefreshCw,
  ArrowRight, ShieldCheck, Download, Sparkles, Building2
} from "lucide-react";
import { api } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";

function BkashCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser, loginWithToken } = useAuth();

  const paymentID = searchParams.get("paymentID");
  const status = searchParams.get("status"); // "success", "cancel", "failure"
  const tier = searchParams.get("tier") || "starter";
  const cycle = searchParams.get("cycle") || "monthly";
  const coupon = searchParams.get("coupon") || undefined;

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [trxResult, setTrxResult] = useState<any | null>(null);
  const [countdown, setCountdown] = useState(4);
  const hasExecutedRef = React.useRef(false);

  useEffect(() => {
    if (hasExecutedRef.current) return;
    hasExecutedRef.current = true;

    async function processPayment() {
      if (!paymentID) {
        setLoading(false);
        setErrorMsg("No payment ID returned from bKash gateway.");
        return;
      }

      if (status === "cancel") {
        setLoading(false);
        setErrorMsg("Payment was cancelled by user on the bKash checkout portal.");
        return;
      }

      if (status === "failure") {
        setLoading(false);
        setErrorMsg("Payment transaction failed on bKash Payment Gateway. Please try again.");
        return;
      }

      try {
        setLoading(true);
        const pendingSignupRaw = typeof window !== "undefined" ? sessionStorage.getItem("aiaas_pending_signup") : null;
        let payerEmail = undefined;
        let pendingSignup = null;
        if (pendingSignupRaw) {
          try {
            pendingSignup = JSON.parse(pendingSignupRaw);
            payerEmail = pendingSignup.admin_email;
          } catch (e) {}
        }

        // Call backend to execute and capture payment with bKash central API
        const execRes = await api.executeBkashPayment(paymentID, tier, cycle, coupon, payerEmail);
        
        // If guest signup, finalize provisioning
        if (pendingSignup) {
          try {
            const provRes = await api.provisionTenant(pendingSignup);
            if (provRes?.access_token && loginWithToken) {
              await loginWithToken(provRes.access_token);
            }
            sessionStorage.removeItem("aiaas_pending_signup");
          } catch (pErr: any) {
            console.error("Provisioning follow-up:", pErr);
          }
        }

        setTrxResult(execRes);
        if (refreshUser) {
          await refreshUser();
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to execute bKash payment verification.");
      } finally {
        setLoading(false);
      }
    }

    processPayment();
  }, [paymentID, status, tier, cycle, coupon, refreshUser, loginWithToken]);

  // Auto redirect countdown on success
  useEffect(() => {
    let timer: any;
    if (trxResult && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else if (trxResult && countdown === 0) {
      router.push("/subscription");
    }
    return () => clearInterval(timer);
  }, [trxResult, countdown, router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-sans selection:bg-pink-500 selection:text-white">
      
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#e2136e]/15 blur-[120px] rounded-full" />
      </div>

      <div className="relative w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
        
        {/* bKash Header Badge */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#e2136e] text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-pink-600/30">
              ৳
            </div>
            <div>
              <div className="text-[11px] font-extrabold tracking-widest text-pink-400 uppercase">
                bKash Tokenized Checkout
              </div>
              <h1 className="text-lg font-black text-white">
                PADMA AI-AS-A-SERVICE
              </h1>
            </div>
          </div>
          <div className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-semibold border border-slate-700">
            PGW Gateway
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="py-12 text-center space-y-4">
            <div className="w-14 h-14 border-3 border-[#e2136e] border-t-transparent rounded-full animate-spin mx-auto shadow-lg shadow-pink-500/20" />
            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-white">
                Verifying Transaction with bKash...
              </h2>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Executing payment capture on bKash servers and activating your AI subscription.
              </p>
            </div>
          </div>
        )}

        {/* ERROR / CANCELLED STATE */}
        {!loading && errorMsg && (
          <div className="py-8 space-y-6 text-center animate-in fade-in">
            <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
              <XCircle className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-extrabold text-white">
                Payment Verification Failed
              </h2>
              <p className="text-xs text-red-300 bg-red-950/40 p-3 rounded-xl border border-red-900/50">
                {errorMsg}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                href="/pricing"
                className="w-full py-3 bg-[#e2136e] hover:bg-[#c00f5c] text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs"
              >
                <span>Retry Payment / Change Plan</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {!loading && trxResult && (
          <div className="py-6 space-y-6 animate-in fade-in">
            
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-xl font-extrabold text-white">
                bKash Payment Confirmed!
              </h2>
              <p className="text-xs text-slate-400">
                Your subscription has been upgraded and quotas are provisioned.
              </p>
            </div>

            {/* Official Digital Invoice Receipt */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-2.5 text-xs font-medium">
              <div className="flex justify-between items-center text-slate-400">
                <span>Transaction ID (TrxID):</span>
                <span className="font-mono font-bold text-[#e2136e] text-sm">{trxResult.trxID}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Payment ID:</span>
                <span className="font-mono text-slate-300">{trxResult.paymentID || paymentID}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Subscription Plan:</span>
                <span className="font-bold text-white uppercase">{trxResult.tier || tier}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Monthly AI Token Quota:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {Number(trxResult.monthly_token_limit || 2500000).toLocaleString()} Tokens
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Valid Period End:</span>
                <span className="font-mono text-slate-300">
                  {trxResult.current_period_end ? new Date(trxResult.current_period_end).toLocaleDateString() : "30 Days"}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/subscription"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs"
              >
                <span>Launch & Enter Workspace (Redirecting in {countdown}s)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        )}

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>256-Bit SSL Encrypted PGW</span>
          </div>
          <div>Official bKash Settlement</div>
        </div>

      </div>

    </div>
  );
}

export default function BkashCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
          <RefreshCw className="w-6 h-6 animate-spin text-pink-500" />
        </div>
      }
    >
      <BkashCallbackContent />
    </Suspense>
  );
}
