"use client";

import React from "react";
import AppShell from "../../components/layout/AppShell";
import DashboardView from "../../components/views/DashboardView";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const handleNavigate = (nav: string) => {
    const routeMap: Record<string, string> = {
      dashboard: "/dashboard",
      inbox: "/support-inbox",
      contacts: "/contacts",
      assistants: "/assistants",
      knowledge: "/knowledge",
      websites: "/websites",
      analytics: "/analytics",
      usage: "/usage",
      team: "/team",
      settings: "/settings",
      subscription: "/subscription",
      superadmin: "/superadmin"
    };
    const target = routeMap[nav] || `/${nav}`;
    router.push(target);
  };

  return (
    <AppShell navKey="dashboard">
      <DashboardView onNavigate={handleNavigate} />
    </AppShell>
  );
}
