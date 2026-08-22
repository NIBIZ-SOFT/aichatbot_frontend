"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RefreshCw, Home, Activity, ShieldAlert, Terminal } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorBoundary({ error, reset }: ErrorProps) {
  const { currentTheme } = useTheme();

  useEffect(() => {
    // Log error to console / telemetry in production
    console.error("Enterprise Global Error Boundary caught exception:", error);
  }, [error]);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-6 sm:p-10 text-slate-100 font-sans antialiased relative overflow-hidden"
      style={{ backgroundColor: currentTheme.dark_surface || "#0A0D14" }}
    >
      {/* Ambient Red Glow */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-rose-600/20 rounded-full blur-[140px] pointer-events-none" />

      <div
        className="max-w-xl w-full p-8 rounded-3xl border shadow-2xl space-y-6 relative z-10 text-center"
        style={{
          backgroundColor: currentTheme.dark_card || "#121722",
          borderColor: currentTheme.dark_border || "#1e293b"
        }}
      >
        {/* Error Badge Icon */}
        <div className="h-16 w-16 mx-auto rounded-3xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase border border-rose-500/40 bg-rose-950/60 text-rose-300">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            <span>Application Runtime Safeguard</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Unexpected Workspace Interruption
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            The workspace encountered a temporary client-side exception. The state has been safely isolated to prevent data corruption.
          </p>
        </div>

        {/* Error Digest Log Box */}
        {error?.message && (
          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-left font-mono text-[11px] text-rose-300 overflow-x-auto space-y-1">
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <Terminal className="w-3 h-3" /> Error Details
            </div>
            <div className="line-clamp-3">{error.message}</div>
            {error.digest && (
              <div className="text-[9.5px] text-slate-500">Digest ID: {error.digest}</div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: currentTheme.primary_color || "#00C978" }}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recover Session / Try Again</span>
          </button>

          <Link
            href="/diagnostics"
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-2"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Run Diagnostics</span>
          </Link>

          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
