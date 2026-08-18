"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { useTheme, ThemeConfig, DEFAULT_THEME_PRESETS } from "../../context/ThemeContext";
import {
  Sparkles, Check, RefreshCw, Palette, Save,
  Eye, CheckCircle2, RotateCcw, ShieldCheck,
  Layers, MessageSquare, CreditCard, ArrowRight, Sun, Moon,
  Globe, Image as ImageIcon, Type, Mail, Link as LinkIcon
} from "lucide-react";

export default function ThemeManagementTab() {
  const { currentTheme, presets, applyTheme, saveTheme } = useTheme();
  const { showToast } = useToast();

  const [activePresetId, setActivePresetId] = useState<string>(currentTheme.preset_id || "ocean_sapphire");
  const [themeForm, setThemeForm] = useState<ThemeConfig>({ ...currentTheme });
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Sync state when currentTheme updates from context
  useEffect(() => {
    if (currentTheme) {
      setThemeForm({ ...currentTheme });
      setActivePresetId(currentTheme.preset_id);
    }
  }, [currentTheme]);

  const handleSelectPreset = (preset: ThemeConfig) => {
    setActivePresetId(preset.preset_id);
    const updated = {
      ...preset,
      platform_name: themeForm.platform_name || preset.platform_name,
      platform_tagline: themeForm.platform_tagline || preset.platform_tagline,
      logo_url: themeForm.logo_url || preset.logo_url,
      favicon_url: themeForm.favicon_url || preset.favicon_url,
      widget_avatar_url: themeForm.widget_avatar_url || preset.widget_avatar_url,
      footer_text: themeForm.footer_text || preset.footer_text,
      support_email: themeForm.support_email || preset.support_email
    };
    setThemeForm(updated);
    // Instant Live preview
    applyTheme(updated);
    showToast("Theme Preview Active", `Switched to "${preset.name}". Click "Save to Platform" to make it permanent.`, "info");
  };

  const handleInputChange = (field: keyof ThemeConfig, val: string) => {
    const updated = {
      ...themeForm,
      [field]: val
    };
    setThemeForm(updated);
    // Apply live
    applyTheme(updated);
  };

  const handleColorChange = (key: keyof ThemeConfig, val: string) => {
    const updated = {
      ...themeForm,
      [key]: val,
      preset_id: "custom",
      name: "Custom Platform Theme"
    };
    setActivePresetId("custom");
    setThemeForm(updated);
    // Live preview
    applyTheme(updated);
  };

  const handleSaveToPlatform = async () => {
    setIsSaving(true);
    try {
      const ok = await saveTheme(themeForm);
      if (ok) {
        showToast(
          "Branding Saved & Deployed",
          `Platform "${themeForm.platform_name || 'Enterprise AIaaS'}" & colors saved to PostgreSQL database!`,
          "success"
        );
      } else {
        showToast("Save Error", "Could not save branding to database. Please check connection.", "error");
      }
    } catch (e: any) {
      showToast("Error", e.message || "Failed to save theme.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefault = () => {
    const defaultTheme = DEFAULT_THEME_PRESETS[0];
    setActivePresetId(defaultTheme.preset_id);
    setThemeForm({ ...defaultTheme });
    applyTheme(defaultTheme);
    showToast("Reset to Default", "Reset back to Ocean Sapphire default.", "info");
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      
      {/* Top Banner & Quick Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-blue-600/20 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-amber-400 text-xs font-bold border border-slate-700">
            <Palette className="w-3.5 h-3.5" />
            <span>Platform White-Label & Global Brand Control</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white">
            Dynamic Branding & Color Setup
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Configure the platform name, logo, browser favicon, and color palette. All changes persist in PostgreSQL and immediately re-brand the Landing Page, Login Screen, and Client Dashboards.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleResetDefault}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Default
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveToPlatform}
            className="flex-1 sm:flex-initial px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save to Platform</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PLATFORM WHITE-LABEL IDENTITY (Name, Tagline, Logo, Favicon) */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Platform Identity & White-Label Details</h3>
              <p className="text-xs text-slate-500">Set the custom brand name, tagline, logo image URL, and browser favicon</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
            Live PostgreSQL Sync
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Platform Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Platform Brand Name *</label>
            <input
              type="text"
              value={themeForm.platform_name || ""}
              onChange={(e) => handleInputChange("platform_name", e.target.value)}
              placeholder="e.g. Padma AI, LazyChat Enterprise, Enterprise AIaaS"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
            <span className="text-[10px] text-slate-400">Displayed on the navbar, login screen, and page titles</span>
          </div>

          {/* Platform Tagline */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Platform Tagline / Subtitle</label>
            <input
              type="text"
              value={themeForm.platform_tagline || ""}
              onChange={(e) => handleInputChange("platform_tagline", e.target.value)}
              placeholder="e.g. Autonomous Customer Communication & Sales Cloud"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
            <span className="text-[10px] text-slate-400">Displayed below the logo and in browser tab meta descriptions</span>
          </div>

          {/* Main Logo Image URL */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Main Brand Logo Image URL</span>
              <span className="text-[10px] text-slate-400 font-normal">Optional (PNG / SVG / WebP)</span>
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="url"
                value={themeForm.logo_url || ""}
                onChange={(e) => handleInputChange("logo_url", e.target.value)}
                placeholder="https://example.com/logo.png"
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
              {themeForm.logo_url && (
                <div className="h-10 w-10 rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  <img src={themeForm.logo_url} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-400">If left blank, the modern dynamic icon avatar will be displayed</span>
          </div>

          {/* Browser Favicon URL */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Browser Tab Favicon URL</span>
              <span className="text-[10px] text-slate-400 font-normal">(.ico, .png, .svg)</span>
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="url"
                value={themeForm.favicon_url || ""}
                onChange={(e) => handleInputChange("favicon_url", e.target.value)}
                placeholder="https://example.com/favicon.ico"
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
              {themeForm.favicon_url && (
                <div className="h-10 w-10 rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  <img src={themeForm.favicon_url} alt="Favicon Preview" className="max-h-6 max-w-6 object-contain" />
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-400">Instantly changes the favicon icon in the visitor's browser tab</span>
          </div>

          {/* Public Support Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Platform Support Email</label>
            <input
              type="email"
              value={themeForm.support_email || ""}
              onChange={(e) => handleInputChange("support_email", e.target.value)}
              placeholder="support@yourdomain.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>

          {/* Footer Copyright Text */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Footer Copyright Text</label>
            <input
              type="text"
              value={themeForm.footer_text || ""}
              onChange={(e) => handleInputChange("footer_text", e.target.value)}
              placeholder="© 2026 Enterprise AIaaS Platform • Multi-Tenant PostgreSQL 18"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CURATED 1-CLICK THEME PRESETS */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
              Curated Theme Presets (1-Click Switch)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">{presets.length} Presets Available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map((p) => {
            const isSelected = activePresetId === p.preset_id;
            return (
              <div
                key={p.preset_id}
                onClick={() => handleSelectPreset(p)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between group ${
                  isSelected
                    ? "bg-white border-blue-600 shadow-md ring-2 ring-blue-600"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                }`}
              >
                {/* Selected Indicator */}
                {isSelected && (
                  <span className="absolute top-3 right-3 h-5 w-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs">
                    <Check className="w-3 h-3" />
                  </span>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {/* Color Swatch Circle */}
                    <div
                      className="h-9 w-9 rounded-xl shadow-xs flex items-center justify-center shrink-0 border border-black/10 text-white font-bold text-xs"
                      style={{ backgroundColor: p.primary_color }}
                    >
                      ★
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                        {p.name}
                      </h4>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        {p.badge}
                      </span>
                    </div>
                  </div>

                  {/* Palette Preview Bars */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    <div className="space-y-1 text-center">
                      <div className="h-6 rounded-lg border border-slate-200 shadow-2xs" style={{ backgroundColor: p.primary_color }} />
                      <span className="text-[9px] text-slate-400 font-mono">Accent</span>
                    </div>
                    <div className="space-y-1 text-center">
                      <div className="h-6 rounded-lg border border-slate-200 shadow-2xs" style={{ backgroundColor: p.dark_surface }} />
                      <span className="text-[9px] text-slate-400 font-mono">Dark Base</span>
                    </div>
                    <div className="space-y-1 text-center">
                      <div className="h-6 rounded-lg border border-slate-200 shadow-2xs" style={{ backgroundColor: p.dark_card }} />
                      <span className="text-[9px] text-slate-400 font-mono">Card Base</span>
                    </div>
                    <div className="space-y-1 text-center">
                      <div className="h-6 rounded-lg border border-slate-200 shadow-2xs" style={{ backgroundColor: p.light_bg }} />
                      <span className="text-[9px] text-slate-400 font-mono">Canvas</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-500 font-semibold">{p.primary_color}</span>
                  <span className={`font-bold ${isSelected ? "text-blue-600" : "text-slate-400 group-hover:text-slate-700"}`}>
                    {isSelected ? "✓ Active Preset" : "Click to Preview"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CUSTOM COLOR PALETTE STUDIO & LIVE SANDBOX */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT: Custom Color Pickers */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">Custom Color Palette Studio</h3>
              <p className="text-xs text-slate-500">Fine-tune individual hex codes with live color pickers</p>
            </div>
            {activePresetId === "custom" && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                Custom Palette Mode
              </span>
            )}
          </div>

          <div className="space-y-3 text-xs">
            
            {/* Primary Accent */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={themeForm.primary_color}
                  onChange={(e) => handleColorChange("primary_color", e.target.value)}
                  className="w-10 h-10 rounded-xl border-0 cursor-pointer p-0 bg-transparent"
                />
                <div>
                  <div className="font-bold text-slate-900">Primary Brand Accent</div>
                  <div className="text-[11px] text-slate-500">Buttons, hero CTA, active icons, checked pills</div>
                </div>
              </div>
              <input
                type="text"
                value={themeForm.primary_color}
                onChange={(e) => handleColorChange("primary_color", e.target.value)}
                className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-mono font-bold text-xs"
              />
            </div>

            {/* Primary Hover Accent */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={themeForm.primary_hover}
                  onChange={(e) => handleColorChange("primary_hover", e.target.value)}
                  className="w-10 h-10 rounded-xl border-0 cursor-pointer p-0 bg-transparent"
                />
                <div>
                  <div className="font-bold text-slate-900">Primary Hover State</div>
                  <div className="text-[11px] text-slate-500">Mouse hover color for primary buttons</div>
                </div>
              </div>
              <input
                type="text"
                value={themeForm.primary_hover}
                onChange={(e) => handleColorChange("primary_hover", e.target.value)}
                className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-mono font-bold text-xs"
              />
            </div>

            {/* Dark Surface Background */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={themeForm.dark_surface}
                  onChange={(e) => handleColorChange("dark_surface", e.target.value)}
                  className="w-10 h-10 rounded-xl border-0 cursor-pointer p-0 bg-transparent"
                />
                <div>
                  <div className="font-bold text-slate-900">Dark Pitch Base (Shell & Sidebar)</div>
                  <div className="text-[11px] text-slate-500">Background for sidebar and hero navbar</div>
                </div>
              </div>
              <input
                type="text"
                value={themeForm.dark_surface}
                onChange={(e) => handleColorChange("dark_surface", e.target.value)}
                className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-mono font-bold text-xs"
              />
            </div>

            {/* Dark Card Surface */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={themeForm.dark_card}
                  onChange={(e) => handleColorChange("dark_card", e.target.value)}
                  className="w-10 h-10 rounded-xl border-0 cursor-pointer p-0 bg-transparent"
                />
                <div>
                  <div className="font-bold text-slate-900">Dark Card Surface</div>
                  <div className="text-[11px] text-slate-500">Card containers in dark mode views & login box</div>
                </div>
              </div>
              <input
                type="text"
                value={themeForm.dark_card}
                onChange={(e) => handleColorChange("dark_card", e.target.value)}
                className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-mono font-bold text-xs"
              />
            </div>

            {/* Light Canvas Background */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={themeForm.light_bg}
                  onChange={(e) => handleColorChange("light_bg", e.target.value)}
                  className="w-10 h-10 rounded-xl border-0 cursor-pointer p-0 bg-transparent"
                />
                <div>
                  <div className="font-bold text-slate-900">Light Canvas Background</div>
                  <div className="text-[11px] text-slate-500">Background for dashboard and white-mode views</div>
                </div>
              </div>
              <input
                type="text"
                value={themeForm.light_bg}
                onChange={(e) => handleColorChange("light_bg", e.target.value)}
                className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-mono font-bold text-xs"
              />
            </div>

          </div>
        </div>

        {/* RIGHT: Live Interactive UI Sandbox Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>Real-Time Component Sandbox</span>
                </h3>
                <p className="text-xs text-slate-500">Live preview of how your brand renders across the system</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Interactive Preview
              </span>
            </div>

            {/* Simulated Mini App Interface */}
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
              
              {/* Mini Header */}
              <div
                className="p-3 rounded-xl flex items-center justify-between text-white shadow-xs transition-colors"
                style={{ backgroundColor: themeForm.dark_surface }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {themeForm.logo_url ? (
                    <img src={themeForm.logo_url} alt="Logo" className="h-6 w-auto max-w-[80px] object-contain rounded" />
                  ) : (
                    <div
                      className="h-6 w-6 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ backgroundColor: themeForm.primary_color }}
                    >
                      AI
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-xs truncate">{themeForm.platform_name || "Enterprise AIaaS"}</div>
                    <div className="text-[9px] text-slate-400 truncate">{themeForm.platform_tagline || "Autonomous Support Cloud"}</div>
                  </div>
                </div>

                <div
                  className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs shrink-0"
                  style={{ backgroundColor: themeForm.primary_color }}
                >
                  Active
                </div>
              </div>

              {/* Sample Action Buttons */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-700">Button & CTA Styling:</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="px-3.5 py-1.5 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    style={{ backgroundColor: themeForm.primary_color }}
                  >
                    <span>Primary Action</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    className="px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-colors flex items-center gap-1.5 bg-white cursor-pointer"
                    style={{ borderColor: themeForm.primary_color, color: themeForm.primary_color }}
                  >
                    <span>Outline Button</span>
                  </button>

                  <div
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    style={{ backgroundColor: `${themeForm.primary_color}18`, color: themeForm.primary_color }}
                  >
                    <span>Soft Pill Badge</span>
                  </div>
                </div>
              </div>

              {/* Sample KPI Widget Card */}
              <div
                className="p-4 rounded-xl border shadow-xs text-white space-y-1.5 transition-colors"
                style={{ backgroundColor: themeForm.dark_card, borderColor: themeForm.dark_border }}
              >
                <div className="text-[11px] text-slate-400 font-medium">Monthly Active Conversations</div>
                <div className="text-xl font-bold font-mono">1,248 Sessions</div>
                <div
                  className="text-[11px] font-bold flex items-center gap-1"
                  style={{ color: themeForm.primary_color }}
                >
                  ↑ +18.4% growth this week
                </div>
              </div>

            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveToPlatform}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Branding & Colors to PostgreSQL (Apply Platform-Wide)</span>
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
