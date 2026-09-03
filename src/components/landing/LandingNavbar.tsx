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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <Bot className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-lg tracking-tight leading-tight">
              Jobab<span className="text-indigo-600">.chat</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium tracking-wide">Universal AI Platform</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
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
            className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Sign In
          </Link>
          <button
            onClick={() => onOpenPricing("growth")}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2 hover:scale-102 active:scale-98"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2.5 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 shadow-lg">
          <a
            href="#solutions"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-700 hover:text-indigo-600 py-1.5"
          >
            Solutions
          </a>
          <a
            href="#capabilities"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-700 hover:text-indigo-600 py-1.5"
          >
            Capabilities
          </a>
          <a
            href="#deployment"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-700 hover:text-indigo-600 py-1.5"
          >
            How It Works
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-700 hover:text-indigo-600 py-1.5"
          >
            Pricing
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-700 hover:text-indigo-600 py-1.5"
          >
            FAQ
          </a>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full text-center py-2.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
            >
              Sign In
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPricing("growth");
              }}
              className="w-full text-center py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-xl shadow-xs"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
