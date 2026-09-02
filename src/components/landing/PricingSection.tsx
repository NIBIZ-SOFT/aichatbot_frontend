"use client";

import React, { useState } from "react";
import { Check, ArrowRight, Zap, Sliders, ShieldCheck, Sparkles, Building2, HelpCircle } from "lucide-react";

interface PricingSectionProps {
  dbPlans: any[];
  pricingConfig?: any;
  onOpenPricing: (tier: string) => void;
}

export default function PricingSection({ dbPlans, pricingConfig, onOpenPricing }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  // Interactive Slider State
  const [sliderTokens, setSliderTokens] = useState<number>(1000000); // 1M tokens
  const [sliderSeats, setSliderSeats] = useState<number>(3);
  const [sliderWebsites, setSliderWebsites] = useState<number>(2);

  const isPaygActive = pricingConfig?.pay_as_you_go_enabled !== false;
  const isSliderActive = pricingConfig?.custom_slider_builder_enabled !== false;
  const tokenRate10k = pricingConfig?.default_per_10k_tokens_rate_bdt || 1.50;
  const minTopup = pricingConfig?.min_wallet_topup_bdt || 100.0;

  // Real-time custom slider price calculation
  const baseFee = 1990;
  const tokensCost = (sliderTokens / 10000) * tokenRate10k;
  const extraSeatsCost = Math.max(0, sliderSeats - 2) * 750;
  const extraWebsitesCost = Math.max(0, sliderWebsites - 1) * 1200;
  const rawCustomMonthly = Math.round(baseFee + tokensCost + extraSeatsCost + extraWebsitesCost);
  const customPrice = billingCycle === "annual" ? Math.round(rawCustomMonthly * 0.85) : rawCustomMonthly;

  return (
    <section id="pricing" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Section Header & Billing Toggle */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Predictable Enterprise Pricing</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Transparent Plans for Any Business Scale
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
          Choose the right capacity for your team. All plans include full multi-channel AI capabilities with bKash and Bangladeshi bank payment gateways.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="inline-flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 mt-2">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              billingCycle === "monthly"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              billingCycle === "annual"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              15% OFF
            </span>
          </button>
        </div>
      </div>

      {/* 1. Primary Fixed SaaS Subscription Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {dbPlans.map((plan) => {
          const isPopular = plan.is_popular;
          const price = billingCycle === "annual" 
            ? (plan.annual_price_bdt || Math.round(plan.monthly_price_bdt * 0.85)) 
            : plan.monthly_price_bdt;

          return (
            <div
              key={plan.code}
              className={`p-6 sm:p-7 rounded-3xl border flex flex-col justify-between transition-all ${
                isPopular
                  ? "bg-white border-indigo-600 shadow-xl ring-2 ring-indigo-600/20 relative"
                  : "bg-white border-slate-200/90 shadow-sm hover:border-slate-300 hover:shadow-md"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-[11px] font-bold px-3.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
                  <span>Most Popular Choice</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-black text-slate-900">{plan.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 min-h-[34px] font-normal leading-relaxed">{plan.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
                      ৳{price.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">/ month</span>
                  </div>
                  {billingCycle === "annual" && (
                    <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                      Billed annually (৳{(price * 12).toLocaleString()} / yr)
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-700">
                  <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Included Resources:
                  </div>
                  {plan.features?.map((f: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                      <div className="h-4 w-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => onOpenPricing(plan.code)}
                  className={`w-full py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
                    isPopular
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 hover:shadow-indigo-600/50"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  <span>Choose {plan.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. ⚡ Pay-As-You-Go Master Card (Visible when enabled in SuperAdmin) */}
      {isPaygActive && (
        <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/30 text-amber-300 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 fill-amber-300" />
                <span>Zero Contract • Pure Usage-Based Billing</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                ⚡ Pay-As-You-Go AI Engine Wallet
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                No monthly recurring subscription or lock-in commitments. Deposit a flexible prepaid balance via bKash or Nagad and pay strictly for the AI tokens your assistants actually consume.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="text-[10.5px] text-slate-400 uppercase font-bold">Token Rate</div>
                  <div className="text-sm sm:text-base font-black text-amber-400 mt-0.5">৳{tokenRate10k.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">/ 10k</span></div>
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="text-[10.5px] text-slate-400 uppercase font-bold">Min Top-Up</div>
                  <div className="text-sm sm:text-base font-black text-emerald-400 mt-0.5">৳{minTopup.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">BDT</span></div>
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="text-[10.5px] text-slate-400 uppercase font-bold">Support Seats</div>
                  <div className="text-sm sm:text-base font-black text-indigo-300 mt-0.5">5 Seats <span className="text-[10px] text-slate-400 font-normal">Included</span></div>
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="text-[10.5px] text-slate-400 uppercase font-bold">Store Widgets</div>
                  <div className="text-sm sm:text-base font-black text-indigo-300 mt-0.5">2 Widgets <span className="text-[10px] text-slate-400 font-normal">Included</span></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-stretch sm:items-end gap-3 w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
              <div className="text-left sm:text-right">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Starting Balance</div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono">৳{minTopup.toLocaleString()} <span className="text-xs font-semibold text-slate-400">BDT</span></div>
                <div className="text-[10.5px] text-emerald-400 font-medium mt-0.5">Prepaid balance never expires</div>
              </div>

              <button
                type="button"
                onClick={() => onOpenPricing("payg")}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Launch with Pay-As-You-Go Wallet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Interactive Custom Capacity Builder (Visible when enabled in SuperAdmin) */}
      {isSliderActive && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <h4 className="text-base sm:text-lg font-black text-slate-900">Custom Capacity Builder & Live Quote Calculator</h4>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Customize your required monthly AI tokens, human agent seats, and storefront widgets for an instant bespoke estimate.
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs font-bold text-slate-500 uppercase">Estimated Total</div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-600 font-mono">৳{customPrice.toLocaleString()} <span className="text-xs text-slate-500 font-medium">/ mo</span></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Slider 1: Tokens */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900">Monthly AI Tokens</span>
                <span className="font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                  {(sliderTokens / 1000).toLocaleString()}k Tokens
                </span>
              </div>
              <input
                type="range"
                min={500000}
                max={20000000}
                step={500000}
                value={sliderTokens}
                onChange={(e) => setSliderTokens(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>500k</span>
                <span>10M</span>
                <span>20M Tokens</span>
              </div>
            </div>

            {/* Slider 2: Seats */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900">Support / Sales Seats</span>
                <span className="font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                  {sliderSeats} Human Seats
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                step={1}
                value={sliderSeats}
                onChange={(e) => setSliderSeats(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1 Seat</span>
                <span>25 Seats</span>
                <span>50 Seats</span>
              </div>
            </div>

            {/* Slider 3: Widgets */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900">Storefront Widgets</span>
                <span className="font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                  {sliderWebsites} Connected Sites
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                step={1}
                value={sliderWebsites}
                onChange={(e) => setSliderWebsites(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1 Site</span>
                <span>10 Sites</span>
                <span>20 Sites</span>
              </div>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Includes Dedicated Account Manager, bKash/Nagad Corporate Billing, and 99.9% SLA Guarantee.</span>
            </div>

            <button
              type="button"
              onClick={() => onOpenPricing("growth")}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span>Deploy Custom Configuration (৳{customPrice.toLocaleString()})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </section>
  );
}
