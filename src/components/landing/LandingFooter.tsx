"use client";

import React from "react";
import Link from "next/link";
import { Bot } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="bg-white border-t border-slate-200/80 py-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-slate-800 text-sm">Jobab.chat</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 font-medium">Enterprise Multilingual Conversational AI</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 font-semibold text-slate-600">
            <a href="#solutions" className="hover:text-indigo-600 transition-colors">Solutions</a>
            <a href="#capabilities" className="hover:text-indigo-600 transition-colors">Capabilities</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <Link href="/about" className="hover:text-indigo-600 transition-colors">About Us</Link>
            <Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link>
            <Link href="/login" className="hover:text-indigo-600 transition-colors text-indigo-600 font-bold">Login</Link>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} Jobab.chat. All rights reserved. Dhaka, Bangladesh.
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span>TLS 1.3 Bank-Grade Encryption</span>
            <span>•</span>
            <span>bKash & EPS Tokenized Gateway</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
