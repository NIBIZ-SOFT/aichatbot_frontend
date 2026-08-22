"use client";

import React, { useState, useEffect } from "react";
import { X, ShieldCheck, DollarSign, Cpu, CheckCircle2, Lock, RefreshCw, AlertCircle } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

interface TenantPricingContractModalProps {
  tenant: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TenantPricingContractModal({
  tenant,
  onClose,
  onSuccess,
}: TenantPricingContractModalProps) {
  const { showToast } = useToast();

  const [contractData, setContractData] = useState({
    locked_price_bdt: 0.0,
    per_1k_tokens_rate_bdt: 0.15,
    is_custom_deal: false,
    deal_notes: "",
    tier: "",
    balance_bdt: 0.0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (tenant?.id) {
      setIsLoading(true);
      api.getTenantPricingContract(tenant.id)
        .then((data: any) => {
          if (data) {
            setContractData({
              locked_price_bdt: data.locked_price_bdt || 0.0,
              per_1k_tokens_rate_bdt: data.per_1k_tokens_rate_bdt || 0.15,
              is_custom_deal: data.is_custom_deal || false,
              deal_notes: data.deal_notes || "",
              tier: data.tier || "growth",
              balance_bdt: data.balance_bdt || 0.0,
            });
          }
        })
        .catch((err: any) => {
          showToast("Error", err.message || "Failed to load tenant contract", "error");
        })
        .finally(() => setIsLoading(false));
    }
  }, [tenant?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateTenantPricingContract(tenant.id, {
        locked_price_bdt: contractData.locked_price_bdt,
        per_1k_tokens_rate_bdt: contractData.per_1k_tokens_rate_bdt,
        is_custom_deal: contractData.is_custom_deal,
        deal_notes: contractData.deal_notes,
      });
      showToast("Contract Saved", `Custom agreement for ${tenant.name} updated successfully!`, "success");
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast("Save Failed", err.message || "Could not update contract", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                Individual VIP Contract Override
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              Pricing Agreement: {tenant.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Fetching locked contract rates from database...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Current Snapshot Box */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-500">Subscription Tier</span>
                <div className="font-bold text-slate-900 uppercase mt-0.5">{contractData.tier}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Live AI Wallet</span>
                <div className="font-bold text-emerald-600 font-mono mt-0.5">৳{contractData.balance_bdt.toLocaleString()}</div>
              </div>
            </div>

            {/* Input 1: Locked Subscription Fee */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Locked Monthly Subscription Fee (৳ BDT)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-xs">৳</span>
                <input
                  type="number"
                  step="50"
                  min="0"
                  value={contractData.locked_price_bdt}
                  onChange={(e) => setContractData({ ...contractData, locked_price_bdt: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
              <p className="text-[10.5px] text-slate-500 mt-1">
                Custom negotiated monthly recurring charge for this organization.
              </p>
            </div>

            {/* Input 2: Per 1k Tokens Rate */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Contracted Rate per 1,000 Tokens (৳ BDT)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-xs">৳</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="10.00"
                  value={contractData.per_1k_tokens_rate_bdt}
                  onChange={(e) => setContractData({ ...contractData, per_1k_tokens_rate_bdt: parseFloat(e.target.value) || 0.15 })}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
              <div className="text-[10.5px] text-indigo-700 font-mono mt-1">
                Equivalent to: <strong>৳{(contractData.per_1k_tokens_rate_bdt * 10).toFixed(2)}</strong> per 10,000 tokens
              </div>
            </div>

            {/* Checkbox: Custom Deal Flag */}
            <label className="flex items-center gap-2 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 cursor-pointer">
              <input
                type="checkbox"
                checked={contractData.is_custom_deal}
                onChange={(e) => setContractData({ ...contractData, is_custom_deal: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-indigo-950">
                Mark as VIP / Special Custom Enterprise Agreement
              </span>
            </label>

            {/* Notes */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Agreement Notes / Contract Summary
              </label>
              <textarea
                rows={2}
                value={contractData.deal_notes}
                onChange={(e) => setContractData({ ...contractData, deal_notes: e.target.value })}
                placeholder="e.g., Enterprise SLA agreement negotiated on Aug 2026 for 10M tokens volume..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Save Contract Agreement</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
