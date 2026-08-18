"use client";

import AppShell from "../../components/layout/AppShell";
import SuperAdminView from "../../components/views/SuperAdminView";

export default function SuperAdminOverviewPage() {
  return (
    <AppShell activeNav="superadmin" requiredRole="super_admin">
      <SuperAdminView defaultTab="overview" />
    </AppShell>
  );
}
