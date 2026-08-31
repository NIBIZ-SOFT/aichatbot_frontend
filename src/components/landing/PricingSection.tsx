"use client";

import React, { useState } from "react";
import { Check, ArrowRight } from "lucide-react";

interface PricingSectionProps {
  dbPlans: any[];
  onOpenPricing: (tier: string) => void;
}

export default function PricingSection({ dbPlans, onOpenPricing }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  return (
    <section id="pricing" className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Section Header & Toggle */}
      <div className="text-center max-w-xl mx-auto space-y-2.5">
        <h2 className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">Predictable Pricing</h2>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Transparent Plans for Any Business Scale
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          Choose the right capacity for your team. All plans include full multi-channel AI capabilities.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 mt-1">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              billingCycle === "monthly"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              billingCycle === "annual"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
              15% OFF
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {dbPlans.map((plan) => {
          const isPopular = plan.is_popular;
          const price = billingCycle === "annual" 
            ? (plan.annual_price_bdt || Math.round(plan.monthly_price_bdt * 0.85)) 
            : plan.monthly_price_bdt;

          return (
            <div
              key={plan.code}
              className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
                isPopular
                  ? "bg-white border-indigo-600 shadow-lg ring-1 ring-indigo-600/30 relative"
                  : "bg-white border-slate-200 shadow-2xs hover:border-slate-300"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                  Most Popular
                </div>
              )}

              <div className="space-y-3.5">
                <div>
                  <h4 className="text-base font-bold text-slate-900">{plan.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 min-h-[30px] font-normal">{plan.description}</p>
                </div>

                <div className="pt-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                      ৳{price.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">/ month</span>
                  </div>
                  {billingCycle === "annual" && (
                    <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                      Billed annually (৳{(price * 12).toLocaleString()} / yr)
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-700">
                  <div className="font-semibold text-slate-900 text-[10.5px] uppercase tracking-wider">Features:</div>
                  {plan.features?.map((f: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5">
                <button
                  type="button"
                  onClick={() => onOpenPricing(plan.code)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isPopular
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs shadow-indigo-600/30"
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

    </section>
  );
}
