"use client";

import React from "react";
import AppShell from "../../components/layout/AppShell";
import AnalyticsView from "../../components/views/AnalyticsView";

export default function AnalyticsPage() {
  return (
    <AppShell navKey="analytics">
      <AnalyticsView />
    </AppShell>
  );
}
