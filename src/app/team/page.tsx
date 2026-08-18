"use client";

import AppShell from "../../components/layout/AppShell";
import TeamView from "../../components/views/TeamView";

export default function TeamPage() {
  return (
    <AppShell activeNav="team">
      <TeamView />
    </AppShell>
  );
}
