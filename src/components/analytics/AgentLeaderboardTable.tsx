"use client";

import React from "react";
import { Trophy, Star, Clock, CheckCircle2, UserCheck, Shield } from "lucide-react";

interface AgentItem {
  agent_id: string;
  name: string;
  email: string;
  department: string;
  assigned_count: number;
  resolved_count: number;
  avg_csat: number;
  avg_response_speed_seconds: number;
  is_online: boolean;
}

interface AgentLeaderboardProps {
  agents: AgentItem[];
}

export default function AgentLeaderboardTable({ agents }: AgentLeaderboardProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Support Staff Performance & CSAT Leaderboard
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual team member resolution efficiency, speeds, and customer satisfaction ratings.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          {agents.length} Active Staff Members
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <th className="pb-3 px-3">Agent Profile</th>
              <th className="pb-3 px-3">Department</th>
              <th className="pb-3 px-3 text-center">Assigned</th>
              <th className="pb-3 px-3 text-center">Resolved</th>
              <th className="pb-3 px-3 text-center">Avg CSAT</th>
              <th className="pb-3 px-3 text-right">Avg Response</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {agents.map((agent, idx) => {
              const initials = agent.name.split(" ").map(n => n[0]).slice(0, 2).join("");
              return (
                <tr key={agent.agent_id} className="hover:bg-slate-50/70 transition-colors">
                  
                  {/* Name & Avatar */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold flex items-center justify-center text-xs shadow-sm">
                          {initials}
                        </div>
                        {agent.is_online && (
                          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {agent.name}
                          {idx === 0 && (
                            <span className="text-[9.5px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full border border-amber-200">
                              🏆 Top Rated
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{agent.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="py-3.5 px-3">
                    <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      {agent.department}
                    </span>
                  </td>

                  {/* Assigned Count */}
                  <td className="py-3.5 px-3 text-center font-bold text-slate-700 font-mono">
                    {agent.assigned_count}
                  </td>

                  {/* Resolved Count */}
                  <td className="py-3.5 px-3 text-center">
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                      {agent.resolved_count}
                    </span>
                  </td>

                  {/* CSAT Rating */}
                  <td className="py-3.5 px-3 text-center">
                    <div className="inline-flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-amber-700 font-extrabold font-mono text-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {agent.avg_csat.toFixed(1)}
                    </div>
                  </td>

                  {/* Avg Speed */}
                  <td className="py-3.5 px-3 text-right font-mono text-slate-600 font-bold">
                    {agent.avg_response_speed_seconds}s
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
