"use client";

import AppShell from "../../components/layout/AppShell";
import UsageView from "../../components/views/UsageView";

export default function UsagePage() {
  return (
    <AppShell activeNav="usage">
      <UsageView />
    </AppShell>
  );
}
