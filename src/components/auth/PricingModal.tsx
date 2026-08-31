"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { 
  Building2, Check, Sparkles, X, RefreshCw, 
  ArrowRight, ArrowLeft, ShieldCheck, Zap, Lock, 
  CreditCard, Tag, User, Mail, Key, ExternalLink 
} from "lucide-react";
import { api } from "../../lib/api";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedTier?: string;
}

export default function PricingModal({ isOpen, onClose, initialSelectedTier }: PricingModalProps) {
  const router = useRouter();
  const { loginWithToken } = useAuth();
  const { currentTheme } = useTheme();
  const { showToast } = useToast();

  const [plans, setPlans] = useState<any[]>([
    {
      id: "starter",
      code: "starter",
      name: "Starter Package",
      monthlyPrice: 4990,
      annualPrice: 4240,
      price: "৳4,990",
      period: "/ month",
      tokens: "500,000 AI Tokens",
      seats: "2 Support Seats",
      widgets: "1 Website Widget",
      desc: "Perfect for early-stage startups and small online businesses in Bangladesh."
    },
    {
      id: "growth",
      code: "growth",
      name: "Growth Package",
      monthlyPrice: 19990,
      annualPrice: 16990,
      price: "৳19,990",
      period: "/ month",
      popular: true,
      badge_text: "MOST POPULAR",
      tokens: "2,500,000 AI Tokens",
      seats: "10 Support Seats",
      widgets: "5 Website Widgets",
      desc: "Ideal for growing e-commerce brands and IT companies needing RAG knowledge search."
    },
    {
      id: "enterprise",
      code: "enterprise",
      name: "Enterprise Package",
      monthlyPrice: 49990,
      annualPrice: 42490,
      price: "৳49,990",
      period: "/ month",
      tokens: "10,000,000 AI Tokens",
      seats: "25 Support Seats",
      widgets: "Unlimited Widgets",
      desc: "Complete white-label, 99.99% uptime SLA, and bKash/Nagad/Card corporate billing."
    }
  ]);

  const [selectedTier, setSelectedTier] = useState<string>(initialSelectedTier || "growth");
  const [activeStep, setActiveStep] = useState<1 | 2>(1);

  // Sync initialSelectedTier when prop changes
  useEffect(() => {
    if (initialSelectedTier) {
      setSelectedTier(initialSelectedTier);
    }
  }, [initialSelectedTier]);

  // Form State
  const [orgName, setOrgName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessCategory, setBusinessCategory] = useState<"ecommerce" | "erp" | "services">("ecommerce");
  const [isLoading, setIsLoading] = useState(false);

  // Coupon State
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // bKash Checkout State
  const [isBkashModalOpen, setIsBkashModalOpen] = useState(false);

  // Fetch dynamic plans and pricing config from database
  useEffect(() => {
    if (isOpen) {
      Promise.all([
        api.getPublicPlans().catch(() => []),
        api.getPublicPricingConfig().catch(() => null)
      ]).then(([dbPlans, pricingCfg]: [any[], any]) => {
        if (dbPlans && Array.isArray(dbPlans) && dbPlans.length > 0) {
          const paid = dbPlans.filter(p => p.monthly_price_bdt > 0 && p.is_active !== false);
          if (paid.length > 0) {
            const formatted = paid.map(p => ({
              id: p.code,
              code: p.code,
              name: p.name,
              monthlyPrice: p.monthly_price_bdt,
              annualPrice: p.annual_price_bdt || Math.round(p.monthly_price_bdt * 0.85),
              price: `৳${p.monthly_price_bdt.toLocaleString()}`,
              period: "/ month",
              popular: p.is_popular,
              badge_text: p.badge_text,
              tokens: `${(p.monthly_token_limit / 1000).toLocaleString()}k AI Tokens`,
              seats: `${p.max_agents} Support Seats`,
              widgets: `${p.max_websites} Website Widgets`,
              desc: p.description,
              features: p.features
            }));

            const isPaygActive = pricingCfg?.pay_as_you_go_enabled !== false;
            const tokenRate10k = pricingCfg?.default_per_10k_tokens_rate_bdt || 1.50;
            const minTopup = pricingCfg?.min_wallet_topup_bdt || 1000;

            const paygPlan = isPaygActive ? {
              id: "payg",
              code: "payg",
              name: "⚡ Pay-As-You-Go Wallet",
              monthlyPrice: minTopup,
              annualPrice: minTopup,
              price: `৳${minTopup.toLocaleString()} Initial Top-Up`,
              period: "prepaid credit",
              popular: false,
              badge_text: "ZERO CONTRACT",
              tokens: `Pay ৳${tokenRate10k.toFixed(2)} per 10k Tokens`,
              seats: "5 Support Seats",
              widgets: "2 Website Widgets",
              desc: "No recurring subscription. Pure usage-based billing with instant bKash recharge.",
              features: [
                "No monthly recurring fees",
                `৳${tokenRate10k.toFixed(2)} per 10,000 tokens`,
                "Instant bKash Recharge",
                "Full Autonomous AI & RAG",
                "Credits never expire"
              ]
            } : null;

            const allPlans = paygPlan ? [...formatted, paygPlan] : formatted;
            setPlans(allPlans);
            const targetTier = initialSelectedTier || selectedTier;
            if (allPlans.some(p => p.id === targetTier)) {
              setSelectedTier(targetTier);
            } else {
              setSelectedTier(allPlans[0].id);
            }
          }
        }
      });
    }
  }, [isOpen, initialSelectedTier]);

  if (!isOpen) return null;

  const currentPlan = plans.find(p => p.id === selectedTier) || plans[0];
  const rawPrice = currentPlan ? currentPlan.monthlyPrice : 19990;
  const discountAmount = appliedCoupon?.discount_amount_bdt || 0;
  const finalPrice = Math.max(0, rawPrice - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return;
    setIsValidatingCoupon(true);
    try {
      const res = await api.validateCoupon(couponCodeInput.trim(), selectedTier, rawPrice);
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

  const validateForm = () => {
    if (!orgName.trim() || !adminEmail.trim() || !password.trim()) {
      showToast("Validation Error", "Please fill in Company Name, Email, and Password.", "error");
      return false;
    }
    if (password.length < 6) {
      showToast("Validation Error", "Password must be at least 6 characters.", "error");
      return false;
    }
    return true;
  };

  const handleStartPayment = async (gateway: "bkash" | "eps" = "bkash") => {
    if (!validateForm()) return;
    try {
      setIsLoading(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("aiaas_pending_signup", JSON.stringify({
          organization_name: orgName,
          admin_name: adminName || orgName + " Admin",
          admin_email: adminEmail,
          password: password,
          subscription_tier: selectedTier,
          billing_cycle: "monthly",
          business_category: businessCategory
        }));
      }

      if (gateway === "eps") {
        const session = await api.createEpsPayment(
          selectedTier,
          "monthly",
          {
            name: adminName || orgName + " Admin",
            email: adminEmail,
            phone: "01700000000",
            address: "Dhaka, Bangladesh"
          },
          appliedCoupon?.code
        );
        if (session && session.redirectURL) {
          window.location.href = session.redirectURL;
        } else {
          showToast("EPS Gateway", "Failed to connect with EPS checkout.", "error");
        }
      } else {
        const session = await api.createBkashPayment(selectedTier, "monthly", "01770618575", appliedCoupon?.code);
        if (session && session.bkashURL) {
          window.location.href = session.bkashURL;
        } else {
          showToast("bKash Gateway", "Failed to connect with official bKash checkout.", "error");
        }
      }
    } catch (err: any) {
      showToast("Payment Error", err.message || "Failed to initiate payment gateway.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProvisionWorkspace = async (trxData?: any) => {
    setIsLoading(true);
    try {
      const res = await api.provisionTenant({
        organization_name: orgName,
        admin_name: adminName || orgName + " Admin",
        admin_email: adminEmail,
        password: password,
        subscription_tier: selectedTier,
        business_category: businessCategory
      });

      if (res.access_token) {
        localStorage.setItem("aiaas_token", res.access_token);
        if (loginWithToken) {
          await loginWithToken(res.access_token);
        } else {
          window.location.reload();
        }
      }

      showToast(
        "Welcome to Enterprise AIaaS!",
        `Successfully provisioned ${orgName} on ${selectedTier.toUpperCase()} plan.` + (trxData?.trxID ? ` bKash TrxID: ${trxData.trxID}` : ""),
        "success"
      );
      setIsBkashModalOpen(false);
      onClose();
    } catch (err: any) {
      console.error("Provision error:", err);
      showToast("Registration Error", err.message || "Failed to provision workspace", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans antialiased animate-in fade-in">
        
        {/* Main Modal Container with Max-Height and Flex Column */}
        <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95">
          
          {/* 1. Modal Fixed Header */}
          <div className="shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight">
                  Buy AIaaS Package & Start Workspace
                </h2>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Instant multi-tenant PostgreSQL provisioning & bKash checkout
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push("/pricing");
                }}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold px-2 py-1 rounded-lg hover:bg-blue-50 hidden md:flex items-center gap-1 cursor-pointer"
                title="Open Full Page View"
              >
                <span>Full Page</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <button 
                onClick={onClose} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Stepper Toggle (< lg) */}
          <div className="lg:hidden shrink-0 flex border-b border-slate-100 bg-slate-50/80 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={`flex-1 py-2 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeStep === 1
                  ? "border-b-2 border-blue-600 text-blue-700 bg-white shadow-xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <span className="h-4 w-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">1</span>
              <span>Select Plan</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className={`flex-1 py-2 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeStep === 2
                  ? "border-b-2 border-blue-600 text-blue-700 bg-white shadow-xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <span className="h-4 w-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">2</span>
              <span>Account & Pay</span>
            </button>
          </div>

          {/* 2. Scrollable Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar">
            
            {/* Desktop 2-Column Split OR Mobile Step Swapping */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              {/* LEFT COLUMN: Plan Selection Cards */}
              <div className={`lg:col-span-7 space-y-3 ${activeStep === 1 ? "block" : "hidden lg:block"}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Choose Your Subscription Tier
                  </span>
                  <span className="text-[11px] text-slate-500">{plans.length} tiers</span>
                </div>

                <div className="space-y-2.5">
                  {plans.map(p => {
                    const isSelected = selectedTier === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedTier(p.id);
                          setAppliedCoupon(null);
                        }}
                        className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                          isSelected
                            ? "shadow-sm ring-2"
                            : "border-slate-200 hover:border-slate-400 bg-white"
                        }`}
                        style={isSelected ? { borderColor: currentTheme.primary_color, backgroundColor: `${currentTheme.primary_color}10`, outlineColor: currentTheme.primary_color } : {}}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-900">{p.name}</h3>
                            {p.popular && (
                              <span
                                className="text-[9px] font-bold text-white px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: currentTheme.primary_color }}
                              >
                                POPULAR
                              </span>
                            )}
                            {p.badge_text && !p.popular && (
                              <span className="text-[9px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">
                                {p.badge_text}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{p.desc}</p>
                          <div className="flex items-center gap-3 pt-1 text-[11px] font-medium text-slate-700">
                            <span className="flex items-center gap-1 font-semibold" style={{ color: currentTheme.primary_color }}>
                              <Zap className="w-3 h-3" /> {p.tokens}
                            </span>
                            <span className="flex items-center gap-1 text-slate-600">
                              <Check className="w-3 h-3 text-emerald-600" /> {p.seats}
                            </span>
                            <span className="flex items-center gap-1 text-slate-600">
                              <Check className="w-3 h-3 text-emerald-600" /> {p.widgets}
                            </span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 shrink-0">
                          <div className="text-base sm:text-lg font-bold text-slate-900 font-mono">
                            {p.price} <span className="text-[10px] font-normal text-slate-500 font-sans">/mo</span>
                          </div>
                          <div
                            className={`mt-1.5 px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 ${
                              isSelected 
                                ? "text-white shadow-xs" 
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                            style={isSelected ? { backgroundColor: currentTheme.primary_color } : {}}
                          >
                            {isSelected ? <Check className="w-3 h-3 font-bold" /> : null}
                            <span>{isSelected ? "Selected" : "Select"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile Next Step CTA */}
                <div className="lg:hidden pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Workspace Setup</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: Workspace Account & Checkout Form */}
              <div className={`lg:col-span-5 space-y-3.5 ${activeStep === 2 ? "block" : "hidden lg:block"}`}>
                
                {/* Active Plan Pill */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Selected Package</span>
                    <div className="font-extrabold text-slate-900">{currentPlan.name}</div>
                    <div className="text-[11px] text-slate-500">{currentPlan.tokens}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-black text-slate-900 text-sm">{currentPlan.price}</div>
                    <button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold underline cursor-pointer"
                    >
                      Change Plan
                    </button>
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="space-y-1.5 text-xs">
                  <label className="block font-bold text-slate-700">Promo / Coupon Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. EID2026"
                      value={couponCodeInput}
                      onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 bg-white text-slate-900 font-mono font-bold text-xs rounded-xl border border-slate-300 outline-none uppercase placeholder:text-slate-400 focus:border-indigo-600 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon || !couponCodeInput.trim()}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      {isValidatingCoupon ? "..." : "Apply"}
                    </button>
                  </div>

                  {appliedCoupon && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-800 animate-in fade-in">
                      <span className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{appliedCoupon.code} applied (-৳{appliedCoupon.discount_amount_bdt.toLocaleString()} BDT)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setAppliedCoupon(null)}
                        className="text-slate-400 hover:text-rose-600 text-[10px] underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <form id="pricing-modal-form" onSubmit={(e) => { e.preventDefault(); handleStartPayment("bkash"); }} className="space-y-3 text-xs">
                  {/* Business Model / Archetype Selector */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Business Model / Industry Type *</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setBusinessCategory("ecommerce")}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                          businessCategory === "ecommerce"
                            ? "bg-indigo-50/80 border-indigo-600 ring-1 ring-indigo-600 text-indigo-950 font-bold shadow-xs"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-base">🛍️</span>
                          {businessCategory === "ecommerce" && <Check className="w-3 h-3 text-indigo-600" />}
                        </div>
                        <div>
                          <div className="font-bold text-[11px]">E-Commerce</div>
                          <div className="text-[9px] text-slate-500 font-normal leading-tight">Products & COD</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBusinessCategory("erp")}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                          businessCategory === "erp"
                            ? "bg-blue-50/80 border-blue-600 ring-1 ring-blue-600 text-blue-950 font-bold shadow-xs"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-base">🏢</span>
                          {businessCategory === "erp" && <Check className="w-3 h-3 text-blue-600" />}
                        </div>
                        <div>
                          <div className="font-bold text-[11px]">ERP / B2B</div>
                          <div className="text-[9px] text-slate-500 font-normal leading-tight">SLA & Knowledge</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBusinessCategory("services")}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                          businessCategory === "services"
                            ? "bg-emerald-50/80 border-emerald-600 ring-1 ring-emerald-600 text-emerald-950 font-bold shadow-xs"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-base">💼</span>
                          {businessCategory === "services" && <Check className="w-3 h-3 text-emerald-600" />}
                        </div>
                        <div>
                          <div className="font-bold text-[11px]">Services</div>
                          <div className="text-[9px] text-slate-500 font-normal leading-tight">Leads & Bookings</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Company / Organization Name *</label>
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={e => setOrgName(e.target.value)}
                      placeholder={businessCategory === "ecommerce" ? "e.g. Padma Fashion BD" : "e.g. Apex Enterprise Solutions"}
                      className="w-full px-3 py-2 bg-white text-slate-900 font-medium placeholder:text-slate-400 border border-slate-300 rounded-xl outline-none focus:border-indigo-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Admin Full Name *</label>
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={e => setAdminName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-3 py-2 bg-white text-slate-900 font-medium placeholder:text-slate-400 border border-slate-300 rounded-xl outline-none focus:border-indigo-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Work Email Address *</label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="alex@company.com"
                      className="w-full px-3 py-2 bg-white text-slate-900 font-medium placeholder:text-slate-400 border border-slate-300 rounded-xl outline-none focus:border-indigo-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Account Password *</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full px-3 py-2 bg-white text-slate-900 font-medium placeholder:text-slate-400 border border-slate-300 rounded-xl outline-none focus:border-indigo-600 transition-all"
                    />
                  </div>
                </form>

              </div>

            </div>

          </div>

          {/* 3. Modal Sticky Bottom Action Bar */}
          <div className="shrink-0 px-4 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <div className="text-left">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Amount</span>
                {appliedCoupon ? (
                  <div className="font-mono font-black text-emerald-700 text-sm sm:text-base">
                    <span className="line-through text-slate-400 text-xs mr-1 font-normal">{currentPlan.price}</span>
                    ৳{finalPrice.toLocaleString()} BDT
                  </div>
                ) : (
                  <div className="font-mono font-black text-indigo-700 text-sm sm:text-base">
                    ৳{finalPrice.toLocaleString()} BDT
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 ml-2">
                <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="hidden sm:inline">Isolated DB & SLA</span>
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>

              {/* Instant Sandbox Trial Launch */}
              <button
                type="button"
                disabled={isLoading || !orgName.trim() || !adminEmail.trim() || !password.trim()}
                onClick={() => handleProvisionWorkspace()}
                className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
                <span className="hidden sm:inline">Direct Trial</span>
                <span className="sm:hidden">Trial</span>
              </button>

              {/* Pay with EPS Gateway Button */}
              <button
                type="button"
                disabled={isLoading || !orgName.trim() || !adminEmail.trim() || !password.trim()}
                onClick={() => handleStartPayment("eps")}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay with EPS</span>
              </button>

              {/* Pay with bKash PGW Button */}
              <button
                type="button"
                disabled={isLoading || !orgName.trim() || !adminEmail.trim() || !password.trim()}
                onClick={() => handleStartPayment("bkash")}
                className="px-4 py-2 bg-[#e2136e] hover:bg-[#c00f5c] text-white font-bold rounded-xl text-xs shadow-md shadow-pink-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <span className="h-4 w-4 rounded-full bg-white text-[#e2136e] flex items-center justify-center text-[10px] font-black">৳</span>
                <span>Pay with bKash</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
