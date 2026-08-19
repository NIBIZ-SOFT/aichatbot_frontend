"use client";

import React from "react";
import AppShell from "../../components/layout/AppShell";
import OrdersView from "../../components/views/OrdersView";

export default function OrdersPage() {
  return (
    <AppShell navKey="orders">
      <OrdersView />
    </AppShell>
  );
}
