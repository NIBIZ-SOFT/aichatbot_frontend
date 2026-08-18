"use client";

import AppShell from "../../../components/layout/AppShell";
import SuperAdminView from "../../../components/views/SuperAdminView";

export default function SuperAdminAuditPage() {
  return (
    <AppShell activeNav="audit" requiredRole="super_admin">
      <SuperAdminView defaultTab="audit" />
    </AppShell>
  );
}
