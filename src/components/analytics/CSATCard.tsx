"use client";

import React from "react";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";

interface CSATCardProps {
  score: number;
  totalRatings: number;
  positivePercentage: number;
  stars: {
    star_5: number;
    star_4: number;
    star_3: number;
    star_2: number;
    star_1: number;
  };
}

export default function CSATCard({ score, totalRatings, positivePercentage, stars }: CSATCardProps) {
  const total = totalRatings || 1;
  const ratingRows = [
    { label: "5 Stars", count: stars.star_5, pct: Math.round((stars.star_5 / total) * 100), color: "bg-amber-400" },
    { label: "4 Stars", count: stars.star_4, pct: Math.round((stars.star_4 / total) * 100), color: "bg-emerald-400" },
    { label: "3 Stars", count: stars.star_3, pct: Math.round((stars.star_3 / total) * 100), color: "bg-blue-400" },
    { label: "2 Stars", count: stars.star_2, pct: Math.round((stars.star_2 / total) * 100), color: "bg-orange-400" },
    { label: "1 Star", count: stars.star_1, pct: Math.round((stars.star_1 / total) * 100), color: "bg-rose-400" },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            Customer Satisfaction
          </span>
          <h3 className="text-base font-extrabold text-slate-900 mt-2">Overall CSAT Rating</h3>
          <p className="text-xs text-slate-500">Aggregated post-chat visitor feedback</p>
        </div>
        <div className="h-10 w-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-100 shrink-0">
          <Star className="w-5 h-5 fill-amber-400" />
        </div>
      </div>

      {/* Main Score Display */}
      <div className="flex items-baseline gap-3">
        <div className="text-4xl font-black text-slate-900 tracking-tight">{score.toFixed(1)}</div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map(s => (
              <Star
                key={s}
                className={`w-4 h-4 ${s <= Math.round(score) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
              />
            ))}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <ThumbsUp className="w-3 h-3" /> {positivePercentage}% Positive feedback
          </div>
        </div>
      </div>

      {/* 5-to-1 Star Breakdown */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        {ratingRows.map((row, idx) => (
          <div key={idx} className="flex items-center gap-3 text-xs">
            <span className="w-12 text-slate-500 font-medium text-[11px]">{row.label}</span>
            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, Math.max(row.pct, row.count > 0 ? 8 : 0))}%` }}
                className={`h-full rounded-full transition-all ${row.color}`}
              ></div>
            </div>
            <span className="w-8 text-right font-mono text-[11px] text-slate-600 font-bold">{row.count}</span>
          </div>
        ))}
      </div>

      <div className="text-[11px] text-slate-400 text-center font-medium pt-1">
        Based on <strong className="text-slate-700">{totalRatings} verified customer ratings</strong>
      </div>
    </div>
  );
}
