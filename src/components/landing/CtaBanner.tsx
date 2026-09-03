"use client";

import React from "react";
import Link from "next/link";

interface CtaBannerProps {
  onOpenPricing: (tier: string) => void;
}

export default function CtaBanner({ onOpenPricing }: CtaBannerProps) {
  return (
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-indigo-600 rounded-2xl p-6 sm:p-10 text-white text-center space-y-4 shadow-lg shadow-indigo-600/20">
        <div className="max-w-xl mx-auto space-y-1.5">
          <h3 className="text-xl sm:text-3xl font-black tracking-tight">
            Ready to Automate Customer Support & Operations?
          </h3>
          <p className="text-xs text-indigo-100 font-medium">
            Join innovative B2B companies, healthcare helplines, ERP providers, and retailers using Jobab.chat.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          <button
            onClick={() => onOpenPricing("growth")}
            className="px-5 py-2.5 bg-white text-indigo-600 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            Get Started
          </button>
          <Link
            href="/login"
            className="px-5 py-2.5 bg-indigo-700/60 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl border border-indigo-400/40 transition-colors"
          >
            Sign In to Workspace
          </Link>
        </div>
      </div>
    </section>
  );
}
