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

  const showToast = useCallback((title: string, message?: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev.slice(-4), { id, title, message, type }]);

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
      <div
        style={{ position: "fixed", top: "18px", right: "18px", zIndex: 999999999 }}
        className="flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] pointer-events-none"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            className={`toast-slide-down pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-2xl flex items-start gap-3 transition-all ${
              t.type === "success"
                ? "bg-slate-900/98 text-white border-emerald-500/60 shadow-emerald-950/40"
                : t.type === "error"
                ? "bg-slate-950/98 text-rose-100 border-rose-500/80 shadow-rose-950/50"
                : t.type === "warning"
                ? "bg-slate-950/98 text-amber-100 border-amber-500/70 shadow-amber-950/40"
                : "bg-slate-900/98 text-white border-slate-700/50 shadow-slate-950/30"
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

