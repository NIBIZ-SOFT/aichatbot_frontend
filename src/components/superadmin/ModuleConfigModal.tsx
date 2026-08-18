"use client";

import React, { useState } from "react";
import { 
  X, Check, Sparkles, Shield, LayoutDashboard, MessageSquare, 
  Users, Globe, BarChart3, Cpu, UserPlus, Settings, CreditCard,
  Sliders, CheckCircle2, AlertCircle, RefreshCw
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { api } from "../../lib/api";

interface ModuleConfigModalProps {
  tenantId: string;
  tenantName: string;
  initialModules: Record<string, boolean>;
  onClose: () => void;
  onSuccess: (updatedModules: Record<string, boolean>) => void;
}

interface ModuleDef {
  id: string;
  name: string;
  description: string;
  category: "OPERATIONS" | "AI & KNOWLEDGE" | "METRICS & BILLING" | "MANAGEMENT";
  icon: any;
}

const MODULE_DEFS: ModuleDef[] = [
  {
    id: "dashboard",
    name: "Operations Dashboard",
    description: "Live visitor counter, recent inquiry metrics, and operational health.",
    category: "OPERATIONS",
    icon: LayoutDashboard
  },
  {
    id: "inbox",
    name: "Live Support Inbox",
    description: "Real-time visitor chat queue, agent ticket assignment, and order tracking.",
    category: "OPERATIONS",
    icon: MessageSquare
  },
  {
    id: "contacts",
    name: "CRM Contacts & Buyers",
    description: "Bangladeshi customer directory, lifetime spend, order count, and tags.",
    category: "OPERATIONS",
    icon: Users
  },
  {
    id: "knowledge",
    name: "AI Brain & Knowledge RAG",
    description: "Product catalog ingestion, delivery policy docs, and live AI Simulator.",
    category: "AI & KNOWLEDGE",
    icon: Sparkles
  },
  {
    id: "websites",
    name: "Websites & Widget Studio",
    description: "Connected storefront URLs and embeddable live chat widget script.",
    category: "AI & KNOWLEDGE",
    icon: Globe
  },
  {
    id: "analytics",
    name: "Analytics & CSAT Engine",
    description: "5-star CSAT ratings, autonomous resolution rates, and staff leaderboard.",
    category: "METRICS & BILLING",
    icon: BarChart3
  },
  {
    id: "usage",
    name: "Token Usage Meter (BDT ৳)",
    description: "Exact OpenAI tokenizer metering, BDT cost conversion, and daily graphs.",
    category: "METRICS & BILLING",
    icon: Cpu
  },
  {
    id: "subscription",
    name: "Subscription & Billing",
    description: "Monthly plan management, billing invoice history, and package upgrades.",
    category: "METRICS & BILLING",
    icon: CreditCard
  },
  {
    id: "team",
    name: "Team & Permissions (RBAC)",
    description: "Invite up to 4 organization staff with role-based queue permissions.",
    category: "MANAGEMENT",
    icon: UserPlus
  },
  {
    id: "settings",
    name: "Organization Settings",
    description: "Store profile, brand colors, contact address, and business hours.",
    category: "MANAGEMENT",
    icon: Settings
  }
];

export default function ModuleConfigModal({
  tenantId,
  tenantName,
  initialModules,
  onClose,
  onSuccess
}: ModuleConfigModalProps) {
  const { showToast } = useToast();
  const [modules, setModules] = useState<Record<string, boolean>>({
    dashboard: true,
    inbox: true,
    contacts: true,
    knowledge: true,
    websites: true,
    analytics: true,
    usage: true,
    subscription: true,
    team: true,
    settings: true,
    ...initialModules
  });
  const [isSaving, setIsSaving] = useState(false);

  const toggleModule = (id: string) => {
    setModules(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // One-Click Presets
  const applyPreset = (preset: "starter" | "pro" | "vip") => {
    if (preset === "starter") {
      setModules({
        dashboard: true,
        inbox: true,
        contacts: false,
        knowledge: true,
        websites: false,
        analytics: false,
        usage: true,
        subscription: true,
        team: false,
        settings: true
      });
      showToast("Applied Starter Support Preset (6/10 Active)", "info");
    } else if (preset === "pro") {
      setModules({
        dashboard: true,
        inbox: true,
        contacts: true,
        knowledge: true,
        websites: true,
        analytics: true,
        usage: true,
        subscription: true,
        team: true,
        settings: true
      });
      showToast("Applied E-Commerce Pro Preset (10/10 Active)", "info");
    } else if (preset === "vip") {
      const full: Record<string, boolean> = {};
      MODULE_DEFS.forEach(m => full[m.id] = true);
      setModules(full);
      showToast("Applied Enterprise VIP Suite (All 10 Active)", "info");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.updateTenantModules(tenantId, modules);
      showToast(`Module permissions updated for '${tenantName}'`, "success");
      onSuccess(res.enabled_modules || modules);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("aiaas:refresh_user"));
      }
      onClose();
    } catch (err: any) {
      showToast(err.message || "Failed to update module permissions", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const activeCount = Object.values(modules).filter(Boolean).length;

  const categories = ["OPERATIONS", "AI & KNOWLEDGE", "METRICS & BILLING", "MANAGEMENT"] as const;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-extrabold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-200 uppercase tracking-wide">
                Feature Flags Engine
              </span>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                {activeCount} of {MODULE_DEFS.length} Modules Active
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 mt-2">
              Configure Modules for <span className="text-indigo-600 font-black">{tenantName}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select which workspace modules this organization owner and their staff can view and access.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="px-6 py-3 bg-indigo-50/50 border-b border-indigo-100/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-bold text-slate-600 text-[11px] flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-600" /> One-Click Tier Presets:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => applyPreset("starter")}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg border border-slate-200 text-[11px] shadow-sm transition-all cursor-pointer"
            >
              🟢 Starter (6 Mods)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("pro")}
              className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-200 text-[11px] shadow-sm transition-all cursor-pointer"
            >
              🔵 E-Com Pro (10 Mods)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("vip")}
              className="px-2.5 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg text-[11px] shadow-sm transition-all cursor-pointer"
            >
              🟣 Full Enterprise VIP
            </button>
          </div>
        </div>

        {/* Scrollable Module Checklist */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {categories.map(cat => {
            const catModules = MODULE_DEFS.filter(m => m.category === cat);
            return (
              <div key={cat} className="space-y-3">
                <div className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase border-b border-slate-100 pb-1">
                  {cat}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catModules.map(mod => {
                    const Icon = mod.icon;
                    const isEnabled = !!modules[mod.id];

                    return (
                      <div
                        key={mod.id}
                        onClick={() => toggleModule(mod.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isEnabled
                            ? "bg-indigo-50/40 border-indigo-200 shadow-sm"
                            : "bg-slate-50/50 border-slate-200 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`p-2 rounded-xl shrink-0 ${
                            isEnabled ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                              {mod.name}
                            </div>
                            <p className="text-[10.5px] text-slate-500 mt-0.5 leading-snug">
                              {mod.description}
                            </p>
                          </div>
                        </div>

                        {/* Toggle Checkbox Switch */}
                        <div className={`h-5 w-5 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                          isEnabled
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}>
                          {isEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Changes apply instantly to client's sidebar & API access.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-semibold text-xs hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving Permissions...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Save Module Permissions
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
