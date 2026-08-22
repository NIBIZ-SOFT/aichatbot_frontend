"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import {
  Search, Bell, Check, CheckCheck, Trash2, ExternalLink,
  ShoppingBag, MessageSquare, Zap, Cpu, Activity, Clock, X, Menu
} from "lucide-react";
import { api } from "../../lib/api";

interface HeaderProps {
  onOpenNotifications?: () => void;
  activeNav: string;
  onToggleMobileNav?: () => void;
}

export default function Header({ onOpenNotifications, activeNav, onToggleMobileNav }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { currentTheme } = useTheme();
  const { showToast } = useToast();

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch {
      // Silent error in background polling
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 25000); // 25s auto-poll
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      showToast("All Read", "All notifications marked as read.", "success");
    } catch (err: any) {
      showToast("Error", err.message || "Failed to mark as read", "error");
    }
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.is_read) {
      try {
        await api.markNotificationRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
      } catch {
        // Continue navigation
      }
    }
    setNotifOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation();
    try {
      await api.deleteNotification(notifId);
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    } catch (err: any) {
      showToast("Error", err.message || "Failed to delete notification", "error");
    }
  };

  const handleClearAllRead = async () => {
    try {
      await api.clearAllNotifications();
      setNotifications((prev) => prev.filter((n) => !n.is_read));
      showToast("Cleared", "Read notifications cleared.", "info");
    } catch (err: any) {
      showToast("Error", err.message || "Failed to clear notifications", "error");
    }
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return "just now";
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return "just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };

  const getIconForType = (type?: string) => {
    switch (type) {
      case "order":
        return <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />;
      case "handover":
        return <MessageSquare className="w-3.5 h-3.5 text-rose-600" />;
      case "billing":
        return <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />;
      case "knowledge":
        return <Cpu className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === "unread") return !n.is_read;
    if (filterType === "order") return n.type === "order";
    if (filterType === "handover") return n.type === "handover";
    return true;
  });

  return (
    <header className="h-16 bg-white border-b border-[#E1E8E4] px-4 sm:px-6 flex items-center justify-between shrink-0 relative z-30 font-sans gap-3">
      
      {/* Left: Mobile Toggle & Global Search Bar */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-md min-w-0">
        {onToggleMobileNav && (
          <button
            type="button"
            onClick={onToggleMobileNav}
            className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all lg:hidden cursor-pointer shrink-0"
            title="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
        )}

        <div className="relative w-full min-w-0">
          <Search className="w-4 h-4 text-[#759B87] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search conversations, orders..."
            className="w-full pl-9 pr-3 sm:pr-4 py-1.5 text-xs bg-[#F4F7F5] hover:bg-[#EBF2EE] border border-[#CBD7D0] rounded-xl outline-hidden focus:bg-white focus:border-[#00C978] focus:ring-1 focus:ring-[#00C978] transition-all text-[#0F1713] placeholder:text-[#759B87] truncate"
          />
        </div>
      </div>

      {/* Right: Notifications & User Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* Real-Time Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer shadow-xs border border-transparent hover:border-slate-200"
            title="Notifications & Live Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full text-[9px] font-black text-white flex items-center justify-center shadow-xs animate-pulse"
                style={{ backgroundColor: currentTheme.primary_color || "#00C978" }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto right-2 sm:right-0 top-18 sm:top-auto sm:mt-2 w-auto sm:w-96 max-w-[calc(100vw-1rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 p-0 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
              
              {/* Header */}
              <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs">Live Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.2 rounded-full font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[10.5px] text-slate-300 hover:text-emerald-400 font-medium transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200/80 text-[11px] overflow-x-auto">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterType === "all" ? "bg-white text-slate-900 shadow-xs border border-slate-200" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilterType("unread")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterType === "unread" ? "bg-white text-slate-900 shadow-xs border border-slate-200" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  onClick={() => setFilterType("order")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterType === "order" ? "bg-white text-emerald-700 shadow-xs border border-slate-200" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setFilterType("handover")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterType === "handover" ? "bg-white text-rose-700 shadow-xs border border-slate-200" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Support
                </button>
              </div>

              {/* Notifications List */}
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto custom-scrollbar">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <Bell className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
                    <p className="text-xs font-medium">No notifications in this view</p>
                    <p className="text-[10px] text-slate-400">All customer alerts and updates will appear here</p>
                  </div>
                ) : (
                  filteredNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 text-xs transition-all flex items-start gap-3 hover:bg-slate-50 cursor-pointer group relative ${
                        !n.is_read ? "bg-indigo-50/40" : "bg-white"
                      }`}
                    >
                      {/* Icon */}
                      <div className="p-2 rounded-xl bg-slate-100 border border-slate-200/80 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        {getIconForType(n.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-xs truncate ${!n.is_read ? "font-black text-slate-900" : "font-semibold text-slate-700"}`}>
                            {n.title}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {formatRelativeTime(n.created_at)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                          {n.message}
                        </p>
                      </div>

                      {/* Delete Action Button on Hover */}
                      <button
                        onClick={(e) => handleDeleteNotification(e, n.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all absolute right-2 top-3"
                        title="Dismiss notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Unread Indicator Dot */}
                      {!n.is_read && (
                        <span
                          className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: currentTheme.primary_color || "#00C978" }}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.some((n) => n.is_read) && (
                <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10.5px]">
                  <span className="text-slate-400">Live Workspace Sync Active</span>
                  <button
                    onClick={handleClearAllRead}
                    className="text-slate-500 hover:text-rose-600 font-medium transition-colors cursor-pointer"
                  >
                    Clear read notifications
                  </button>
                </div>
              )}

            </div>
          )}
        </div>

      </div>

    </header>
  );
}

