"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { api } from "../../lib/api";
import {
  Globe, Search, Share2, ShieldCheck, Code, Save, RefreshCw,
  Sparkles, ExternalLink, CheckCircle2, AlertCircle, Eye,
  BarChart3, Twitter, Check, RotateCcw, Copy
} from "lucide-react";

export default function SeoManagementTab() {
  const { showToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<"core" | "social" | "verification" | "schema">("core");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [form, setForm] = useState<any>({
    meta_title: "Jobab Chat — AI-Powered Customer Support & Multilingual Sales Automation",
    meta_description: "Transform customer support with Jobab Chat. 24/7 bilingual AI assistant in Bengali & English, live human inbox handover, bKash automated orders & isolated database architecture.",
    meta_keywords: "ai chatbot bangladesh, customer service ai, bkash chatbot, e-commerce automation, bengali ai assistant, live chat widget, enterprise support ai, jobab chat",
    canonical_url: "https://jobab.chat",
    author: "Jobab Chat Enterprise",
    robots: "index, follow",
    og_title: "Jobab Chat — Intelligent Bilingual Customer Support & Sales Automation",
    og_description: "24/7 AI chatbot for Bangladeshi businesses with direct bKash integration, live human handover, and instant website widget embed.",
    og_image_url: "https://jobab.chat/og-banner.png",
    og_type: "website",
    og_site_name: "Jobab Chat",
    og_locale: "en_US",
    twitter_card: "summary_large_image",
    twitter_title: "Jobab Chat — 24/7 AI Customer Support & Sales Automation",
    twitter_description: "Automate customer conversations in Bengali & English with isolated enterprise AI.",
    twitter_image_url: "https://jobab.chat/twitter-banner.png",
    twitter_creator: "@jobabchat",
    google_site_verification: "",
    bing_site_verification: "",
    google_analytics_id: "",
    google_tag_manager_id: "",
    facebook_pixel_id: "",
    schema_org_name: "Jobab Chat",
    schema_org_url: "https://jobab.chat",
    schema_org_logo: "https://jobab.chat/logo.png",
    schema_application_category: "BusinessApplication",
    schema_price_currency: "BDT",
    schema_price_min: 4990.0,
    schema_rating_value: 4.9,
    schema_review_count: 128
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSuperAdminSeoMetadata();
      if (data) {
        setForm((prev: any) => ({ ...prev, ...data }));
      }
    } catch (e: any) {
      console.error("Failed to load SEO metadata:", e);
      showToast("Notice", "Using default SEO metadata template.", "info");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.updateSuperAdminSeoMetadata(form);
      if (res && res.config) {
        setForm((prev: any) => ({ ...prev, ...res.config }));
      }
      showToast("SEO Metadata Saved", "Platform SEO, Open Graph tags, and Structured Data updated successfully!", "success");
    } catch (err: any) {
      showToast("Save Failed", err.message || "Failed to update SEO metadata", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Length calculation for SERP recommendations
  const titleLen = form.meta_title?.length || 0;
  const descLen = form.meta_description?.length || 0;

  // Schema generation preview
  const jsonLdPreview = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": form.schema_org_name || "Jobab Chat",
        "applicationCategory": form.schema_application_category || "BusinessApplication",
        "operatingSystem": "All Web Browsers, Cloud SaaS",
        "url": form.schema_org_url || "https://jobab.chat",
        "description": form.meta_description,
        "offers": {
          "@type": "Offer",
          "price": String(form.schema_price_min || 4990),
          "priceCurrency": form.schema_price_currency || "BDT"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": String(form.schema_rating_value || 4.9),
          "reviewCount": String(form.schema_review_count || 128)
        }
      },
      {
        "@type": "Organization",
        "name": form.schema_org_name || "Jobab Chat",
        "url": form.schema_org_url || "https://jobab.chat",
        "logo": form.schema_org_logo || "https://jobab.chat/logo.png"
      }
    ]
  }, null, 2);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Hero Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-indigo-400" />
              Search Engine & Social Metadata
            </span>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Live Indexing Active
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            SEO & Meta Data Master Control Plane
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Configure Google SERP snippet rankings, Open Graph social cards for WhatsApp & Facebook, Twitter cards, Schema.org rich results, and search engine ownership tokens.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading || isSaving}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Reload from database"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaving ? "Saving SEO Settings..." : "Save SEO Configuration"}</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab("core")}
          className={`px-4 py-2.5 font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${activeSubTab === "core"
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Core Search Metadata</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("social")}
          className={`px-4 py-2.5 font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${activeSubTab === "social"
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Social Sharing (OG & Twitter)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("verification")}
          className={`px-4 py-2.5 font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${activeSubTab === "verification"
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verification & Analytics Pixels</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("schema")}
          className={`px-4 py-2.5 font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${activeSubTab === "schema"
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Schema.org Rich Snippets</span>
        </button>
      </div>

      {/* 3. Main Grid: Form (Left) & Live Previews (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Configuration Forms (7 cols) */}
        <div className="lg:col-span-7 space-y-5">

          {/* SUB-TAB 1: Core Search Metadata */}
          {activeSubTab === "core" && (
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3.5 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Search className="w-4 h-4 text-indigo-600" />
                    Core Search Engine Metadata
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Controls primary title, meta description, and indexing rules for Google and Bing.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {/* Meta Title */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-700">Meta Title *</label>
                    <span className={`text-[10.5px] font-mono ${titleLen >= 50 && titleLen <= 65 ? "text-emerald-600 font-bold" : titleLen > 65 ? "text-amber-600" : "text-slate-400"}`}>
                      {titleLen} / 60 characters {titleLen >= 50 && titleLen <= 65 ? "✓ Optimal" : ""}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={form.meta_title || ""}
                    onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                    placeholder="e.g. Jobab Chat — AI-Powered Customer Support & Sales Automation"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs"
                  />
                  <p className="text-[10.5px] text-slate-400">
                    Recommended length: 50–60 characters. Appears as the headline link in search results.
                  </p>
                </div>

                {/* Meta Description */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-700">Meta Description *</label>
                    <span className={`text-[10.5px] font-mono ${descLen >= 140 && descLen <= 165 ? "text-emerald-600 font-bold" : descLen > 165 ? "text-amber-600" : "text-slate-400"}`}>
                      {descLen} / 160 characters {descLen >= 140 && descLen <= 165 ? "✓ Optimal" : ""}
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={form.meta_description || ""}
                    onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                    placeholder="Provide a compelling 150-160 character summary that entices users to click."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs leading-relaxed"
                  />
                </div>

                {/* Meta Keywords */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Meta Keywords (Comma-separated)</label>
                  <input
                    type="text"
                    value={form.meta_keywords || ""}
                    onChange={(e) => setForm({ ...form, meta_keywords: e.target.value })}
                    placeholder="e.g. ai chatbot bangladesh, bkash chatbot, customer service ai, jobab chat"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs"
                  />
                </div>

                {/* Grid: Canonical URL & Author */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Canonical URL</label>
                    <input
                      type="url"
                      value={form.canonical_url || ""}
                      onChange={(e) => setForm({ ...form, canonical_url: e.target.value })}
                      placeholder="https://jobab.chat"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Author / Organization Name</label>
                    <input
                      type="text"
                      value={form.author || ""}
                      onChange={(e) => setForm({ ...form, author: e.target.value })}
                      placeholder="Jobab Chat Enterprise"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs"
                    />
                  </div>
                </div>

                {/* Robots Indexing Directive */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>Robots Indexing Directive</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${form.robots === "index, follow" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                        {form.robots === "index, follow" ? "INDEXABLE (PUBLIC)" : "NOINDEX (HIDDEN)"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {form.robots === "index, follow" 
                        ? "🟢 Search engines are permitted to crawl, index, and follow all links."
                        : "🔴 Search engines are instructed to ignore this site (recommended for staging)."}
                    </p>
                  </div>
                  <select
                    value={form.robots || "index, follow"}
                    onChange={(e) => setForm({ ...form, robots: e.target.value })}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="index, follow">index, follow (Production)</option>
                    <option value="noindex, nofollow">noindex, nofollow (Private / Staging)</option>
                    <option value="noindex, follow">noindex, follow</option>
                  </select>
                </div>

              </div>
            </div>
          )}

          {/* SUB-TAB 2: Social Sharing (Open Graph & Twitter) */}
          {activeSubTab === "social" && (
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3.5">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-pink-600" />
                  Social Sharing Cards (Open Graph & Twitter)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Controls the visual preview card generated when users share links on WhatsApp, Facebook, LinkedIn, Discord, and Twitter / X.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* OG Title */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Open Graph Title (Social Headline)</label>
                  <input
                    type="text"
                    value={form.og_title || ""}
                    onChange={(e) => setForm({ ...form, og_title: e.target.value })}
                    placeholder="Headline shown in WhatsApp / Facebook preview cards"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs"
                  />
                </div>

                {/* OG Description */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Open Graph Description</label>
                  <textarea
                    rows={2}
                    value={form.og_description || ""}
                    onChange={(e) => setForm({ ...form, og_description: e.target.value })}
                    placeholder="Short engaging summary shown beneath the social banner"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs leading-relaxed"
                  />
                </div>

                {/* OG Image URL */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Social Share Image URL (1200 × 630 px recommended)</label>
                  <input
                    type="url"
                    value={form.og_image_url || ""}
                    onChange={(e) => setForm({ ...form, og_image_url: e.target.value, twitter_image_url: form.twitter_image_url || e.target.value })}
                    placeholder="https://jobab.chat/og-banner.png"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs font-mono"
                  />
                  <p className="text-[10.5px] text-slate-400">
                    High-resolution 1200x630 banner displayed in WhatsApp chat cards and Facebook feed posts.
                  </p>
                </div>

                {/* Grid: OG Site Name & OG Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">OG Site Name</label>
                    <input
                      type="text"
                      value={form.og_site_name || "Jobab Chat"}
                      onChange={(e) => setForm({ ...form, og_site_name: e.target.value })}
                      placeholder="Jobab Chat"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">OG Locale</label>
                    <input
                      type="text"
                      value={form.og_locale || "en_US"}
                      onChange={(e) => setForm({ ...form, og_locale: e.target.value })}
                      placeholder="en_US or bn_BD"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs"
                    />
                  </div>
                </div>

                {/* Twitter / X Specific Parameters */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <Twitter className="w-3.5 h-3.5 text-sky-500" />
                    Twitter / X Card Parameters
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Twitter Card Type</label>
                      <select
                        value={form.twitter_card || "summary_large_image"}
                        onChange={(e) => setForm({ ...form, twitter_card: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs"
                      >
                        <option value="summary_large_image">summary_large_image (Large Hero Card)</option>
                        <option value="summary">summary (Small Thumbnail)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Twitter Handle / Creator</label>
                      <input
                        type="text"
                        value={form.twitter_creator || "@jobabchat"}
                        onChange={(e) => setForm({ ...form, twitter_creator: e.target.value })}
                        placeholder="@jobabchat"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SUB-TAB 3: Verification & Analytics Pixels */}
          {activeSubTab === "verification" && (
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3.5">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Search Console Verification & Analytics
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Easily verify domain ownership and inject tracking codes without modifying application source code.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Google Site Verification */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Google Search Console Verification Token</span>
                    <span className="text-[10px] text-slate-400 font-mono">google-site-verification</span>
                  </label>
                  <input
                    type="text"
                    value={form.google_site_verification || ""}
                    onChange={(e) => setForm({ ...form, google_site_verification: e.target.value })}
                    placeholder="e.g. 7_AbCdEfGhIjKlMnOpQrStUvWxYz123456789"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs font-mono"
                  />
                  <p className="text-[10.5px] text-slate-400">
                    Paste the content token from Google Search Console HTML Tag verification method.
                  </p>
                </div>

                {/* Bing Webmaster Verification */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Bing Webmaster Tools Verification Token</span>
                    <span className="text-[10px] text-slate-400 font-mono">msvalidate.01</span>
                  </label>
                  <input
                    type="text"
                    value={form.bing_site_verification || ""}
                    onChange={(e) => setForm({ ...form, bing_site_verification: e.target.value })}
                    placeholder="e.g. 8A72B3C4D5E6F70123456789ABCDEF01"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs font-mono"
                  />
                </div>

                {/* Analytics Pixels Grid */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                    Web Analytics & Ad Tracking Pixels
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Google Analytics (GA4 Measurement ID)</label>
                      <input
                        type="text"
                        value={form.google_analytics_id || ""}
                        onChange={(e) => setForm({ ...form, google_analytics_id: e.target.value })}
                        placeholder="G-XXXXXXXXXX"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Meta (Facebook) Pixel ID</label>
                      <input
                        type="text"
                        value={form.facebook_pixel_id || ""}
                        onChange={(e) => setForm({ ...form, facebook_pixel_id: e.target.value })}
                        placeholder="e.g. 123456789012345"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SUB-TAB 4: Schema.org Structured Data */}
          {activeSubTab === "schema" && (
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3.5">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Code className="w-4 h-4 text-amber-500" />
                  Schema.org Structured Data (Rich Snippets)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Helps Google understand your SaaS pricing, star ratings, and organization to display rich SERP results.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Application Name</label>
                    <input
                      type="text"
                      value={form.schema_org_name || "Jobab Chat"}
                      onChange={(e) => setForm({ ...form, schema_org_name: e.target.value })}
                      placeholder="Jobab Chat"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Application Category</label>
                    <input
                      type="text"
                      value={form.schema_application_category || "BusinessApplication"}
                      onChange={(e) => setForm({ ...form, schema_application_category: e.target.value })}
                      placeholder="BusinessApplication"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Starting Price (BDT)</label>
                    <input
                      type="number"
                      value={form.schema_price_min || 4990}
                      onChange={(e) => setForm({ ...form, schema_price_min: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Aggregate Rating (out of 5.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="5.0"
                      value={form.schema_rating_value || 4.9}
                      onChange={(e) => setForm({ ...form, schema_rating_value: parseFloat(e.target.value) || 4.9 })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Generated JSON-LD Code Block */}
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <span>Generated JSON-LD Schema (Google Crawlers Output)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(jsonLdPreview);
                        showToast("Copied", "JSON-LD schema copied to clipboard!", "success");
                      }}
                      className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy JSON-LD
                    </button>
                  </div>
                  <pre className="p-3.5 bg-slate-900 text-slate-200 font-mono text-[10.5px] rounded-2xl overflow-x-auto max-h-60 border border-slate-800">
                    {jsonLdPreview}
                  </pre>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Real-Time Interactive Live Previews (5 cols) */}
        <div className="lg:col-span-5 space-y-5">

          {/* 1. Google SERP Snippet Preview */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-600" />
                Google SERP Snippet Preview
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                Google Search
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-1 font-sans">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                  J
                </div>
                <div className="text-[11px] text-slate-600 leading-none">
                  <div className="font-semibold text-slate-800">Jobab Chat</div>
                  <div className="text-[10px] text-slate-400 font-mono">https://jobab.chat</div>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-[#1a0dab] hover:underline cursor-pointer line-clamp-1 pt-0.5">
                {form.meta_title || "Jobab Chat — AI-Powered Customer Support & Sales"}
              </h4>

              <p className="text-[11px] text-[#4d5156] leading-relaxed line-clamp-2">
                {form.meta_description || "Transform customer support with Jobab Chat. 24/7 bilingual AI assistant in Bengali & English, live human inbox handover, bKash automated orders & isolated database architecture."}
              </p>

              <div className="text-[10px] text-amber-600 font-semibold pt-1 flex items-center gap-1">
                <span>★★★★★ Rating: {form.schema_rating_value || "4.9"}</span>
                <span className="text-slate-400">• {form.schema_review_count || 128} reviews</span>
                <span className="text-slate-400">• ৳{form.schema_price_min || 4990} BDT</span>
              </div>
            </div>
          </div>

          {/* 2. Facebook / WhatsApp Social Card Preview */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-pink-600" />
                WhatsApp / Facebook Preview Card
              </span>
              <span className="text-[10px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full">
                Open Graph
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shadow-xs">
              {/* Banner Image Preview */}
              <div className="h-40 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 flex items-center justify-center relative overflow-hidden">
                {form.og_image_url ? (
                  <img
                    src={form.og_image_url}
                    alt="OG Social Card Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-4">
                  <span className="text-[11px] font-black tracking-wider text-white uppercase bg-indigo-600/80 px-2 py-0.5 rounded">
                    {form.og_site_name || "Jobab Chat"}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3.5 bg-white space-y-1">
                <div className="text-[9.5px] uppercase font-bold text-slate-400 font-mono">
                  JOBAB.CHAT
                </div>
                <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                  {form.og_title || form.meta_title || "Jobab Chat — Intelligent Customer AI"}
                </h5>
                <p className="text-[10.5px] text-slate-500 line-clamp-2 leading-relaxed">
                  {form.og_description || form.meta_description}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Twitter / X Large Card Preview */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Twitter className="w-3.5 h-3.5 text-sky-500" />
                Twitter / X Summary Card
              </span>
              <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full font-mono">
                {form.twitter_card || "summary_large_image"}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">
                  𝕏
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-900 leading-none">Jobab Chat</div>
                  <div className="text-[10px] text-slate-400">{form.twitter_creator || "@jobabchat"}</div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                <div className="h-28 bg-slate-900 flex items-center justify-center relative overflow-hidden">
                  {form.twitter_image_url || form.og_image_url ? (
                    <img
                      src={form.twitter_image_url || form.og_image_url}
                      alt="Twitter Card"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : null}
                </div>
                <div className="p-2.5 space-y-0.5">
                  <div className="text-[9px] text-slate-400 font-mono">From jobab.chat</div>
                  <div className="text-xs font-bold text-slate-900 line-clamp-1">
                    {form.twitter_title || form.og_title || form.meta_title}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
