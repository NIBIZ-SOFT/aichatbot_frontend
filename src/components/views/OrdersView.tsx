"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContext";
import { api } from "../../lib/api";
import { Order } from "../../types";
import { 
  Package, Search, Filter, CheckCircle2, Clock, Truck, 
  XCircle, Send, Phone, MapPin, DollarSign, Eye, X,
  ShoppingBag, ShieldCheck, AlertCircle, Sparkles, RefreshCw,
  MessageSquare, FileText
} from "lucide-react";

export default function OrdersView() {
  const { showToast } = useToast();
  const { currentTheme } = useTheme();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusToSet, setStatusToSet] = useState("");
  const [trackingNotes, setTrackingNotes] = useState("");
  const [sendSms, setSendSms] = useState(true);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await api.getOrders({
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        search: searchQuery || undefined,
      });
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders:", err);
      showToast("Error", "Could not load orders", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setStatusToSet(order.order_status);
    setTrackingNotes(order.tracking_notes || "");
    setSendSms(true);
  };

  const handleUpdateStatus = async (newStatus?: string) => {
    if (!selectedOrder) return;
    const targetStatus = newStatus || statusToSet;

    try {
      setIsUpdatingStatus(true);
      const updated = await api.updateOrderStatus(selectedOrder.id, {
        order_status: targetStatus,
        tracking_notes: trackingNotes,
        send_sms_notification: sendSms,
      });

      setOrders(prev => prev.map(o => (o.id === selectedOrder.id ? updated : o)));
      setSelectedOrder(updated);
      showToast("Status Updated", `Order #${updated.order_number} marked as ${targetStatus.toUpperCase()}${sendSms ? " (SMS dispatched)" : ""}`, "success");
    } catch (err: any) {
      console.error("Update order status error:", err);
      showToast("Update Failed", err.message || "Could not update order status", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // KPIs
  const totalRevenue = orders
    .filter(o => o.order_status !== "cancelled")
    .reduce((acc, o) => acc + o.total_amount, 0);
  const pendingCount = orders.filter(o => o.order_status === "pending").length;
  const confirmedCount = orders.filter(o => o.order_status === "confirmed").length;
  const shippedCount = orders.filter(o => o.order_status === "shipped").length;
  const deliveredCount = orders.filter(o => o.order_status === "delivered").length;

  const statuses = [
    { id: "all", label: "All Orders" },
    { id: "pending", label: "Pending" },
    { id: "confirmed", label: "Confirmed" },
    { id: "shipped", label: "Shipped" },
    { id: "delivered", label: "Delivered" },
    { id: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans antialiased">
      {/* Top Header Banner themed dynamically */}
      <div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden transition-all"
        style={{
          backgroundColor: currentTheme.dark_card,
          borderColor: currentTheme.dark_border,
          boxShadow: `0 20px 40px -15px ${currentTheme.primary_color}15`
        }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span 
              className="text-[10px] font-extrabold px-3 py-1 rounded-full border uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
              style={{
                backgroundColor: `${currentTheme.primary_color}15`,
                color: currentTheme.primary_color,
                borderColor: `${currentTheme.primary_color}35`
              }}
            >
              <Sparkles className="w-3 h-3 animate-pulse" />
              {currentTheme.name || "Curated Theme Active"}
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Live SMSMatrix Gateway
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <div 
              className="p-2.5 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: currentTheme.primary_color }}
            >
              <Package className="w-6 h-6" />
            </div>
            <span>E-Commerce Orders & Fulfillment</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl font-medium">
            Real-time multi-channel orders placed via AI Chat Widget, bKash Tokenized Checkout, and Cash on Delivery.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="relative z-10 px-4 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-900 border text-slate-300 hover:text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          style={{ borderColor: currentTheme.dark_border }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </button>

        {/* Ambient background glow matching theme */}
        <div 
          className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: currentTheme.primary_color }}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          className="p-5 rounded-2xl border transition-all"
          style={{ backgroundColor: currentTheme.dark_card, borderColor: currentTheme.dark_border }}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>Total Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            ৳{totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 0 })} <span className="text-xs font-bold text-slate-400">BDT</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Excludes cancelled orders
          </div>
        </div>

        <div 
          className="p-5 rounded-2xl border transition-all"
          style={{ backgroundColor: currentTheme.dark_card, borderColor: currentTheme.dark_border }}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>New Pending Orders</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{pendingCount}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Awaiting merchant verification
          </div>
        </div>

        <div 
          className="p-5 rounded-2xl border transition-all"
          style={{ backgroundColor: currentTheme.dark_card, borderColor: currentTheme.dark_border }}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>In Courier Dispatch</span>
            <Truck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400">{shippedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Dispatched with live SMS tracking
          </div>
        </div>

        <div 
          className="p-5 rounded-2xl border transition-all"
          style={{ backgroundColor: currentTheme.dark_card, borderColor: currentTheme.dark_border }}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>Delivered & Settled</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{deliveredCount}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Successfully completed deliveries
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div 
        className="p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm"
        style={{ backgroundColor: currentTheme.dark_card, borderColor: currentTheme.dark_border }}
      >
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Order #, phone or customer..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-500 outline-none transition-all font-medium"
            style={{ borderColor: currentTheme.dark_border }}
          />
        </form>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {statuses.map(s => {
            const isSelected = selectedStatus === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedStatus(s.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "text-white shadow-md"
                    : "text-slate-400 hover:text-white bg-slate-950/50 hover:bg-slate-900"
                }`}
                style={isSelected ? { backgroundColor: currentTheme.primary_color } : {}}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mb-3" style={{ color: currentTheme.primary_color }} />
          <p className="text-xs font-medium">Fetching orders & tracking statuses...</p>
        </div>
      ) : orders.length === 0 ? (
        <div 
          className="text-center py-20 rounded-3xl border border-dashed p-8"
          style={{ backgroundColor: currentTheme.dark_card, borderColor: currentTheme.dark_border }}
        >
          <div 
            className="p-4 rounded-2xl w-14 h-14 mx-auto mb-3 flex items-center justify-center shadow-lg"
            style={{ backgroundColor: `${currentTheme.primary_color}15`, color: currentTheme.primary_color }}
          >
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No orders found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4 font-medium">
            {searchQuery ? `No orders matching "${searchQuery}".` : "Incoming orders placed via AI Chatbot Widget will appear here in real-time."}
          </p>
        </div>
      ) : (
        <div 
          className="rounded-3xl border overflow-hidden shadow-sm"
          style={{ backgroundColor: currentTheme.dark_card, borderColor: currentTheme.dark_border }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800/80">
                <tr>
                  <th className="px-6 py-4">Order Number</th>
                  <th className="px-6 py-4">Customer Details</th>
                  <th className="px-6 py-4">Delivery Info</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Order Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {orders.map(order => {
                  const isBkash = order.payment_method === "bkash";
                  const isPaid = order.payment_status === "paid";

                  return (
                    <tr key={order.id} className="hover:bg-slate-900/40 transition-colors group">
                      {/* Order Number */}
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-white text-xs flex items-center gap-1.5">
                          <span 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: currentTheme.primary_color }}
                          />
                          <span>{order.order_number}</span>
                        </div>
                        <div className="text-[10.5px] text-slate-500 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>

                      {/* Customer Details */}
                      <td className="px-6 py-4">
                        <div className="text-white font-bold">{order.customer_name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{order.customer_phone}</span>
                        </div>
                      </td>

                      {/* Delivery Info */}
                      <td className="px-6 py-4">
                        <div className="text-slate-300 truncate max-w-xs font-medium">
                          {order.delivery_address}
                        </div>
                        <div className="text-[10.5px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{order.delivery_city} (৳{order.delivery_charge} fee)</span>
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                            isBkash 
                              ? "bg-pink-500/10 text-pink-400 border-pink-500/30"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}>
                            {isBkash ? "bKash Online" : "Cash on Delivery"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10.5px]">
                          <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? "bg-emerald-400" : "bg-slate-500"}`} />
                          <span className={isPaid ? "text-emerald-400 font-bold capitalize" : "text-slate-400 capitalize"}>
                            {order.payment_status}
                          </span>
                          {order.bkash_trx_id && (
                            <span className="font-mono text-[9.5px] text-pink-300">({order.bkash_trx_id})</span>
                          )}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="px-6 py-4">
                        <div className="font-black text-white text-sm">
                          ৳{order.total_amount.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold">BDT</span>
                        </div>
                        <div className="text-[10.5px] text-slate-500">
                          {order.items_json.length} item{order.items_json.length > 1 ? "s" : ""}
                        </div>
                      </td>

                      {/* Order Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          order.order_status === "confirmed" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                          order.order_status === "shipped" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                          order.order_status === "delivered" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          order.order_status === "cancelled" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                          {order.order_status === "confirmed" && <CheckCircle2 className="w-3 h-3" />}
                          {order.order_status === "shipped" && <Truck className="w-3 h-3" />}
                          {order.order_status === "delivered" && <CheckCircle2 className="w-3 h-3" />}
                          {order.order_status === "cancelled" && <XCircle className="w-3 h-3" />}
                          {order.order_status === "pending" && <Clock className="w-3 h-3" />}
                          <span className="capitalize">{order.order_status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenDetails(order)}
                          className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all text-white shadow-md hover:scale-105 ml-auto cursor-pointer"
                          style={{
                            backgroundColor: currentTheme.primary_color,
                            boxShadow: `0 5px 15px -3px ${currentTheme.primary_color}40`
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details & Status Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div 
            className="rounded-3xl border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200"
            style={{ backgroundColor: currentTheme.dark_card, borderColor: currentTheme.dark_border }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span 
                    className="p-2 rounded-xl text-white shadow-md"
                    style={{ backgroundColor: currentTheme.primary_color }}
                  >
                    <Package className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <span>Order #{selectedOrder.order_number}</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-950 border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer & Delivery Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Customer Contact</div>
                <div className="text-sm font-bold text-white">{selectedOrder.customer_name}</div>
                <div className="text-slate-300 font-mono flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedOrder.customer_phone}</span>
                </div>
                {selectedOrder.customer_email && (
                  <div className="text-slate-400">{selectedOrder.customer_email}</div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Delivery Address</div>
                <div className="text-slate-200 font-medium">{selectedOrder.delivery_address}</div>
                <div className="text-emerald-400 font-bold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{selectedOrder.delivery_city} (Charge: ৳{selectedOrder.delivery_charge} BDT)</span>
                </div>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Ordered Products</div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800 font-bold">
                    <tr>
                      <th className="px-4 py-2.5">Item</th>
                      <th className="px-4 py-2.5">Qty</th>
                      <th className="px-4 py-2.5">Unit Price</th>
                      <th className="px-4 py-2.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {selectedOrder.items_json.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-4 py-2.5 text-white font-bold">{item.title}</td>
                        <td className="px-4 py-2.5 text-slate-300">{item.quantity || 1}</td>
                        <td className="px-4 py-2.5 text-slate-300">৳{(item.price || item.unit_price || 0).toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-white">
                          ৳{((item.price || item.unit_price || 0) * (item.quantity || 1)).toLocaleString()} BDT
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-900/40 border-t border-slate-800 font-bold">
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-slate-400 text-right">Delivery Charge:</td>
                      <td className="px-4 py-2 text-right text-white">৳{selectedOrder.delivery_charge} BDT</td>
                    </tr>
                    <tr className="text-sm">
                      <td colSpan={3} className="px-4 py-2.5 text-white text-right font-black">Total Payable:</td>
                      <td className="px-4 py-2.5 text-right text-emerald-400 font-black">
                        ৳{selectedOrder.total_amount.toLocaleString()} BDT
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Status Update Form */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Update Lifecycle Status & Dispatch SMS</span>
                <span className="text-[11px] text-slate-400 font-mono">Current: {selectedOrder.order_status.toUpperCase()}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["confirmed", "shipped", "delivered", "cancelled"].map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleUpdateStatus(st)}
                    disabled={isUpdatingStatus}
                    className={`py-2 px-3 rounded-xl font-bold capitalize transition-all border cursor-pointer ${
                      selectedOrder.order_status === st
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm"
                        : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 hover:text-white"
                    }`}
                  >
                    Mark as {st}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300">Courier / Tracking Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Steadfast Courier Tracking #ST-882910"
                  value={trackingNotes}
                  onChange={e => setTrackingNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-medium outline-none focus:border-indigo-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={sendSms}
                  onChange={e => setSendSms(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-slate-300 font-medium text-xs">
                  Trigger automated SMS dispatch to customer mobile ({selectedOrder.customer_phone}) via SMSMatrix API
                </span>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl border border-slate-800 transition-all text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
