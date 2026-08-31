"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
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

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isResendingSms, setIsResendingSms] = useState(false);
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

  const handleResendSms = async () => {
    if (!selectedOrder) return;
    setIsResendingSms(true);
    try {
      const res = await api.resendOrderSms(selectedOrder.id);
      if (res.status === "success") {
        showToast("SMS Resent", `Order confirmation SMS successfully dispatched to ${selectedOrder.customer_phone}!`, "success");
        setSelectedOrder(prev => prev ? { ...prev, sms_sent: true, tracking_notes: `SMS resent to ${selectedOrder.customer_phone}` } : null);
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, sms_sent: true } : o));
      } else {
        showToast("SMS Failed", res.sms_response?.error || "Could not resend SMS. Check gateway balance.", "error");
      }
    } catch (err: any) {
      showToast("Resend Failed", err.message || "Failed to resend SMS", "error");
    } finally {
      setIsResendingSms(false);
    }
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

  const statuses = [
    { id: "all", label: "All Orders" },
    { id: "pending", label: "Pending" },
    { id: "confirmed", label: "Confirmed" },
    { id: "shipped", label: "In Dispatch" },
    { id: "delivered", label: "Delivered" },
    { id: "cancelled", label: "Cancelled" },
  ];

  // Calculate Metrics
  const totalRevenue = orders
    .filter(o => o.order_status !== "cancelled")
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const pendingCount = orders.filter(o => o.order_status === "pending").length;
  const shippedCount = orders.filter(o => o.order_status === "shipped").length;
  const deliveredCount = orders.filter(o => o.order_status === "delivered").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-slate-900">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              E-Commerce Orders & Fulfillment
            </h1>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Real-Time
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time orders placed via AI Chat Widget, bKash Direct Checkout, EPS Multi-Channel, and Cash on Delivery.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>Total Store Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">
            ৳{totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 0 })} <span className="text-xs font-normal text-slate-500">BDT</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Excludes cancelled orders</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>Pending Orders</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-600 font-mono">{pendingCount}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Awaiting merchant dispatch</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>In Courier Dispatch</span>
            <Truck className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-cyan-600 font-mono">{shippedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Dispatched with couriers</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>Delivered & Settled</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 font-mono">{deliveredCount}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Successfully completed</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order #, phone or customer..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium"
          />
        </form>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1.5 md:pb-0 custom-scrollbar-horizontal flex-nowrap sm:flex-wrap">
          {statuses.map(s => {
            const isSelected = selectedStatus === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedStatus(s.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/60"
                }`}
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
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-xs font-medium">Fetching orders & tracking statuses...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-white border border-slate-200 border-dashed p-8">
          <div className="p-4 rounded-2xl w-14 h-14 mx-auto mb-3 flex items-center justify-center bg-indigo-50 text-indigo-600">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No orders found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4 font-medium">
            {searchQuery ? `No orders matching "${searchQuery}".` : "Incoming orders placed via AI Chatbot Widget will appear here in real-time."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4">Order Number</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Ordered Items</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">SMS Status</th>
                  <th className="px-5 py-4">Total Amount</th>
                  <th className="px-5 py-4">Order Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {orders.map(order => {
                  const isBkash = order.payment_method === "bkash";
                  const isEps = order.payment_method === "eps";
                  const isPaid = order.payment_status === "paid";
                  const firstItem = order.items_json && order.items_json.length > 0 ? order.items_json[0] : null;
                  const moreItemsCount = order.items_json ? order.items_json.length - 1 : 0;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Order Number */}
                      <td className="px-5 py-4">
                        <div className="font-mono font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-600" />
                          <span>{order.order_number}</span>
                        </div>
                        <div className="text-[10.5px] text-slate-500 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>

                      {/* Customer Details */}
                      <td className="px-5 py-4">
                        <div className="text-slate-900 font-bold">{order.customer_name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{order.customer_phone}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5" />
                          <span>{order.delivery_city}</span>
                        </div>
                      </td>

                      {/* Ordered Items Preview */}
                      <td className="px-5 py-4">
                        {firstItem ? (
                          <div className="flex items-center gap-2 max-w-[200px]">
                            {firstItem.image_url ? (
                              <img 
                                src={firstItem.image_url} 
                                alt={firstItem.title} 
                                className="w-8 h-8 rounded-lg object-cover border border-slate-200 bg-slate-50 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-400">
                                <ShoppingBag className="w-4 h-4" />
                              </div>
                            )}
                            <div className="truncate">
                              <div className="text-slate-900 font-bold text-[11.5px] truncate">{firstItem.title}</div>
                              <div className="text-[10.5px] text-slate-500 flex items-center gap-1.5">
                                <span>Qty: {firstItem.quantity || 1}</span>
                                {moreItemsCount > 0 && (
                                  <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded text-[9.5px] font-bold border border-slate-200">
                                    +{moreItemsCount} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No items data</span>
                        )}
                      </td>

                      {/* Payment */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                            isEps
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isBkash 
                                ? "bg-pink-50 text-[#E2136E] border-pink-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {isEps ? "EPS Multi-Channel" : isBkash ? "bKash Direct" : "Cash on Delivery"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10.5px]">
                          <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? "bg-emerald-500" : "bg-slate-400"}`} />
                          <span className={isPaid ? "text-emerald-700 font-bold capitalize" : "text-slate-500 capitalize"}>
                            {order.payment_status}
                          </span>
                          {order.bkash_trx_id && (
                            <span className="font-mono text-[9.5px] text-slate-600 truncate max-w-[80px]">({order.bkash_trx_id})</span>
                          )}
                        </div>
                      </td>

                      {/* SMS Status */}
                      <td className="px-5 py-4">
                        {order.sms_sent ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Send className="w-2.5 h-2.5" />
                            <span>SMS Sent</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            <Clock className="w-2.5 h-2.5" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 text-xs font-mono">
                          ৳{order.total_amount.toLocaleString()} <span className="text-[10px] text-slate-500 font-sans">BDT</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          (Delivery: ৳{order.delivery_charge})
                        </div>
                      </td>

                      {/* Order Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          order.order_status === "confirmed" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          order.order_status === "shipped" ? "bg-cyan-50 text-cyan-700 border-cyan-200" :
                          order.order_status === "delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          order.order_status === "cancelled" ? "bg-red-50 text-red-700 border-red-200" :
                          "bg-amber-50 text-amber-700 border-amber-200"
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
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleOpenDetails(order)}
                          className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 ml-auto cursor-pointer"
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Package className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">Order #{selectedOrder.order_number}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                      selectedOrder.order_status === "confirmed" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      selectedOrder.order_status === "shipped" ? "bg-cyan-50 text-cyan-700 border-cyan-200" :
                      selectedOrder.order_status === "delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      selectedOrder.order_status === "cancelled" ? "bg-red-50 text-red-700 border-red-200" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {selectedOrder.order_status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer & Delivery Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Customer Contact</div>
                <div className="text-sm font-bold text-slate-900">{selectedOrder.customer_name}</div>
                <div className="text-slate-700 font-mono flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedOrder.customer_phone}</span>
                </div>
                {selectedOrder.customer_email && (
                  <div className="text-slate-500">{selectedOrder.customer_email}</div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Delivery Address</div>
                <div className="text-slate-800 font-medium">{selectedOrder.delivery_address}</div>
                <div className="text-emerald-700 font-bold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{selectedOrder.delivery_city} (Fee: ৳{selectedOrder.delivery_charge} BDT)</span>
                </div>
              </div>
            </div>

            {/* Ordered Products */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Ordered Products ({selectedOrder.items_json.length})</span>
                <span className="text-[11px] text-slate-500 font-mono">Subtotal: ৳{selectedOrder.subtotal_amount.toLocaleString()} BDT</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {selectedOrder.items_json.map((item: any, idx: number) => {
                    const unitPrice = item.price || item.unit_price || 0;
                    const qty = item.quantity || 1;
                    const lineTotal = unitPrice * qty;

                    return (
                      <div key={idx} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-all">
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.title} 
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-50 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                              <ShoppingBag className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{item.title}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>৳{unitPrice.toLocaleString()} BDT</span>
                              <span>×</span>
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-bold text-[10px] border border-slate-200">Qty: {qty}</span>
                              {item.selected_size && (
                                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[10px]">Size: {item.selected_size}</span>
                              )}
                              {item.selected_color && (
                                <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px]">Color: {item.selected_color}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right font-mono font-bold text-slate-900 text-xs">
                          ৳{lineTotal.toLocaleString()} BDT
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="bg-slate-50 p-3.5 border-t border-slate-200 flex flex-col gap-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Products Subtotal:</span>
                    <span className="font-mono">৳{selectedOrder.subtotal_amount.toLocaleString()} BDT</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Delivery Charge ({selectedOrder.delivery_city}):</span>
                    <span className="font-mono">৳{selectedOrder.delivery_charge} BDT</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200 font-mono">
                    <span>Total Payable:</span>
                    <span className="text-emerald-700">৳{selectedOrder.total_amount.toLocaleString()} BDT</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SMS Notification Audit Trail */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900 text-xs">Automated SMS Notification</span>
                </div>
                {selectedOrder.sms_sent ? (
                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Delivered to {selectedOrder.customer_phone}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-50 text-amber-700 border border-amber-200">
                    Pending Dispatch
                  </span>
                )}
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-1">
                <div className="text-[10px] text-slate-400 font-bold uppercase">SMS Content Template:</div>
                <p className="font-sans italic text-slate-600">
                  &ldquo;Dear {selectedOrder.customer_name}, your order #{selectedOrder.order_number} for ৳{selectedOrder.total_amount.toLocaleString()} BDT is placed at Padma Mart! Thank you for shopping with us.&rdquo;
                </p>
                {selectedOrder.tracking_notes && (
                  <div className="text-[10px] text-emerald-700 pt-1 font-mono">
                    Log: {selectedOrder.tracking_notes}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleResendSms}
                  disabled={isResendingSms}
                  className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  <span>{isResendingSms ? "Resending SMS..." : "Resend Confirmation SMS"}</span>
                </button>
              </div>
            </div>

            {/* Status Update Form */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Update Lifecycle Status & Dispatch SMS</span>
                <span className="text-[11px] text-slate-500 font-mono">Current: {selectedOrder.order_status.toUpperCase()}</span>
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
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    Mark as {st}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">Courier / Tracking Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Steadfast Courier Tracking #ST-882910"
                  value={trackingNotes}
                  onChange={e => setTrackingNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium outline-none focus:border-indigo-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={sendSms}
                  onChange={e => setSendSms(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 accent-indigo-600"
                />
                <span className="text-slate-600 font-medium text-xs">
                  Trigger automated status update SMS to customer ({selectedOrder.customer_phone})
                </span>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 transition-all text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
