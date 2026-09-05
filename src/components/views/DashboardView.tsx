"use client";

import React, { useEffect, useState } from "react";
import { MessageSquare, Users, Globe, Cpu, CheckCircle2, TrendingUp, Sparkles, AlertCircle, AlertTriangle, RefreshCw, Layers, ArrowRight } from "lucide-react";
import { api } from "../../lib/api";
import { DashboardStats, Conversation } from "../../types";

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [tenantInfo, setTenantInfo] = useState<any | null>(null);
  const [subscription, setSubscription] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, convsData, tData, subData] = await Promise.all([
          api.getDashboardStats().catch(() => null),
          api.getConversations().catch(() => []),
          api.getTenantSettings().catch(() => null),
          api.getSubscriptionCurrent().catch(() => null)
        ]);
        if (statsData) setStats(statsData);
        if (convsData && Array.isArray(convsData)) setConversations(convsData);
        if (tData) setTenantInfo(tData);
        if (subData) setSubscription(subData);
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const isTenantSuspended = tenantInfo?.is_active === false || subscription?.status === "past_due" || subscription?.status === "canceled";
  const suspensionReason = tenantInfo?.branding_config?.suspension_reason || "Subscription renewal is overdue. Settle your pending invoice to restore 24/7 AI capabilities.";

  const totalConvs = stats?.total_conversations ?? 0;
  const aiResolved = stats?.ai_resolved_count ?? 0;
  const humanResolved = stats?.human_resolved_count ?? 0;
  const tokensUsed = stats?.total_tokens_used ?? 0;
  const tokenLimit = subscription?.monthly_token_limit ?? 500000;

  const aiPct = totalConvs > 0 ? Math.round((aiResolved / totalConvs) * 100) : 0;
  const humanPct = totalConvs > 0 ? Math.round((humanResolved / totalConvs) * 100) : 0;
  const tokenLimitStr = tokenLimit >= 1000000 ? `${(tokenLimit / 1000000).toFixed(0)}M` : `${(tokenLimit / 1000).toFixed(0)}k`;
  const tokenUsedStr = tokensUsed >= 1000000 ? `${(tokensUsed / 1000000).toFixed(2)}M` : `${tokensUsed.toLocaleString()}`;
  const quotaPct = tokenLimit > 0 ? ((tokensUsed / tokenLimit) * 100).toFixed(1) : "0.0";

  const statCards = [
    { label: "Total Conversations", value: totalConvs.toLocaleString(), change: totalConvs > 0 ? "Live visitor inquiries" : "No conversations yet", icon: MessageSquare, iconBg: "bg-[#00C978]/10 text-[#008750]" },
    { label: "AI Resolved Conversations", value: `${aiResolved.toLocaleString()} (${aiPct}%)`, change: "Zero human intervention", icon: Sparkles, iconBg: "bg-emerald-50 text-emerald-700" },
    { label: "Human Escalated Tickets", value: `${humanResolved.toLocaleString()} (${humanPct}%)`, change: "Handled within SLA", icon: Users, iconBg: "bg-amber-50 text-amber-700" },
    { label: "Monthly AI Tokens Used", value: `${tokenUsedStr} / ${tokenLimitStr}`, change: `${quotaPct}% of monthly limit`, icon: Cpu, iconBg: "bg-cyan-50 text-cyan-700" }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Dignified Suspension / Grace Recovery Banner */}
      {isTenantSuspended && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Subscription Inactive & Autonomous AI Paused
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Suspended State
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                {suspensionReason}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
            <button
              onClick={() => onNavigate("subscription")}
              className="w-full md:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>💳 Pay & Reactivate with bKash</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
      
      {/* Welcome Banner */}
      <div className="bg-[#080D0A] rounded-2xl p-6 sm:p-7 text-white border border-[#1A2922] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div className="max-w-2xl space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0F1713] text-[#00C978] text-[11px] font-semibold border border-[#1A2922]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00C978] animate-pulse"></span>
            <span>Live Workspace Dashboard</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            AI Customer Support Operations
          </h1>
          <p className="text-xs sm:text-sm text-[#759B87] leading-relaxed">
            Real-time conversation monitoring, AI autonomous resolutions, and customer support ticket escalations.
          </p>
        </div>

        <div className="flex gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate("inbox")}
            className="px-4 py-2 bg-[#00C978] hover:bg-[#00B36B] text-[#080D0A] font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Support Inbox ({conversations.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-[#CBD7D0] shadow-sm flex flex-col justify-between hover:border-[#00C978]/60 transition-all"
            >
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs font-semibold text-[#4F7863]">{s.label}</span>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${s.iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#0F1713] tracking-tight">{s.value}</div>
              </div>
              <div className="text-[11px] font-medium text-[#008750] mt-3 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {s.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Live Escalations */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#CBD7D0] shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-[#E1E8E4] pb-3">
            <div>
              <h3 className="font-bold text-sm text-[#0F1713]">Recent Customer Escalations</h3>
              <p className="text-xs text-[#4F7863]">Live visitor sessions requiring assistance or feedback</p>
            </div>
            <button
              onClick={() => onNavigate("inbox")}
              className="text-xs font-bold text-[#008750] hover:text-[#00663C] cursor-pointer"
            >
              View all →
            </button>
          </div>

          <div className="space-y-2.5">
            {conversations.length > 0 ? (
              conversations.slice(0, 5).map((c, idx) => (
                <div
                  key={c.id || idx}
                  onClick={() => onNavigate("inbox")}
                  className="p-3.5 bg-[#F4F7F5] hover:bg-[#EBF2EE] rounded-xl border border-[#E1E8E4] flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 bg-[#00C978]/15 text-[#008750] font-bold rounded-full flex items-center justify-center text-xs shrink-0">
                      {(c.visitor_name || "Visitor").split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#0F1713] truncate">
                        {c.visitor_name || "Website Visitor"} <span className="text-[#759B87] font-normal">({c.visitor_company || "Direct Storefront"})</span>
                      </div>
                      <div className="text-[11px] text-[#4F7863] mt-0.5 truncate">
                        Tags: <span className="font-medium text-[#263D31]">{c.tags?.join(", ") || "General Inquiry"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${Number(c.last_sentiment_score) > 0 ? "bg-[#00C978]/15 text-[#008750] border border-[#00C978]/30" : "bg-slate-100 text-slate-700 border border-slate-200"}`}>
                      Sentiment: {Number(c.last_sentiment_score) > 0 ? `+${c.last_sentiment_score}` : (c.last_sentiment_score ?? "0.0")}
                    </span>
                    <div className="text-[10px] text-[#759B87] mt-1 capitalize">{c.status.replace("_", " ")}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-[#759B87]">Loading live conversations...</div>
            )}
          </div>
        </div>

        {/* AI Assistant & Channels Readiness */}
        <div className="bg-white rounded-2xl border border-[#CBD7D0] shadow-sm p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-[#E1E8E4] pb-3 mb-3">
              <h3 className="font-bold text-sm text-[#0F1713]">AI Assistant & Channels</h3>
              <p className="text-xs text-[#4F7863]">Real-time autonomous support readiness</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-[#F4F7F5] rounded-lg">
                <span className="font-medium text-[#263D31]">AI Autonomous Bot</span>
                <span className="text-[#008750] font-semibold bg-[#00C978]/10 px-2 py-0.5 rounded border border-[#00C978]/30 text-[11px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C978] animate-pulse"></span>
                  Active (24/7)
                </span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-[#F4F7F5] rounded-lg">
                <span className="font-medium text-[#263D31]">Knowledge Base</span>
                <span className="text-[#008750] font-semibold bg-[#00C978]/10 px-2 py-0.5 rounded border border-[#00C978]/30 text-[11px]">Trained & Synced</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-[#F4F7F5] rounded-lg">
                <span className="font-medium text-[#263D31]">Chatbot Web Widget</span>
                <span className="text-[#008750] font-semibold bg-[#00C978]/10 px-2 py-0.5 rounded border border-[#00C978]/30 text-[11px]">Connected</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-[#F4F7F5] rounded-lg">
                <span className="font-medium text-[#263D31]">Human Escalation SLA</span>
                <span className="text-[#008750] font-semibold bg-[#00C978]/10 px-2 py-0.5 rounded border border-[#00C978]/30 text-[11px]">Ready (Instant)</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#F4F7F5] rounded-xl border border-[#CBD7D0] text-[11px] text-[#263D31]">
            <strong className="text-[#008750]">AI Operational:</strong> Autonomous AI assistant is actively monitoring your storefronts, answering visitors, and capturing qualified leads in real-time.
          </div>
        </div>

      </div>
    </div>
  );
}
