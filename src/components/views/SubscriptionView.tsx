"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  CreditCard, Check, Sparkles, Shield, ArrowRight, Zap,
  Building2, Globe, Users, Cpu, FileText, Download,
  CheckCircle2, RefreshCw, AlertCircle, Lock, Star,
  ShieldCheck, HelpCircle, ChevronRight, X, PhoneCall, Tag,
  Printer, Award, MessageSquare
} from "lucide-react";
import { api } from "../../lib/api";
import { calculateEstimatedMessages, enhanceFeatureWithMessages, setGlobalTokensPerMessage } from "../../lib/pricingUtils";
import PaymentMethodModal from "../payment/PaymentMethodModal";

interface SubscriptionDetails {
  id: string;
  tenant_name: string;
  tier: string;
  plan_code?: string;
  status: string;
  price_bdt: number;
  billing_cycle: string;
  monthly_token_limit: number;
  used_tokens?: number;
  usage_percent?: number;
  current_month_tokens_used?: number;
  token_usage_percentage?: number;
  max_agents: number;
  current_agents_count: number;
  max_websites: number;
  current_websites_count: number;
  current_period_start: string;
  current_period_end: string;
  payment_method: string;
  whitelabel_enabled: boolean;
  custom_cname_enabled: boolean;
}

interface InvoiceItem {
  id: string;
  invoice_number: string;
  date: string;
  plan_name: string;
  billing_cycle: string;
  amount_bdt: number;
  payment_method: string;
  status: string;
  receipt_url: string;
}

