"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import LandingPage from "../components/landing/LandingPage";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import { ShieldAlert, ArrowLeft } from "lucide-react";

// Views
import DashboardView from "../components/views/DashboardView";
import InboxView from "../components/views/InboxView";
import ContactsView from "../components/views/ContactsView";
import AssistantsView from "../components/views/AssistantsView";
import KnowledgeView from "../components/views/KnowledgeView";
import WebsitesView from "../components/views/WebsitesView";
import AnalyticsView from "../components/views/AnalyticsView";
import UsageView from "../components/views/UsageView";
import DeveloperApiView from "../components/views/DeveloperApiView";
import TeamView from "../components/views/TeamView";
import SettingsView from "../components/views/SettingsView";
import SubscriptionView from "../components/views/SubscriptionView";
import SuperAdminView from "../components/views/SuperAdminView";

export default function MainPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<string>(
    user?.role === "super_admin" ? "superadmin" : "dashboard"
  );

  React.useEffect(() => {
    if (user?.role === "super_admin") {
      setActiveNav("superadmin");
    }
  }, [user?.role]);

  // Strip public landing page CDN chat widget when logged into workspace
  React.useEffect(() => {
    if (isAuthenticated) {
      const scriptEl = document.getElementById("platform-superadmin-chat-widget");
      if (scriptEl) scriptEl.remove();

      const widgetHosts = document.querySelectorAll("#aiaas-widget-host, #enterprise-ai-widget-root, [id^='aiaas-'], [id^='enterprise-ai-widget']");
      widgetHosts.forEach(el => el.remove());
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium">Initializing Enterprise Workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  const role = user?.role;
  const dept = user?.department?.toLowerCase() || "";
  const isSuperAdmin = role === "super_admin";
  const isOwnerOrAdmin = role === "tenant_owner" || role === "super_admin" || role === "tenant_admin";
  const isTechSupport = role === "support_agent" && dept.includes("tech");
  const isCustomerSupport = role === "support_agent" && !dept.includes("tech");
  const isSales = role === "sales_agent";
  const isViewer = role === "viewer";

  // Check view access permission
  const checkNavPermission = (nav: string): boolean => {
    if (nav === "superadmin") return isSuperAdmin;
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

  const hasAccess = checkNavPermission(activeNav);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeNav={activeNav}
        onSelectNav={(nav) => {
          setActiveNav(nav);
          setMobileSidebarOpen(false);
        }}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <Header
          activeNav={activeNav}
          onToggleMobileNav={() => setMobileSidebarOpen(prev => !prev)}
        />

        {/* View Body */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-8 bg-slate-100/90">
          {!hasAccess ? (
            <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">Access Restricted</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  This page requires <strong>Platform Super Admin</strong> or <strong>Organization Owner</strong> privileges. Your account ({role}) is scoped to <strong>{user?.department || "General"}</strong>.
                </p>
              </div>
              <button
                onClick={() => setActiveNav(isSuperAdmin ? "superadmin" : "dashboard")}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Dashboard
              </button>
            </div>
          ) : (
            <>
              {activeNav === "superadmin" && <SuperAdminView />}
              {activeNav === "dashboard" && <DashboardView onNavigate={setActiveNav} />}
              {activeNav === "inbox" && <InboxView />}
              {activeNav === "contacts" && <ContactsView />}
              {activeNav === "assistants" && <AssistantsView />}
              {activeNav === "knowledge" && <KnowledgeView />}
              {activeNav === "websites" && <WebsitesView />}
              {activeNav === "analytics" && <AnalyticsView />}
              {activeNav === "usage" && <UsageView />}
              {activeNav === "api" && <DeveloperApiView />}
              {activeNav === "team" && <TeamView />}
              {activeNav === "settings" && <SettingsView />}
              {activeNav === "subscription" && <SubscriptionView />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
