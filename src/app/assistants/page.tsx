"use client";

import React from "react";
import AppShell from "../../components/layout/AppShell";
import KnowledgeView from "../../components/views/KnowledgeView";

export default function AssistantsPage() {
  return (
    <AppShell navKey="knowledge">
      <KnowledgeView />
    </AppShell>
  );
}