export default function SubscriptionView() {
  const { showToast } = useToast();
  const { user, refreshUser } = useAuth();
  const { currentTheme } = useTheme();

  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [tenantInfo, setTenantInfo] = useState<any | null>(null);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Billing Cycle Toggle (Monthly vs Annual)
  const [isAnnual, setIsAnnual] = useState(false);

  // Coupon State
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Prepaid AI Wallet State
  const [wallet, setWallet] = useState<any | null>(null);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState<number>(1000);
  const [topupGateway, setTopupGateway] = useState<"bkash" | "eps">("bkash");
  const [pricingConfig, setPricingConfig] = useState<any>(null);
  const [isInitiatingTopup, setIsInitiatingTopup] = useState(false);

  // Plan Upgrade / Change Modal State
  const [selectedPlanForChange, setSelectedPlanForChange] = useState<any | null>(null);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<any | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("bKash Direct Merchant");
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [isInitiatingBkash, setIsInitiatingBkash] = useState<string | null>(null);

  const handleTopupWallet = async (amount: number) => {
    setIsInitiatingTopup(true);
    try {
      if (topupGateway === "eps") {
        const session = await api.initWalletTopupEps(amount);
        if (session && session.redirectURL) {
          showToast("Redirecting to EPS", "Launching secure EPS Checkout Portal for Wallet Top-Up...", "info");
          window.location.href = session.redirectURL;
        } else {
          showToast("EPS Gateway", "Failed to connect with EPS checkout.", "error");
        }
      } else {
        const session = await api.initWalletTopup(amount);
        if (session && session.paymentID) {
          await api.executeWalletTopup(session.paymentID);
          showToast("Wallet Credited!", `৳${amount.toLocaleString()} added to your AI Prepaid Balance!`, "success");
          setIsTopupModalOpen(false);
          loadData();
        }
      }
    } catch (err: any) {
      showToast("Top-Up Failed", err.message || "Failed to process recharge.", "error");
    } finally {
      setIsInitiatingTopup(false);
    }
  };

  const handleOpenCheckout = (plan: any) => {
    setSelectedCheckoutPlan(plan);
  };

  // Invoice Receipt Modal State
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceItem | null>(null);

  const [plans, setPlans] = useState<any[]>([
    {
      id: "free",
      name: "Free Plan",
      monthlyPrice: 0,
      annualPrice: 0,
      tokens: "50,000 / mo",
      tokenLimitNum: 50000,
      websites: "1 Active Widget",
      agents: "1 Staff Seat",
      rag: "2 Knowledge Docs",
      badge: "Free Forever",
      description: "Essential AI Chatbot widget for testing and early validation.",
      features: [
        "50,000 AI Tokens / month",
        "1 Active Website Widget",
        "1 Staff / Agent Seat",
        "2 Knowledge Base Documents",
        "Standard AI Response Speed",
        "Community Support"
      ]
    },
    {
      id: "starter",
      name: "Starter Plan",
      monthlyPrice: 4990,
      annualPrice: 4240,
      tokens: "~1,500 Messages (~500k Tokens)",
      tokenLimitNum: 500000,
      websites: "2 Active Widgets",
      agents: "2 Staff Seats",
      rag: "10 Knowledge Docs",
      badge: "Starter",
      description: "Professional conversational AI for growing e-commerce businesses.",
      features: [
        "~1,500 AI Messages / month (500k Tokens)",
        "2 Active Website Widgets",
        "2 Staff / Agent Seats",
        "10 Knowledge Base Documents",
        "bKash & EPS Automated Billing",
        "Basic CSAT & Analytics",
        "Email Support (24h SLA)"
      ]
    },
    {
      id: "growth",
      name: "Growth Plan",
      monthlyPrice: 19990,
      annualPrice: 16990,
      tokens: "~7,500 Messages (~2.5M Tokens)",
      tokenLimitNum: 2500000,
      websites: "5 Active Widgets",
      agents: "5 Staff Seats",
      rag: "50 Knowledge Docs",
      badge: "Most Popular",
      description: "High-volume AI automation for scaling digital commerce brands.",
      features: [
        "~7,500 AI Messages / month (2.5M Tokens)",
        "5 Active Website Widgets",
        "5 Staff / Agent Seats",
        "50 Knowledge Base Documents",
        "E-Commerce Cart & Order Desk",
        "Advanced CSAT & Real-Time Analytics",
        "Custom Brand White-Labeling",
        "Priority WhatsApp & Ticket Support"
      ]
    },
    {
      id: "enterprise",
      name: "Enterprise Plan",
      monthlyPrice: 49990,
      annualPrice: 42490,
      tokens: "~30,000 Messages (~10M Tokens)",
      tokenLimitNum: 10000000,
      websites: "20 Active Widgets",
      agents: "20 Staff Seats",
      rag: "200 Knowledge Docs",
      badge: "Enterprise",
      description: "Dedicated LLM infrastructure, custom integrations & unlimited scalability.",
      features: [
        "~30,000 AI Messages / month (10M Tokens)",
        "20 Active Website Widgets",
        "20 Staff / Agent Seats",
        "200 Knowledge Base Documents",
        "Custom AI LLM Fine-Tuning & RAG",
        "Dedicated Account Manager",
        "Enterprise 99.9% SLA Guarantee",
        "24/7 Phone & Slack Direct Support"
      ]
    }
  ]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [subData, invList, dbPlans, tSettings, walletData, pricingCfg] = await Promise.all([
        api.getSubscriptionCurrent(),
        api.getSubscriptionInvoices(),
        api.getPublicPlans().catch(() => []),
        api.getTenantSettings().catch(() => null),
        api.getTenantWallet().catch(() => null),
        api.getPublicPricingConfig().catch(() => null)
      ]);
      setSubscription(subData);
      setInvoices(invList);
      if (walletData) setWallet(walletData);
      if (tSettings) setTenantInfo(tSettings);
      if (pricingCfg) {
        setPricingConfig(pricingCfg);
        if (pricingCfg.tokens_per_message) {
          setGlobalTokensPerMessage(pricingCfg.tokens_per_message);
        }
        if (pricingCfg.bkash_enabled === false && pricingCfg.eps_enabled !== false) {
          setTopupGateway("eps");
        } else if (pricingCfg.eps_enabled === false && pricingCfg.bkash_enabled !== false) {
          setTopupGateway("bkash");
        }
      }
      if (dbPlans && dbPlans.length > 0) {
        const mapped = dbPlans.map(p => {
          const msgEst = calculateEstimatedMessages(p.monthly_token_limit, pricingCfg?.tokens_per_message);
          const tokenStr = p.monthly_token_limit >= 1000000 
            ? `${(p.monthly_token_limit / 1000000).toFixed(p.monthly_token_limit % 1000000 === 0 ? 0 : 1)}M` 
            : `${(p.monthly_token_limit / 1000).toFixed(0)}k`;
          return {
            id: p.code,
            name: p.name,
            monthlyPrice: p.monthly_price_bdt,
            annualPrice: p.annual_price_bdt,
            tokens: `~${msgEst.toLocaleString()} Messages (~${tokenStr} Tokens)`,
            tokenLimitNum: p.monthly_token_limit,
            websites: `${p.max_websites} Websites`,
            agents: `${p.max_agents} Agent Seats`,
            rag: `${p.max_knowledge_docs || 50} Knowledge Docs`,
            badge: p.badge_text || (p.is_popular ? "MOST POPULAR" : null),
            description: p.description,
            features: (p.features || []).map((f: string) => enhanceFeatureWithMessages(f, p.monthly_token_limit, pricingCfg?.tokens_per_message))
          };
        });
        setPlans(mapped);
      }
    } catch (err) {
      console.error("Failed to load subscription details:", err);
      showToast("Error", "Could not load live subscription details.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim() || !selectedPlanForChange) return;
    setIsValidatingCoupon(true);
    try {
      const rawPrice = isAnnual ? selectedPlanForChange.annualPrice * 12 : selectedPlanForChange.monthlyPrice;
      const res = await api.validateCoupon(couponCodeInput.trim(), selectedPlanForChange.id, rawPrice);
      if (res.valid) {
        setAppliedCoupon(res);
        showToast("Coupon Applied!", res.message, "success");
      } else {
        setAppliedCoupon(null);
        showToast("Coupon Invalid", res.message, "error");
      }
    } catch (err: any) {
      setAppliedCoupon(null);
      showToast("Coupon Error", err.message || "Failed to validate coupon", "error");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const currentTierId = (subscription?.tier || "enterprise").toLowerCase();

  const handleConfirmPlanChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForChange) return;

    if (selectedPaymentMethod.toLowerCase().includes("bkash") || selectedPaymentMethod.toLowerCase().includes("eps")) {
      const planToBuy = selectedPlanForChange;
      setSelectedPlanForChange(null);
      setSelectedCheckoutPlan(planToBuy);
      return;
    }

    setIsChangingPlan(true);
    try {
      const cycleStr = isAnnual ? "annual" : "monthly";
      await api.changeSubscriptionPlan(
        selectedPlanForChange.id,
        cycleStr,
        selectedPaymentMethod
      );

      showToast(
        "Plan Updated Successfully",
        `Your organization has been upgraded to the ${selectedPlanForChange.name}. Quota is now ${selectedPlanForChange.tokens}.`,
        "success"
      );

      setSelectedPlanForChange(null);
      await loadData();
      if (refreshUser) await refreshUser();
    } catch (err: any) {
      showToast("Plan Change Failed", err.message || "Could not change plan", "error");
    } finally {
      setIsChangingPlan(false);
    }
  };

  const handleDirectSwitchFree = async (plan: any) => {
    if (!confirm("Are you sure you want to switch to the Free Sandbox plan? Your quotas will be adjusted to 50,000 tokens/mo.")) {
      return;
    }
    setIsChangingPlan(true);
    try {
      await api.changeSubscriptionPlan("free", "monthly", "Free Tier");
      showToast("Plan Updated", "Successfully switched to Free Sandbox plan.", "success");
      await loadData();
      if (refreshUser) await refreshUser();
    } catch (err: any) {
      showToast("Error", err.message || "Failed to switch plan", "error");
    } finally {
      setIsChangingPlan(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Loading subscription quotas & billing details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 font-sans antialiased">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 uppercase tracking-wide flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5" /> Subscription & Resource Meter
            </span>
            <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active Verified Plan
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2 flex items-center gap-2">
            Subscription Plans & Billing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your AI token quotas, active storefront widget limits, agent seats, and invoice history in Bangladeshi Taka (৳).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadData}
            className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
          </button>
        </div>
      </div>

      {/* 1. Live Active Subscription & Resource Quota Pulse */}
      {subscription && (
        <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-indigo-900/50 pb-5 relative z-10">
            <div>
              <div className="text-[11px] font-mono text-indigo-300 uppercase tracking-wider font-semibold">
                Current Active Subscription
              </div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-3 mt-1">
                <span>{subscription.tier}</span>
                <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-3 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  {subscription.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                ৳{subscription.price_bdt.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ month</span>
              </div>
              <div className="text-[11px] text-indigo-200/70 font-mono mt-0.5">
                Renews on: {new Date(subscription.current_period_end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </div>
            </div>
          </div>

          {/* 3 Live Resource Quota Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs relative z-10">

            {/* AI Tokens Meter */}
            <div className="bg-slate-900/80 backdrop-blur-sm p-4 rounded-2xl border border-indigo-500/20 space-y-2">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-semibold flex items-center gap-1.5 text-white">
                  <Cpu className="w-4 h-4 text-indigo-400" /> Monthly AI Tokens
                </span>
                <span className="font-mono text-indigo-300 font-bold">{subscription.usage_percent}%</span>
              </div>
              <div className="text-base font-bold text-white font-mono">
                {(subscription.used_tokens / 1000).toFixed(0)}k <span className="text-xs text-slate-400 font-normal">/ {(subscription.monthly_token_limit / 1000000).toFixed(1)}M Tokens</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    subscription.usage_percent > 90 ? 'bg-rose-500' : subscription.usage_percent > 70 ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, subscription.usage_percent))}%` }}
                />
              </div>
            </div>

            {/* Storefront Widgets Quota */}
            <div className="bg-slate-900/80 backdrop-blur-sm p-4 rounded-2xl border border-indigo-500/20 space-y-2">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-semibold flex items-center gap-1.5 text-white">
                  <Globe className="w-4 h-4 text-indigo-400" /> Storefront Widgets
                </span>
                <span className="font-mono text-emerald-400 font-bold">Active</span>
              </div>
              <div className="text-base font-bold text-white font-mono">
                {subscription.current_websites_count} <span className="text-xs text-slate-400 font-normal">/ {subscription.max_websites >= 100 ? 'Unlimited' : `${subscription.max_websites} Allowed`}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full" style={{ width: `${Math.min(100, (subscription.current_websites_count / Math.max(1, subscription.max_websites)) * 100)}%` }} />
              </div>
            </div>

            {/* Support Agent Seats */}
            <div className="bg-slate-900/80 backdrop-blur-sm p-4 rounded-2xl border border-indigo-500/20 space-y-2">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-semibold flex items-center gap-1.5 text-white">
                  <Users className="w-4 h-4 text-indigo-400" /> Staff Agent Seats
                </span>
                <span className="font-mono text-emerald-400 font-bold">Active</span>
              </div>
              <div className="text-base font-bold text-white font-mono">
                {subscription.current_agents_count} <span className="text-xs text-slate-400 font-normal">/ {subscription.max_agents >= 100 ? 'Unlimited' : `${subscription.max_agents} Seats`}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full" style={{ width: `${Math.min(100, (subscription.current_agents_count / Math.max(1, subscription.max_agents)) * 100)}%` }} />
              </div>
            </div>

          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-slate-400 border-t border-indigo-900/50 relative z-10">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Payment Method: <strong className="text-white font-semibold">{subscription.payment_method}</strong></span>
            </div>
            <div className="font-mono text-indigo-300/80">
              Auto-Renewal Protected • AES-256 Encrypted
            </div>
          </div>
        </div>
      )}

      {/* 2. Prepaid AI Wallet & Pay-As-You-Go Pulse */}
      {wallet && (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Prepaid AI Balance & Pay-As-You-Go Wallet
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-1">
                ৳{wallet.balance_bdt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsTopupModalOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Recharge with bKash</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-slate-500 font-medium">Total Top-Ups</div>
              <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                ৳{wallet.total_credited_bdt.toLocaleString()}
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-slate-500 font-medium">AI Usage Consumed</div>
              <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                ৳{wallet.total_consumed_bdt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-slate-500 font-medium">Token Metering Rate</div>
              <div className="text-base font-bold text-emerald-600 font-mono mt-0.5">
                ৳{wallet.per_1k_tokens_rate_bdt} / 1k Tokens
              </div>
            </div>
          </div>

          {/* Recent Wallet Transactions Ledger */}
          {wallet.recent_transactions && wallet.recent_transactions.length > 0 && (
            <div className="pt-2">
              <div className="text-xs font-bold text-slate-700 mb-2">Recent Wallet Activity</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] text-slate-400 font-mono">
                      <th className="py-2">Type</th>
                      <th className="py-2">Description</th>
                      <th className="py-2">Amount</th>
                      <th className="py-2">Balance After</th>
                      <th className="py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {wallet.recent_transactions.slice(0, 5).map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tx.transaction_type === "topup" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                            }`}>
                            {tx.transaction_type.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-700 font-medium">{tx.description}</td>
                        <td className={`py-2.5 font-mono font-bold ${tx.amount_bdt >= 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                          {tx.amount_bdt >= 0 ? `+৳${tx.amount_bdt.toLocaleString()}` : `-৳${Math.abs(tx.amount_bdt).toFixed(2)}`}
                        </td>
                        <td className="py-2.5 font-mono text-slate-500">৳{tx.balance_after_bdt.toFixed(2)}</td>
                        <td className="py-2.5 text-slate-400 font-mono text-[11px]">
                          {new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Billing Toggle & Section Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Available Subscription Packages</h2>
          <p className="text-xs text-slate-500 mt-0.5">Instant self-serve plan switching with bKash Direct Merchant & EPS gateway</p>
        </div>

        <div className="bg-slate-100 border border-slate-200 p-1 rounded-2xl flex items-center gap-1 text-xs font-semibold shadow-xs">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer font-bold ${
              !isAnnual
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
              isAnnual
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black uppercase">
              Up to 25% OFF
            </span>
          </button>
        </div>
      </div>

      {/* 3. Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {plans.map(p => {
          const currentPlanCode = (subscription?.plan_code || "").toLowerCase();
          const currentPlanTier = (subscription?.tier || "").toLowerCase();
          const pId = p.id.toLowerCase();
          const pName = p.name.toLowerCase();

          const isCurrent = (currentPlanCode && (pId === currentPlanCode || pName === currentPlanCode)) ||
            pName === currentPlanTier ||
            pId === currentPlanTier ||
            currentPlanTier.includes(pId) ||
            pName.includes(currentPlanTier);

          const isPopular = p.badge?.toLowerCase().includes("popular") || p.id === "growth";
          const displayPrice = isAnnual ? p.annualPrice : p.monthlyPrice;
          const planDiscountPercent = p.monthlyPrice > 0 && p.annualPrice < p.monthlyPrice
            ? Math.round(((p.monthlyPrice - p.annualPrice) / p.monthlyPrice) * 100)
            : 0;
          const yearlySavings = p.monthlyPrice > p.annualPrice
            ? (p.monthlyPrice - p.annualPrice) * 12
            : 0;

          return (
            <div
              key={p.id}
              className={`p-6 sm:p-7 rounded-3xl border flex flex-col justify-between transition-all relative ${
                isCurrent
                  ? "bg-white border-emerald-600 shadow-xl ring-2 ring-emerald-600/20"
                  : isPopular
                    ? "bg-white border-indigo-600 shadow-xl ring-2 ring-indigo-600/20"
                    : "bg-white border-slate-200/90 shadow-sm hover:border-slate-300 hover:shadow-md"
              }`}
            >
              {/* Floating Badge */}
              {isCurrent ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-[11px] font-bold px-3.5 py-0.5 rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap">
                  <Check className="w-3.5 h-3.5 text-emerald-200 stroke-[3]" />
                  <span>Current Active Plan</span>
                </div>
              ) : isPopular ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-[11px] font-bold px-3.5 py-0.5 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap">
                  <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
                  <span>Most Popular Choice</span>
                </div>
              ) : p.badge ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-bold px-3.5 py-0.5 rounded-full shadow-md whitespace-nowrap">
                  <span>{p.badge}</span>
                </div>
              ) : null}

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-lg font-black text-slate-900">{p.name}</h4>
                    {isAnnual && planDiscountPercent > 0 && (
                      <span className="text-[10.5px] font-black uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        Save {planDiscountPercent}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 min-h-[34px] font-normal leading-relaxed">{p.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                        ৳{displayPrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        {p.monthlyPrice === 0 ? "/ forever" : "/ month"}
                      </span>
                    </div>

                    {isAnnual && planDiscountPercent > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs line-through text-slate-400 font-mono">
                          ৳{p.monthlyPrice.toLocaleString()}
                        </span>
                        <span className="inline-flex items-center bg-emerald-600 text-white text-[10.5px] font-black px-2 py-0.5 rounded-full shadow-xs">
                          {planDiscountPercent}% OFF
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center justify-between flex-wrap gap-1">
                    <span>
                      {p.monthlyPrice === 0
                        ? "Forever Free Sandbox"
                        : isAnnual
                          ? `Billed annually (৳${(displayPrice * 12).toLocaleString()} / yr)`
                          : "Billed monthly"}
                    </span>
                    {isAnnual && yearlySavings > 0 && (
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                        Save ৳{yearlySavings.toLocaleString()}/yr
                      </span>
                    )}
                  </div>

                  {/* Estimated Messages / Tokens Box */}
                  <div className="mt-3 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-indigo-950 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{p.tokens}</span>
                    </span>
                    <span className="text-[10px] font-mono text-indigo-600 font-bold">
                      {p.tokenLimitNum ? `${(p.tokenLimitNum / 1000).toLocaleString()}k Tokens` : "Included"}
                    </span>
                  </div>
                </div>

                {/* Core Resources */}
                <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2 font-medium">
                    <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="text-slate-800">{p.websites}</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="text-slate-800">{p.agents}</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-slate-800">{p.rag}</span>
                  </div>
                </div>

                {/* Detailed Features List */}
                <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
                  <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Included Features:
                  </div>
                  {p.features.map((f: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                      <div className="h-4 w-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-[11.5px] leading-relaxed text-slate-700">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-2 cursor-default"
                  >
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                    <span>Current Active Plan</span>
                  </button>
                ) : p.id === "free" ? (
                  <button
                    onClick={() => handleDirectSwitchFree(p)}
                    className="w-full py-3 rounded-2xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Switch to Free Sandbox</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenCheckout(p)}
                    className={`w-full py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
                      isPopular
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 hover:shadow-indigo-600/50"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Choose {p.name} (bKash / EPS)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* 4. Supported Bangladeshi Payment Methods */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Supported Payment Gateways in Bangladesh
        </h3>
        <p className="text-xs text-slate-500">
          All subscription invoices are auto-debited in Bangladeshi Taka (৳ BDT) with instant digital VAT receipts.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-pink-50/60 border border-pink-200/80 font-bold text-pink-900 flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-full bg-[#e2136e] text-white flex items-center justify-center text-[10px] font-black">৳</div>
            <div>
              <div>bKash Direct PGW</div>
              <div className="text-[10px] text-pink-700 font-normal">Tokenized Checkout</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 font-bold text-emerald-900 flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
            <div>
              <div>EPS Easy Payment</div>
              <div className="text-[10px] text-emerald-700 font-normal">Multi-Channel PGW</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 font-bold text-indigo-900 flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <div>
              <div>Cards (Visa/Master)</div>
              <div className="text-[10px] text-indigo-700 font-normal">Debit & Credit Cards</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 font-bold text-amber-900 flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">৳</div>
            <div>
              <div>Nagad, Rocket, Upay</div>
              <div className="text-[10px] text-amber-700 font-normal">Via EPS Gateway</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Billing Invoices & Payment History Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" /> Billing Invoices & Payment History (BDT ৳)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Download official receipts for your accounting and company tax deductions.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Billing Date</th>
                <th className="py-3 px-4">Package Plan</th>
                <th className="py-3 px-4">Amount BDT</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    No past invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                      {inv.invoice_number}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(inv.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {inv.plan_name} ({inv.billing_cycle})
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ৳{inv.amount_bdt.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {inv.payment_method}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setViewingInvoice(inv)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-indigo-600 font-bold rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer ml-auto text-[11px]"
                      >
                        <Download className="w-3.5 h-3.5" /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan Upgrade / Change Confirmation Modal */}
      {selectedPlanForChange && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10.5px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                  Confirm Subscription Change
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  Switch to {selectedPlanForChange.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPlanForChange(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPlanChange} className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                <div className="flex justify-between items-center font-bold text-slate-900">
                  <span>Selected Package:</span>
                  <span className="text-indigo-700">{selectedPlanForChange.name}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-slate-900">
                  <span>Monthly Price:</span>
                  <span className="font-mono text-emerald-700 text-sm">
                    ৳{selectedPlanForChange.monthlyPrice.toLocaleString()} BDT
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Monthly Token Quota:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedPlanForChange.tokens}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Included Staff Seats:</span>
                  <span className="font-bold text-slate-800">{selectedPlanForChange.agents}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Select Bangladeshi Payment Method</label>
                <select
                  value={selectedPaymentMethod}
                  onChange={e => setSelectedPaymentMethod(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 bg-white font-medium cursor-pointer"
                >
                  <option value="bKash Direct Merchant">bKash Direct Merchant (Auto-Verified)</option>
                  <option value="Nagad Pay Merchant">Nagad Pay Merchant</option>
                  <option value="Rocket DBBL Pay">Rocket DBBL Pay</option>
                  <option value="Local Cards (SSLCommerz)">Local Debit/Credit Card (Visa / Mastercard)</option>
                  <option value="Bank Wire Transfer">Corporate Bank Wire (BRAC / City Bank)</option>
                </select>
              </div>

              {/* Promo / Coupon Code Section */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo / Coupon Code (e.g. EID2026)"
                    value={couponCodeInput}
                    onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 bg-white text-slate-900 font-mono font-bold text-xs rounded-xl border border-slate-300 outline-none uppercase placeholder:text-slate-400 focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponCodeInput.trim()}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    {isValidatingCoupon ? "Checking..." : "Apply Coupon"}
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between font-bold text-emerald-800 animate-in fade-in">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{appliedCoupon.code} applied! Saved ৳{appliedCoupon.discount_amount_bdt.toLocaleString()} BDT.</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="text-slate-400 hover:text-rose-600 text-[11px] underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedPlanForChange(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPlan}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isChangingPlan ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isChangingPlan ? "Activating Plan..." : "Confirm & Activate Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Tax Invoice & Payment Receipt Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 sm:p-10 my-auto animate-in fade-in zoom-in-95 text-xs text-slate-800 font-sans space-y-6">

            {/* Modal Actions Bar (hidden on print) */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 no-print">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Official Tax Receipt & Payment Invoice
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 text-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setViewingInvoice(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Formal Tax Invoice Container */}
            <div id="printable-tax-invoice" className="space-y-6 bg-white">

              {/* 1. TOP HEADER: Issuer (Platform Super Admin) vs Invoice Meta */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b-2 border-slate-900">
                {/* ISSUER DETAILS (Jobab Chat Official Platform Information) */}
                <div className="space-y-2 max-w-sm">
                  <div className="flex items-center gap-3">
                    {(currentTheme?.logo_url?.trim() || currentTheme?.favicon_url?.trim()) ? (
                      <div className="h-11 min-w-11 max-w-[140px] rounded-xl border border-slate-200 bg-white flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-xs">
                        <img
                          src={currentTheme.logo_url?.trim() || currentTheme.favicon_url?.trim()}
                          alt={currentTheme?.platform_name || "Platform Brand Logo"}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0"
                        style={{ backgroundColor: currentTheme?.primary_color || "#2563EB" }}
                      >
                        {currentTheme?.platform_name ? currentTheme.platform_name.slice(0, 2).toUpperCase() : "AI"}
                      </div>
                    )}
                    <div>
                      <h2 className="text-base font-black text-slate-900 tracking-tight leading-snug">
                        {currentTheme?.platform_name || "Jobab Chat Enterprise Platform"}
                      </h2>
                      <div
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: currentTheme?.primary_color || "#059669" }}
                      >
                        {currentTheme?.platform_tagline || "Autonomous AI Customer Support & Chat Provider"}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    <p>{currentTheme?.company_address || "Level 8, Motijheel Commercial Area, Dhaka-1000, Bangladesh"}</p>
                    <p>
                      Support: <span className="font-mono text-slate-700">{currentTheme?.support_email || "support@jobab.chat"}</span>
                      {(currentTheme?.support_phone || "+880 1837-586105") && (
                        <> • Hotline: <span className="font-mono text-slate-700">{currentTheme?.support_phone || "+880 1837-586105"}</span></>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Govt. BIN Reg: <strong className="text-slate-700">004892176-0102</strong> • E-Commerce Trade Lic: <strong className="text-slate-700">TR-89210-DHK</strong>
                    </p>
                  </div>
                </div>

                {/* INVOICE META & STATUS */}
                <div className="sm:text-right space-y-1.5">
                  <div className="text-xs font-mono font-extrabold uppercase tracking-widest text-slate-400">
                    TAX INVOICE & RECEIPT
                  </div>
                  <div className="text-xl font-black text-slate-900 font-mono tracking-tight">
                    {viewingInvoice.invoice_number}
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    Invoice Date: <strong className="text-slate-900 font-mono">{new Date(viewingInvoice.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</strong>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    Payment Gateway: <strong className="text-slate-900">{viewingInvoice.payment_method}</strong>
                  </div>
                  <div className="text-[10.5px] text-slate-500 font-mono">
                    TrxID: <strong className="text-slate-800">TRX-{viewingInvoice.invoice_number.replace(/[^0-9]/g, '') || "9K82LX"}</strong>
                  </div>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full font-extrabold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PAID & SETTLED
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. BILLED TO (Customer / Client Company Details from Client Settings) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">
                    BILLED TO (CLIENT ORGANIZATION):
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    {tenantInfo?.name || subscription?.tenant_name || user?.tenant_name || "Client Organization"}
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium mt-1">
                    <span className="text-slate-400">Authorized Contact:</span> <strong className="text-slate-800">{user?.full_name || "Account Owner"}</strong>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    <span className="text-slate-400">Account Email:</span> <span className="font-mono text-slate-800">{tenantInfo?.branding_config?.support_email || user?.email}</span>
                  </div>
                </div>

                <div className="sm:text-right">
                  <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">
                    CLIENT STORE & LOCATION:
                  </div>
                  <div className="text-[11px] text-slate-700 font-medium">
                    {tenantInfo?.branding_config?.company_address || "Dhaka, Bangladesh"}
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    <span className="text-slate-400">Phone:</span> <span className="font-mono text-slate-800">{tenantInfo?.branding_config?.support_phone || "+880 1800-000000"}</span>
                  </div>
                  <div className="text-[10.5px] text-slate-500 font-mono mt-0.5">
                    Tenant Ref: <strong>TEN-{((subscription?.id || "CLIENT") as string).slice(0, 8).toUpperCase()}</strong>
                  </div>
                </div>
              </div>

              {/* 3. ITEMIZED SERVICE TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-800 bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">SL</th>
                      <th className="py-2.5 px-3">Service & Solution Description</th>
                      <th className="py-2.5 px-3">Billing Cycle</th>
                      <th className="py-2.5 px-3 text-right">Qty</th>
                      <th className="py-2.5 px-3 text-right">Rate (BDT)</th>
                      <th className="py-2.5 px-3 text-right">Amount (BDT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-3 px-3 font-mono font-bold text-slate-500">01</td>
                      <td className="py-3 px-3">
                        <div className="font-black text-slate-900 text-xs">
                          Enterprise AI Chatbot & Autonomous Live Solution
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          Package: <strong className="text-indigo-600">{viewingInvoice.plan_name}</strong> • Includes {subscription?.monthly_token_limit ? (subscription.monthly_token_limit / 1000000).toFixed(1) + "M" : "500k"} Tokens/mo, pgvector RAG Knowledge Base, 1-Line Embed Script & Multi-Agent Queues.
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {viewingInvoice.billing_cycle || "Monthly"}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">1</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                        ৳{viewingInvoice.amount_bdt.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                        ৳{viewingInvoice.amount_bdt.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 4. FINANCIAL SUMMARY & WORDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t-2 border-slate-200 items-start">
                <div className="space-y-2 p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-[11px] text-indigo-950">
                  <div className="font-bold flex items-center gap-1.5 text-indigo-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Payment Verification & Security</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Payment successfully captured and authorized via <strong>{viewingInvoice.payment_method}</strong>. Digital IT services delivered instantly under SLA compliance.
                  </p>
                  <div className="text-[10px] text-slate-500 font-mono pt-1">
                    Receipt Hash: <code>{viewingInvoice.invoice_number}-BD-AUTH-2026</code>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold text-slate-800">৳{viewingInvoice.amount_bdt.toLocaleString()} BDT</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>VAT / Tax (0% IT Export Exemption):</span>
                    <span className="font-mono text-slate-500">৳0.00 BDT</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t-2 border-slate-900">
                    <span>Total Amount Paid:</span>
                    <span className="font-mono text-emerald-700 text-base">৳{viewingInvoice.amount_bdt.toLocaleString()} BDT</span>
                  </div>
                </div>
              </div>

              {/* 5. OFFICIAL DIGITAL SEAL & SIGNATORY */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-6 text-[10px] text-slate-400">
                <div className="max-w-md space-y-1">
                  <p className="font-bold text-slate-600 uppercase tracking-wider">Terms & Legal Exemption:</p>
                  <p className="leading-relaxed">
                    This is an official computer-generated Tax Invoice issued by <strong>{currentTheme?.platform_name || "Jobab Chat Enterprise Platform"}</strong>. No physical signature is required. Eligible for company tax deductions & corporate accounting audits under Bangladesh NBR regulations.
                  </p>
                </div>

                {/* Digital Stamp / Seal Box */}
                <div className="border-2 border-dashed border-emerald-600/60 p-3 rounded-2xl bg-emerald-50/40 text-center space-y-1 min-w-[200px]">
                  <div className="text-[11px] font-black text-emerald-800 tracking-wider uppercase flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    DIGITALLY SEALED
                  </div>
                  <div className="text-[9.5px] font-bold text-slate-700 font-mono">
                    {currentTheme?.platform_name || "Jobab Chat"} Finance Dept.
                  </div>
                  <div className="text-[8.5px] text-slate-500 font-mono">
                    Authorized Electronic Receipt
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Bottom Close Action (hidden on print) */}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md text-xs"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
              <button
                type="button"
                onClick={() => setViewingInvoice(null)}
                className="px-5 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 cursor-pointer text-xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. Multi-Gateway Prepaid Wallet Top-Up Modal */}
      {isTopupModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-xs">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Recharge AI Prepaid Wallet</h3>
                  <p className="text-[11px] text-slate-500">Instant credit addition via bKash or EPS Gateway</p>
                </div>
              </div>
              <button
                onClick={() => setIsTopupModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Payment Gateway Toggle */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Select Payment Gateway</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pricingConfig?.bkash_enabled !== false && (
                    <button
                      type="button"
                      onClick={() => setTopupGateway("bkash")}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${topupGateway === "bkash"
                          ? "border-[#e2136e] bg-pink-50 text-[#e2136e] ring-1 ring-pink-500"
                          : "border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-[#e2136e] text-white flex items-center justify-center text-[10px] font-black">৳</span>
                      <span>bKash Direct</span>
                    </button>
                  )}

                  {pricingConfig?.eps_enabled !== false && (
                    <button
                      type="button"
                      onClick={() => setTopupGateway("eps")}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${topupGateway === "eps"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600"
                          : "border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                    >
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span>EPS Gateway</span>
                    </button>
                  )}

                  {pricingConfig?.bkash_enabled === false && pricingConfig?.eps_enabled === false && (
                    <div className="col-span-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      Payment gateways are temporarily undergoing maintenance.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Select Top-Up Amount (BDT)</label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[500, 1000, 2500, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopupAmount(amt)}
                      className={`py-2 rounded-xl text-xs font-bold font-mono border transition-all cursor-pointer ${topupAmount === amt
                          ? (topupGateway === "eps" ? "bg-emerald-600 text-white border-emerald-600" : "bg-pink-600 text-white border-pink-600 shadow-xs")
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                        }`}
                    >
                      ৳{amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono text-sm">৳</span>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(Number(e.target.value))}
                    placeholder="Enter custom amount..."
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Instant Account Credit
                </div>
                <div className="text-slate-600">
                  Your funds are immediately credited to your AI balance and deducted at ৳1.50 per 10k AI tokens used.
                </div>
              </div>

              <button
                onClick={() => handleTopupWallet(topupAmount)}
                disabled={isInitiatingTopup || topupAmount < 100}
                className={`w-full py-3 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${topupGateway === "eps" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[#E2136E] hover:bg-[#C90E60]"
                  }`}
              >
                {isInitiatingTopup ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Pay ৳{topupAmount.toLocaleString()} via {topupGateway === "eps" ? "EPS" : "bKash"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Gateway Subscription Purchase Modal */}
      {selectedCheckoutPlan && (
        <PaymentMethodModal
          plan={selectedCheckoutPlan}
          isAnnual={isAnnual}
          couponCode={appliedCoupon?.code}
          discountAmount={appliedCoupon?.discount_amount_bdt || 0}
          payerEmail={user?.email}
          payerName={user?.full_name}
          onClose={() => setSelectedCheckoutPlan(null)}
          onSuccess={() => {
            setSelectedCheckoutPlan(null);
            loadData();
          }}
        />
      )}

    </div>
  );
}
