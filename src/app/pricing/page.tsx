"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import {
  Sparkles, Check, ArrowRight, ShieldCheck, Zap, Lock,
  CreditCard, Tag, ArrowLeft, Building2, User, Mail, Key,
  CheckCircle2, RefreshCw, Star, HelpCircle, PhoneCall, Layers
} from "lucide-react";
import { api } from "../../lib/api";
import { calculateEstimatedMessages, enhanceFeatureWithMessages, setGlobalTokensPerMessage } from "../../lib/pricingUtils";

export default function PricingPage() {
  const router = useRouter();
  const { user, loginWithToken } = useAuth();
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
      tokens: "~1,500 Messages (~500k Tokens)",
      seats: "2 Support Seats",
      widgets: "1 Website Widget",
      desc: "Perfect for early-stage startups and small online businesses in Bangladesh.",
      features: [
        "~1,500 AI Messages / month (500k Tokens)",
        "1 Connected Website Widget",
        "2 Dedicated Agent Seats",
        "Bengali & English AI Auto-Reply",
        "Live Human Handover System",
        "bKash / Nagad Instant Billing"
      ]
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
      tokens: "~7,500 Messages (~2.5M Tokens)",
      seats: "10 Support Seats",
      widgets: "5 Website Widgets",
      desc: "Ideal for growing e-commerce brands and IT companies needing RAG knowledge search.",
      features: [
        "~7,500 AI Messages / month (2.5M Tokens)",
        "5 Connected Website Widgets",
        "10 Support & Sales Staff Seats",
        "Role-based Department Queues",
        "Autonomous CRM Lead Extraction",
        "pgvector Knowledge Base Search",
        "Priority Customer Support"
      ]
    },
    {
      id: "enterprise",
      code: "enterprise",
      name: "Enterprise Package",
      monthlyPrice: 49990,
      annualPrice: 42490,
      price: "৳49,990",
      period: "/ month",
      tokens: "~30,000 Messages (~10M Tokens)",
      seats: "25 Support Seats",
      widgets: "Unlimited Widgets",
      desc: "Complete white-label, 99.99% uptime SLA, and bKash/Nagad/Card corporate billing.",
      features: [
        "~30,000 AI Messages / month (10M Tokens)",
        "Unlimited Storefront Widgets",
        "25 Dedicated Staff & Admin Seats",
        "White-Label Chat Branding",
        "Custom Store Domain (CNAME)",
        "Dedicated 99.99% SLA Guarantee",
        "24/7 Dedicated Account Manager"
      ]
    }
  ]);

  const [selectedTier, setSelectedTier] = useState<string>("growth");
  const [isAnnual, setIsAnnual] = useState(false);
  const [activeStep, setActiveStep] = useState<1 | 2>(1);

  // Form State
  const [orgName, setOrgName] = useState("");
  const [websiteDomain, setWebsiteDomain] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const cleanDomainStr = (d: string) => {
    let cleaned = d.trim().toLowerCase();
    if (cleaned.includes("://")) cleaned = cleaned.split("://")[1];
    return cleaned.split("/")[0].split("?")[0].split(":")[0].trim();
  };

  // Coupon State
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // bKash Checkout State
  const [isBkashModalOpen, setIsBkashModalOpen] = useState(false);

  // Fetch dynamic plans and pricing config from database
  useEffect(() => {
    Promise.all([
      api.getPublicPlans().catch(() => []),
      api.getPublicPricingConfig().catch(() => null)
    ]).then(([dbPlans, pricingCfg]: [any[], any]) => {
      if (pricingCfg && pricingCfg.tokens_per_message) {
        setGlobalTokensPerMessage(pricingCfg.tokens_per_message);
      }
      if (dbPlans && dbPlans.length > 0) {
        const paid = dbPlans.filter(p => p.monthly_price_bdt > 0);
        if (paid.length > 0) {
          const formatted = paid.map(p => {
            const msgEst = calculateEstimatedMessages(p.monthly_token_limit, pricingCfg?.tokens_per_message);
            const tokenStr = p.monthly_token_limit >= 1000000 
              ? `${(p.monthly_token_limit / 1000000).toFixed(p.monthly_token_limit % 1000000 === 0 ? 0 : 1)}M` 
              : `${(p.monthly_token_limit / 1000).toFixed(0)}k`;
            return {
              id: p.code,
              code: p.code,
              name: p.name,
              monthlyPrice: p.monthly_price_bdt,
              annualPrice: p.annual_price_bdt || Math.round(p.monthly_price_bdt * 0.85),
              price: `৳${p.monthly_price_bdt.toLocaleString()}`,
              period: "/ month",
              popular: p.is_popular,
              badge_text: p.badge_text,
              tokens: `~${msgEst.toLocaleString()} Messages (~${tokenStr} Tokens)`,
              seats: `${p.max_agents} Support Seats`,
              widgets: `${p.max_websites} Website Widgets`,
              desc: p.description,
              features: (p.features || [
                `~${msgEst.toLocaleString()} AI Messages / mo (~${tokenStr} Tokens)`,
                `${p.max_agents} Support Seats`,
                `${p.max_websites} Website Widgets`,
                "bKash Instant Billing"
              ]).map((f: string) => enhanceFeatureWithMessages(f, p.monthly_token_limit, pricingCfg?.tokens_per_message))
            };
          });
          setPlans(formatted);
          if (!formatted.some(p => p.id === selectedTier)) {
            setSelectedTier(formatted[0].id);
          }
        }
      }
    }).catch(() => { });
  }, []);

  const currentPlan = plans.find(p => p.id === selectedTier) || plans[0];
  const rawPrice = currentPlan ? (isAnnual ? currentPlan.annualPrice * 12 : currentPlan.monthlyPrice) : 19990;
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
    if (!orgName.trim() || !adminEmail.trim()) {
      showToast("Validation Error", "Please fill in Company Name and Work Email.", "error");
      return false;
    }
    if (!websiteDomain.trim()) {
      showToast("Validation Error", "Please provide your Website / Storefront Domain.", "error");
      return false;
    }
    if (!user && (!password.trim() || password.length < 6)) {
      showToast("Validation Error", "Password must be at least 6 characters.", "error");
      return false;
    }
    return true;
  };

  const handleStartPayment = async (gateway: "bkash" | "eps" = "bkash") => {
    if (!validateForm()) return;
    try {
      setIsLoading(true);
      const sanitizedDomain = cleanDomainStr(websiteDomain);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("aiaas_pending_signup", JSON.stringify({
          organization_name: orgName,
          admin_name: adminName || orgName + " Admin",
          admin_email: adminEmail,
          password: password,
          subscription_tier: selectedTier,
          billing_cycle: isAnnual ? "annual" : "monthly",
          website_domain: sanitizedDomain
        }));
      }

      const cycle = isAnnual ? "annual" : "monthly";

      if (gateway === "eps") {
        const session = await api.createEpsPayment(
          selectedTier,
          cycle,
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
        const session = await api.createBkashPayment(selectedTier, cycle, "01770618575", appliedCoupon?.code);
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
      const sanitizedDomain = cleanDomainStr(websiteDomain);
      const res = await api.provisionTenant({
        organization_name: orgName,
        admin_name: adminName || orgName + " Admin",
        admin_email: adminEmail,
        password: password,
        subscription_tier: selectedTier,
        website_domain: sanitizedDomain
      });

      if (res.access_token) {
        localStorage.setItem("aiaas_token", res.access_token);
        if (loginWithToken) {
          await loginWithToken(res.access_token);
        }
      }

      showToast(
        "Welcome to Jobab Chat!",
        `Successfully provisioned ${orgName} on ${selectedTier.toUpperCase()} plan.` + (trxData?.trxID ? ` bKash TrxID: ${trxData.trxID}` : ""),
        "success"
      );
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Provision error:", err);
      showToast("Registration Error", err.message || "Failed to provision workspace", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen text-slate-100 font-sans antialiased flex flex-col justify-between transition-colors"
      style={{ backgroundColor: currentTheme.dark_surface }}
    >

      {/* Top Header */}
      <header
        className="px-4 sm:px-8 py-3.5 flex items-center justify-between border-b backdrop-blur-md sticky top-0 z-30 transition-colors"
        style={{
          backgroundColor: `${currentTheme.dark_surface}F0`,
          borderColor: currentTheme.dark_border
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/login")}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Back to Login"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          {currentTheme.logo_url ? (
            <img src={currentTheme.logo_url} alt="Logo" className="h-8 w-auto max-w-[100px] object-contain rounded-lg shadow-sm" />
          ) : (
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-white shadow-sm shrink-0"
              style={{ backgroundColor: currentTheme.primary_color }}
            >
              <Layers className="w-4 h-4 text-white" />
            </div>
          )}
          <div>
            <div className="font-bold text-white text-sm tracking-tight">
              {currentTheme.platform_name || "Jobab Chat Platform"} Workspace
            </div>
            <div className="text-[10px] text-slate-400 font-normal hidden sm:block">
              {currentTheme.platform_tagline || "Self-Serve Instant Multi-Tenant Setup"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/login")}
            className="px-3.5 py-1.5 border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
          >
            Sign In
          </button>
          <span
            className="text-[11px] px-2.5 py-1 rounded-full font-medium hidden md:flex items-center gap-1.5"
            style={{
              backgroundColor: `${currentTheme.primary_color}18`,
              borderColor: `${currentTheme.primary_color}40`,
              color: currentTheme.primary_color,
              borderWidth: "1px"
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: currentTheme.primary_color }}></span>
            bKash PGW Active
          </span>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 text-center space-y-2.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#00C978]/10 border border-[#00C978]/30 text-[#00C978] text-xs font-medium">
          <span>Self-Serve Instant Setup</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight max-w-3xl mx-auto leading-tight">
          Launch Your AI Customer Support Platform
        </h1>
        <p className="text-xs sm:text-sm text-[#759B87] max-w-2xl mx-auto leading-relaxed">
          Select your subscription tier. Your dedicated workspace, embeddable chat widget, and Bengali AI assistant will be provisioned instantly.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="pt-2 flex items-center justify-center gap-3">
          <div className="bg-[#0F1713] border border-[#1A2922] p-1 rounded-xl flex items-center gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${!isAnnual ? "bg-[#00C978] text-[#080D0A] shadow-sm font-bold" : "text-[#759B87] hover:text-white"
                }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${isAnnual ? "bg-[#00C978] text-[#080D0A] shadow-sm font-bold" : "text-[#759B87] hover:text-white"
                }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-[#080D0A] text-[#00C978] px-1.5 py-0.2 rounded-full font-bold">
                Save 15%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Responsive Split Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">

        {/* Mobile Step Indicator Tabs (< lg) */}
        <div className="lg:hidden flex border-b border-[#17271F] mb-6 font-semibold text-xs">
          <button
            onClick={() => setActiveStep(1)}
            className={`flex-1 py-2.5 border-b-2 text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${activeStep === 1
                ? "border-[#00C978] text-white bg-[#00C978]/10"
                : "border-transparent text-[#759B87] hover:text-[#CBD7D0]"
              }`}
          >
            <span className="h-4 w-4 rounded-full bg-[#17271F] text-[#CBD7D0] flex items-center justify-center text-[10px]">1</span>
            <span>1. Choose Package</span>
          </button>
          <button
            onClick={() => setActiveStep(2)}
            className={`flex-1 py-2.5 border-b-2 text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${activeStep === 2
                ? "border-[#00C978] text-white bg-[#00C978]/10"
                : "border-transparent text-[#759B87] hover:text-[#CBD7D0]"
              }`}
          >
            <span className="h-4 w-4 rounded-full bg-[#17271F] text-[#CBD7D0] flex items-center justify-center text-[10px]">2</span>
            <span>2. Account & Checkout</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT SIDE: Package Selection Cards */}
          <div className={`lg:col-span-7 space-y-4 ${activeStep === 1 ? "block" : "hidden lg:block"}`}>
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-sm sm:text-base font-bold text-white">Select Subscription Tier</h2>
              <span className="text-xs text-[#759B87] font-medium">{plans.length} tiers available</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {plans.map(p => {
                const isSelected = selectedTier === p.id;
                const displayPrice = isAnnual ? p.annualPrice : p.monthlyPrice;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedTier(p.id);
                      setAppliedCoupon(null);
                    }}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${isSelected
                        ? "border-[#00C978] bg-[#0F1713] shadow-lg ring-2 ring-[#00C978]"
                        : "border-[#1A2922] bg-[#0F1713]/80 hover:border-[#00C978]/60 hover:bg-[#0F1713]"
                      }`}
                  >
                    {p.popular && (
                      <span className="absolute -top-2.5 right-3 text-[10px] font-bold bg-[#00C978] text-[#080D0A] px-2 py-0.5 rounded-full shadow-sm">
                        POPULAR
                      </span>
                    )}
                    {p.badge_text && !p.popular && (
                      <span className="absolute -top-2.5 right-3 text-[10px] font-bold bg-amber-500 text-[#080D0A] px-2 py-0.5 rounded-full shadow-sm">
                        {p.badge_text}
                      </span>
                    )}

                    <div className="space-y-2.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-sm text-white">{p.name}</h3>
                          <p className="text-[11px] text-[#759B87] mt-0.5 line-clamp-2 leading-relaxed">{p.desc}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${isSelected ? "border-[#00C978] bg-[#00C978] text-[#080D0A]" : "border-[#1A2922]"
                          }`}>
                          {isSelected && <Check className="w-3 h-3 font-bold" />}
                        </div>
                      </div>

                      <div className="pt-1">
                        <div className="flex items-baseline justify-between gap-1 flex-wrap">
                          <div className="text-xl font-bold text-white font-mono">
                            ৳{displayPrice.toLocaleString()} <span className="text-xs font-normal text-[#759B87] font-sans">/ mo</span>
                          </div>
                          {isAnnual && p.monthlyPrice > p.annualPrice && (
                            <span className="text-[9.5px] font-black bg-[#00C978] text-[#080D0A] px-1.5 py-0.2 rounded-full">
                              {Math.round(((p.monthlyPrice - p.annualPrice) / p.monthlyPrice) * 100)}% OFF
                            </span>
                          )}
                        </div>
                        {isAnnual && (
                          <div className="text-[10px] text-[#00C978] font-medium mt-0.5 flex items-center justify-between flex-wrap gap-1">
                            <span>৳{(displayPrice * 12).toLocaleString()} BDT/yr</span>
                            {p.monthlyPrice > p.annualPrice && (
                              <span className="text-[9px] text-[#759B87]">
                                Save ৳{((p.monthlyPrice - p.annualPrice) * 12).toLocaleString()}/yr
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-2.5 border-t border-[#17271F] space-y-1 text-xs text-[#CBD7D0]">
                        <div className="flex items-center gap-2 text-[#E4ECE7] font-medium">
                          <Zap className="w-3.5 h-3.5 text-[#00C978] shrink-0" />
                          <span>{p.tokens}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#759B87]">
                          <Check className="w-3.5 h-3.5 text-[#00C978] shrink-0" />
                          <span>{p.seats}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#759B87]">
                          <Check className="w-3.5 h-3.5 text-[#00C978] shrink-0" />
                          <span>{p.widgets}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-[#17271F]">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTier(p.id);
                          setActiveStep(2);
                        }}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${isSelected
                            ? "bg-[#00C978] text-[#080D0A] shadow-sm"
                            : "bg-[#080D0A] hover:bg-[#17271F] text-[#CBD7D0] border border-[#1A2922]"
                          }`}
                      >
                        {isSelected ? "Selected Plan" : "Choose Tier"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Feature Comparison Checklist */}
            <div className="p-4 rounded-2xl bg-[#0F1713]/60 border border-[#1A2922] space-y-2.5 text-xs">
              <h4 className="font-semibold text-white text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00C978]" />
                <span>All Subscription Packages Include:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#759B87] text-[11.5px]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00C978] shrink-0" />
                  <span>Dedicated Secure Workspace & Data Vault</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00C978] shrink-0" />
                  <span>bKash Tokenized Sandbox / Live</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00C978] shrink-0" />
                  <span>Autonomous Neural AI Assistant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00C978] shrink-0" />
                  <span>Embeddable Web Chat Widget (JS)</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Workspace Registration & bKash Checkout */}
          <div className={`lg:col-span-5 space-y-4 ${activeStep === 2 ? "block" : "hidden lg:block"}`}>

            <div className="bg-[#0F1713] border border-[#1A2922] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">

              {/* Selected Plan Summary Banner */}
              <div className="p-3.5 rounded-xl bg-[#080D0A] border border-[#1A2922] flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-semibold text-[#759B87] uppercase tracking-wider">Active Plan</span>
                  <h3 className="text-sm font-bold text-white">{currentPlan.name}</h3>
                  <div className="text-[#759B87] font-normal">{currentPlan.tokens} • {currentPlan.seats}</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-white font-mono">
                    ৳{rawPrice.toLocaleString()}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="text-[11px] text-[#00C978] hover:underline font-medium cursor-pointer"
                  >
                    Change Plan
                  </button>
                </div>
              </div>

              {/* Account & Storefront Info Form */}
              <div className="space-y-3 pt-2 border-t border-[#1A2922]">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#00C978]" />
                  <span>Your Organization & Storefront Details</span>
                </h4>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Company / Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    placeholder="e.g. Padma Fashion BD"
                    className="w-full px-3 py-2 bg-slate-950 text-white font-medium placeholder:text-slate-500 border border-slate-700 rounded-xl text-xs outline-none focus:border-[#00C978] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Website / Storefront Domain *</label>
                  <input
                    type="text"
                    required
                    value={websiteDomain}
                    onChange={e => setWebsiteDomain(e.target.value)}
                    placeholder="e.g. padmafashion.com"
                    className="w-full px-3 py-2 bg-slate-950 text-white font-medium placeholder:text-slate-500 border border-slate-700 rounded-xl text-xs outline-none focus:border-[#00C978] transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Enter the domain where your AI chat widget will be embedded (e.g. padmafashion.com)
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Admin Full Name *</label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-3 py-2 bg-slate-950 text-white font-medium placeholder:text-slate-500 border border-slate-700 rounded-xl text-xs outline-none focus:border-[#00C978] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Work Email Address *</label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full px-3 py-2 bg-slate-950 text-white font-medium placeholder:text-slate-500 border border-slate-700 rounded-xl text-xs outline-none focus:border-[#00C978] transition-all"
                  />
                </div>

                {!user && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Account Password *</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full px-3 py-2 bg-slate-950 text-white font-medium placeholder:text-slate-500 border border-slate-700 rounded-xl text-xs outline-none focus:border-[#00C978] transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Promo / Coupon Code Input Box */}
              <div className="space-y-2 pt-2 border-t border-[#1A2922]">
                <label className="block text-xs font-bold text-slate-300">Promo / Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. EID2026"
                    value={couponCodeInput}
                    onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3.5 py-2.5 bg-slate-950 text-white font-mono font-bold text-xs rounded-xl border border-slate-700 outline-none uppercase placeholder:text-slate-500 focus:border-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponCodeInput.trim()}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 border border-slate-700"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    {isValidatingCoupon ? "Checking..." : "Apply"}
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-700/80 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-300 animate-in fade-in">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{appliedCoupon.code} applied! Saved ৳{appliedCoupon.discount_amount_bdt.toLocaleString()} BDT</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="text-slate-400 hover:text-rose-400 text-[10px] underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Final Order Price Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Package Base Price:</span>
                    <span className="font-mono">৳{rawPrice.toLocaleString()} BDT</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Promo Discount ({appliedCoupon.code}):</span>
                      <span className="font-mono">-৳{discountAmount.toLocaleString()} BDT</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 text-sm font-black text-white">
                    <span>Total Payable Today:</span>
                    <span className="text-base font-mono text-emerald-400">
                      ৳{finalPrice.toLocaleString()} BDT
                    </span>
                  </div>
                </div>

                {/* Checkout CTAs */}
                <div className="space-y-2.5 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={isLoading || !orgName.trim() || !websiteDomain.trim() || !adminEmail.trim() || (!user && !password.trim())}
                      onClick={() => handleStartPayment("bkash")}
                      className="py-3 bg-[#e2136e] hover:bg-[#c00f5c] text-white font-black rounded-xl text-xs shadow-md shadow-pink-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="h-4 w-4 rounded-full bg-white text-[#e2136e] flex items-center justify-center text-[10px] font-black">৳</span>
                      <span>Pay with bKash</span>
                    </button>

                    <button
                      type="button"
                      disabled={isLoading || !orgName.trim() || !websiteDomain.trim() || !adminEmail.trim() || (!user && !password.trim())}
                      onClick={() => handleStartPayment("eps")}
                      className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Pay with EPS</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={isLoading || !orgName.trim() || !websiteDomain.trim() || !adminEmail.trim() || (!user && !password.trim())}
                    onClick={() => handleProvisionWorkspace()}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-indigo-400" />}
                    <span>Direct Trial Launch (Instant Provisioning)</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center pt-2">
                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>SSL Encrypted • Instant Multi-Tenant Isolation SLA</span>
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 px-4 text-center text-xs text-slate-500">
        <p>© 2026 {currentTheme.platform_name || "Jobab Chat Platform"}. Powered by N.I. BIZ Soft & bKash Tokenized Payment Gateway.</p>
      </footer>

    </div>
  );
}
