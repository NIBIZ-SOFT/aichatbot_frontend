"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench, Activity, ShieldCheck, RefreshCw, Layers,
  Clock, CheckCircle2, AlertCircle, ArrowRight
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { api } from "../../lib/api";

export default function MaintenancePage() {
  const router = useRouter();
  const { currentTheme } = useTheme();

  const [isChecking, setIsChecking] = useState(false);
  const [autoCheckSeconds, setAutoCheckSeconds] = useState(15);
  const [isOnline, setIsOnline] = useState(false);

  // Auto-polling effect to detect when maintenance ends
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoCheckSeconds((prev) => {
        if (prev <= 1) {
          checkHealthStatus();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const checkHealthStatus = async () => {
    setIsChecking(true);
    try {
      const res = await api.getSystemDiagnostics();
      if (res?.overall_status === "healthy") {
        setIsOnline(true);
        setTimeout(() => {
          router.replace("/dashboard");
        }, 1500);
      }
    } catch {
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between font-sans antialiased text-slate-100 p-6 sm:p-10 relative overflow-hidden"
      style={{ backgroundColor: currentTheme.dark_surface || "#0A0D14" }}
    >
      {/* Ambient Amber Background Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full relative z-10">
        <div className="flex items-center gap-3">
          {currentTheme.logo_url ? (
            <img src={currentTheme.logo_url} alt="Logo" className="h-8 w-auto max-w-[120px] object-contain rounded-xl" />
          ) : (
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
              style={{ backgroundColor: currentTheme.primary_color || "#00C978" }}
            >
              <Layers className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="font-bold text-white text-sm sm:text-base tracking-tight">
            {currentTheme.platform_name || "AIaaS Enterprise Platform"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/60 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping"></span>
            Scheduled Maintenance Mode
          </span>
        </div>
      </header>

      {/* Main Maintenance Centerpiece */}
      <main className="max-w-2xl mx-auto w-full my-auto text-center space-y-7 relative z-10 py-10">
        
        {/* Animated Wrench / Gear Icon */}
        <div className="h-20 w-20 mx-auto rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-2xl relative">
          <Wrench className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            System Upgrades & Security Maintenance
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            We are performing scheduled database performance tuning, neural AI model version upgrades, and security optimizations to enhance your customer experience.
          </p>
        </div>

        {/* Live Reconnect Card */}
        <div
          className="p-6 rounded-3xl border text-left space-y-4 max-w-md mx-auto shadow-xl"
          style={{
            backgroundColor: currentTheme.dark_card || "#121722",
            borderColor: currentTheme.dark_border || "#1e293b"
          }}
        >
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Auto-Reconnect Polling
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Checking in {autoCheckSeconds}s
            </span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`}></span>
              <span className="text-slate-300">
                {isOnline ? "Server Responding (Redirecting...)" : "Maintenance in progress..."}
              </span>
            </div>
            <button
              onClick={checkHealthStatus}
              disabled={isChecking}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
              title="Check Now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="space-y-1.5 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero data loss guarantee across all tenant workspaces</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Customer chat queues automatically preserved</span>
            </div>
          </div>
        </div>

        {/* Manual Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={checkHealthStatus}
            disabled={isChecking}
            className="px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: currentTheme.primary_color || "#00C978" }}
          >
            {isChecking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
            <span>Check Platform Status Now</span>
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-500 relative z-10 max-w-5xl mx-auto w-full pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>Need urgent corporate support? Contact: support@padmadigital.example</span>
        <span>ISO/IEC 27001 Security Standard • High Availability</span>
      </footer>
    </div>
  );
}
