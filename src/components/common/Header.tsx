"use client";

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { Search, Bell, LogOut, User } from "lucide-react";

interface HeaderProps {
  onOpenNotifications?: () => void;
  activeNav: string;
}

export default function Header({ onOpenNotifications, activeNav }: HeaderProps) {
  const { user, logout } = useAuth();
  const { currentTheme } = useTheme();
  const { showToast } = useToast();
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = [
    { id: 1, title: "Handover Request", desc: "Customer requested human support in Customer Support queue", time: "2m ago", unread: true },
    { id: 2, title: "Token Quota Update", desc: "You have consumed 1.86M of monthly tokens", time: "1h ago", unread: false },
    { id: 3, title: "Knowledge Base Indexed", desc: "Pricing & Product Guide indexed successfully", time: "3h ago", unread: false }
  ];

  const handleLogout = () => {
    logout();
    showToast("Signed out", "You have been logged out successfully", "info");
  };

  return (
    <header className="h-16 bg-white border-b border-[#E1E8E4] px-6 flex items-center justify-between shrink-0 relative z-30">
      
      {/* Left: Global Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#759B87] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search conversations, customers, documents..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F4F7F5] hover:bg-[#EBF2EE] border border-[#CBD7D0] rounded-lg outline-none focus:bg-white focus:border-[#00C978] focus:ring-1 focus:ring-[#00C978] transition-all text-[#0F1713] placeholder:text-[#759B87]"
          />
        </div>
      </div>

      {/* Right: Notifications & User Menu */}
      <div className="flex items-center gap-3">
        
        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span
              className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
              style={{ backgroundColor: currentTheme.primary_color }}
            ></span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#CBD7D0] p-2 z-50 animate-in fade-in">
              <div className="px-3 py-2 text-[11px] font-semibold text-[#0F1713] border-b border-[#E1E8E4] flex items-center justify-between">
                <span>Notifications</span>
                <span className="text-[10px] text-[#008750] font-medium cursor-pointer">Mark all as read</span>
              </div>
              <div className="divide-y divide-[#E1E8E4] max-h-72 overflow-y-auto custom-scrollbar">
                {notifications.map((n) => (
                  <div key={n.id} className={`p-2.5 text-xs rounded-lg transition-colors ${n.unread ? "bg-[#F4F7F5]" : ""}`}>
                    <div className="font-semibold text-[#0F1713] flex items-center justify-between">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-[#759B87] font-normal">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[#4F7863] mt-0.5 leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
