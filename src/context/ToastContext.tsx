"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle2, AlertCircle, Info, X, WifiOff, Clock, ShieldAlert } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (title: string, message?: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Global helper for triggering toasts outside React component lifecycle (e.g. from api.ts)
 */
export function emitToast(title: string, message?: string, type: ToastType = "error") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("app:toast", {
        detail: { title, message, type },
      })
    );
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const recentToastsRef = useRef<Map<string, number>>(new Map());

  const showToast = useCallback((title: string, message?: string, type: ToastType = "success") => {
    // Smart Deduplication: prevent toast spamming if same message fired within 2.5 seconds
    const key = `${type}:${title}:${message || ""}`;
    const now = Date.now();
    const lastSeen = recentToastsRef.current.get(key) || 0;
    if (now - lastSeen < 2500) {
      return; // Ignore spam duplicate
    }
    recentToastsRef.current.set(key, now);

    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev.slice(-4), { id, title, message, type }]); // Keep max 5 visible

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  // Listen for global window events dispatched by api.ts or network handlers
  useEffect(() => {
    const handleGlobalToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string; message?: string; type?: ToastType }>;
      if (customEvent.detail) {
        showToast(customEvent.detail.title, customEvent.detail.message, customEvent.detail.type || "error");
      }
    };

    window.addEventListener("app:toast", handleGlobalToast);
    return () => {
      window.removeEventListener("app:toast", handleGlobalToast);
    };
  }, [showToast]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-start gap-3 transition-all animate-slide-up ${
              t.type === "success"
                ? "bg-slate-900/95 text-white border-emerald-500/30 shadow-emerald-950/20"
                : t.type === "error"
                ? "bg-slate-950/95 text-rose-100 border-rose-600/40 shadow-rose-950/30"
                : t.type === "warning"
                ? "bg-slate-950/95 text-amber-100 border-amber-600/40 shadow-amber-950/30"
                : "bg-slate-900/95 text-white border-slate-700/50 shadow-slate-950/30"
            }`}
          >
            {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {t.type === "error" && (
              t.title.toLowerCase().includes("timeout") ? (
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              ) : t.title.toLowerCase().includes("connection") ? (
                <WifiOff className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )
            )}
            {t.type === "warning" && <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {t.type === "info" && <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-xs text-white tracking-wide">{t.title}</h5>
              {t.message && <p className="text-[11.5px] text-slate-300 mt-1 leading-relaxed">{t.message}</p>}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white p-1 transition-colors cursor-pointer rounded-lg hover:bg-slate-800/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

