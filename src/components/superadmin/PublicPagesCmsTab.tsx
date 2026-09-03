"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useToast } from "../../context/ToastContext";
import { api } from "../../lib/api";
import {
  FileText, ShieldCheck, Globe, Save, RefreshCw,
  ExternalLink, RotateCcw, CheckCircle2, Eye, Edit3,
  Sparkles, Clock, AlertCircle, Check, Code, PenTool
} from "lucide-react";
import { marked } from "marked";
import TurndownService from "turndown";

// Import Quill styles
import "react-quill/dist/quill.snow.css";

// Dynamic import for ReactQuill to prevent SSR issues in Next.js
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 font-medium text-xs flex items-center justify-center gap-2">
      <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
      <span>Loading Quill WYSIWYG Editor...</span>
    </div>
  )
});

interface PageModel {
  slug: string;
  title: string;
  subtitle?: string;
  meta_title?: string;
  meta_description?: string;
  last_updated?: string;
  badge?: string;
  content: string;
}

export default function PublicPagesCmsTab() {
  const { showToast } = useToast();

  const [selectedSlug, setSelectedSlug] = useState<"about" | "privacy" | "terms">("about");
  const [allPages, setAllPages] = useState<Record<string, PageModel>>({});
  const [activeEditorMode, setActiveEditorMode] = useState<"quill" | "markdown" | "preview">("quill");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Initialize Turndown service for converting Quill HTML back to standard Markdown
  const turndownService = useMemo(() => {
    return new TurndownService({
      headingStyle: "atx",
      hr: "---",
      bulletListMarker: "-"
    });
  }, []);

  const [form, setForm] = useState<PageModel>({
    slug: "about",
    title: "",
    subtitle: "",
    meta_title: "",
    meta_description: "",
    last_updated: "September 2026",
    badge: "",
    content: ""
  });

  // Quill HTML state
  const [quillHtml, setQuillHtml] = useState<string>("");

  const loadAllPages = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSuperAdminPublicPages();
      if (data && typeof data === "object") {
        setAllPages(data);
        if (data[selectedSlug]) {
          const pg = data[selectedSlug];
          setForm(pg);
          const parsed = marked.parse(pg.content || "") as string;
          setQuillHtml(parsed);
        }
      }
    } catch (err: any) {
      console.error("Failed to load public pages for CMS:", err);
      showToast("CMS Load Error", err.message || "Could not load public pages.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllPages();
  }, []);

  // When selected slug changes, update form and Quill HTML from allPages
  useEffect(() => {
    if (allPages[selectedSlug]) {
      const pg = allPages[selectedSlug];
      setForm(pg);
      const parsed = marked.parse(pg.content || "") as string;
      setQuillHtml(parsed);
    }
  }, [selectedSlug, allPages]);

  // Handle Quill Editor Change
  const handleQuillChange = (contentHtml: string) => {
    setQuillHtml(contentHtml);
    try {
      const markdown = turndownService.turndown(contentHtml);
      setForm((prev) => ({ ...prev, content: markdown }));
    } catch (e) {
      // fallback
      setForm((prev) => ({ ...prev, content: contentHtml }));
    }
  };

  // Handle Raw Markdown Change
  const handleMarkdownChange = (rawMarkdown: string) => {
    setForm((prev) => ({ ...prev, content: rawMarkdown }));
    try {
      const parsed = marked.parse(rawMarkdown || "") as string;
      setQuillHtml(parsed);
    } catch (e) {
      setQuillHtml(rawMarkdown);
    }
  };

  const handleSavePage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.updateSuperAdminPublicPage(selectedSlug, form);
      if (res && res.page) {
        setAllPages((prev) => ({ ...prev, [selectedSlug]: res.page }));
        setForm(res.page);
        const parsed = marked.parse(res.page.content || "") as string;
        setQuillHtml(parsed);
      }
      showToast("Page Saved Successfully", `Public page '/${selectedSlug}' updated and live!`, "success");
    } catch (err: any) {
      showToast("Save Failed", err.message || "Failed to update page.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!confirm(`Are you sure you want to reset '/${selectedSlug}' to the standard default copy?`)) return;
    setIsSaving(true);
    try {
      const res = await api.getPublicPage(selectedSlug);
      if (res) {
        setForm(res);
        const parsed = marked.parse(res.content || "") as string;
        setQuillHtml(parsed);
        showToast("Reset Prepared", "Default copy loaded. Click 'Save Page Changes' to persist.", "info");
      }
    } catch (err: any) {
      showToast("Reset Error", err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Quill Toolbar Configuration
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ header: [2, 3, 4, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link"],
      ["clean"]
    ]
  }), []);

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "blockquote",
    "code-block",
    "link"
  ];

  // Render HTML for Preview
  const previewHtml = useMemo(() => {
    try {
      return marked.parse(form.content || "") as string;
    } catch {
      return form.content || "";
    }
  }, [form.content]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-indigo-400" />
              Quill WYSIWYG & Markdown CMS
            </span>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Live Routing Active
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Public Pages CMS (About, Privacy & Terms)
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Easily write and update rich company background, privacy policies, bKash compliance disclosures, and terms of service with the visual Quill editor.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
          <a
            href={`/${selectedSlug}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Open public page in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Public URL</span>
          </a>

          <button
            type="button"
            onClick={handleResetToDefault}
            disabled={isSaving}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Reload default copy"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Default</span>
          </button>

          <button
            type="button"
            onClick={() => handleSavePage()}
            disabled={isSaving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaving ? "Saving..." : "Save Page Changes"}</span>
          </button>
        </div>
      </div>

      {/* 2. Page Selector Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setSelectedSlug("about")}
          className={`px-4 py-2.5 font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${selectedSlug === "about"
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>About Us (/about)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSlug("privacy")}
          className={`px-4 py-2.5 font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${selectedSlug === "privacy"
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Privacy Policy (/privacy)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSlug("terms")}
          className={`px-4 py-2.5 font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${selectedSlug === "terms"
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Terms & Conditions (/terms)</span>
        </button>
      </div>

      {/* 3. Main Form Container */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        
        {/* Row 1: SEO Meta Tags */}
        <div className="space-y-3 border-b border-slate-100 pb-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Page SEO & Search Engine Ranking
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Public Route: https://jobab.chat/{selectedSlug}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Meta Title (Search Headline)</label>
              <input
                type="text"
                value={form.meta_title || ""}
                onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                placeholder="e.g. About Us — Jobab.chat | Enterprise AI Platform"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Meta Description (SERP Summary)</label>
              <input
                type="text"
                value={form.meta_description || ""}
                onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                placeholder="Search engine snippet summary (150-160 chars recommended)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Page Hero Header Settings */}
        <div className="space-y-3 border-b border-slate-100 pb-5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            Page Hero Header & Subtitle
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="md:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-700">Page Headline (H1 Title) *</label>
              <input
                type="text"
                value={form.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Header Pill Badge</label>
              <input
                type="text"
                value={form.badge || ""}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="e.g. ENTERPRISE AI PLATFORM"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-700">Subtitle / Tagline</label>
              <input
                type="text"
                value={form.subtitle || ""}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Last Updated Display</label>
              <input
                type="text"
                value={form.last_updated || "September 2026"}
                onChange={(e) => setForm({ ...form, last_updated: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all text-xs"
              />
            </div>
          </div>
        </div>

        {/* Row 3: Quill WYSIWYG & Markdown Content Editor */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                Page Content Editor
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Format your content seamlessly with the visual Quill editor or switch to raw Markdown mode.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto text-xs">
              <button
                type="button"
                onClick={() => setActiveEditorMode("quill")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeEditorMode === "quill"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <PenTool className="w-3 h-3" />
                <span>Quill Visual Editor</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveEditorMode("markdown")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeEditorMode === "markdown"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Code className="w-3 h-3" />
                <span>Raw Markdown</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveEditorMode("preview")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeEditorMode === "preview"
                  ? "bg-white text-emerald-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Live Public Preview</span>
              </button>
            </div>
          </div>

          {/* 1. Quill Rich WYSIWYG Mode */}
          {activeEditorMode === "quill" && (
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs">
              <ReactQuill
                theme="snow"
                value={quillHtml}
                onChange={handleQuillChange}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Type or format your page content here..."
                className="bg-white min-h-[380px] text-slate-800"
              />
            </div>
          )}

          {/* 2. Raw Markdown Code Mode */}
          {activeEditorMode === "markdown" && (
            <div className="space-y-1.5">
              <textarea
                rows={18}
                value={form.content || ""}
                onChange={(e) => handleMarkdownChange(e.target.value)}
                placeholder="Write raw markdown here (## Headings, - bullet items, **bold**)..."
                className="w-full p-4 bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed rounded-2xl border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[10.5px] text-slate-400">
                Any changes made here in Markdown will automatically synchronize to the Quill visual editor.
              </p>
            </div>
          )}

          {/* 3. Live Public Preview Mode */}
          {activeEditorMode === "preview" && (
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 max-h-[500px] overflow-y-auto">
              <div
                className="prose prose-slate max-w-none prose-headings:font-black prose-h2:text-xl prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-2 prose-h3:text-base prose-h3:font-bold prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 text-xs sm:text-sm"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
