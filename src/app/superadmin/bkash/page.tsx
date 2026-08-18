"use client";

import React from "react";
import AppShell from "../../../components/layout/AppShell";
import SuperAdminView from "../../../components/views/SuperAdminView";

export default function SuperAdminBkashPage() {
  return (
    <AppShell activeNav="bkash" requiredRole="super_admin">
      <SuperAdminView defaultTab="bkash" />
    </AppShell>
  );
}
