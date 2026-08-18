"use client";

import React from "react";
import { Bot, UserCheck, Clock, TrendingUp, Sparkles } from "lucide-react";

interface ResolutionCardProps {
  totalConversations: number;
  aiAutonomousCount: number;
  aiAutonomousRate: number;
  humanHandoverCount: number;
  humanHandoverRate: number;
  estimatedHoursSaved: number;
}

export default function ResolutionCard({
  totalConversations,
  aiAutonomousCount,
  aiAutonomousRate,
  humanHandoverCount,
  humanHandoverRate,
  estimatedHoursSaved
}: ResolutionCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
            Autonomous Operations
          </span>
          <h3 className="text-base font-extrabold text-slate-900 mt-2">AI Resolution Rate</h3>
          <p className="text-xs text-slate-500">Inquiries solved without human intervention</p>
        </div>
        <div className="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
          <Bot className="w-5 h-5" />
        </div>
      </div>

      {/* Main Percentage Display */}
      <div className="flex items-baseline gap-3">
        <div className="text-4xl font-black text-indigo-600 tracking-tight">{aiAutonomousRate}%</div>
        <div className="text-[11px] text-slate-500 font-semibold leading-tight">
          <strong>{aiAutonomousCount}</strong> of {totalConversations} inquiries resolved 100% autonomously
        </div>
      </div>

      {/* Visual Proportion Bar */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <div className="flex justify-between text-[11px] font-bold text-slate-700">
          <span className="flex items-center gap-1 text-indigo-600">
            <Sparkles className="w-3 h-3" /> AI Handled ({aiAutonomousRate}%)
          </span>
          <span className="flex items-center gap-1 text-amber-600">
            <UserCheck className="w-3 h-3" /> Live Agent ({humanHandoverRate}%)
          </span>
        </div>

        <div className="w-full bg-amber-100 h-3 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${Math.max(15, aiAutonomousRate)}%` }}
            className="bg-indigo-600 h-full rounded-l-full transition-all"
          ></div>
          <div
            style={{ width: `${Math.max(5, humanHandoverRate)}%` }}
            className="bg-amber-500 h-full rounded-r-full transition-all"
          ></div>
        </div>
      </div>

      {/* Staff Labor Savings Card */}
      <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-100 flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4" />
        </div>
        <div className="text-xs">
          <div className="font-extrabold text-emerald-900">~{estimatedHoursSaved} Hours Saved</div>
          <div className="text-[11px] text-emerald-700">Estimated support staff work hours saved this period</div>
        </div>
      </div>
    </div>
  );
}
