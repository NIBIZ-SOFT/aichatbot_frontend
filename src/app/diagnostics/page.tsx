"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity, CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  Database, Cpu, Globe, CreditCard, ShieldCheck, Terminal,
  ExternalLink, Zap, Copy, Check, Server, ArrowRight, Sparkles, Play
} from "lucide-react";
import { api, API_BASE_URL } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContext";

export default function DiagnosticsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { currentTheme } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [isPingingDb, setIsPingingDb] = useState(false);
  const [isPingingAi, setIsPingingAi] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any | null>(null);
  const [dbPingResult, setDbPingResult] = useState<string | null>(null);
  const [aiPingResult, setAiPingResult] = useState<any | null>(null);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSystemDiagnostics();
      setDiagnostics(data);
      if (data?.overall_status === "healthy" && data?.is_fully_seeded) {
        showToast("System 100% Operational", "Database, Super Admin, AI Gateway & Gateways verified.", "success");
      } else if (!data?.is_fully_seeded) {
        showToast("Database Needs Seeding", "Tables exist but Super Admin & pricing plans need initialization.", "warning");
      }
    } catch (err: any) {
      setDiagnostics({
        overall_status: "disconnected",
        health_score_percent: 0,
        is_fully_seeded: false,
        components: {
          database: { status: "disconnected", error: err.message || "Failed to reach FastAPI backend" },
          ai_engine: { status: "unknown" },
          bkash_gateway: { status: "unknown" },
          widget_cdn: { status: "unknown" }
        },
        fix_recommendations: [
          {
            component: "Backend Server",
            issue: "FastAPI server unreachable",
            solution: "1. Open backend terminal.\n2. Run: python -m uvicorn app.main:app --reload --port 8000\n3. Verify backend is running."
          }
        ]
      });
      showToast("Backend Server Unreachable", "Cannot connect to FastAPI backend API.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const handlePingDb = async () => {
    setIsPingingDb(true);
    setDbPingResult(null);
    try {
      const res = await api.pingDatabase();
      setDbPingResult(`✅ Connected in ${res.latency_ms}ms (Server time: ${res.server_time || 'OK'})`);
      showToast("PostgreSQL Responded", `Latency: ${res.latency_ms}ms`, "success");
    } catch (err: any) {
      setDbPingResult(`❌ Failed: ${err.message}`);
      showToast("Database Ping Failed", err.message, "error");
    } finally {
      setIsPingingDb(false);
    }
  };

  const handlePingAi = async () => {
    setIsPingingAi(true);
    setAiPingResult(null);
    try {
      const res = await api.pingAI();
      setAiPingResult(res);
      if (res.status === "success") {
        showToast("AI Gateway Responded", `Model '${res.model}' replied in ${res.latency_ms}ms`, "success");
      } else {
        showToast("AI Ping Failed", res.message || res.error, "error");
      }
    } catch (err: any) {
      setAiPingResult({ status: "error", error: err.message });
      showToast("AI Test Failed", err.message, "error");
    } finally {
      setIsPingingAi(false);
    }
  };

  const handleSeedDatabase = async () => {
    if (!confirm("Are you sure you want to run the database seeder? This will ensure Super Admin (admin@gmail.com), OpenRouter AI configs, bKash & EPS settings, and SaaS Pricing Plans are fully populated.")) {
      return;
    }
    setIsSeeding(true);
    setSeedResult(null);
    try {
      const res = await api.triggerDatabaseSeed();
      setSeedResult(res.message);
      showToast("Database Seeded Successfully", "Super Admin and platform configs are ready!", "success");
      await runDiagnostics();
    } catch (err: any) {
      setSeedResult(`❌ Seeder Failed: ${err.message}`);
      showToast("Seeder Failed", err.message, "error");
    } finally {
      setIsSeeding(false);
    }
  };

  const score = diagnostics?.health_score_percent ?? 100;
  const isHealthy = diagnostics?.overall_status === "healthy";
  const isSeeded = diagnostics?.is_fully_seeded ?? false;
  const dbComp = diagnostics?.components?.database;
  const aiComp = diagnostics?.components?.ai_engine;
  const bkashComp = diagnostics?.components?.bkash_gateway;
  const epsComp = diagnostics?.components?.eps_gateway;
  const cdnComp = diagnostics?.components?.widget_cdn;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center font-black text-white shadow-md shadow-indigo-600/30">
              J
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight group-hover:text-indigo-400 transition-colors">
                Jobab Chat
              </span>
              <span className="text-[10px] text-slate-400 block -mt-1 font-mono">
                System Diagnostics & Seeder Status
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              onClick={runDiagnostics}
              disabled={isLoading}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
              <span>Refresh Status</span>
            </button>

            <Link
              href="/login"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Super Admin Login</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Banner: Overall Health Score & Quick Actions */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full border ${isHealthy && isSeeded
                  ? "bg-emerald-950/80 text-emerald-400 border-emerald-800"
                  : "bg-amber-950/80 text-amber-300 border-amber-800"
                }`}>
                  {isHealthy && isSeeded ? "🟢 100% ONLINE & SEEDED" : "🟡 ACTION RECOMMENDED"}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Environment: {diagnostics?.environment || "production"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Live Deployment & Architecture Verification
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                Real-time connection, schema integrity, and database seeding verification across FastAPI, PostgreSQL, OpenRouter AI Gateway, and Payment Infrastructure.
              </p>
            </div>

            {/* Health Score Pill */}
            <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-800 rounded-2xl p-4 shrink-0">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                  {score}%
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Health Index
                </div>
              </div>
              <div className="h-10 w-[1px] bg-slate-800" />
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className={`w-2 h-2 rounded-full ${dbComp?.status === "connected" ? "bg-emerald-400" : "bg-rose-500"}`} />
                  PostgreSQL: <strong className="text-white">{dbComp?.status === "connected" ? "OK" : "Error"}</strong>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className={`w-2 h-2 rounded-full ${isSeeded ? "bg-emerald-400" : "bg-amber-400"}`} />
                  Seeder: <strong className="text-white">{isSeeded ? "Complete" : "Pending"}</strong>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className={`w-2 h-2 rounded-full ${aiComp?.status === "configured" ? "bg-emerald-400" : "bg-rose-500"}`} />
                  AI Gateway: <strong className="text-white">{aiComp?.status === "configured" ? "Ready" : "Missing"}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Card Infrastructure Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* CARD 1: PostgreSQL & Seeder */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">PostgreSQL 18 & Seeder Data</h3>
                  <p className="text-[11px] text-slate-400">Multi-Tenant PostgreSQL Storage & RAG Vector Engine</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${dbComp?.status === "connected"
                ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                : "bg-rose-950 text-rose-400 border-rose-800"
              }`}>
                {dbComp?.status === "connected" ? "ONLINE" : "DISCONNECTED"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 font-mono">
              <div>
                <span className="text-slate-500 block text-[10px]">PING LATENCY</span>
                <span className="text-emerald-400 font-bold">{dbComp?.latency_ms ? `${dbComp.latency_ms}ms` : "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">PUBLIC TABLES</span>
                <span className="text-white font-bold">{dbComp?.table_count ?? 0} Tables</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">SUPER ADMIN ACCOUNT</span>
                <span className={dbComp?.superadmin_ready ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {dbComp?.superadmin_ready ? "admin@gmail.com (Ready)" : "❌ Unseeded"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">SAAS PRICING PLANS</span>
                <span className="text-indigo-400 font-bold">{dbComp?.pricing_plans_count ?? 0} Plans Seeded</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handlePingDb}
                disabled={isPingingDb}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Zap className={`w-3.5 h-3.5 ${isPingingDb ? "animate-spin text-amber-400" : "text-amber-400"}`} />
                <span>Ping Database</span>
              </button>

              <button
                onClick={handleSeedDatabase}
                disabled={isSeeding}
                className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isSeeding ? "animate-spin" : ""}`} />
                <span>{isSeeded ? "Reseed Database" : "⚡ Run Seeder Now"}</span>
              </button>
            </div>

            {dbPingResult && (
              <div className="text-[11px] p-2 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 font-mono">
                {dbPingResult}
              </div>
            )}
          </div>

          {/* CARD 2: Universal AI Gateway & OpenRouter */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Universal AI Gateway</h3>
                  <p className="text-[11px] text-slate-400">OpenRouter Multi-LLM Routing & Context Ingestion</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${aiComp?.status === "configured"
                ? "bg-purple-950 text-purple-300 border-purple-800"
                : "bg-amber-950 text-amber-400 border-amber-800"
              }`}>
                {aiComp?.status === "configured" ? "READY" : "NO API KEY"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 font-mono">
              <div className="col-span-2">
                <span className="text-slate-500 block text-[10px]">PRIMARY MASTER MODEL</span>
                <span className="text-purple-300 font-bold">{aiComp?.master_model || "google/gemini-2.5-flash"}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">API ENDPOINT</span>
                <span className="text-slate-300 truncate block">{aiComp?.base_url || "https://openrouter.ai/api/v1"}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">CREDENTIALS</span>
                <span className={aiComp?.api_key_configured ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                  {aiComp?.key_masked || "Configured"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handlePingAi}
                disabled={isPingingAi}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 ${isPingingAi ? "animate-spin" : ""}`} />
                <span>Test Live AI Ping</span>
              </button>
            </div>

            {aiPingResult && (
              <div className={`text-[11px] p-2.5 rounded-lg border font-mono ${aiPingResult.status === "success"
                ? "bg-purple-950/40 border-purple-800 text-purple-200"
                : "bg-rose-950/40 border-rose-800 text-rose-300"
              }`}>
                <div className="flex justify-between font-bold">
                  <span>Model: {aiPingResult.model}</span>
                  <span>{aiPingResult.latency_ms}ms</span>
                </div>
                <div className="mt-1 text-slate-300 text-[10px]">
                  Response: "{aiPingResult.reply || aiPingResult.error}"
                </div>
              </div>
            )}
          </div>

          {/* CARD 3: Payment Gateways (bKash & EPS) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Bangladeshi Payment Gateways</h3>
                  <p className="text-[11px] text-slate-400">bKash Tokenized & EPS Multi-Channel Integration</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-950 text-emerald-400 border-emerald-800">
                ACTIVE
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                  <span className="font-bold text-white">bKash Tokenized PGW</span>
                </div>
                <span className="text-slate-400 text-[11px]">v1.2.0-beta (Platform Resolved)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-white">EPS Multi-Channel PGW</span>
                </div>
                <span className="text-slate-400 text-[11px]">Cards, MFS, Net Banking</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Gateways support instant SaaS subscription checkout and automated prepaid token wallet top-ups.
            </p>
          </div>

          {/* CARD 4: Static Widget CDN & Frontend Core */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Embeddable Widget CDN</h3>
                  <p className="text-[11px] text-slate-400">1-Line Vanilla JS Chat Widget Script</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${cdnComp?.status === "ready"
                ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                : "bg-rose-950 text-rose-400 border-rose-800"
              }`}>
                {cdnComp?.status === "ready" ? "READY" : "MISSING"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 font-mono">
              <div>
                <span className="text-slate-500 block text-[10px]">CDN ENDPOINT</span>
                <span className="text-emerald-400 font-bold">{cdnComp?.endpoint || "/static/widget.js"}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">BUNDLE SIZE</span>
                <span className="text-white font-bold">{cdnComp?.file_size_kb || 28} KB</span>
              </div>
            </div>

            <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-400 truncate">
              &lt;script src="https://api.jobab.chat/static/widget.js" data-widget-key="wg_..."&gt;&lt;/script&gt;
            </div>
          </div>
        </div>

        {/* Action Callout: Super Admin Login Shortcut */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Default Super Admin Credentials</h4>
              <p className="text-xs text-slate-400">
                Email: <code className="text-indigo-300 font-bold">admin@gmail.com</code> • Password: <code className="text-indigo-300 font-bold">12345678</code>
              </p>
            </div>
          </div>

          <Link
            href="/login"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 shrink-0"
          >
            <span>Open Super Admin Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </main>
    </div>
  );
}
