"use client";

import React from "react";
import { useAuth } from "../../context/AuthContext";
import LoginScreen from "../auth/LoginScreen";
import Header from "../common/Header";
import Sidebar from "../common/Sidebar";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AppShellProps {
  children: React.ReactNode;
  navKey?: string;
  activeNav?: string;
  requiredRoles?: string[];
  requiredRole?: string;
}

export default function AppShell({ children, navKey, activeNav, requiredRoles, requiredRole }: AppShellProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  const currentNav = activeNav || navKey;

  // Derive navKey from pathname if not explicitly provided
  const derivedNavKey = currentNav || (() => {
    if (pathname.includes("support-inbox") || pathname.includes("inbox")) return "inbox";
    if (pathname.includes("contacts")) return "contacts";
    if (pathname.includes("assistants")) return "assistants";
    if (pathname.includes("knowledge")) return "knowledge";
    if (pathname.includes("websites")) return "websites";
    if (pathname.includes("analytics")) return "analytics";
    if (pathname.includes("usage")) return "usage";
    if (pathname.includes("team")) return "team";
    if (pathname.includes("settings")) return "settings";
    if (pathname.includes("subscription")) return "subscription";
    if (pathname.includes("superadmin")) return "superadmin";
    return "dashboard";
  })();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium">Initializing Enterprise Workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const role = user?.role;
  const dept = user?.department?.toLowerCase() || "";
  const isSuperAdmin = role === "super_admin";
  const isOwnerOrAdmin = role === "tenant_owner" || role === "super_admin" || role === "tenant_admin";
  const isTechSupport = role === "support_agent" && dept.includes("tech");
  const isCustomerSupport = role === "support_agent" && !dept.includes("tech");
  const isSales = role === "sales_agent";
  const isViewer = role === "viewer";

  const enabledModules = user?.enabled_modules;
  const isModuleDisabled = !isSuperAdmin && enabledModules && enabledModules[derivedNavKey] === false;

  // Check route access permission
  const checkNavPermission = (nav: string): boolean => {
    if (requiredRole && role !== requiredRole) return false;
    if (requiredRoles && requiredRoles.length > 0 && (!role || !requiredRoles.includes(role))) return false;
    if (isSuperAdmin) return true;
    if (nav === "superadmin" || nav === "tenants" || nav === "revenue" || nav === "infrastructure" || nav === "audit") {
      return isSuperAdmin;
    }
    if (isModuleDisabled) return false;
    if (isOwnerOrAdmin) return true;
    if (nav === "dashboard" || nav === "inbox") return true;
    if (nav === "contacts") return isCustomerSupport || isSales;
    if (nav === "assistants") return isTechSupport;
    if (nav === "knowledge") return isCustomerSupport || isTechSupport;
    if (nav === "analytics") return isSales || isViewer;
    if (nav === "usage") return isViewer;
    if (nav === "api") return isTechSupport;
    if (nav === "websites" || nav === "team" || nav === "settings" || nav === "subscription") {
      return false; // Only Owner / Admin
    }
    return false;
  };

  const hasAccess = checkNavPermission(derivedNavKey);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased">
      {/* Sidebar Navigation with URL support */}
      <Sidebar activeNav={derivedNavKey} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header activeNav={derivedNavKey} />

        {/* Route Body */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-100/90">
          {!hasAccess ? (
            <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">
                  {isModuleDisabled ? "Module Not Included in Plan" : "Access Restricted"}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isModuleDisabled ? (
                    <>
                      The <strong>{derivedNavKey.toUpperCase()}</strong> module is currently disabled for your organization. Please upgrade your subscription package or contact your Platform Super Admin.
                    </>
                  ) : (
                    <>
                      This page requires <strong>Platform Super Admin</strong> or <strong>Organization Owner</strong> privileges. Your account ({role}) is scoped to <strong>{user?.department || "General"}</strong>.
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                {isModuleDisabled && isOwnerOrAdmin && (
                  <Link
                    href="/subscription"
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    Upgrade Plan
                  </Link>
                )}
                <Link
                  href={isSuperAdmin ? "/superadmin" : "/dashboard"}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Return to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
