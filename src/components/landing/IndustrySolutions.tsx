"use client";

import React from "react";
import { Building2, Headphones, Database, ShoppingBag } from "lucide-react";

export default function IndustrySolutions() {
  const industries = [
    {
      title: "B2B SaaS & Corporate",
      desc: "Automatically qualify high-intent sales leads, handle service pricing inquiries, and schedule demos directly into your sales CRM.",
      icon: <Building2 className="w-5 h-5 text-indigo-600" />,
      badge: "Lead Qualification",
      color: "bg-indigo-50 border-indigo-100"
    },
    {
      title: "Helplines & Healthcare",
      desc: "Deliver 24/7 instant answers for lab reports, doctor schedules, hospital departments, and appointment bookings with zero waiting.",
      icon: <Headphones className="w-5 h-5 text-emerald-600" />,
      badge: "24/7 Helpline",
      color: "bg-emerald-50 border-emerald-100"
    },
    {
      title: "ERP & Operations Portals",
      desc: "Give clients and staff instant self-service lookup for shipment tracking, outstanding invoice balances, and company SOPs.",
      icon: <Database className="w-5 h-5 text-purple-600" />,
      badge: "Operations Self-Service",
      color: "bg-purple-50 border-purple-100"
    },
    {
      title: "E-Commerce & Retail",
      desc: "Showcase in-chat product carousels with prices and size variants. Enable 1-click orders with automated bKash & EPS payments.",
      icon: <ShoppingBag className="w-5 h-5 text-[#E2136E]" />,
      badge: "Instant Commerce",
      color: "bg-pink-50 border-pink-100"
    }
  ];

  return (
    <section id="solutions" className="py-10 sm:py-14 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <h2 className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">Industry Verticals</h2>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            One Intelligent AI Platform for Every Sector
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Designed to fit seamlessly into diverse business models without custom AI engineering.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {industries.map((ind, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-indigo-300 hover:bg-white transition-all shadow-2xs hover:shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl border ${ind.color}`}>
                  {ind.icon}
                </div>
                <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                  {ind.badge}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{ind.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {ind.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
