"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  ExternalLink,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Phone,
  MapPin,
  CreditCard,
  Tag
} from "lucide-react";

interface GenerativeUIPreviewProps {
  uiComponent: {
    type: "product_card" | "product_carousel" | "order_tracking_card" | string;
    data: any;
  };
  isDark?: boolean;
}

// -------------------------------------------------------------
// 1. Single Interactive Product Card Component
// -------------------------------------------------------------
function ProductCardView({ product, isDark }: { product: any; isDark?: boolean }) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [currentQty, setCurrentQty] = useState<number>(product.initial_quantity || 1);

  if (!product) return null;

  const image = (product.images && product.images[0]) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";
  const unitPrice = product.unit_price || 0;
  const sellingPrice = product.selling_price || 0;
  const discountPercent = unitPrice > sellingPrice ? Math.round(((unitPrice - sellingPrice) / unitPrice) * 100) : 0;
  const sizes = product.specifications?.Sizes || product.specifications?.Size || product.specifications?.sizes;
  const sizeList: string[] = typeof sizes === "string" ? sizes.split(",").map((s: string) => s.trim()) : [];

  return (
    <div
      className={`rounded-2xl border p-3.5 mt-2.5 transition-all shadow-md max-w-sm ${
        isDark
          ? "bg-slate-900/90 border-slate-700/80 text-white"
          : "bg-white border-slate-200/90 text-slate-900"
      }`}
    >
      {/* Product Image & Badges */}
      <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 mb-2.5 group">
        <img
          src={image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Category Pill */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-[10px] font-bold text-white uppercase tracking-wider">
          {product.category || "Store Item"}
        </div>
        {/* Stock Status Pill */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs bg-emerald-500 text-white flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>In Stock ({product.stock_quantity || 1})</span>
        </div>
      </div>

      {/* Product Title & SKU */}
      <div className="space-y-0.5">
        <div className="flex items-center justify-between gap-1 text-[10px] font-mono text-slate-400">
          <span>SKU: {product.sku || "N/A"}</span>
          {product.priority ? <span className="text-amber-400 font-bold">Featured ⭐</span> : null}
        </div>
        <h4 className="font-bold text-xs line-clamp-1 text-inherit">
          {product.title}
        </h4>
        {product.description && (
          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="flex items-baseline gap-2 mt-2 pt-2 border-t border-slate-200/50">
        <span className="font-extrabold text-sm font-mono text-emerald-500">
          ৳{sellingPrice.toLocaleString()} BDT
        </span>
        {unitPrice > sellingPrice && (
          <>
            <span className="text-[11px] font-mono text-slate-400 line-through">
              ৳{unitPrice.toLocaleString()}
            </span>
            <span className="text-[9.5px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/30 px-1.5 py-0.2 rounded-md">
              -{discountPercent}%
            </span>
          </>
        )}
      </div>

      {/* Size Variant Chips if present */}
      {sizeList.length > 0 && (
        <div className="mt-2 space-y-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Select Size:</span>
          <div className="flex items-center gap-1 flex-wrap">
            {sizeList.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setSelectedSize(sz)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono transition-all cursor-pointer ${
                  selectedSize === sz
                    ? "bg-indigo-600 text-white shadow-xs"
                    : isDark
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity & Agent Action Bar */}
      <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex items-center justify-between gap-2">
        {/* Quantity Stepper Display */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200/60 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setCurrentQty((q) => Math.max(1, q - 1))}
            className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            −
          </button>
          <span className="w-6 text-center font-mono font-bold text-xs text-slate-900 dark:text-white">
            {currentQty}
          </span>
          <button
            type="button"
            onClick={() => setCurrentQty((q) => q + 1)}
            className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            +
          </button>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-1.5 flex-1 justify-end">
          <span className="text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 px-2 py-1 rounded-lg flex items-center gap-1">
            <ShoppingBag className="w-3 h-3" />
            <span>Card Shown to Customer</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. Multi-Product Carousel Component
// -------------------------------------------------------------
function ProductCarouselView({ products, isDark }: { products: any[]; isDark?: boolean }) {
  if (!products || products.length === 0) return null;

  return (
    <div
      className={`rounded-2xl border p-3 mt-2.5 transition-all shadow-md space-y-2 max-w-lg ${
        isDark
          ? "bg-slate-900/90 border-slate-700/80 text-white"
          : "bg-white border-slate-200/90 text-slate-900"
      }`}
    >
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/50">
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <Layers className="w-3.5 h-3.5 text-indigo-500" />
          <span>Product Catalog ({products.length} Products)</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Scroll to view ↕</span>
      </div>

      {/* Product Items List / Carousel */}
      <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
        {products.map((p, idx) => {
          const img = (p.images && p.images[0]) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";
          return (
            <div
              key={p.id || idx}
              className={`p-2 rounded-xl border flex items-center gap-3 transition-colors ${
                isDark
                  ? "bg-slate-800/80 border-slate-700/60 hover:bg-slate-800"
                  : "bg-slate-50 border-slate-200/70 hover:bg-slate-100"
              }`}
            >
              <img
                src={img}
                alt={p.title}
                className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200/50"
              />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  {p.category || "Item"} • SKU: {p.sku || "N/A"}
                </div>
                <h5 className="font-bold text-xs truncate text-inherit">{p.title}</h5>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-bold text-xs font-mono text-emerald-500">
                    ৳{(p.selling_price || 0).toLocaleString()} BDT
                  </span>
                  {p.unit_price > p.selling_price && (
                    <span className="text-[10px] font-mono text-slate-400 line-through">
                      ৳{(p.unit_price || 0).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. Order Tracking Card with 4-Step Progress Stepper
// -------------------------------------------------------------
function OrderTrackingView({ order, isDark }: { order: any; isDark?: boolean }) {
  if (!order) return null;

  const status = (order.order_status || "pending").toLowerCase();
  const stepIndex =
    status === "delivered"
      ? 4
      : status === "shipped"
      ? 3
      : status === "confirmed"
      ? 2
      : 1;

  const steps = [
    { label: "Placed", num: 1 },
    { label: "Confirmed", num: 2 },
    { label: "Shipped", num: 3 },
    { label: "Delivered", num: 4 }
  ];

  return (
    <div
      className={`rounded-2xl border p-4 mt-2.5 transition-all shadow-md space-y-3 max-w-md ${
        isDark
          ? "bg-slate-900/90 border-slate-700/80 text-white"
          : "bg-white border-slate-200/90 text-slate-900"
      }`}
    >
      {/* Header with Order ID & Status */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/50">
        <div>
          <div className="flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-mono font-extrabold text-xs text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
              {order.order_number}
            </span>
          </div>
          <div className="text-[10.5px] text-slate-400 mt-1 flex items-center gap-1">
            <span>{order.customer_name}</span>
            {order.customer_phone ? <span>• {order.customer_phone}</span> : null}
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
            status === "delivered"
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
              : status === "shipped"
              ? "bg-blue-500/10 text-blue-500 border-blue-500/30"
              : status === "confirmed"
              ? "bg-purple-500/10 text-purple-500 border-purple-500/30"
              : "bg-amber-500/10 text-amber-500 border-amber-500/30"
          }`}
        >
          {status}
        </span>
      </div>

      {/* 4-Step Animated Visual Stepper */}
      <div className="py-2">
        <div className="relative flex items-center justify-between">
          {/* Background Bar */}
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 z-0" />
          {/* Progress Active Bar */}
          <div
            className="absolute top-1/2 left-4 h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${((stepIndex - 1) / 3) * 85}%` }}
          />

          {steps.map((s) => {
            const isPassed = s.num <= stepIndex;
            const isCurrent = s.num === stepIndex;
            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center gap-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-xs ${
                    isPassed
                      ? "bg-emerald-500 text-white ring-2 ring-emerald-500/30"
                      : isDark
                      ? "bg-slate-800 text-slate-400 border border-slate-700"
                      : "bg-white text-slate-400 border border-slate-300"
                  } ${isCurrent ? "scale-110" : ""}`}
                >
                  {isPassed ? "✓" : s.num}
                </div>
                <span
                  className={`text-[9.5px] font-medium ${
                    isPassed ? "text-emerald-500 font-bold" : "text-slate-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ordered Items List */}
      {order.items && order.items.length > 0 && (
        <div className="space-y-1 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-[11px]">
          <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Items in Package:</div>
          {order.items.map((it: any, itIdx: number) => {
            const itemTotal = it.line_total || it.total || (it.unit_price || it.price || 0) * (it.quantity || 1);
            return (
              <div key={itIdx} className="flex justify-between items-center text-inherit">
                <span className="truncate pr-2">
                  {it.quantity}x {it.title} {it.selected_size ? `(${it.selected_size})` : ""}
                </span>
                <span className="font-mono font-bold shrink-0">৳{Number(itemTotal).toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Financial & Delivery Details Footer */}
      <div className="pt-2 border-t border-slate-200/50 space-y-1.5 text-[11px]">
        <div className="flex justify-between items-center">
          <span className="text-slate-400 font-medium">Total Amount:</span>
          <span className="font-mono font-extrabold text-xs text-emerald-500">
            ৳{(order.total_amount || 0).toLocaleString()} BDT
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Payment Method:</span>
          <span className="font-semibold text-inherit capitalize">
            {order.payment_method === "bkash" ? "📱 bKash Online" : "💵 Cash on Delivery"}
          </span>
        </div>
        {order.delivery_address && (
          <div className="flex items-start gap-1 text-[10.5px] text-slate-400 pt-1">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
            <span className="truncate">{order.delivery_address}, {order.delivery_city}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Main Generative UI Entry Point (Open-Closed SOLID Principle)
// -------------------------------------------------------------
export default function GenerativeUIPreview({ uiComponent, isDark }: GenerativeUIPreviewProps) {
  if (!uiComponent || !uiComponent.type || !uiComponent.data) return null;

  switch (uiComponent.type) {
    case "product_card":
      return <ProductCardView product={uiComponent.data.product} isDark={isDark} />;
    case "product_carousel":
      return <ProductCarouselView products={uiComponent.data.products} isDark={isDark} />;
    case "order_tracking_card":
      return <OrderTrackingView order={uiComponent.data.order} isDark={isDark} />;
    default:
      return null;
  }
}
