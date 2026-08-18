"use client";

import React from "react";
import AppShell from "../../../components/layout/AppShell";
import SuperAdminView from "../../../components/views/SuperAdminView";

export default function SuperAdminThemePage() {
  return (
    <AppShell activeNav="theme" requiredRole="super_admin">
      <SuperAdminView defaultTab="theme" />
    </AppShell>
  );
}
