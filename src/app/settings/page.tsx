"use client";

import AppShell from "../../components/layout/AppShell";
import SettingsView from "../../components/views/SettingsView";

export default function SettingsPage() {
  return (
    <AppShell activeNav="settings">
      <SettingsView />
    </AppShell>
  );
}
