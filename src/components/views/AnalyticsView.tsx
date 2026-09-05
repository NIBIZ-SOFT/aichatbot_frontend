"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, Bot, MessageSquare, Star, Clock, CheckCircle2, RefreshCw, Sparkles } from "lucide-react";
import { api } from "../../lib/api";
import CSATCard from "../analytics/CSATCard";
import ResolutionCard from "../analytics/ResolutionCard";
import ResponseTimeCard from "../analytics/ResponseTimeCard";
import AgentLeaderboardTable from "../analytics/AgentLeaderboardTable";
import CustomerFeedbackList from "../analytics/CustomerFeedbackList";

export default function AnalyticsView() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async (range: string) => {
    setIsLoading(true);
    try {
      const res = await api.getAnalyticsOverview(range);
      setData(res);
    } catch (e) {
      console.error("Failed to load analytics overview:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeRange);
  }, [timeRange]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600" /> Multi-Tenant Scoped Analytics
            </span>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
              Live Real-Time
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            Analytics & Customer Satisfaction (CSAT)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time performance metrics, first-response times, AI autonomous resolution rates, and visitor CSAT ratings.
          </p>
        </div>

        {/* Time Range Filter Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 text-xs shadow-sm">
            {(["7d", "30d", "90d"] as const).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-3.5 py-1.5 rounded-xl font-bold uppercase transition-all cursor-pointer ${
                  timeRange === r ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {r === "7d" ? "Last 7 Days" : r === "30d" ? "Last 30 Days" : "Last 90 Days"}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchAnalytics(timeRange)}
            className="p-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl shadow-sm transition-all"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading && !data ? (
        <div className="p-16 text-center text-xs text-slate-400 flex flex-col items-center gap-3 bg-white rounded-3xl border border-slate-200">
          <div className="h-8 w-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          Calculating real-time CSAT and performance metrics...
        </div>
      ) : data ? (
        <>
          {/* Top 3 Core Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <CSATCard
              score={data.csat.average_score}
              totalRatings={data.csat.total_feedback_count}
              positivePercentage={data.csat.positive_percentage}
              stars={data.csat.stars}
            />

            <ResolutionCard
              totalConversations={data.resolution.total_conversations}
              aiAutonomousCount={data.resolution.ai_autonomous_count}
              aiAutonomousRate={data.resolution.ai_autonomous_rate}
              humanHandoverCount={data.resolution.human_handover_count}
              humanHandoverRate={data.resolution.human_handover_rate}
              estimatedHoursSaved={data.resolution.estimated_hours_saved}
            />

            <ResponseTimeCard
              avgAiFirstResponseMs={data.speed.avg_ai_first_response_ms}
              avgHumanResponseSeconds={data.speed.avg_human_response_seconds}
              avgResolutionMinutes={data.speed.avg_resolution_time_minutes}
              slaComplianceRate={data.speed.sla_compliance_rate}
            />
          </div>

          {/* Support Staff Leaderboard */}
          <AgentLeaderboardTable agents={data.agent_leaderboard || []} />

          {/* Verified Customer Reviews */}
          <CustomerFeedbackList feedbacks={data.recent_feedback || []} />
        </>
      ) : null}

    </div>
  );
}
