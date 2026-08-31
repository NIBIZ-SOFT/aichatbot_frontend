"use client";

import React from "react";
import { 
  Bot, Users, CreditCard, ShieldCheck, Zap, 
  MessageSquare, FileText, Activity 
} from "lucide-react";

export default function PlatformCapabilities() {
  const capabilities = [
    {
      title: "Bilingual Bengali & English Vector RAG",
      desc: "Instant retrieval from your uploaded PDFs, docs, and URLs. Handles colloquial Bengali, Banglish, and English with zero hallucination.",
      icon: <Bot className="w-4 h-4 text-indigo-600" />,
      colSpan: "lg:col-span-2",
      badge: "PostgreSQL pgvector"
    },
    {
      title: "Multi-Agent Live Support Handover",
      desc: "Automated routing to specialized human staff (Sales, Tech Support, Accounts) with 1-click live chat takeover and internal whisper notes.",
      icon: <Users className="w-4 h-4 text-emerald-600" />,
      colSpan: "lg:col-span-1",
      badge: "WebSocket Real-Time"
    },
    {
      title: "bKash Direct & EPS Multi-Gateway",
      desc: "Built-in automated payment verification for bKash tokenized checkout, Cards, Nagad, Rocket, and Internet Banking with instant SMS receipts.",
      icon: <CreditCard className="w-4 h-4 text-pink-600" />,
      colSpan: "lg:col-span-1",
      badge: "Automated PGW"
    },
    {
      title: "100% Multi-Tenant Data Isolation & Security",
      desc: "Every merchant operates with dedicated cryptographic encryption (AES-256). No business secrets or customer chats are shared.",
      icon: <ShieldCheck className="w-4 h-4 text-indigo-600" />,
      colSpan: "lg:col-span-2",
      badge: "AES-256 Vault"
    }
  ];

  return (
    <section id="capabilities" className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
      
      {/* Section Header */}
      <div className="text-center max-w-xl mx-auto space-y-1.5">
        <h2 className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">Platform Capabilities</h2>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Engineered for Performance & Reliability
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          Enterprise-ready architecture designed to scale with your volume.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {capabilities.map((cap, i) => (
          <div
            key={i}
            className={`p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-3 ${cap.colSpan}`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                {cap.icon}
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                {cap.badge}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">{cap.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">{cap.desc}</p>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
