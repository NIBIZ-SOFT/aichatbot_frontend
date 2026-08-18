"use client";

import React from "react";
import AppShell from "../../components/layout/AppShell";
import ContactsView from "../../components/views/ContactsView";

export default function ContactsPage() {
  return (
    <AppShell navKey="contacts">
      <ContactsView />
    </AppShell>
  );
}
