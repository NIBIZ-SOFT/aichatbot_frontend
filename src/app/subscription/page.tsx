"use client";

import AppShell from "../../components/layout/AppShell";
import SubscriptionView from "../../components/views/SubscriptionView";

export default function SubscriptionPage() {
  return (
    <AppShell activeNav="subscription">
      <SubscriptionView />
    </AppShell>
  );
}
