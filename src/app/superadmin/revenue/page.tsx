"use client";

import AppShell from "../../../components/layout/AppShell";
import SuperAdminView from "../../../components/views/SuperAdminView";

export default function SuperAdminRevenuePage() {
  return (
    <AppShell activeNav="revenue" requiredRole="super_admin">
      <SuperAdminView defaultTab="revenue" />
    </AppShell>
  );
}
