"use client";

import React from "react";
import AppShell from "../../../components/layout/AppShell";
import SuperAdminView from "../../../components/views/SuperAdminView";

export default function SuperAdminPaymentsPage() {
  return (
    <AppShell activeNav="payments" requiredRole="super_admin">
      <SuperAdminView defaultTab="payments" />
    </AppShell>
  );
}
