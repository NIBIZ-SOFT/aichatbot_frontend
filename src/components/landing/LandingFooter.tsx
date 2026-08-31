"use client";

import React from "react";
import Link from "next/link";
import { Bot } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="bg-white border-t border-slate-200/80 py-6 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-5.5 w-5.5 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-800">Jobab.chat</span>
          <span>• &copy; {new Date().getFullYear()} All Rights Reserved.</span>
        </div>

        <div className="flex items-center gap-5 font-medium">
          <a href="#solutions" className="hover:text-slate-800 transition-colors">Solutions</a>
          <a href="#capabilities" className="hover:text-slate-800 transition-colors">Capabilities</a>
          <a href="#pricing" className="hover:text-slate-800 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-slate-800 transition-colors">FAQ</a>
          <Link href="/login" className="hover:text-slate-800 transition-colors font-bold text-slate-700">Login</Link>
        </div>
      </div>
    </footer>
  );
}
