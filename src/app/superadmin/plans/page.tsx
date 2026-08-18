"use client";

import React from "react";
import AppShell from "../../../components/layout/AppShell";
import SuperAdminView from "../../../components/views/SuperAdminView";

export default function SuperAdminPlansPage() {
  return (
    <AppShell activeNav="plans" requiredRole="super_admin">
      <SuperAdminView defaultTab="plans" />
    </AppShell>
  );
}
