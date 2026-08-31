"use client";

import React from "react";
import AppShell from "../../../components/layout/AppShell";
import SuperAdminView from "../../../components/views/SuperAdminView";

export default function SuperAdminEpsPage() {
  return (
    <AppShell activeNav="eps" requiredRole="super_admin">
      <SuperAdminView defaultTab="eps" />
    </AppShell>
  );
}
