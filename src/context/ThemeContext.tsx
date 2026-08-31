"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../lib/api";

export interface ThemeConfig {
  preset_id: string;
  name?: string;
  badge?: string;
  platform_name?: string;
  platform_tagline?: string;
  logo_url?: string;
  favicon_url?: string;
  widget_avatar_url?: string;
  footer_text?: string;
  support_email?: string;
  primary_color: string;
  primary_hover: string;
  dark_surface: string;
  dark_card: string;
  dark_border: string;
  light_bg: string;
  border_radius?: string;
  preview_bg?: string;
}

export const DEFAULT_THEME_PRESETS: ThemeConfig[] = [
  {
    preset_id: "ocean_sapphire",
    name: "Ocean Sapphire & Slate",
    badge: "Linear & Stripe Style",
    platform_name: "Jobab Chat",
    platform_tagline: "Autonomous Customer Communication & Sales Cloud",
    logo_url: "https://iili.io/CsuMe3l.png",
    favicon_url: "https://iili.io/CsuMe3l.png",
    widget_avatar_url: "",
    footer_text: "© 2026 Jobab Chat Platform • Multi-Tenant PostgreSQL 18 & Enterprise Neural AI",
    support_email: "support@enterprise.example",
    primary_color: "#2563EB",
    primary_hover: "#1D4ED8",
    dark_surface: "#0B0F19",
    dark_card: "#111827",
    dark_border: "#1F2937",
    light_bg: "#F8FAFC",
    preview_bg: "from-blue-600 to-indigo-600"
  },
  {
    preset_id: "modern_emerald",
    name: "Modern Emerald & Obsidian Mint",
    badge: "Supabase & Wise Style",
    platform_name: "Padma Mart AI Live",
    platform_tagline: "24/7 AI Customer Support & Order Automation",
    logo_url: "https://iili.io/CsuMe3l.png",
    favicon_url: "https://iili.io/CsuMe3l.png",
    widget_avatar_url: "",
    footer_text: "© 2026 Padma AIaaS Cloud • Multi-Tenant PostgreSQL 18 & Enterprise Neural AI",
    support_email: "support@padmadigital.example",
    primary_color: "#00C978",
    primary_hover: "#00B36B",
    dark_surface: "#080D0A",
    dark_card: "#0F1713",
    dark_border: "#1A2922",
    light_bg: "#F6F8F6",
    preview_bg: "from-emerald-500 to-teal-500"
  },
  {
    preset_id: "nordic_charcoal",
    name: "Nordic Charcoal & Sunset Coral",
    badge: "Raycast Style",
    platform_name: "Raycast AI Support",
    platform_tagline: "Blazing Fast AI Agent for Omnichannel Stores",
    logo_url: "",
    favicon_url: "",
    widget_avatar_url: "",
    footer_text: "© 2026 Nordic Cloud • Multi-Tenant PostgreSQL 18 & Enterprise Neural AI",
    support_email: "support@nordic.example",
    primary_color: "#FF5C35",
    primary_hover: "#E04823",
    dark_surface: "#0E0E10",
    dark_card: "#18181B",
    dark_border: "#27272A",
    light_bg: "#FAFAFA",
    preview_bg: "from-orange-500 to-rose-500"
  },
  {
    preset_id: "royal_violet",
    name: "Royal Violet & Midnight",
    badge: "Cosmic Luxury Style",
    platform_name: "Cosmic AIaaS Cloud",
    platform_tagline: "Next-Gen AI Customer Engagement & Sales Pipeline",
    logo_url: "",
    favicon_url: "",
    widget_avatar_url: "",
    footer_text: "© 2026 Cosmic AI SaaS • Multi-Tenant PostgreSQL 18 & Enterprise Neural AI",
    support_email: "support@cosmic.example",
    primary_color: "#7C3AED",
    primary_hover: "#6D28D9",
    dark_surface: "#0A0B1E",
    dark_card: "#12132E",
    dark_border: "#1E2048",
    light_bg: "#F8F9FE",
    preview_bg: "from-purple-600 to-violet-600"
  },
  {
    preset_id: "amber_gold",
    name: "Amber Gold & Espresso",
    badge: "Fintech Gold Style",
    platform_name: "Apex Financial AI",
    platform_tagline: "Autonomous Payment Support & Customer Verification",
    logo_url: "",
    favicon_url: "",
    widget_avatar_url: "",
    footer_text: "© 2026 Apex Fintech AI • Multi-Tenant PostgreSQL 18 & Enterprise Neural AI",
    support_email: "support@apex.example",
    primary_color: "#D97706",
    primary_hover: "#B45309",
    dark_surface: "#120E0A",
    dark_card: "#1C1712",
    dark_border: "#2C241D",
    light_bg: "#FDFBF7",
    preview_bg: "from-amber-500 to-yellow-600"
  },
  {
    preset_id: "minimal_zinc",
    name: "Minimal Monochrome & Pure Zinc",
    badge: "Vercel Minimalist Style",
    platform_name: "Zinc AI Systems",
    platform_tagline: "Minimalist Autonomous Support Infrastructure",
    logo_url: "",
    favicon_url: "",
    widget_avatar_url: "",
    footer_text: "© 2026 Zinc AI Platform • Multi-Tenant PostgreSQL 18 & Enterprise Neural AI",
    support_email: "support@zinc.example",
    primary_color: "#18181B",
    primary_hover: "#27272A",
    dark_surface: "#09090B",
    dark_card: "#18181B",
    dark_border: "#27272A",
    light_bg: "#FAFAFA",
    preview_bg: "from-slate-700 to-slate-900"
  }
];

