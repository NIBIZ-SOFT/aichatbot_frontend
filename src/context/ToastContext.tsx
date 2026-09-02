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
        style={{ position: "fixed", top: "20px", right: "20px", zIndex: 999999999 }}
        className="flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] pointer-events-none"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            className={`toast-slide-down pointer-events-auto p-4 rounded-2xl bg-white border shadow-2xl flex items-start gap-3.5 transition-all ${
              t.type === "success"
                ? "border-slate-200 border-l-4 border-l-emerald-500 shadow-slate-900/10"
                : t.type === "error"
                ? "border-slate-200 border-l-4 border-l-rose-500 shadow-slate-900/10"
                : t.type === "warning"
                ? "border-slate-200 border-l-4 border-l-amber-500 shadow-slate-900/10"
                : "border-slate-200 border-l-4 border-l-indigo-500 shadow-slate-900/10"
            }`}
          >
            {/* Type-Specific Icon Badges */}
            {t.type === "success" && (
              <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
            {t.type === "error" && (
              <div className="h-8 w-8 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                {t.title.toLowerCase().includes("timeout") ? (
                  <Clock className="w-4 h-4 text-amber-600" />
                ) : t.title.toLowerCase().includes("connection") ? (
                  <WifiOff className="w-4 h-4 text-rose-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
              </div>
            )}
            {t.type === "warning" && (
              <div className="h-8 w-8 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
              </div>
            )}
            {t.type === "info" && (
              <div className="h-8 w-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-4 h-4 text-indigo-600" />
              </div>
            )}

            {/* Title & Message */}
            <div className="flex-1 min-w-0 pt-0.5">
              <h5 className="font-bold text-xs text-slate-900 tracking-tight leading-snug">{t.title}</h5>
              {t.message && <p className="text-[11.5px] text-slate-600 mt-0.5 leading-relaxed font-normal">{t.message}</p>}
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-700 p-1.5 transition-colors cursor-pointer rounded-lg hover:bg-slate-100 shrink-0"
              title="Close notification"
            >
              <X className="w-3.5 h-3.5" />
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

