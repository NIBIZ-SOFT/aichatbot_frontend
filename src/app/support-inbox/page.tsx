"use client";

import React from "react";
import AppShell from "../../components/layout/AppShell";
import InboxView from "../../components/views/InboxView";

export default function SupportInboxPage() {
  return (
    <AppShell navKey="inbox">
      <InboxView />
    </AppShell>
  );
}