interface ThemeContextType {
  currentTheme: ThemeConfig;
  presets: ThemeConfig[];
  isLoadingTheme: boolean;
  applyTheme: (theme: ThemeConfig) => void;
  saveTheme: (theme: ThemeConfig) => Promise<boolean>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(DEFAULT_THEME_PRESETS[0]);
  const [presets, setPresets] = useState<ThemeConfig[]>(DEFAULT_THEME_PRESETS);
  const [isLoadingTheme, setIsLoadingTheme] = useState<boolean>(true);

  // Apply CSS Variables & Document Attributes
  const applyCssVariables = (theme: ThemeConfig) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    root.style.setProperty("--brand-primary", theme.primary_color);
    root.style.setProperty("--brand-primary-hover", theme.primary_hover);
    root.style.setProperty("--brand-dark-surface", theme.dark_surface);
    root.style.setProperty("--brand-dark-card", theme.dark_card);
    root.style.setProperty("--brand-dark-border", theme.dark_border);
    root.style.setProperty("--brand-light-bg", theme.light_bg);

    // Update document title if platform name is set
    if (theme.platform_name) {
      document.title = `${theme.platform_name} • ${theme.platform_tagline || "Autonomous AI Support & Sales Cloud"}`;
    }

    // Dynamic Favicon Update: Uses favicon_url if provided, otherwise automatically falls back to logo_url variable
    const effectiveFavicon = (theme.favicon_url && theme.favicon_url.trim())
      || (theme.logo_url && theme.logo_url.trim())
      || "https://iili.io/CsuMe3l.png";

    if (effectiveFavicon && typeof document !== "undefined") {
      const iconSelectors = ["link[rel~='icon']", "link[rel='shortcut icon']", "link[rel='apple-touch-icon']"];
      let updated = false;
      iconSelectors.forEach(sel => {
        const link = document.querySelector(sel) as HTMLLinkElement;
        if (link) {
          link.href = effectiveFavicon;
          updated = true;
        }
      });
      if (!updated) {
        const link = document.createElement("link");
        link.rel = "icon";
        link.href = effectiveFavicon;
        document.head.appendChild(link);
      }
    }
  };

  // Cross-Tab Broadcast & Storage Listener
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "platform_theme_config" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setCurrentTheme(parsed);
          applyCssVariables(parsed);
        } catch (err) {
          console.warn("Storage sync error:", err);
        }
      }
    };
    window.addEventListener("storage", handleStorage);

    let channel: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel("platform_branding_sync");
      channel.onmessage = (event) => {
        if (event.data?.type === "THEME_UPDATED" && event.data.theme) {
          setCurrentTheme(event.data.theme);
          applyCssVariables(event.data.theme);
        }
      };
    }

    return () => {
      window.removeEventListener("storage", handleStorage);
      if (channel) channel.close();
    };
  }, []);

  // Load from API / LocalStorage on mount
  useEffect(() => {
    const loadTheme = async () => {
      // 1. Instant cache load from localStorage if available
      try {
        const saved = localStorage.getItem("platform_theme_config");
        if (saved) {
          const parsed = JSON.parse(saved);
          setCurrentTheme(parsed);
          applyCssVariables(parsed);
        }
      } catch (e) {
        console.warn("Theme local cache error:", e);
      }

      // 2. Fetch active theme from backend database
      try {
        const res = await api.getPublicTheme();
        if (res && res.theme) {
          const remoteTheme: ThemeConfig = {
            preset_id: res.theme.preset_id || "ocean_sapphire",
            name: res.theme.name || "Active Theme",
            platform_name: res.theme.platform_name || "Jobab Chat",
            platform_tagline: res.theme.platform_tagline || "Autonomous Customer Communication & Sales Cloud",
            logo_url: res.theme.logo_url || "",
            favicon_url: res.theme.favicon_url || "",
            widget_avatar_url: res.theme.widget_avatar_url || "",
            footer_text: res.theme.footer_text || "© 2026 Jobab Chat Platform • Multi-Tenant PostgreSQL 18 & Enterprise Neural AI",
            support_email: res.theme.support_email || "support@enterprise.example",
            primary_color: res.theme.primary_color || "#2563EB",
            primary_hover: res.theme.primary_hover || "#1D4ED8",
            dark_surface: res.theme.dark_surface || "#0B0F19",
            dark_card: res.theme.dark_card || "#111827",
            dark_border: res.theme.dark_border || "#1F2937",
            light_bg: res.theme.light_bg || "#F8FAFC",
            border_radius: res.theme.border_radius || "rounded-xl"
          };
          setCurrentTheme(remoteTheme);
          applyCssVariables(remoteTheme);
          localStorage.setItem("platform_theme_config", JSON.stringify(remoteTheme));

          if (res.presets && Array.isArray(res.presets) && res.presets.length > 0) {
            setPresets(res.presets);
          }
        }
      } catch (err) {
        console.warn("Could not fetch remote theme, using fallback:", err);
      } finally {
        setIsLoadingTheme(false);
      }
    };

    loadTheme();
  }, []);

  const applyTheme = (theme: ThemeConfig) => {
    setCurrentTheme(theme);
    applyCssVariables(theme);
    try {
      localStorage.setItem("platform_theme_config", JSON.stringify(theme));
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const channel = new BroadcastChannel("platform_branding_sync");
        channel.postMessage({ type: "THEME_UPDATED", theme });
        channel.close();
      }
    } catch (e) { }
  };

  const saveTheme = async (theme: ThemeConfig): Promise<boolean> => {
    try {
      applyTheme(theme);
      await api.updateSuperAdminTheme(theme);
      return true;
    } catch (e) {
      console.error("Failed to persist theme to backend:", e);
      return false;
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, presets, isLoadingTheme, applyTheme, saveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
