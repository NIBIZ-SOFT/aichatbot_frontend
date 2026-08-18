"use client";

import AppShell from "../../../components/layout/AppShell";
import SuperAdminView from "../../../components/views/SuperAdminView";

export default function SuperAdminTenantsPage() {
  return (
    <AppShell activeNav="tenants" requiredRole="super_admin">
      <SuperAdminView defaultTab="tenants" />
    </AppShell>
  );
}
