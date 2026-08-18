"use client";

import React from "react";
import AppShell from "../../../components/layout/AppShell";
import SuperAdminView from "../../../components/views/SuperAdminView";

export default function SuperAdminCouponsPage() {
  return (
    <AppShell activeNav="coupons" requiredRole="super_admin">
      <SuperAdminView defaultTab="coupons" />
    </AppShell>
  );
}
