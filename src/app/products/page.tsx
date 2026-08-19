"use client";

import React from "react";
import AppShell from "../../components/layout/AppShell";
import ProductsView from "../../components/views/ProductsView";

export default function ProductsPage() {
  return (
    <AppShell navKey="products">
      <ProductsView />
    </AppShell>
  );
}
