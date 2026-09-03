"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot, ShieldCheck, ArrowLeft, ArrowRight, Clock,
  CheckCircle2, FileText, Lock, Globe, Mail, HelpCircle,
  ExternalLink, Sparkles, Building2, ChevronRight
} from "lucide-react";
import { api } from "../../lib/api";
import PricingModal from "../auth/PricingModal";

interface PublicPageData {
  slug: string;
  title: string;
  subtitle?: string;
  meta_title?: string;
  meta_description?: string;
  last_updated?: string;
  badge?: string;
  content: string;
}

interface PublicPageShellProps {
  initialSlug: string;
  fallbackData: PublicPageData;
}

export default function PublicPageShell({ initialSlug, fallbackData }: PublicPageShellProps) {
  const pathname = usePathname();
  const [pageData, setPageData] = useState<PublicPageData>(fallbackData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api.getPublicPage(initialSlug)
      .then((data) => {
        if (isMounted && data) {
          setPageData(data);
        }
      })
      .catch((err) => {
        console.warn(`Could not fetch dynamic page content for ${initialSlug}, using fallback:`, err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialSlug]);

  // Inject Meta Data into Document Head
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (pageData.meta_title) {
        document.title = pageData.meta_title;
      }
      if (pageData.meta_description) {
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
          metaDesc = document.createElement("meta");
          metaDesc.setAttribute("name", "description");
          document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute("content", pageData.meta_description);
      }
    }
  }, [pageData]);

  // Extract headings from markdown content for Table of Contents
  const extractHeadings = (text: string) => {
    const lines = text.split("\n");
    const headings: { id: string; title: string }[] = [];
    lines.forEach((line) => {
      const match = line.match(/^##\s+(.+)$/);
      if (match) {
        const title = match[1].trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        headings.push({ id, title });
      }
    });
    return headings;
  };

  const headings = extractHeadings(pageData.content || "");

  // Simple Markdown Parser for beautiful typography
  const renderMarkdown = (text: string) => {
    const sections = text.split("\n\n");
    return sections.map((section, idx) => {
      const trimmed = section.trim();

      // Heading 2
      if (trimmed.startsWith("## ")) {
        const title = trimmed.replace(/^##\s+/, "");
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        return (
          <h2
            key={idx}
            id={id}
            className="text-lg sm:text-xl font-black text-slate-900 mt-8 mb-3 scroll-mt-24 flex items-center gap-2 border-b border-slate-100 pb-2"
          >
            <span className="w-1.5 h-5 bg-indigo-600 rounded-full inline-block" />
            <span>{title}</span>
          </h2>
        );
      }

      // Heading 3
      if (trimmed.startsWith("### ")) {
        const title = trimmed.replace(/^###\s+/, "");
        return (
          <h3 key={idx} className="text-base font-extrabold text-slate-900 mt-6 mb-2">
            {title}
          </h3>
        );
      }

      // Divider
      if (trimmed === "---") {
        return <hr key={idx} className="my-6 border-slate-200" />;
      }

      // Bullet Lists
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const items = trimmed.split("\n").map((line) => line.replace(/^[-*]\s+/, ""));
        return (
          <ul key={idx} className="my-3 space-y-2 text-slate-600 leading-relaxed text-xs sm:text-sm pl-4">
            {items.map((item, itemIdx) => (
              <li key={itemIdx} className="list-disc list-outside">
                {formatInlineMarkdown(item)}
              </li>
            ))}
          </ul>
        );
      }

      // Numbered Lists
      if (/^\d+\.\s+/.test(trimmed)) {
        const items = trimmed.split("\n").map((line) => line.replace(/^\d+\.\s+/, ""));
        return (
          <ol key={idx} className="my-3 space-y-2 text-slate-600 leading-relaxed text-xs sm:text-sm pl-4 list-decimal list-outside">
            {items.map((item, itemIdx) => (
              <li key={itemIdx}>
                {formatInlineMarkdown(item)}
              </li>
            ))}
          </ol>
        );
      }

      // Standard Paragraph
      return (
        <p key={idx} className="my-3 text-slate-600 leading-relaxed text-xs sm:text-sm">
          {formatInlineMarkdown(trimmed)}
        </p>
      );
    });
  };

  // Helper for bold text and code snippets
  const formatInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-extrabold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="px-1.5 py-0.5 bg-slate-100 text-indigo-700 font-mono text-[11px] rounded border border-slate-200">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* 1. Glassmorphic Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight leading-tight">
                Jobab<span className="text-indigo-600">.chat</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">Enterprise AI Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
            <Link href="/" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <Link href="/about" className={`hover:text-indigo-600 transition-colors ${initialSlug === "about" ? "text-indigo-600 font-extrabold" : ""}`}>
              About Us
            </Link>
            <Link href="/privacy" className={`hover:text-indigo-600 transition-colors ${initialSlug === "privacy" ? "text-indigo-600 font-extrabold" : ""}`}>
              Privacy Policy
            </Link>
            <Link href="/terms" className={`hover:text-indigo-600 transition-colors ${initialSlug === "terms" ? "text-indigo-600 font-extrabold" : ""}`}>
              Terms of Service
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link>
            <button
              onClick={() => setIsPricingOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. Hero Header Banner */}
      <section className="bg-gradient-to-b from-white via-indigo-50/20 to-slate-50 border-b border-slate-200/80 pt-12 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-4 text-center sm:text-left">
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              {pageData.badge || "OFFICIAL DOCUMENT"}
            </span>
            {pageData.last_updated && (
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                <Clock className="w-3 h-3 text-slate-400" />
                Last Updated: <strong className="text-slate-700 font-semibold">{pageData.last_updated}</strong>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {pageData.title}
          </h1>

          {pageData.subtitle && (
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              {pageData.subtitle}
            </p>
          )}

        </div>
      </section>

      {/* 3. Main Content Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar: Quick Navigation & Trust Badges (4 cols) */}
          <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            
            {/* Quick Links Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Company & Legal Documents
              </h3>
              <nav className="space-y-1 text-xs">
                <Link
                  href="/about"
                  className={`flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all ${initialSlug === "about"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <span>About Jobab.chat</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/privacy"
                  className={`flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all ${initialSlug === "privacy"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <span>Privacy Policy</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/terms"
                  className={`flex items-center justify-between px-3 py-2 rounded-xl font-bold transition-all ${initialSlug === "terms"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <span>Terms of Service</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </nav>
            </div>

            {/* Table of Contents (if page has headings) */}
            {headings.length > 0 && (
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  On This Page
                </h3>
                <nav className="space-y-1.5 text-xs text-slate-600 max-h-72 overflow-y-auto pr-1">
                  {headings.map((h, i) => (
                    <a
                      key={i}
                      href={`#${h.id}`}
                      className="block hover:text-indigo-600 hover:translate-x-0.5 transition-all line-clamp-1 py-0.5"
                    >
                      • {h.title}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Enterprise Trust Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-3xl shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-extrabold">Enterprise Integrity</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Multi-tenant isolated databases, bank-grade encryption, and zero cross-tenant LLM training.
              </p>
              <div className="pt-1 text-[10px] text-indigo-300 font-mono">
                bKash & EPS Automated Compliance
              </div>
            </div>

          </aside>

          {/* Right Main Content Card (8 cols) */}
          <article className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
            <div className="prose prose-slate max-w-none">
              {renderMarkdown(pageData.content || "")}
            </div>

            {/* Support / Helpdesk Box */}
            <div className="mt-12 pt-6 border-t border-slate-100 bg-slate-50 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  Have Questions or Feedback?
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Our legal and compliance team is available to assist you.
                </p>
              </div>
              <a
                href="mailto:support@jobab.chat"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>support@jobab.chat</span>
              </a>
            </div>
          </article>

        </div>
      </main>

      {/* 4. Rich Multi-Column Legal & Platform Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Col 1: Brand */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-slate-900 text-base">Jobab.chat</span>
              </div>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Autonomous conversational AI and live support desk infrastructure engineered for high-growth Bangladeshi commerce brands and enterprise helplines.
              </p>
              <div className="text-[11px] text-slate-400">
                Official bKash Merchant & EPS Gateway Tokenized Integrations.
              </div>
            </div>

            {/* Col 2: Platform Links */}
            <div className="space-y-2">
              <div className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">Platform</div>
              <ul className="space-y-1.5 font-medium">
                <li><Link href="/#solutions" className="hover:text-indigo-600 transition-colors">Industry Solutions</Link></li>
                <li><Link href="/#capabilities" className="hover:text-indigo-600 transition-colors">AI Capabilities</Link></li>
                <li><Link href="/#pricing" className="hover:text-indigo-600 transition-colors">Pricing & Plans</Link></li>
                <li><Link href="/#faq" className="hover:text-indigo-600 transition-colors">FAQ Desk</Link></li>
              </ul>
            </div>

            {/* Col 3: Company & Legal */}
            <div className="space-y-2">
              <div className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">Company & Legal</div>
              <ul className="space-y-1.5 font-medium">
                <li><Link href="/about" className="hover:text-indigo-600 transition-colors">About Us</Link></li>
                <li><Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
                <li><Link href="/login" className="hover:text-indigo-600 transition-colors">Sign In to Workspace</Link></li>
              </ul>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <div>
              &copy; {new Date().getFullYear()} Jobab.chat. All rights reserved. Dhaka, Bangladesh.
            </div>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-slate-800">Privacy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-slate-800">Terms</Link>
              <span>•</span>
              <Link href="/about" className="hover:text-slate-800">About</Link>
            </div>
          </div>

        </div>
      </footer>

      {/* Pricing Modal */}
      {isPricingOpen && (
        <PricingModal
          isOpen={isPricingOpen}
          onClose={() => setIsPricingOpen(false)}
          initialSelectedTier="growth"
        />
      )}

    </div>
  );
}
