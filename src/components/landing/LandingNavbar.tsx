"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bot, ArrowRight, Menu, X } from "lucide-react";

interface LandingNavbarProps {
  onOpenPricing: (tier: string) => void;
}

export default function LandingNavbar({ onOpenPricing }: LandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8.5 w-8.5 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-indigo-600/30">
            <Bot className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-base tracking-tight leading-none">
              Jobab<span className="text-indigo-600">.chat</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide">Universal AI Platform</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
          <a href="#solutions" className="hover:text-indigo-600 transition-colors">Solutions</a>
          <a href="#capabilities" className="hover:text-indigo-600 transition-colors">Capabilities</a>
          <a href="#deployment" className="hover:text-indigo-600 transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
        </nav>

        {/* Auth & CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Sign In
          </Link>
          <button
            onClick={() => onOpenPricing("growth")}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2.5">
          <a
            href="#solutions"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold text-slate-700 hover:text-indigo-600 py-1"
          >
            Solutions
          </a>
          <a
            href="#capabilities"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold text-slate-700 hover:text-indigo-600 py-1"
          >
            Capabilities
          </a>
          <a
            href="#deployment"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold text-slate-700 hover:text-indigo-600 py-1"
          >
            How It Works
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold text-slate-700 hover:text-indigo-600 py-1"
          >
            Pricing
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold text-slate-700 hover:text-indigo-600 py-1"
          >
            FAQ
          </a>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full text-center py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
            >
              Sign In
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPricing("growth");
              }}
              className="w-full text-center py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl"
            >
              Get Started Free
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
