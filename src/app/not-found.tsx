"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass, ArrowLeft, Home, Activity, MessageSquare,
  ShieldCheck, Search, HelpCircle, Layers
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function NotFound() {
  const router = useRouter();
  const { currentTheme } = useTheme();

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between font-sans antialiased text-slate-100 p-6 sm:p-10 relative overflow-hidden transition-colors"
      style={{ backgroundColor: currentTheme.dark_surface || "#0A0D14" }}
    >
      {/* Ambient Cyber Light Glows */}
      <div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-20"
        style={{ backgroundColor: currentTheme.primary_color || "#00C978" }}
      />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Brand Header */}
      <header className="flex items-center justify-between max-w-6xl mx-auto w-full relative z-10">
        <Link href="/" className="flex items-center gap-3 group">
          {currentTheme.logo_url ? (
            <img src={currentTheme.logo_url} alt="Logo" className="h-8 w-auto max-w-[120px] object-contain rounded-xl" />
          ) : (
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center font-bold text-white shadow-sm transition-transform group-hover:scale-105"
              style={{ backgroundColor: currentTheme.primary_color || "#00C978" }}
            >
              <Layers className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="font-bold text-white text-sm sm:text-base tracking-tight">
            {currentTheme.platform_name || "AIaaS Enterprise Platform"}
          </span>
        </Link>

        <Link
          href="/diagnostics"
          className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:border-slate-600 transition-all flex items-center gap-1.5 shadow-xs"
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">System Status</span>
        </Link>
      </header>

      {/* Main 404 Centerpiece Card */}
      <main className="max-w-2xl mx-auto w-full my-auto text-center space-y-8 relative z-10 py-12">
        
        {/* Animated Glow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border border-rose-500/30 bg-rose-500/10 text-rose-300 animate-pulse">
          <span className="h-2 w-2 rounded-full bg-rose-500"></span>
          HTTP 404 // ROUTE NOT FOUND
        </div>

        {/* 404 Massive Title */}
        <div className="space-y-2">
          <h1 className="text-7xl sm:text-9xl font-black tracking-tight text-white font-mono flex items-center justify-center gap-4">
            <span>4</span>
            <span
              className="inline-block animate-bounce text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(135deg, ${currentTheme.primary_color || "#00C978"}, #3b82f6)`
              }}
            >
              0
            </span>
            <span>4</span>
          </h1>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            Lost in the Cloud Workspace
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            The destination URL or workspace module you are looking for has been relocated, archived, or does not exist.
          </p>
        </div>

        {/* Action Buttons Matrix */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleGoBack}
            className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <Link
            href="/dashboard"
            className="px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: currentTheme.primary_color || "#00C978" }}
          >
            <Home className="w-4 h-4" />
            <span>Return to Workspace Dashboard</span>
          </Link>
        </div>

        {/* Quick Route Shortcut Directory */}
        <div
          className="p-5 rounded-2xl border text-left space-y-3 transition-colors"
          style={{
            backgroundColor: currentTheme.dark_card || "#121722",
            borderColor: currentTheme.dark_border || "#1e293b"
          }}
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>Popular Organization Destinations</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <Link
              href="/inbox"
              className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Support Inbox</span>
            </Link>

            <Link
              href="/knowledge"
              className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-2"
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>RAG Knowledge Base</span>
            </Link>

            <Link
              href="/diagnostics"
              className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-2"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Connection Diagnostics</span>
            </Link>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-500 relative z-10 max-w-6xl mx-auto w-full pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>{currentTheme.footer_text || "Enterprise AIaaS Platform • ISO/IEC 27001 Certified"}</span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hover:text-slate-300 transition-colors">Sign In</Link>
          <span>•</span>
          <Link href="/pricing" className="hover:text-slate-300 transition-colors">Pricing</Link>
          <span>•</span>
          <Link href="/diagnostics" className="hover:text-slate-300 transition-colors">Status (100% Online)</Link>
        </div>
      </footer>
    </div>
  );
}
