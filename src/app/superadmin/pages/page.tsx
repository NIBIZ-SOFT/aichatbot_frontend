"use client";

import React from "react";
import AppShell from "../../../components/layout/AppShell";
import SuperAdminView from "../../../components/views/SuperAdminView";

export default function SuperAdminPagesCmsPage() {
  return (
    <AppShell activeNav="superadmin" requiredRole="super_admin">
      <SuperAdminView defaultTab="pages" />
    </AppShell>
  );
}
