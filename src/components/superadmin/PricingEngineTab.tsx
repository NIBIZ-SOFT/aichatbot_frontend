"use client";

import React, { useState, useEffect } from "react";
import { Zap, DollarSign, ShieldCheck, RefreshCw, Cpu, Layers, CheckCircle2, Lock, ArrowRight } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

export default function PricingEngineTab() {
  const { showToast } = useToast();

  const [config, setConfig] = useState({
    default_per_10k_tokens_rate_bdt: 1.50,
    pay_as_you_go_enabled: true,
    custom_slider_builder_enabled: true,
    min_wallet_topup_bdt: 100.0,
    base_custom_platform_fee_bdt: 1990.0,
    per_extra_agent_bdt: 750.0,
    per_extra_website_bdt: 1200.0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSuperAdminPricingEngine();
      if (data) {
        setConfig((prev) => ({ ...prev, ...data }));
      }
    } catch (err: any) {
      showToast("Error", err.message || "Failed to load pricing engine config", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateSuperAdminPricingEngine(config);
      showToast("Pricing Engine Updated", "Global AI token rates and PAYG settings saved successfully!", "success");
    } catch (err: any) {
      showToast("Update Failed", err.message || "Failed to update pricing engine", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-500 flex flex-col items-center gap-3">
        <div className="h-7 w-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading Dynamic AI Token & Pricing Engine Settings...</span>
      </div>
    );
  }

  const per1kRate = (config.default_per_10k_tokens_rate_bdt / 10.0).toFixed(4);
  const per1MRate = (config.default_per_10k_tokens_rate_bdt * 100.0).toLocaleString();

  return (
    <form onSubmit={handleSave} className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Dynamic AI Token & Billing Engine
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Global Token Pricing & Pay-As-You-Go Control
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure real-time unit token costs in BDT, master feature toggles, and contract rate defaults.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Card 1: Token Unit Pricing Engine */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Token Metering Rate (BDT)</h3>
              <p className="text-[11px] text-slate-500">Unit cost for RAG queries and chat interactions</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Default Rate per 10,000 Tokens (৳ BDT)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-xs">৳</span>
                <input
                  type="number"
                  step="0.05"
                  min="0.10"
                  max="50.00"
                  value={config.default_per_10k_tokens_rate_bdt}
                  onChange={(e) => setConfig({ ...config, default_per_10k_tokens_rate_bdt: parseFloat(e.target.value) || 1.50 })}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Live Rate Conversion Meter */}
            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2 text-xs">
              <span className="font-bold text-indigo-900 flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-indigo-600" /> Live Unit Conversion Matrix
              </span>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-700 font-mono">
                <div className="bg-white p-2.5 rounded-xl border border-indigo-100/80">
                  <div className="text-[10px] text-slate-400">1k Tokens</div>
                  <div className="font-bold text-indigo-950 mt-0.5">৳{per1kRate}</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-indigo-100/80">
                  <div className="text-[10px] text-slate-400">10k Tokens</div>
                  <div className="font-bold text-indigo-950 mt-0.5">৳{config.default_per_10k_tokens_rate_bdt}</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-indigo-100/80">
                  <div className="text-[10px] text-slate-400">1M Tokens</div>
                  <div className="font-bold text-indigo-950 mt-0.5">৳{per1MRate}</div>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong>Grandfathering Protection:</strong> Updating the global rate updates default prices for new accounts and new top-ups. Existing clients retain their locked contracted rate.
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: PAYG & Feature Master Switches */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Master Visibility Switches</h3>
              <p className="text-[11px] text-slate-500">Enable or disable billing features on public portals</p>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* PAYG Master Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Pay-As-You-Go System
                </div>
                <div className="text-[11px] text-slate-500">
                  Allows visitors to choose prepaid credits with no monthly contract
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.pay_as_you_go_enabled}
                  onChange={(e) => setConfig({ ...config, pay_as_you_go_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Custom Builder Switch */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900">
                  Interactive Slider Custom Builder
                </div>
                <div className="text-[11px] text-slate-500">
                  Displays resource sliders on public landing page
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.custom_slider_builder_enabled}
                  onChange={(e) => setConfig({ ...config, custom_slider_builder_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Minimum Topup */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Minimum Wallet Top-Up Threshold (৳ BDT)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-xs">৳</span>
                <input
                  type="number"
                  step="50"
                  min="50"
                  value={config.min_wallet_topup_bdt}
                  onChange={(e) => setConfig({ ...config, min_wallet_topup_bdt: parseFloat(e.target.value) || 100 })}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Bottom Save Action */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>Save Global Pricing Configuration</span>
        </button>
      </div>

    </form>
  );
}
