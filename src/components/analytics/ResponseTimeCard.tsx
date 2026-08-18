"use client";

import React from "react";
import { Zap, Clock, ShieldCheck, Activity } from "lucide-react";

interface ResponseTimeCardProps {
  avgAiFirstResponseMs: number;
  avgHumanResponseSeconds: number;
  avgResolutionMinutes: number;
  slaComplianceRate: number;
}

export default function ResponseTimeCard({
  avgAiFirstResponseMs,
  avgHumanResponseSeconds,
  avgResolutionMinutes,
  slaComplianceRate
}: ResponseTimeCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Speed & Latency
          </span>
          <h3 className="text-base font-extrabold text-slate-900 mt-2">First Response Time</h3>
          <p className="text-xs text-slate-500">Average response speed across channels</p>
        </div>
        <div className="h-10 w-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
          <Zap className="w-5 h-5" />
        </div>
      </div>

      {/* Main Metric */}
      <div className="flex items-baseline gap-3">
        <div className="text-4xl font-black text-slate-900 tracking-tight">{avgAiFirstResponseMs}ms</div>
        <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
          <Activity className="w-3 h-3" /> Real-time token streaming
        </div>
      </div>

      {/* Grid of Sub-Metrics */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="text-[11px] text-slate-400 font-medium">Live Agent Takeover</div>
          <div className="text-base font-extrabold text-slate-800 mt-0.5">{avgHumanResponseSeconds}s</div>
          <div className="text-[10px] text-slate-500">From customer queue</div>
        </div>

        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="text-[11px] text-slate-400 font-medium">Avg Resolution Time</div>
          <div className="text-base font-extrabold text-slate-800 mt-0.5">{avgResolutionMinutes} min</div>
          <div className="text-[10px] text-slate-500">From start to closed</div>
        </div>
      </div>

      {/* SLA Badge */}
      <div className="p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-bold">Enterprise SLA Compliance</span>
        </div>
        <span className="font-black text-emerald-400 font-mono">{slaComplianceRate}%</span>
      </div>
    </div>
  );
}
