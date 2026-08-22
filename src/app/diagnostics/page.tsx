"use client";

import React, { useState } from "react";
import AppShell from "../../components/layout/AppShell";
import SystemDiagnosticsModal from "../../components/common/SystemDiagnosticsModal";
import { Activity, ShieldCheck, Database, Cpu, Globe, ArrowRight } from "lucide-react";

export default function DiagnosticsPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <AppShell activeNav="diagnostics">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
              Platform Health & Diagnostics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            System Connection & Infrastructure Diagnostics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Verify active connectivity between the Next.js Frontend, FastAPI Backend (Port 8000), PostgreSQL 18 Multi-Tenant Database, Google Gemini AI API, and bKash PGW Gateway.
          </p>

          <div className="pt-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>Launch Live Diagnostics Scanner</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <SystemDiagnosticsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </AppShell>
  );
}
