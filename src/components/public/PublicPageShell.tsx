"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot, ShieldCheck, ArrowLeft, ArrowRight, Clock,
  CheckCircle2, FileText, Lock, Globe, Mail, HelpCircle,
  ExternalLink, Sparkles, Building2, ChevronRight, Search,
  Printer, Copy, Check, Shield, Database, Cpu, CreditCard,
  Scale, UserCheck, AlertTriangle, Layers, Zap, Server, Key,
  Award, ChevronDown
} from "lucide-react";
import { marked } from "marked";
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

interface ParsedSection {
  id: string;
  rawTitle: string;
  number?: string;
  title: string;
  contentHtml: string;
  rawText: string;
  iconType: "shield" | "database" | "payment" | "legal" | "user" | "server" | "default";
}

export default function PublicPageShell({ initialSlug, fallbackData }: PublicPageShellProps) {
  const pathname = usePathname();
  const [pageData, setPageData] = useState<PublicPageData>(fallbackData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

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

  // Parse markdown into rich structured section widgets
  const parsedSections = useMemo(() => {
    const text = pageData.content || "";
    const rawParts = text.split(/(?=^##\s+)/m);
    const sections: ParsedSection[] = [];

    rawParts.forEach((part, index) => {
      const trimmed = part.trim();
      if (!trimmed) return;

      const firstLineEnd = trimmed.indexOf("\n");
      const headerLine = firstLineEnd === -1 ? trimmed : trimmed.substring(0, firstLineEnd);
      const bodyText = firstLineEnd === -1 ? "" : trimmed.substring(firstLineEnd).trim();

      const titleMatch = headerLine.match(/^##\s+(.+)$/);
      const rawTitle = titleMatch ? titleMatch[1].replace(/\*\*/g, "").trim() : `Section ${index + 1}`;
      
      const numMatch = rawTitle.match(/^(\d+[\.\)]?)\s*(.+)$/);
      const number = numMatch ? numMatch[1] : undefined;
      const cleanTitle = numMatch ? numMatch[2] : rawTitle;

      const id = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const lower = cleanTitle.toLowerCase();
      let iconType: ParsedSection["iconType"] = "default";
      if (lower.includes("security") || lower.includes("protect") || lower.includes("confidentiality")) {
        iconType = "shield";
      } else if (lower.includes("collect") || lower.includes("data") || lower.includes("retention") || lower.includes("architecture")) {
        iconType = "database";
      } else if (lower.includes("billing") || lower.includes("bkash") || lower.includes("payment") || lower.includes("subscription") || lower.includes("refund")) {
        iconType = "payment";
      } else if (lower.includes("terms") || lower.includes("agreement") || lower.includes("liability") || lower.includes("governing")) {
        iconType = "legal";
      } else if (lower.includes("account") || lower.includes("user") || lower.includes("who we are")) {
        iconType = "user";
      } else if (lower.includes("uptime") || lower.includes("sla") || lower.includes("infrastructure")) {
        iconType = "server";
      }

      let contentHtml = "";
      try {
        contentHtml = marked.parse(bodyText) as string;
      } catch {
        contentHtml = bodyText;
      }

      sections.push({
        id,
        rawTitle,
        number,
        title: cleanTitle,
        contentHtml,
        rawText: bodyText,
        iconType
      });
    });

    return sections;
  }, [pageData.content]);

  // Filter sections by live search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return parsedSections;
    const q = searchQuery.toLowerCase();
    return parsedSections.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.rawText.toLowerCase().includes(q)
    );
  }, [parsedSections, searchQuery]);

  const handleCopyPageUrl = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getSectionIcon = (iconType: ParsedSection["iconType"]) => {
    switch (iconType) {
      case "shield":
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case "database":
        return <Database className="w-5 h-5 text-indigo-600" />;
      case "payment":
        return <CreditCard className="w-5 h-5 text-pink-600" />;
      case "legal":
        return <Scale className="w-5 h-5 text-amber-600" />;
      case "user":
        return <UserCheck className="w-5 h-5 text-sky-600" />;
      case "server":
        return <Server className="w-5 h-5 text-purple-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-600" />;
    }
  };

  const getSectionIconBg = (iconType: ParsedSection["iconType"]) => {
    switch (iconType) {
      case "shield":
        return "bg-emerald-50 border-emerald-100";
      case "database":
        return "bg-indigo-50 border-indigo-100";
      case "payment":
        return "bg-pink-50 border-pink-100";
      case "legal":
        return "bg-amber-50 border-amber-100";
      case "user":
        return "bg-sky-50 border-sky-100";
      case "server":
        return "bg-purple-50 border-purple-100";
      default:
        return "bg-indigo-50 border-indigo-100";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* 1. Header Navigation Bar (Matches Landing Page Theme) */}
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
              <span className="text-[11px] text-slate-500 font-medium tracking-wide">Enterprise Legal & Trust Center</span>
            </div>
          </Link>

          {/* Center Tabs: Document Switcher */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600">
            <Link
              href="/"
              className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-white/60 transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <Link
              href="/about"
              className={`px-3.5 py-1.5 rounded-xl transition-all ${initialSlug === "about"
                ? "bg-white text-indigo-600 shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              About Us
            </Link>
            <Link
              href="/privacy"
              className={`px-3.5 py-1.5 rounded-xl transition-all ${initialSlug === "privacy"
                ? "bg-white text-indigo-600 shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className={`px-3.5 py-1.5 rounded-xl transition-all ${initialSlug === "terms"
                ? "bg-white text-indigo-600 shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              Terms of Service
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors hidden sm:inline-block"
            >
              Sign In
            </Link>
            <button
              onClick={() => setIsPricingOpen(true)}
              className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-102 active:scale-98"
            >
              <span>Explore Plans</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. Hero Section: Matches Landing Page Gradient (from-indigo-50/60 via-white to-slate-50) */}
      <section className="relative pt-10 pb-12 sm:pt-14 sm:pb-16 bg-gradient-to-b from-indigo-50/60 via-white to-slate-50 border-b border-slate-200/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center sm:text-left">
          
          {/* Badge & Timestamp Row */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-2xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              {pageData.badge || "ENTERPRISE TRUST SPECIFICATION"}
            </span>

            {pageData.last_updated && (
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                <Clock className="w-3 h-3 text-slate-400" />
                Version Published: <strong className="text-slate-700 font-semibold">{pageData.last_updated}</strong>
              </span>
            )}

            <span className="text-[10px] text-slate-400 hidden sm:inline-block font-medium">
              • Bangladesh ICT Act 2006 & International Enterprise Standards
            </span>
          </div>

          {/* Main Title & Subtitle */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              {pageData.title}
            </h1>
            {pageData.subtitle && (
              <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed font-medium">
                {pageData.subtitle}
              </p>
            )}
          </div>

          {/* 4 Trust & Security Guarantee Widgets (Hero Grid) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            
            {/* Widget 1 */}
            <div className="bg-white border border-slate-200/90 hover:border-indigo-300 p-4 sm:p-5 rounded-2xl shadow-xs space-y-1.5 transition-all group">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-extrabold text-slate-900">Zero Training</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Customer conversations are never used to train global public AI models.
              </p>
            </div>

            {/* Widget 2 */}
            <div className="bg-white border border-slate-200/90 hover:border-indigo-300 p-4 sm:p-5 rounded-2xl shadow-xs space-y-1.5 transition-all group">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 group-hover:scale-110 transition-transform">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="text-xs font-extrabold text-slate-900">TLS 1.3 & AES-256</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Bank-grade encryption in transit and at rest across all PostgreSQL databases.
              </p>
            </div>

            {/* Widget 3 */}
            <div className="bg-white border border-slate-200/90 hover:border-indigo-300 p-4 sm:p-5 rounded-2xl shadow-xs space-y-1.5 transition-all group">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-pink-50 text-pink-600 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-xs font-extrabold text-slate-900">bKash & EPS Secure</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Tokenized billing. Zero credit card or bKash PIN numbers stored on our servers.
              </p>
            </div>

            {/* Widget 4 */}
            <div className="bg-white border border-slate-200/90 hover:border-indigo-300 p-4 sm:p-5 rounded-2xl shadow-xs space-y-1.5 transition-all group">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
                  <Server className="w-4 h-4" />
                </div>
                <span className="text-xs font-extrabold text-slate-900">99.9% Uptime SLA</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Automated cloud failovers and high-availability enterprise clusters.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 3. In-Page Interactive Search & Utility Bar (Light Theme) */}
      <div className="sticky top-18 sm:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          
          {/* Live Section Search Input */}
          <div className="relative w-full sm:w-88">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clauses, bKash, SLA, encryption, refund..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-indigo-500 text-xs transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-[10px] text-slate-500 hover:text-slate-800 absolute right-2.5 top-1/2 -translate-y-1/2 bg-slate-200/70 px-1.5 py-0.5 rounded cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto text-slate-500">
            <span className="text-[11px] text-slate-400 hidden md:inline font-medium">
              Showing {filteredSections.length} of {parsedSections.length} sections
            </span>

            <button
              type="button"
              onClick={handleCopyPageUrl}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer text-xs"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLink ? "Link Copied!" : "Share Link"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") window.print();
              }}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer text-xs"
            >
              <Printer className="w-3 h-3" />
              <span className="hidden sm:inline">Print Document</span>
            </button>
          </div>

        </div>
      </div>

      {/* 4. Main Body: Left Quick Jump Table of Contents & Right Section Widgets */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sticky Navigation (4 cols) */}
          <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-38">
            
            {/* Quick Document Navigation */}
            <div className="bg-white border border-slate-200/90 p-5 rounded-3xl shadow-xs space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Legal & Company Center
              </h3>
              <nav className="space-y-1 text-xs">
                <Link
                  href="/about"
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all ${initialSlug === "about"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-indigo-600" />
                    <span>About Jobab.chat</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </Link>

                <Link
                  href="/privacy"
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all ${initialSlug === "privacy"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Privacy Policy</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </Link>

                <Link
                  href="/terms"
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all ${initialSlug === "terms"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Scale className="w-3.5 h-3.5 text-amber-600" />
                    <span>Terms of Service</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
              </nav>
            </div>

            {/* In-Page Sections Table of Contents */}
            {parsedSections.length > 0 && (
              <div className="bg-white border border-slate-200/90 p-5 rounded-3xl shadow-xs space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  Table of Contents
                </h3>
                <nav className="space-y-1.5 text-xs text-slate-600 max-h-72 overflow-y-auto pr-1 font-medium">
                  {parsedSections.map((s, idx) => (
                    <a
                      key={idx}
                      href={`#${s.id}`}
                      className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-all line-clamp-1"
                    >
                      <span className="text-[10px] font-mono text-indigo-600 font-bold">
                        {s.number || String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="truncate">{s.title}</span>
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Direct Compliance Helpline Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-3xl shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-indigo-500/30 flex items-center justify-center text-indigo-300 font-black">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">Compliance Helpline</h4>
                  <p className="text-[10px] text-slate-300">Direct response within 4 hours</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                For custom business agreements, GDPR data export, or audit reports, contact our compliance office:
              </p>
              <a
                href="mailto:privacy@jobab.chat"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>privacy@jobab.chat</span>
              </a>
            </div>

          </aside>

          {/* Right Main Article: Light Theme Customized Section Cards (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {filteredSections.length === 0 ? (
              <div className="bg-white border border-slate-200 p-10 rounded-3xl text-center space-y-3 shadow-xs">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900">No Matching Sections Found</h3>
                <p className="text-xs text-slate-500">
                  No clauses match "{searchQuery}". Try searching for another term like "bKash", "SLA", or "data".
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 bg-slate-100 text-xs font-bold text-slate-700 hover:text-slate-900 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  Reset Search
                </button>
              </div>
            ) : (
              filteredSections.map((section, idx) => (
                <article
                  key={section.id}
                  id={section.id}
                  className="bg-white border border-slate-200/90 hover:border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5 transition-all scroll-mt-38"
                >
                  {/* Section Card Header Widget */}
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border shadow-2xs shrink-0 ${getSectionIconBg(section.iconType)}`}>
                        {getSectionIcon(section.iconType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          {section.number && (
                            <span className="text-[10px] font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/80">
                              CLAUSE {section.number.replace(/\./g, "")}
                            </span>
                          )}
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            JOBAB.CHAT OFFICIAL POLICY
                          </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
                          {section.title}
                        </h2>
                      </div>
                    </div>

                    <a
                      href={`#${section.id}`}
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors shrink-0"
                      title="Link to section"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Section Content with Light Theme Typography */}
                  <div
                    className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-xs sm:prose-p:text-sm prose-li:text-slate-600 prose-li:text-xs sm:prose-li:text-sm prose-strong:text-slate-900 prose-strong:font-bold prose-hr:border-slate-100 prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: section.contentHtml }}
                  />

                  {/* Specialized Interactive Callout for bKash & EPS Sections */}
                  {section.iconType === "payment" && (
                    <div className="p-4 rounded-2xl bg-pink-50/80 border border-pink-200/80 flex items-start gap-3 text-xs">
                      <div className="p-2 rounded-xl bg-pink-100 text-pink-600 shrink-0 mt-0.5">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-extrabold text-pink-900">Financial Data Protection Assurance</div>
                        <p className="text-[11px] text-pink-800/90 leading-relaxed">
                          Jobab.chat utilizes tokenized direct APIs via bKash Merchant and EPS Gateway. Customer PINs and full debit/credit card numbers are processed exclusively inside certified payment gateway infrastructure and are never visible to or stored by Jobab.chat.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Specialized Interactive Callout for Security & Isolation Sections */}
                  {section.iconType === "shield" && (
                    <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-3 text-xs">
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 shrink-0 mt-0.5">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-extrabold text-emerald-900">Absolute Tenant Boundary Protection</div>
                        <p className="text-[11px] text-emerald-800/90 leading-relaxed">
                          Your enterprise data, vector embeddings, and support conversation logs are isolated in separate logical schemas with tenant ID constraints. No other organization can access or search your data.
                        </p>
                      </div>
                    </div>
                  )}
                </article>
              ))
            )}

            {/* Bottom Support Desk Card (Light Theme) */}
            <div className="bg-white border border-slate-200/90 p-8 rounded-3xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center justify-center sm:justify-start gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  Jobab.chat Corporate Operations
                </h3>
                <p className="text-xs text-slate-500">
                  Dhaka, Bangladesh • Official Support Hotline: support@jobab.chat
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <a
                  href="mailto:support@jobab.chat"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-102 active:scale-98"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact Operations</span>
                </a>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* 5. Enterprise Multi-Column Footer (Matches Landing Page Footer Exactly) */}
      <footer className="bg-white border-t border-slate-200/80 py-10 text-xs text-slate-500 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Col 1: Brand */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-600/20">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-slate-900 text-base">Jobab.chat</span>
              </div>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed font-medium">
                Autonomous conversational AI and live support desk infrastructure engineered for high-growth Bangladeshi commerce brands and enterprise helplines.
              </p>
              <div className="text-[11px] text-slate-400">
                Official bKash Merchant & EPS Gateway Tokenized Integrations.
              </div>
            </div>

            {/* Col 2: Platform Links */}
            <div className="space-y-2">
              <div className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">Platform</div>
              <ul className="space-y-2 font-medium">
                <li><Link href="/#solutions" className="text-slate-600 hover:text-indigo-600 transition-colors">Industry Solutions</Link></li>
                <li><Link href="/#capabilities" className="text-slate-600 hover:text-indigo-600 transition-colors">AI Capabilities</Link></li>
                <li><Link href="/#pricing" className="text-slate-600 hover:text-indigo-600 transition-colors">Pricing & Plans</Link></li>
                <li><Link href="/#faq" className="text-slate-600 hover:text-indigo-600 transition-colors">FAQ Desk</Link></li>
              </ul>
            </div>

            {/* Col 3: Company & Legal */}
            <div className="space-y-2">
              <div className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">Company & Legal</div>
              <ul className="space-y-2 font-medium">
                <li><Link href="/about" className="text-slate-600 hover:text-indigo-600 transition-colors">About Us</Link></li>
                <li><Link href="/privacy" className="text-slate-600 hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-slate-600 hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
                <li><Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">Sign In to Workspace</Link></li>
              </ul>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <div>
              &copy; {new Date().getFullYear()} Jobab.chat. All rights reserved. Dhaka, Bangladesh.
            </div>
            <div className="flex items-center gap-4 font-medium text-slate-500">
              <Link href="/privacy" className="hover:text-indigo-600">Privacy Policy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-indigo-600">Terms of Service</Link>
              <span>•</span>
              <Link href="/about" className="hover:text-indigo-600">About Us</Link>
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
