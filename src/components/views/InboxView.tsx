"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  Search, Send, Pause, Play, CheckCircle2, UserCheck, Shield,
  Tag, Plus, X, AlertTriangle, MessageSquare, Phone, Mail, Globe, Sparkles, Filter, RefreshCw,
  Lock, ArrowRightLeft, UserPlus, Eye, Volume2, VolumeX, Bell, Music, Radio
} from "lucide-react";
import { Conversation, Message, ConversationStatus, ConversationPriority, User as TeamUser } from "../../types";
import { api } from "../../lib/api";
import { notificationSound } from "../../lib/notificationSound";
import MarkdownMessage from "../common/MarkdownMessage";

export default function InboxView() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamUser[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  // Sound & Notification Preferences
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">("default");
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  // Role and Account Queue Filters
  const [scope, setScope] = useState<"all" | "mine" | "dept" | "pending" | "unassigned" | "leads" | "resolved">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isWhisperNote, setIsWhisperNote] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [showTagModal, setShowTagModal] = useState(false);

  const isViewer = user?.role === "viewer";
  const selectedIdRef = useRef<string>(selectedId);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    setSoundEnabled(notificationSound.isSoundEnabled());
    setNotifPermission(notificationSound.getNotificationPermission());
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    notificationSound.setSoundEnabled(next);
    showToast(
      next ? "Sound Alerts Enabled" : "Sound Alerts Muted",
      next ? "Crystal-clear harmonic chime will play for incoming customer messages" : "Audio alerts muted for this session",
      "info"
    );
  };

  const handleTestSound = () => {
    notificationSound.playChime(true);
    showToast("🎵 Sound Preview", "Synthesizing high-fidelity harmonic notification chime (Web Audio API)", "info");
  };

  const handleRequestNotif = async () => {
    const perm = await notificationSound.requestNotificationPermission();
    setNotifPermission(perm);
    if (perm === "granted") {
      showToast("Desktop Alerts Active", "You will now receive desktop push alerts when customers message", "success");
      notificationSound.showDesktopNotification("🎉 Desktop Notifications Active", "You will receive instant alerts for live customer inquiries!");
    } else {
      showToast("Permission Blocked", "Please enable notifications in your browser address bar settings", "warning");
    }
  };

  // Load conversations and team members from PostgreSQL on mount
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [convs, members] = await Promise.all([
        api.getConversations(scope),
        api.getTeamMembers().catch(() => [])
      ]);
      if (convs && Array.isArray(convs)) {
        setConversations(convs);
        if (convs.length > 0 && (!selectedId || !convs.some(c => c.id === selectedId))) {
          setSelectedId(convs[0].id);
        }
      }
      if (members && Array.isArray(members)) {
        setTeamMembers(members);
      }
    } catch (e) {
      console.error("Failed to load inbox data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [scope]);

  // Real-time Tenant Inbox WebSocket Stream for instant incoming messages, chime & lead alerts
  useEffect(() => {
    if (!user?.tenant_id) return;
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    function connectInboxWs() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
        const wsBase = process.env.NEXT_PUBLIC_WS_URL || apiUrl.replace("http://", "ws://").replace("https://", "wss://") + "/ws";
        const cleanWsBase = wsBase.endsWith("/ws") ? wsBase : `${wsBase}/ws`;
        ws = new WebSocket(`${cleanWsBase}/inbox/${user?.tenant_id}`);

        ws.onopen = () => {
          setIsLiveConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event === "new_inbox_message") {
              const currSelected = selectedIdRef.current;
              // 1. Play crystal-clear chime if sent by customer / visitor
              if (data.sender_type === "visitor") {
                notificationSound.playChime();
                notificationSound.showDesktopNotification(
                  `💬 ${data.visitor_name || "Customer"} (${data.website_name || "Store"})`,
                  data.content,
                  () => setSelectedId(data.conversation_id)
                );
                showToast(
                  `New Message from ${data.visitor_name || "Customer"}`,
                  data.content.length > 80 ? data.content.slice(0, 77) + "..." : data.content,
                  "info"
                );
              }

              // 2. Update conversation in list (bump to top & update timestamp)
              setConversations((prev) => {
                const existingIndex = prev.findIndex((c) => c.id === data.conversation_id);
                if (existingIndex > -1) {
                  const existing = prev[existingIndex];
                  const updated: Conversation = {
                    ...existing,
                    last_message_at: data.created_at || new Date().toISOString(),
                    unread_count: data.conversation_id === currSelected ? 0 : (existing.unread_count || 0) + 1,
                    is_lead_detected: data.is_lead !== undefined ? data.is_lead : existing.is_lead_detected
                  };
                  const others = prev.filter((_, idx) => idx !== existingIndex);
                  return [updated, ...others];
                } else {
                  loadData();
                  return prev;
                }
              });

              // 3. If viewing this active conversation, append message to thread immediately
              if (data.conversation_id === currSelected) {
                setMessages((prev) => {
                  const exists = prev.some((m) => m.content === data.content && m.sender_type === data.sender_type);
                  if (exists) return prev;
                  const newM: Message = {
                    id: `ws_${Date.now()}`,
                    conversation_id: data.conversation_id,
                    sender_type: data.sender_type,
                    sender_name: data.sender_name || "Customer",
                    content: data.content,
                    created_at: data.created_at || new Date().toISOString(),
                    is_internal_note: false
                  };
                  return [...prev, newM];
                });
              }
            } else if (data.event === "new_conversation") {
              notificationSound.playChime();
              showToast("👋 New Customer Chat", `${data.visitor_name || "Visitor"} started a chat session`, "success");
              loadData();
            }
          } catch (err) {
            console.error("Inbox WebSocket parse error:", err);
          }
        };

        ws.onclose = () => {
          setIsLiveConnected(false);
          reconnectTimeout = setTimeout(connectInboxWs, 4000);
        };
      } catch (err) {
        console.error("Inbox WebSocket connection error:", err);
      }
    }

    connectInboxWs();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [user?.tenant_id]);

  // Load messages when selectedId changes
  useEffect(() => {
    if (!selectedId || selectedId === "empty") return;
    async function loadMessages() {
      setIsMessagesLoading(true);
      try {
        const msgs = await api.getMessages(selectedId);
        if (msgs && Array.isArray(msgs)) {
          setMessages(msgs);
        }
      } catch (e) {
        console.error("Failed to fetch messages for conversation:", e);
      } finally {
        setIsMessagesLoading(false);
      }
    }
    loadMessages();
  }, [selectedId]);

  const activeConv = conversations.find(c => c.id === selectedId) || conversations[0] || {
    id: "empty",
    tenant_id: "",
    visitor_session_id: "none",
    visitor_name: "No conversation selected",
    visitor_company: "None",
    visitor_email: "",
    status: "ai_active" as ConversationStatus,
    priority: "medium" as ConversationPriority,
    department: "Support",
    ai_paused: false,
    is_lead_detected: false,
    tags: [],
    unread_count: 0,
    last_message_at: "",
    created_at: ""
  };

  // Client-side quick filter
  const filteredConversations = conversations.filter(c => {
    if (scope === "mine") return c.assigned_agent_id === user?.id;
    if (scope === "dept") return c.department?.toLowerCase() === (user?.department?.toLowerCase() || "support");
    if (scope === "pending") return c.status === "pending_agent";
    if (scope === "unassigned") return !c.assigned_agent_id;
    if (scope === "leads") return c.is_lead_detected;
    if (scope === "resolved") return c.status === "resolved";

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.visitor_name?.toLowerCase().includes(q) ||
        c.visitor_company?.toLowerCase().includes(q) ||
        c.department?.toLowerCase().includes(q) ||
        c.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) {
      showToast("Permission Denied", "Viewer accounts have read-only access", "error");
      return;
    }
    if (!replyText.trim() || !activeConv.id || activeConv.id === "empty") return;

    const textToSend = replyText.trim();
    const isNote = isWhisperNote;
    setReplyText("");
    setIsWhisperNote(false);

    try {
      const newMsg = await api.sendReply(activeConv.id, textToSend, isNote);
      setMessages(prev => [...prev, newMsg]);

      setConversations(prev =>
        prev.map(c => {
          if (c.id === activeConv.id) {
            return {
              ...c,
              status: isNote ? c.status : "human_active",
              assigned_agent_id: c.assigned_agent_id || user?.id,
              ai_paused: true
            };
          }
          return c;
        })
      );

      showToast(
        isNote ? "Internal whisper note saved" : "Message delivered",
        `Saved directly to PostgreSQL for ${activeConv.visitor_name}`,
        "success"
      );
    } catch (err) {
      console.error("Reply error:", err);
      showToast("Message error", "Could not persist message", "error");
    }
  };

  const handleClaimTicket = async () => {
    if (isViewer || !activeConv.id || activeConv.id === "empty") return;
    try {
      await api.assignAgent(activeConv.id, user?.id);
      setConversations(prev =>
        prev.map(c => (c.id === activeConv.id ? { ...c, assigned_agent_id: user?.id } : c))
      );
      showToast("Ticket Assigned", `Assigned to ${user?.full_name}`, "success");
    } catch (e) {
      console.error(e);
      showToast("Error", "Could not assign ticket", "error");
    }
  };

  const handleAssignAgent = async (agentId: string) => {
    if (isViewer || !activeConv.id || activeConv.id === "empty") return;
    try {
      await api.assignAgent(activeConv.id, agentId || undefined);
      setConversations(prev =>
        prev.map(c => (c.id === activeConv.id ? { ...c, assigned_agent_id: agentId || null } : c))
      );
      const agent = teamMembers.find(m => m.id === agentId);
      showToast("Ticket Assigned", agent ? `Assigned to ${agent.full_name}` : "Assigned to queue", "success");
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeDepartment = async (dept: string) => {
    if (isViewer || !activeConv.id || activeConv.id === "empty") return;
    try {
      await api.updateDepartment(activeConv.id, dept);
      setConversations(prev =>
        prev.map(c => (c.id === activeConv.id ? { ...c, department: dept } : c))
      );
      showToast("Department Routed", `Moved ticket to ${dept}`, "info");
    } catch (e) {
      console.error(e);
    }
  };

  const toggleAI = async () => {
    if (isViewer || !activeConv.id || activeConv.id === "empty") return;
    try {
      const res = await api.toggleAI(activeConv.id);
      setConversations(prev =>
        prev.map(c => {
          if (c.id === activeConv.id) {
            return {
              ...c,
              ai_paused: res.ai_paused,
              status: res.ai_paused ? "human_active" : "ai_active"
            };
          }
          return c;
        })
      );
      showToast(
        res.ai_paused ? "AI Assistant Paused" : "AI Assistant Resumed",
        res.ai_paused ? "Conversation handed over to human support" : "AI Assistant will handle new visitor messages",
        "info"
      );
    } catch (e) {
      console.error("Toggle AI error:", e);
    }
  };

  const handleResolveTicket = async () => {
    if (isViewer || !activeConv.id || activeConv.id === "empty") return;
    const nextStatus = activeConv.status === "resolved" ? "human_active" : "resolved";
    try {
      await api.updateConversationStatus(activeConv.id, nextStatus);
      setConversations(prev =>
        prev.map(c => {
          if (c.id === activeConv.id) {
            return { ...c, status: nextStatus as ConversationStatus };
          }
          return c;
        })
      );
      showToast(
        nextStatus === "resolved" ? "Ticket Resolved" : "Ticket Reopened",
        "Status updated in PostgreSQL database",
        "success"
      );
    } catch (e) {
      console.error(e);
    }
  };

  const assignedMember = teamMembers.find(m => m.id === activeConv.assigned_agent_id);

  return (
    <div className="flex h-[calc(100vh-140px)] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      
      {/* LEFT COLUMN: Role-based Filters & Conversation Queue */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
        
        {/* User Account / Role Badge & Notification Controls */}
        <div className="p-3 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-semibold flex items-center justify-center text-xs uppercase shadow-xs">
                {user?.full_name?.charAt(0) || "U"}
              </div>
              <span
                className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                  isLiveConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
                title={isLiveConnected ? "Live WebSocket Stream Connected" : "Connecting..."}
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 leading-tight">{user?.full_name}</div>
              <div className="text-[10px] text-slate-500 capitalize">{user?.role?.replace("_", " ")} • {user?.department || "Support"}</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Sound Mute / Unmute Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? "Sound Alerts Active (Click to mute)" : "Sound Alerts Muted (Click to unmute)"}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                soundEnabled
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Test Sound Button */}
            <button
              onClick={handleTestSound}
              title="Test notification chime sound"
              className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
            >
              <Music className="w-3.5 h-3.5" />
            </button>

            {/* Desktop Notification Request */}
            {notifPermission !== "granted" && (
              <button
                onClick={handleRequestNotif}
                title="Enable browser desktop notifications"
                className="p-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-lg transition-colors cursor-pointer animate-pulse"
              >
                <Bell className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Refresh */}
            <button onClick={loadData} title="Refresh conversations" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Role & Account Scope Selector Tabs */}
        <div className="p-2 border-b border-slate-200 bg-white">
          <div className="grid grid-cols-3 gap-1 text-[11px] font-medium">
            <button
              onClick={() => setScope("all")}
              className={`py-1 px-2 rounded-lg transition-all text-center cursor-pointer ${
                scope === "all" ? "bg-blue-600 text-white font-semibold" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setScope("mine")}
              className={`py-1 px-2 rounded-lg transition-all text-center cursor-pointer ${
                scope === "mine" ? "bg-blue-600 text-white font-semibold" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              My Queue
            </button>
            <button
              onClick={() => setScope("dept")}
              className={`py-1 px-2 rounded-lg transition-all text-center cursor-pointer ${
                scope === "dept" ? "bg-blue-600 text-white font-semibold" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              My Dept
            </button>
            <button
              onClick={() => setScope("pending")}
              className={`py-1 px-2 rounded-lg transition-all text-center cursor-pointer ${
                scope === "pending" ? "bg-amber-600 text-white font-semibold" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Escalations
            </button>
            <button
              onClick={() => setScope("leads")}
              className={`py-1 px-2 rounded-lg transition-all text-center cursor-pointer ${
                scope === "leads" ? "bg-emerald-600 text-white font-semibold" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Leads
            </button>
            <button
              onClick={() => setScope("unassigned")}
              className={`py-1 px-2 rounded-lg transition-all text-center cursor-pointer ${
                scope === "unassigned" ? "bg-slate-800 text-white font-semibold" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Unassigned
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-200 bg-white">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search visitor, tag, dept..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
          {isLoading ? (
            <div className="p-6 text-center text-xs text-slate-400">Loading queue from PostgreSQL...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">No conversations in this queue.</div>
          ) : (
            filteredConversations.map(conv => {
              const isSelected = conv.id === selectedId;
              const isMine = conv.assigned_agent_id === user?.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setSelectedId(conv.id);
                    if (conv.unread_count) {
                      setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c));
                    }
                  }}
                  className={`p-3.5 cursor-pointer transition-colors border-l-4 ${
                    isSelected
                      ? "bg-blue-50/50 border-l-blue-600"
                      : "hover:bg-slate-100/80 border-l-transparent"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                      {conv.unread_count ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      ) : null}
                      <span className="font-semibold text-xs text-slate-900 truncate">
                        {conv.visitor_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {conv.unread_count ? (
                        <span className="px-1.5 py-0.5 bg-emerald-600 text-white font-bold text-[9px] rounded-full">
                          {conv.unread_count}
                        </span>
                      ) : null}
                      <span className="text-[10px] text-slate-400">
                        {conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-200/80 text-slate-700">
                      {conv.department || "Support"}
                    </span>

                    {conv.status === "pending_agent" && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-amber-100 text-amber-800">
                        Escalated
                      </span>
                    )}

                    {conv.is_lead_detected && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800">
                        Lead
                      </span>
                    )}

                    {isMine && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-blue-100 text-blue-800">
                        Assigned to Me
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1 leading-snug">
                    {conv.ai_summary || "Active session with AI assistant"}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CENTER & RIGHT: Active Conversation Thread & Sidebar */}
      <div className="flex-1 flex flex-col bg-white">
        
        {/* Top Control Bar: Agent Assignment, Department, AI Controller */}
        <div className="p-3.5 px-6 border-b border-slate-200 flex items-center justify-between bg-white z-10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900">{activeConv.visitor_name}</h3>
              <span className="text-xs text-slate-400 font-normal">({activeConv.visitor_company || "Direct Storefront"})</span>
              
              {/* Department Selector */}
              <select
                disabled={isViewer}
                value={activeConv.department || "Support"}
                onChange={e => handleChangeDepartment(e.target.value)}
                className="text-[11px] font-semibold bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-lg outline-none cursor-pointer hover:border-slate-300"
              >
                <option value="Support">Support</option>
                <option value="Sales">Sales</option>
                <option value="Technical">Technical</option>
                <option value="Billing">Billing</option>
              </select>
            </div>

            {/* Sub-status and Assigned Agent */}
            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
              <span>Assigned: <strong className="text-slate-800 font-semibold">{assignedMember?.full_name || (activeConv.assigned_agent_id === user?.id ? "Me (" + user?.full_name + ")" : "Unassigned Queue")}</strong></span>
              <span>•</span>
              <span>Sentiment: <strong className={Number(activeConv.last_sentiment_score) > 0 ? "text-emerald-600" : "text-slate-600"}>{Number(activeConv.last_sentiment_score) > 0 ? `Positive (+${activeConv.last_sentiment_score})` : `Neutral (${activeConv.last_sentiment_score ?? 0.0})`}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Claim / Assign Dropdown */}
            {!isViewer && (
              <>
                {activeConv.assigned_agent_id !== user?.id ? (
                  <button
                    onClick={handleClaimTicket}
                    className="px-3 py-1.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Claim Ticket
                  </button>
                ) : null}

                {teamMembers.length > 0 && (
                  <select
                    value={activeConv.assigned_agent_id || ""}
                    onChange={e => handleAssignAgent(e.target.value)}
                    className="text-xs bg-white border border-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg outline-none cursor-pointer hover:border-slate-300 shadow-xs"
                  >
                    <option value="">Assign Agent...</option>
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} ({m.department || m.role})
                      </option>
                    ))}
                  </select>
                )}
              </>
            )}

            {/* AI Pause / Resume Controller */}
            {!isViewer && (
              <button
                onClick={toggleAI}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  !activeConv.ai_paused
                    ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                }`}
              >
                {!activeConv.ai_paused ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {!activeConv.ai_paused ? "Pause AI" : "Resume AI"}
              </button>
            )}

            {/* Resolve / Reopen */}
            {!isViewer && (
              <button
                onClick={handleResolveTicket}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeConv.status === "resolved"
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                }`}
              >
                {activeConv.status === "resolved" ? "Reopen" : "Resolve"}
              </button>
            )}
          </div>
        </div>

        {/* Read-Only Banner for Viewer Role */}
        {isViewer && (
          <div className="bg-amber-50 border-b border-amber-200 p-2.5 px-6 flex items-center gap-2 text-xs text-amber-800">
            <Eye className="w-4 h-4 text-amber-600" />
            <span><strong>Viewer Read-Only Mode:</strong> Your role has read permissions. Ticket modifications and replies are restricted.</span>
          </div>
        )}

        {/* Message Thread Scroll View */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#F6F8F6] custom-scrollbar">
          {isMessagesLoading ? (
            <div className="p-12 text-center text-xs text-[#759B87]">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#759B87]">No messages in this thread yet.</div>
          ) : (
            messages.map(m => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender_type === "visitor"
                    ? "items-start"
                    : m.sender_type === "system"
                    ? "items-center"
                    : "items-end"
                }`}
              >
                {m.sender_type === "system" ? (
                  <div className="my-2 bg-amber-50 border border-amber-200 text-amber-900 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    {m.content}
                  </div>
                ) : m.is_internal_note ? (
                  <div className="w-full max-w-lg bg-yellow-50/90 border border-yellow-200 p-3.5 rounded-xl text-xs text-yellow-900">
                    <div className="font-semibold flex items-center gap-1.5 mb-1 text-yellow-800">
                      <Lock className="w-3.5 h-3.5" /> {m.sender_name || "Internal Note"}
                    </div>
                    <MarkdownMessage content={m.content} />
                  </div>
                ) : (
                  <div className="max-w-lg">
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        m.sender_type === "visitor"
                          ? "bg-white text-[#0F1713] border border-[#CBD7D0] rounded-bl-xs shadow-xs"
                          : m.sender_type === "ai"
                          ? "bg-[#080D0A] text-white rounded-br-xs shadow-xs border border-[#17271F]"
                          : "bg-[#008750] text-white rounded-br-xs shadow-xs"
                      }`}
                    >
                      <div className="font-semibold text-[10px] mb-1 opacity-80 flex items-center justify-between gap-2">
                        <span>{m.sender_type === "visitor" ? activeConv.visitor_name : m.sender_type === "ai" ? "AI Assistant" : (m.sender_name || user?.full_name)}</span>
                        {m.latency_ms ? <span className="font-mono text-[9px] opacity-70">{m.latency_ms}ms</span> : null}
                      </div>
                      <MarkdownMessage
                        content={m.content}
                        isDark={m.sender_type === "ai" || m.sender_type === "agent"}
                      />
                      {/* WhatsApp / Telegram Style Date & Time Indicator */}
                      <div className={`flex items-center justify-end gap-1.5 text-[9.5px] mt-2 pt-1 border-t ${
                        m.sender_type === "visitor" ? "border-slate-100 text-slate-400" : "border-white/10 text-white/70"
                      }`}>
                        <span>
                          {m.created_at ? (
                            new Date(m.created_at).toDateString() === new Date().toDateString()
                              ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : `${new Date(m.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          ) : "Just now"}
                        </span>
                        {m.sender_type !== "visitor" && (
                          <span className="text-[10px] text-emerald-400 font-mono font-bold">✓✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Reply Composer Form */}
        {!isViewer && (
          <div className="p-4 border-t border-[#E1E8E4] bg-white">
            <form onSubmit={handleSendReply} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-[#263D31]">
                    <input
                      type="checkbox"
                      checked={isWhisperNote}
                      onChange={e => setIsWhisperNote(e.target.checked)}
                      className="rounded text-[#00C978] focus:ring-0 cursor-pointer"
                    />
                    <Lock className="w-3.5 h-3.5 text-amber-600" /> Internal Note (Hidden from visitor)
                  </label>
                </div>
                <span className="text-[11px] text-[#759B87]">Markdown supported</span>
              </div>

              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={isWhisperNote ? "Add internal note for team members..." : "Reply as human agent to visitor..."}
                  className={`flex-1 p-3 border rounded-xl text-xs outline-none focus:border-[#00C978] focus:ring-1 focus:ring-[#00C978] resize-none transition-colors ${
                    isWhisperNote ? "bg-yellow-50/60 border-yellow-300 text-yellow-950" : "bg-[#F4F7F5] border-[#CBD7D0] text-[#0F1713]"
                  }`}
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className={`px-5 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    !replyText.trim()
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : isWhisperNote
                      ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                      : "bg-[#00C978] hover:bg-[#00B36B] text-[#080D0A]"
                  }`}
                >
                  <Send className="w-4 h-4" /> {isWhisperNote ? "Save Note" : "Send"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
