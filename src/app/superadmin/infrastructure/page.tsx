"use client";

import AppShell from "../../../components/layout/AppShell";
import SuperAdminView from "../../../components/views/SuperAdminView";

export default function SuperAdminInfrastructurePage() {
  return (
    <AppShell activeNav="infrastructure" requiredRole="super_admin">
      <SuperAdminView defaultTab="infrastructure" />
    </AppShell>
  );
}
