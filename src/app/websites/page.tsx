"use client";

import React from "react";
import AppShell from "../../components/layout/AppShell";
import WebsitesView from "../../components/views/WebsitesView";

export default function WebsitesPage() {
  return (
    <AppShell navKey="websites">
      <WebsitesView />
    </AppShell>
  );
}
