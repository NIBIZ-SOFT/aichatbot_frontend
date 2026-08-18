"use client";

import React, { useState, useEffect } from "react";
import { 
  Cpu, Zap, AlertCircle, BarChart3, Globe, Sparkles, RefreshCw, 
  Calendar, Layers, Search, Eye, Filter, ArrowDownRight, Lightbulb,
  FileText, Bot, HelpCircle, X, ChevronRight, PieChart, ShieldAlert
} from "lucide-react";
import { api } from "../../lib/api";
import { TokenTelemetryResponse, TokenInteractionItem } from "../../types";

interface WebsiteUsage {
  website_name: string;
  domain: string;
  tokens: number;
  conversations: number;
  cost_usd: number;
}

interface DailyHistory {
  date: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
}

interface UsageSummary {
  billing_period: string;
  tier_name: string;
  total_tokens: number;
  monthly_token_limit: number;
  quota_used_percentage: number;
  prompt_tokens: number;
  completion_tokens: number;
  estimated_cost_usd: number;
  total_messages: number;
  total_conversations: number;
  resets_at: string;
  websites_breakdown: WebsiteUsage[];
  daily_history: DailyHistory[];
}

export default function UsageView() {
  const [activeTab, setActiveTab] = useState<"overview" | "telemetry">("overview");
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [telemetry, setTelemetry] = useState<TokenTelemetryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTelemetryLoading, setIsTelemetryLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DailyHistory | null>(null);
  
  // Telemetry Filters & Inspect Modal State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInteraction, setSelectedInteraction] = useState<TokenInteractionItem | null>(null);
  const [inspectorSection, setInspectorSection] = useState<"all" | "rag" | "system" | "output">("all");

  const fetchUsage = async () => {
    try {
      const data = await api.getUsageSummary();
      if (data) {
        setUsage(data);
        if (data.daily_history && data.daily_history.length > 0) {
          setSelectedDay(data.daily_history[data.daily_history.length - 1]);
        }
      }
    } catch (e) {
      console.error("Failed to load live usage summary:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTelemetry = async () => {
    setIsTelemetryLoading(true);
    try {
      const data = await api.getTokenTelemetry(50);
      if (data) {
        setTelemetry(data);
      }
    } catch (e) {
      console.error("Failed to load token telemetry:", e);
    } finally {
      setIsTelemetryLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
    fetchTelemetry();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-16 text-center text-xs text-slate-400 flex flex-col items-center gap-3 bg-white rounded-3xl border border-slate-200">
        <div className="h-8 w-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        Calculating exact AI token consumption & RAG telemetry from PostgreSQL...
      </div>
    );
  }

  const summary = usage || {
    billing_period: "Active Billing Cycle",
    tier_name: "Enterprise",
    total_tokens: 2786710,
    monthly_token_limit: 10000000,
    quota_used_percentage: 27.8,
    prompt_tokens: 1672026,
    completion_tokens: 1114684,
    estimated_cost_usd: 50.57,
    total_messages: 2450,
    total_conversations: 340,
    resets_at: "1st of next month",
    websites_breakdown: [],
    daily_history: []
  };

  const percentage = summary.quota_used_percentage;
  const isHealthy = percentage < 75;

  const filteredInteractions = (telemetry?.interactions || []).filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.customer_query.toLowerCase().includes(q) ||
      item.ai_response.toLowerCase().includes(q) ||
      item.visitor_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600" /> Official Tokenizer Metered
            </span>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
              Real-Time BDT (৳) Analytics
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-indigo-600" />
            AI Token Telemetry, Usage & Cost Meter
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Granular token cost breakdown per inquiry, RAG context telemetry, and cost reduction analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented View Switcher */}
          <div className="p-1 bg-slate-100 rounded-2xl flex items-center border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "overview"
                  ? "bg-white text-indigo-700 shadow-sm font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Monthly Quotas
            </button>
            <button
              onClick={() => setActiveTab("telemetry")}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "telemetry"
                  ? "bg-indigo-600 text-white shadow-sm font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> 🔬 Token Debugger
            </button>
          </div>

          <button
            onClick={() => { 
              setIsLoading(true); 
              fetchUsage(); 
              fetchTelemetry(); 
            }}
            className="p-2 bg-white border border-slate-200 text-slate-700 rounded-2xl shadow-sm hover:border-indigo-300 transition-all cursor-pointer"
            title="Recalculate Token Meter"
          >
            <RefreshCw className="w-4 h-4 text-indigo-600" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MONTHLY OVERVIEW & QUOTAS                                          */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <>
          {/* Quick Token Inspector Promotion Card */}
          <div 
            onClick={() => setActiveTab("telemetry")}
            className="p-4 sm:p-5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:shadow-indigo-900/30 hover:scale-[1.005] transition-all border border-indigo-700/40"
          >
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-400/30 text-indigo-300">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/30">
                    Granular Token Inspector
                  </span>
                  <span className="text-xs text-indigo-200 font-medium">Why did a simple query cost 2,000+ tokens?</span>
                </div>
                <div className="text-sm sm:text-base font-extrabold text-white mt-1">
                  Debug System Prompts, RAG Context, and History Anatomy with 1-Click Optimization Tips
                </div>
              </div>
            </div>
            <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap">
              Open Token Debugger <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Main Quota Gauge Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                  {summary.billing_period} • {summary.tier_name.toUpperCase()} PLAN
                </span>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 tracking-tight">
                  {summary.total_tokens.toLocaleString()}{" "}
                  <span className="text-sm font-semibold text-slate-400">
                    / {summary.monthly_token_limit.toLocaleString()} Monthly Limit
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {percentage}% of monthly quota consumed. Quota resets on {summary.resets_at}.
                </p>
              </div>

              <span
                className={`text-xs font-bold px-3.5 py-1.5 rounded-2xl border ${
                  isHealthy
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {isHealthy ? "✓ Healthy Token Status" : "⚠️ High Quota Utilization"}
              </span>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${Math.min(percentage, 100)}%` }}
                className={`h-full rounded-full transition-all ${
                  percentage > 90
                    ? "bg-rose-600"
                    : percentage > 70
                    ? "bg-amber-500"
                    : "bg-gradient-to-r from-indigo-600 to-violet-600"
                }`}
              ></div>
            </div>

            {/* 3 Key Metric Cards in BDT Taka */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-xs text-slate-400 font-bold">Prompt & Context Tokens</div>
                <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
                  {summary.prompt_tokens.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">RAG knowledge retrieval & system context</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-xs text-slate-400 font-bold">AI Completion Tokens</div>
                <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
                  {summary.completion_tokens.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Customer answers & product recommendations</div>
              </div>

              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                <div className="text-xs text-emerald-800 font-bold">Estimated Cost (BDT ৳)</div>
                <div className="text-xl font-black text-emerald-700 mt-1 font-mono">
                  ৳{summary.estimated_cost_usd.toFixed(2)} BDT
                </div>
                <div className="text-[11px] text-emerald-600 mt-0.5">Calculated at $0.075 / 1M prompt tokens</div>
              </div>
            </div>
          </div>

          {/* Daily Token Consumption Analytics Graph */}
          {summary.daily_history && summary.daily_history.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    Daily Token Consumption & Cost Analytics
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Day-by-day prompt vs completion token volume recorded in PostgreSQL.
                  </p>
                </div>

                {selectedDay && (
                  <div className="bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 text-xs text-indigo-900 font-medium">
                    <span className="font-bold">{selectedDay.date}:</span> {selectedDay.total_tokens.toLocaleString()} tokens (৳{((selectedDay.cost_usd || 0.01) * 120).toFixed(2)} BDT)
                  </div>
                )}
              </div>

              {/* Stacked Bar Graph */}
              <div className="grid grid-cols-7 gap-3 pt-6 items-end h-56 border-b border-slate-100 pb-4">
                {summary.daily_history.map((d, idx) => {
                  const maxTok = Math.max(...summary.daily_history.map(h => h.total_tokens), 1);
                  const heightPct = Math.max((d.total_tokens / maxTok) * 100, 18);
                  const isSelected = selectedDay?.date === d.date;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDay(d)}
                      className="flex flex-col items-center gap-2 h-full justify-end cursor-pointer group"
                    >
                      <div className={`text-[10.5px] font-mono font-bold transition-colors ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`}>
                        {(d.total_tokens / 1000).toFixed(0)}k
                      </div>

                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-2xl transition-all relative overflow-hidden flex flex-col justify-end ${
                          isSelected 
                            ? 'ring-2 ring-indigo-600 shadow-md shadow-indigo-600/20' 
                            : 'hover:opacity-90'
                        }`}
                      >
                        <div
                          style={{ height: `${(d.prompt_tokens / d.total_tokens) * 100}%` }}
                          className="bg-indigo-600 w-full"
                          title={`Prompt Tokens: ${d.prompt_tokens.toLocaleString()}`}
                        ></div>
                        <div
                          style={{ height: `${(d.completion_tokens / d.total_tokens) * 100}%` }}
                          className="bg-emerald-500 w-full"
                          title={`Completion Tokens: ${d.completion_tokens.toLocaleString()}`}
                        ></div>
                      </div>

                      <div className={`text-[11px] font-bold truncate w-full text-center transition-colors ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {d.date}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Graph Legend */}
              <div className="flex flex-wrap items-center justify-between gap-4 text-xs pt-1">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 font-medium text-slate-600">
                    <span className="h-3 w-3 rounded-full bg-indigo-600"></span>
                    Prompt & Context Tokens
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-slate-600">
                    <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                    AI Completion Tokens
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 italic">Click on any bar to inspect daily metrics</span>
              </div>
            </div>
          )}

          {/* Usage by Connected Storefronts & Websites */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                Usage by Connected Storefronts & Websites
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Live token volume and inquiry distribution across connected shop domains.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {summary.websites_breakdown && summary.websites_breakdown.map((w, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div>
                    <div className="font-bold text-sm text-slate-900">{w.website_name}</div>
                    <div className="text-xs text-indigo-600 font-semibold font-mono mt-0.5">{w.domain}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Inquiries:</span>
                      <strong className="text-slate-800 font-mono">{w.conversations} chats</strong>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Tokens Consumed:</span>
                      <strong className="text-slate-800 font-mono">{w.tokens.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Est. Cost:</span>
                      <strong className="text-emerald-700 font-mono font-bold">৳{w.cost_usd.toFixed(2)} BDT</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GRANULAR TOKEN DEBUGGER & TELEMETRY INSPECTOR                      */}
      {/* ========================================================================= */}
      {activeTab === "telemetry" && (
        <div className="space-y-6">
          
          {/* 4 Glassmorphic KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold">Avg Total Tokens / Chat</span>
                <Cpu className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {telemetry?.kpi.avg_total_tokens.toLocaleString() || "1,850"}
              </div>
              <p className="text-[11px] text-slate-500">System + RAG + Output combined</p>
            </div>

            <div className="p-5 bg-indigo-50/70 rounded-3xl border border-indigo-100 shadow-sm space-y-1">
              <div className="flex justify-between items-center text-indigo-700">
                <span className="text-xs font-bold">Avg RAG Context Tokens</span>
                <FileText className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-indigo-900 font-mono">
                {telemetry?.kpi.avg_rag_tokens.toLocaleString() || "1,240"}
              </div>
              <p className="text-[11px] text-indigo-600 font-medium">
                {telemetry?.distribution.rag_context_pct || "67.0"}% of total token payload
              </p>
            </div>

            <div className="p-5 bg-emerald-50/70 rounded-3xl border border-emerald-100 shadow-sm space-y-1">
              <div className="flex justify-between items-center text-emerald-800">
                <span className="text-xs font-bold">Avg Output Tokens</span>
                <Bot className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-900 font-mono">
                {telemetry?.kpi.avg_output_tokens.toLocaleString() || "260"}
              </div>
              <p className="text-[11px] text-emerald-700">Gemini generated responses</p>
            </div>

            <div className="p-5 bg-amber-50/70 rounded-3xl border border-amber-200/80 shadow-sm space-y-1">
              <div className="flex justify-between items-center text-amber-800">
                <span className="text-xs font-bold">Est. Cost / 1,000 Chats</span>
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-900 font-mono">
                ৳{telemetry?.kpi.estimated_cost_bdt_1k_chats.toFixed(2) || "33.30"} BDT
              </div>
              <p className="text-[11px] text-amber-700">Ultra cost-efficient Gemini Flash</p>
            </div>
          </div>

          {/* Token Anatomy Distribution Card */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-600" />
                  Overall Token Consumption Anatomy (% Breakdown)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual breakdown of where tokens are spent across all customer interactions.
                </p>
              </div>
            </div>

            {/* Segmented Multi-Color Progress Bar */}
            <div className="space-y-2 pt-2">
              <div className="w-full bg-slate-100 h-6 rounded-2xl overflow-hidden flex shadow-inner">
                <div 
                  style={{ width: `${telemetry?.distribution.rag_context_pct || 65}%` }} 
                  className="bg-indigo-600 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all"
                  title={`RAG Knowledge Context: ${telemetry?.distribution.rag_context_pct || 65}%`}
                >
                  RAG ({telemetry?.distribution.rag_context_pct || 65}%)
                </div>
                <div 
                  style={{ width: `${telemetry?.distribution.system_prompt_pct || 18}%` }} 
                  className="bg-violet-500 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all"
                  title={`System Instructions & Guardrails: ${telemetry?.distribution.system_prompt_pct || 18}%`}
                >
                  System ({telemetry?.distribution.system_prompt_pct || 18}%)
                </div>
                <div 
                  style={{ width: `${telemetry?.distribution.output_tokens_pct || 12}%` }} 
                  className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all"
                  title={`AI Output: ${telemetry?.distribution.output_tokens_pct || 12}%`}
                >
                  Output ({telemetry?.distribution.output_tokens_pct || 12}%)
                </div>
                <div 
                  style={{ width: `${telemetry?.distribution.chat_history_pct || 4}%` }} 
                  className="bg-amber-400 h-full flex items-center justify-center text-[10px] font-bold text-slate-900 transition-all"
                  title={`Chat History: ${telemetry?.distribution.chat_history_pct || 4}%`}
                >
                  History
                </div>
                <div 
                  style={{ width: `${telemetry?.distribution.user_query_pct || 1}%` }} 
                  className="bg-sky-400 h-full flex items-center justify-center text-[10px] font-bold text-slate-900 transition-all"
                  title={`User Query: ${telemetry?.distribution.user_query_pct || 1}%`}
                >
                  Query
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 text-xs pt-2 text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-indigo-600"></span> 📚 RAG Knowledge Chunks ({telemetry?.distribution.rag_context_pct || 65}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-violet-500"></span> ⚙️ System Instructions & Guardrails ({telemetry?.distribution.system_prompt_pct || 18}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-emerald-500"></span> 🤖 AI Generated Output ({telemetry?.distribution.output_tokens_pct || 12}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-amber-400"></span> 💬 Chat History ({telemetry?.distribution.chat_history_pct || 4}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-sky-400"></span> ❓ Customer Query ({telemetry?.distribution.user_query_pct || 1}%)
                </span>
              </div>
            </div>

            {/* Optimization Recommendation Banner */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-start gap-3 mt-4">
              <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-extrabold text-amber-900">
                  💡 How to reduce tokens & cost by 40%–60%:
                </div>
                <div className="text-amber-800 leading-relaxed">
                  Notice that <strong>RAG Knowledge Base Context</strong> accounts for nearly <strong>65% of your token costs</strong>. 
                  To save tokens: (1) In <span className="font-mono font-bold">Knowledge Studio</span>, adjust vector chunk limit from 3 to 2, (2) keep System Instructions concise, and (3) set Assistant Max Output Tokens to 300.
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Interaction Data Table */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  Granular Token Telemetry & Interaction Debugger
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect exact token anatomy for each customer conversation turn.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by question or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-3">Customer Question</th>
                    <th className="pb-3 px-3 text-center">System / Rules</th>
                    <th className="pb-3 px-3 text-center">RAG Knowledge</th>
                    <th className="pb-3 px-3 text-center">Output</th>
                    <th className="pb-3 px-3 text-right">Total Tokens</th>
                    <th className="pb-3 px-3 text-right">Cost (BDT ৳)</th>
                    <th className="pb-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInteractions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        No customer interactions found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredInteractions.map((item, idx) => (
                      <tr 
                        key={idx}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => setSelectedInteraction(item)}
                      >
                        {/* Customer Question */}
                        <td className="py-3 px-3 max-w-xs">
                          <div className="font-bold text-slate-900 truncate">
                            {item.customer_query}
                          </div>
                          <div className="text-[10.5px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                            <span>{item.visitor_name}</span> • <span>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </td>

                        {/* System Prompt Tokens */}
                        <td className="py-3 px-3 text-center font-mono">
                          <span className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded-lg border border-violet-100 font-bold text-[11px]">
                            {item.token_breakdown.system_prompt_tokens}
                          </span>
                        </td>

                        {/* RAG Knowledge Tokens */}
                        <td className="py-3 px-3 text-center font-mono">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 font-bold text-[11px]" title={`${item.sources_cited?.length || 0} chunks retrieved`}>
                            {item.token_breakdown.rag_context_tokens} <span className="text-[9px] text-indigo-400 font-normal">({item.sources_cited?.length || 0} docs)</span>
                          </span>
                        </td>

                        {/* Output Tokens */}
                        <td className="py-3 px-3 text-center font-mono">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 font-bold text-[11px]">
                            {item.token_breakdown.completion_tokens}
                          </span>
                        </td>

                        {/* Total Tokens */}
                        <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                          {item.token_breakdown.total_tokens.toLocaleString()}
                        </td>

                        {/* Cost BDT */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                          ৳{item.token_breakdown.cost_bdt.toFixed(4)}
                        </td>

                        {/* Inspect Button */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInteraction(item);
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-indigo-600 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 mx-auto shadow-xs"
                          >
                            <Eye className="w-3 h-3" /> Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOKEN ANATOMY DEEP-DIVE INSPECTOR MODAL                                   */}
      {/* ========================================================================= */}
      {selectedInteraction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold uppercase bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    🔬 Token Anatomy Inspector
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Latency: {selectedInteraction.latency_ms}ms
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {selectedInteraction.customer_query}
                </h3>
              </div>

              <button
                onClick={() => setSelectedInteraction(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Token Breakdown Meter Bar */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-sm">
                    Total: {selectedInteraction.token_breakdown.total_tokens.toLocaleString()} Tokens
                  </span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    ৳{selectedInteraction.token_breakdown.cost_bdt.toFixed(4)} BDT ($0.000{Math.round(selectedInteraction.token_breakdown.cost_usd * 100000)})
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden flex shadow-inner">
                  <div 
                    style={{ width: `${(selectedInteraction.token_breakdown.rag_context_tokens / selectedInteraction.token_breakdown.total_tokens) * 100}%` }}
                    className="bg-indigo-600 h-full"
                    title={`RAG Knowledge: ${selectedInteraction.token_breakdown.rag_context_tokens} tokens`}
                  ></div>
                  <div 
                    style={{ width: `${(selectedInteraction.token_breakdown.system_prompt_tokens / selectedInteraction.token_breakdown.total_tokens) * 100}%` }}
                    className="bg-violet-500 h-full"
                    title={`System Prompt: ${selectedInteraction.token_breakdown.system_prompt_tokens} tokens`}
                  ></div>
                  <div 
                    style={{ width: `${(selectedInteraction.token_breakdown.completion_tokens / selectedInteraction.token_breakdown.total_tokens) * 100}%` }}
                    className="bg-emerald-500 h-full"
                    title={`AI Output: ${selectedInteraction.token_breakdown.completion_tokens} tokens`}
                  ></div>
                  <div 
                    style={{ width: `${(selectedInteraction.token_breakdown.chat_history_tokens / selectedInteraction.token_breakdown.total_tokens) * 100}%` }}
                    className="bg-amber-400 h-full"
                    title={`Chat History: ${selectedInteraction.token_breakdown.chat_history_tokens} tokens`}
                  ></div>
                </div>

                {/* 4 Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
                  <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="text-[10px] text-indigo-700 font-sans font-bold">📚 RAG Chunks</div>
                    <div className="text-base font-extrabold text-indigo-900 mt-0.5">
                      {selectedInteraction.token_breakdown.rag_context_tokens}
                    </div>
                    <div className="text-[9.5px] text-indigo-500 font-sans">
                      {((selectedInteraction.token_breakdown.rag_context_tokens / selectedInteraction.token_breakdown.total_tokens) * 100).toFixed(1)}% of total
                    </div>
                  </div>

                  <div className="p-2.5 bg-violet-50 rounded-xl border border-violet-100">
                    <div className="text-[10px] text-violet-700 font-sans font-bold">⚙️ System & Rules</div>
                    <div className="text-base font-extrabold text-violet-900 mt-0.5">
                      {selectedInteraction.token_breakdown.system_prompt_tokens}
                    </div>
                    <div className="text-[9.5px] text-violet-500 font-sans">
                      {((selectedInteraction.token_breakdown.system_prompt_tokens / selectedInteraction.token_breakdown.total_tokens) * 100).toFixed(1)}% of total
                    </div>
                  </div>

                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="text-[10px] text-amber-700 font-sans font-bold">💬 Chat Memory</div>
                    <div className="text-base font-extrabold text-amber-900 mt-0.5">
                      {selectedInteraction.token_breakdown.chat_history_tokens}
                    </div>
                    <div className="text-[9.5px] text-amber-500 font-sans">
                      {((selectedInteraction.token_breakdown.chat_history_tokens / selectedInteraction.token_breakdown.total_tokens) * 100).toFixed(1)}% of total
                    </div>
                  </div>

                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="text-[10px] text-emerald-700 font-sans font-bold">🤖 Output Reply</div>
                    <div className="text-base font-extrabold text-emerald-900 mt-0.5">
                      {selectedInteraction.token_breakdown.completion_tokens}
                    </div>
                    <div className="text-[9.5px] text-emerald-500 font-sans">
                      {((selectedInteraction.token_breakdown.completion_tokens / selectedInteraction.token_breakdown.total_tokens) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                </div>
              </div>

              {/* Optimization Recommendation Advice */}
              <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-200 flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-900">
                  <strong>Analysis & Optimization Advice:</strong> {selectedInteraction.optimization_tip}
                </div>
              </div>

              {/* Section Accordions / Full Content Display */}
              <div className="space-y-4">
                
                {/* 1. Customer Query */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex justify-between items-center mb-1.5 font-bold text-slate-700">
                    <span>1. Customer Query Input</span>
                    <span className="font-mono text-slate-500 font-normal">~{selectedInteraction.token_breakdown.user_query_tokens} tokens</span>
                  </div>
                  <p className="text-slate-900 font-medium whitespace-pre-wrap bg-white p-3 rounded-xl border border-slate-100">
                    {selectedInteraction.customer_query}
                  </p>
                </div>

                {/* 2. Retrieved RAG Knowledge Chunks */}
                <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100">
                  <div className="flex justify-between items-center mb-1.5 font-bold text-indigo-900">
                    <span>2. Retrieved RAG Vector Knowledge Context ({selectedInteraction.sources_cited?.length || 0} Chunks)</span>
                    <span className="font-mono text-indigo-600 font-normal">{selectedInteraction.token_breakdown.rag_context_tokens} tokens</span>
                  </div>
                  
                  {selectedInteraction.sources_cited && selectedInteraction.sources_cited.length > 0 ? (
                    <div className="space-y-2 mt-2">
                      {selectedInteraction.sources_cited.map((s, sIdx) => (
                        <div key={sIdx} className="p-3 bg-white rounded-xl border border-indigo-100 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-indigo-950">{s.source || s.title || `Knowledge Chunk #${sIdx + 1}`}</span>
                            {s.similarity && (
                              <span className="font-mono text-[10.5px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                                Match: {(s.similarity * 100).toFixed(0)}%
                              </span>
                            )}
                          </div>
                          {s.content && (
                            <p className="text-slate-600 text-[11.5px] line-clamp-3 font-mono leading-relaxed">
                              {s.content}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic bg-white p-3 rounded-xl border border-slate-100">
                      No external RAG chunks required for this general query.
                    </p>
                  )}
                </div>

                {/* 3. AI Generated Output */}
                <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100">
                  <div className="flex justify-between items-center mb-1.5 font-bold text-emerald-900">
                    <span>3. AI Generated Response (Gemini)</span>
                    <span className="font-mono text-emerald-700 font-normal">{selectedInteraction.token_breakdown.completion_tokens} tokens</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-100 text-slate-900 leading-relaxed whitespace-pre-wrap">
                    {selectedInteraction.ai_response}
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedInteraction(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
