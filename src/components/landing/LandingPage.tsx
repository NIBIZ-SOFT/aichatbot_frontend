"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "../../context/ThemeContext";
import PricingModal from "../auth/PricingModal";
import MarkdownMessage from "../common/MarkdownMessage";
import { api } from "../../lib/api";
import {
  Layers, MessageSquare, Bot, Sparkles, CheckCircle2,
  ArrowRight, ShieldCheck, Zap, Globe, Cpu, ChevronRight,
  TrendingUp, Users, Smartphone, FileText, Lock, Headphones,
  Star, DollarSign, Calculator, HelpCircle, ChevronDown, ChevronUp,
  Play, Send, RefreshCw, Eye, Award, Check, Maximize2, Minimize2, X
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { currentTheme } = useTheme();

  const [showPricingModal, setShowPricingModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [activeFeatureTab, setActiveFeatureTab] = useState<"rag" | "inbox" | "bkash" | "security">("rag");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Dynamic injection for Platform Super Admin Live Chat Widget CDN script
  useEffect(() => {
    const scriptId = "platform-superadmin-chat-widget";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || "http://127.0.0.1:8000";
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
      script.src = `${baseUrl}/static/widget.js`;
      script.setAttribute("data-widget-key", "wgt_platform_live_support");
      script.setAttribute("data-api-url", apiUrl);
      script.setAttribute("data-primary-color", currentTheme.primary_color || "#00C978");
      script.setAttribute("data-position", "bottom-right");
      script.async = true;
      document.body.appendChild(script);
    }

    // Handle Escape key to exit fullscreen
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTheme.primary_color]);

  // Interactive Live Chat Simulator State connected to live AI backend
  const [simMessages, setSimMessages] = useState<Array<{
    sender: "user" | "ai";
    text: string;
    time: string;
    latency_ms?: number;
    sentiment?: string;
    rag_doc?: string;
  }>>([
    {
      sender: "ai",
      text: "👋 **Welcome to our Live AI Solution Sandbox!**\n\nI am the official autonomous AI assistant for this platform. Ask me anything about:\n- 🌐 **1-Line JavaScript Website Live Chatbot**\n- 📚 **Dynamic RAG Knowledge Ingestion** (PDF, Docs & URL Crawling)\n- 👥 **Live Support Inbox & 1-Click Human Handover**\n- 💳 **bKash PGW Billing & Pricing in ৳ BDT**\n\n*Type any question below or click a sample inquiry!*",
      time: "10:00 AM",
      latency_ms: 120,
      sentiment: "Positive (High Intent)",
      rag_doc: "platform_services_guide.pdf (Score: 0.98)"
    }
  ]);
  const [simInput, setSimInput] = useState("");
  const [isSimTyping, setIsSimTyping] = useState(false);
  const [liveSentiment, setLiveSentiment] = useState("Positive (High Intent)");
  const [liveRagDoc, setLiveRagDoc] = useState("platform_services_guide.pdf");
  const [liveLatency, setLiveLatency] = useState(145);

  // ROI Calculator State
  const [monthlyChats, setMonthlyChats] = useState(3000);

  // FAQ open states
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSimSend = async (textToSend?: string) => {
    const query = textToSend || simInput;
    if (!query.trim() || isSimTyping) return;

    const userMsg = {
      sender: "user" as const,
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setSimMessages(prev => [...prev, userMsg]);
    if (!textToSend) setSimInput("");
    setIsSimTyping(true);

    try {
      const history = simMessages.map(m => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      }));

      const res = await api.sendPublicDemoChat(query, history);

      if (res.sentiment) setLiveSentiment(res.sentiment);
      if (res.rag_document) setLiveRagDoc(res.rag_document);
      if (res.latency_ms) setLiveLatency(res.latency_ms);

      const aiMsg = {
        sender: "ai" as const,
        text: res.reply || "Thank you for asking! How else can I assist you with our AI Platform today?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latency_ms: res.latency_ms,
        sentiment: res.sentiment,
        rag_doc: res.rag_document
      };

      setSimMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const q = query.toLowerCase();
      let fallbackText = "Our platform delivers **Autonomous Website Live Chatbots**, **Instant RAG Knowledge Indexing**, and **native bKash payments** in Bangladeshi Taka.";
      if (q.includes("price") || q.includes("cost") || q.includes("taka") || q.includes("plan")) {
        fallbackText = "### 💳 Available Subscription Packages:\n- **Starter**: ৳4,990/month (500k AI Tokens, 1 Website, 2 Seats)\n- **Professional**: ৳14,990/month (2M AI Tokens, 3 Websites, 10 Seats)\n- **Enterprise**: ৳34,990/month (10M AI Tokens, Unlimited Websites, 25 Seats)\n\n*Use promo code `EIDMEGA50` at checkout for 50% discount!*";
      } else if (q.includes("bangla") || q.includes("বাংলা")) {
        fallbackText = "হ্যাঁ, আমাদের অটোনোমাস এআই সম্পূর্ণ **প্রফেশনাল বাংলা, ইংরেজি এবং বাংলিশ** (Phonetic) উভয় ভাষাতেই সাবলীলভাবে চ্যাট ও অর্ডার প্রসেস করতে সক্ষম।";
      }

      const fallbackMsg = {
        sender: "ai" as const,
        text: fallbackText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latency_ms: 180,
        sentiment: "Positive",
        rag_doc: "platform_services_guide.pdf"
      };
      setSimMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsSimTyping(false);
    }
  };

  // Pricing calculations
  const calculatePrice = (monthly: number, annual: number) => {
    return billingCycle === "annual" ? annual : monthly;
  };

  return (
    <div
      className="min-h-screen font-sans text-slate-900 selection:text-white"
      style={{
        backgroundColor: currentTheme.light_bg,
        // @ts-ignore
        "--selection-color": currentTheme.primary_color
      }}
    >
      {/* Self-Serve Pricing & Checkout Modal */}
      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />

      {/* ========================================================================= */}
      {/* 1. TOP NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-md transition-colors"
        style={{
          backgroundColor: `${currentTheme.dark_surface}F2`,
          borderColor: currentTheme.dark_border
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Platform Name */}
          <Link href="/" className="flex items-center gap-3 group">
            {currentTheme.logo_url ? (
              <img src={currentTheme.logo_url} alt="Logo" className="h-9 w-auto max-w-[120px] object-contain rounded-xl shadow-md transition-transform group-hover:scale-105" />
            ) : (
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center font-bold text-white shadow-md transition-transform group-hover:scale-105 shrink-0"
                style={{ backgroundColor: currentTheme.primary_color }}
              >
                <Layers className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <div className="font-extrabold text-white text-base tracking-tight flex items-center gap-1.5">
                <span>{currentTheme.platform_name || "Enterprise AIaaS"}</span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border text-white"
                  style={{
                    backgroundColor: `${currentTheme.primary_color}33`,
                    borderColor: currentTheme.primary_color
                  }}
                >
                  Live
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                {currentTheme.platform_tagline || "Autonomous Customer Support & Sales Cloud"}
              </div>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#multichannel" className="hover:text-white transition-colors">Channels</a>
            <a href="#live-demo" className="hover:text-white transition-colors">Live Sandbox</a>
            <a href="#calculator" className="hover:text-white transition-colors">ROI Calculator</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing (৳ BDT)</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold text-slate-200 hover:text-white rounded-xl transition-colors border border-transparent hover:border-slate-700"
            >
              Sign In
            </Link>

            <button
              onClick={() => setShowPricingModal(true)}
              className="px-4 py-2 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:opacity-95 active:scale-95"
              style={{ backgroundColor: currentTheme.primary_color }}
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================================= */}
      <section
        className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28 text-white border-b"
        style={{
          backgroundColor: currentTheme.dark_surface,
          borderColor: currentTheme.dark_border
        }}
      >
        {/* Glow ambient circle */}
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: currentTheme.primary_color }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md"
            style={{
              backgroundColor: `${currentTheme.primary_color}1A`,
              borderColor: `${currentTheme.primary_color}4D`,
              color: currentTheme.primary_color
            }}
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Autonomous Neural AI + Real-Time RAG v2.5</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-70" />
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Your #1 Autonomous AI Agent for{" "}
            <span
              className="bg-clip-text text-transparent bg-gradient-to-r"
              style={{
                backgroundImage: `linear-gradient(to right, ${currentTheme.primary_color}, #38BDF8, #818CF8)`
              }}
            >
              Website Live Support & Sales
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Train your custom AI on your company documents & FAQs in 60s. Let it answer queries, take orders, and close sales 24/7 on your website in English and বাংলা.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowPricingModal(true)}
              className="w-full sm:w-auto px-7 py-3 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 active:scale-95"
              style={{ backgroundColor: currentTheme.primary_color }}
            >
              <span>Buy Package & Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#live-demo"
              className="w-full sm:w-auto px-6 py-3 bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 text-emerald-400" />
              <span>Test Live Demo Sandbox</span>
            </a>
          </div>

          {/* Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 pt-4">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1-Line JS Live Chatbot Embed
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 60s RAG Knowledge Indexing
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> bKash Automated ৳ BDT Invoicing
            </span>
          </div>

          {/* INTERACTIVE HERO PRODUCT SIMULATION PREVIEW */}
          <div id="live-demo" className={`pt-8 scroll-mt-24 transition-all ${isFullscreen ? "fixed inset-0 z-50 p-3 sm:p-6 bg-slate-950/95 backdrop-blur-2xl flex flex-col justify-center items-center overflow-hidden animate-in fade-in" : "max-w-5xl mx-auto"}`}>
            <div
              className={`rounded-3xl border p-4 sm:p-6 shadow-2xl backdrop-blur-xl text-left transition-all ${isFullscreen ? "w-full max-w-6xl h-[90vh] flex flex-col justify-between" : "w-full"}`}
              style={{
                backgroundColor: currentTheme.dark_card,
                borderColor: currentTheme.dark_border
              }}
            >
              {/* Mock Window Top Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block"></span>
                  <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block"></span>
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block"></span>
                  <span className="text-slate-400 font-mono font-medium ml-2 text-[11px] truncate">
                    https://yourwebsite.com • Live AI Sandbox {isFullscreen && "(Fullscreen Mode)"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-emerald-950/80 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-800 font-bold flex items-center gap-1 shadow-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    AI Assistant LIVE
                  </span>

                  {/* Fullscreen Expand / Collapse Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    title={isFullscreen ? "Exit Fullscreen (Esc)" : "Expand to Fullscreen"}
                    className="p-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 hover:border-slate-600 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-xs"
                  >
                    {isFullscreen ? (
                      <>
                        <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-amber-300 text-[11px]">Minimize</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-cyan-300 text-[11px]">Full Screen</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 2-Column Split: Customer Chat on Left & Live Inbox Agent on Right */}
              <div className={`grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 items-start ${isFullscreen ? "flex-1 min-h-0" : ""}`}>
                
                {/* LEFT: Customer Live Web Widget View */}
                <div className={`md:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 flex flex-col justify-between ${isFullscreen ? "h-full" : "h-[430px]"}`}>
                  <div className="flex-1 min-h-0 flex flex-col">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 text-xs shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-sm"
                          style={{ backgroundColor: currentTheme.primary_color }}
                        >
                          AI
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">Website Live Chatbot</div>
                          <div className="text-[10px] text-slate-400">⚡ Powered by N.I. BIZ Soft</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">Visitor Preview</span>
                    </div>

                    {/* Messages Area */}
                    <div className={`space-y-3 pt-3 overflow-y-auto custom-scrollbar-dark pr-1.5 flex-1 min-h-0 ${isFullscreen ? "max-h-[calc(90vh-270px)]" : "max-h-[260px]"}`}>
                      {simMessages.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                          <div
                            className={`max-w-[92%] p-3 rounded-2xl text-xs shadow-sm ${
                              msg.sender === "user"
                                ? "text-white font-medium rounded-br-xs"
                                : "bg-slate-900/90 text-slate-200 border border-slate-700/80 rounded-bl-xs shadow-md"
                            }`}
                            style={msg.sender === "user" ? { backgroundColor: currentTheme.primary_color } : {}}
                          >
                            {msg.sender === "user" ? (
                              <p className="leading-relaxed">{msg.text}</p>
                            ) : (
                              <MarkdownMessage content={msg.text} isDark={true} className="text-xs text-slate-200 leading-relaxed" />
                            )}
                            {msg.latency_ms && msg.sender === "ai" && (
                              <div className="flex items-center justify-between gap-2 pt-1.5 mt-2 border-t border-slate-800/80 text-[9.5px] text-slate-400 font-mono">
                                <span className="text-emerald-400 font-bold">⚡ {msg.latency_ms}ms response</span>
                                <span className="text-indigo-300 truncate max-w-[150px]">{msg.rag_doc || "Neural Brain"}</span>
                              </div>
                            )}
                            {/* WhatsApp Style Time & Status inside Bubble */}
                            <div className={`flex items-center justify-end gap-1.5 text-[9.5px] mt-1.5 pt-1 border-t ${
                              msg.sender === "user" ? "border-white/20 text-white/80" : "border-slate-800/80 text-slate-400"
                            }`}>
                              <span>{msg.time || "Just now"}</span>
                              {msg.sender === "user" && (
                                <span className="text-[10px] text-emerald-300 font-mono font-bold">✓✓</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {isSimTyping && (
                        <div className="flex items-center gap-1.5 p-2.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl text-xs w-fit">
                          <span className="text-[10px] font-mono text-emerald-400 animate-pulse mr-1">AI Thinking...</span>
                          <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                          <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Input Box */}
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleSimSend(); }}
                    className="flex items-center gap-2 pt-2 border-t border-slate-800 shrink-0"
                  >
                    <input
                      type="text"
                      disabled={isSimTyping}
                      value={simInput}
                      onChange={(e) => setSimInput(e.target.value)}
                      placeholder="Ask anything about our AI platform, pricing & features..."
                      className="flex-1 bg-slate-900 border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-blue-500 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={isSimTyping || !simInput.trim()}
                      className="p-2.5 rounded-xl text-white font-bold cursor-pointer transition-transform active:scale-95 disabled:opacity-50 shadow-md"
                      style={{ backgroundColor: currentTheme.primary_color }}
                    >
                      {isSimTyping ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </form>
                </div>

                {/* RIGHT: Live Support Agent Dashboard View */}
                <div className={`md:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 flex flex-col justify-between ${isFullscreen ? "h-full" : "h-[430px]"}`}>
                  <div className="space-y-3 flex-1 min-h-0 flex flex-col">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 text-xs shrink-0">
                      <div className="flex items-center gap-2">
                        <Headphones className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold text-white text-xs">Live Support Queue (Agent Inspector)</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Real-time AI Guard
                      </span>
                    </div>

                    {/* Meta stats */}
                    <div className="grid grid-cols-2 gap-2.5 text-xs shrink-0">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shadow-xs">
                        <div className="text-[10px] text-slate-400 font-medium">Live Visitor Sentiment</div>
                        <div className="font-bold text-emerald-400 flex items-center gap-1.5 mt-1 text-xs truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{liveSentiment}</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shadow-xs">
                        <div className="text-[10px] text-slate-400 font-medium">RAG Knowledge Vector</div>
                        <div className="font-mono font-bold text-indigo-300 text-[11px] mt-1 truncate">
                          {liveRagDoc}
                        </div>
                      </div>
                    </div>

                    {/* Quick Test Prompt Chips */}
                    <div className="space-y-2 pt-1 flex-1 min-h-0 overflow-y-auto custom-scrollbar-dark">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Try Quick Sample Inquiries:</div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          disabled={isSimTyping}
                          onClick={() => handleSimSend("What subscription plans and pricing do you offer in BDT?")}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-xl cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                          💳 <span>"Pricing in ৳ BDT?"</span>
                        </button>
                        <button
                          type="button"
                          disabled={isSimTyping}
                          onClick={() => handleSimSend("How does the 1-line JavaScript chat embed work on my website?")}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-xl cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                          🌐 <span>"1-Line JS Embed?"</span>
                        </button>
                        <button
                          type="button"
                          disabled={isSimTyping}
                          onClick={() => handleSimSend("বাংলা এবং বাংলিশে কাস্টমারদের সাপোর্ট কীভাবে হ্যান্ডেল করবেন?")}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-xl cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                          🇧🇩 <span>"বাংলা সাপোর্ট ডেমো"</span>
                        </button>
                        <button
                          type="button"
                          disabled={isSimTyping}
                          onClick={() => handleSimSend("What are the key benefits of your RAG vector indexing?")}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-xl cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                          ⚡ <span>"RAG Benefits?"</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Deploy to Website CTA */}
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span className="text-slate-300 font-medium">Autonomous AI Active</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push("/pricing")}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                    >
                      <span>Deploy to Website</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SOCIAL PROOF & PLATFORM METRICS */}
      {/* ========================================================================= */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            <div className="space-y-1">
              <div
                className="text-3xl sm:text-4xl font-black tracking-tight"
                style={{ color: currentTheme.primary_color }}
              >
                1,000+
              </div>
              <div className="text-xs text-slate-500 font-medium">Active Business Tenants</div>
            </div>

            <div className="space-y-1">
              <div
                className="text-3xl sm:text-4xl font-black tracking-tight"
                style={{ color: currentTheme.primary_color }}
              >
                85%
              </div>
              <div className="text-xs text-slate-500 font-medium">Support Deflection Rate</div>
            </div>

            <div className="space-y-1">
              <div
                className="text-3xl sm:text-4xl font-black tracking-tight"
                style={{ color: currentTheme.primary_color }}
              >
                3.2s
              </div>
              <div className="text-xs text-slate-500 font-medium">Average Response Latency</div>
            </div>

            <div className="space-y-1">
              <div
                className="text-3xl sm:text-4xl font-black tracking-tight"
                style={{ color: currentTheme.primary_color }}
              >
                ৳ BDT
              </div>
              <div className="text-xs text-slate-500 font-medium">Native bKash PGW Billing</div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. WEBSITE LIVE CHATBOT & CORE CAPABILITIES */}
      {/* ========================================================================= */}
      <section id="multichannel" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-center gap-1.5">
            <Globe className="w-4 h-4 text-blue-600" /> Website Live Chatbot Suite
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            Dedicated Live Chat Assistant Built for Your Website
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Deploy your trained AI agent to your website with a single line of JavaScript. Powered by N.I. BIZ Soft for instant lead capture, order automation, and seamless human support handover.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Pillar 1: Web Widget */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow relative overflow-hidden">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full absolute top-4 right-4">
              ACTIVE NOW
            </span>
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Website Live Chat Widget</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Embed with 1 line of JavaScript into any website, React, Shopify, WooCommerce, or custom storefront.
            </p>
            <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1 pt-1">
              Powered by N.I. BIZ Soft <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          {/* Pillar 2: Dynamic RAG Knowledge */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow relative overflow-hidden">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full absolute top-4 right-4">
              ACTIVE NOW
            </span>
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">RAG Knowledge Search</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload company docs & paste website URLs. The AI searches verified facts and prevents hallucinations.
            </p>
            <span className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1 pt-1">
              Sub-100ms Vector Indexing <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          {/* Pillar 3: Human Agent Handover */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow relative overflow-hidden">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full absolute top-4 right-4">
              ACTIVE NOW
            </span>
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Headphones className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Live Support Handover</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              One-click visitor transfer to human support agents in the Unified Inbox with real-time sentiment tags.
            </p>
            <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1 pt-1">
              Real-Time WebSocket <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          {/* Pillar 4: Future Roadmap */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow relative overflow-hidden">
            <span className="text-[10px] font-bold text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full absolute top-4 right-4">
              ROADMAP
            </span>
            <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">WhatsApp & Messenger</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Planned future expansion for WhatsApp Business API and Facebook Messenger social channels.
            </p>
            <span className="text-[11px] font-semibold text-purple-600 flex items-center gap-1 pt-1">
              Coming in v3.0 Roadmap <ArrowRight className="w-3 h-3" />
            </span>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE CORE PILLARS & FEATURES */}
      {/* ========================================================================= */}
      <section id="features" className="py-20 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-center gap-1.5">
              <Cpu className="w-4 h-4" /> Enterprise AI Architecture
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Engineered for Speed, Accuracy & Conversions
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Explore how our RAG pipeline, live support inbox, and multi-tenant security give you complete operational control.
            </p>
          </div>

          {/* Feature Tabs Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            {[
              { id: "rag", label: "Dynamic RAG Knowledge", icon: FileText },
              { id: "inbox", label: "Unified Live Inbox", icon: Headphones },
              { id: "bkash", label: "bKash PGW Billing", icon: DollarSign },
              { id: "security", label: "Multi-Tenant Security", icon: Lock }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeFeatureTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFeatureTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? "text-white shadow-md"
                      : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                  style={isActive ? { backgroundColor: currentTheme.primary_color } : {}}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Display */}
          <div className="bg-slate-950 p-6 sm:p-10 rounded-3xl border border-slate-800 max-w-4xl mx-auto">
            {activeFeatureTab === "rag" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-[11px] font-bold uppercase text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800">
                    Zero Hallucinations Guarantee
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Dynamic Knowledge Base with Vector RAG
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Upload product catalogs (PDF, DOCX, CSV) or simply paste your website URL. Our vector embeddings index the content in seconds, ensuring your AI answers only from verified company truth.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      Automatic URL crawler & scheduled re-indexing
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      Multilingual chunking for English, Bengali & Banglish
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      Strict citation matching and accuracy thresholds
                    </li>
                  </ul>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-emerald-300 space-y-2">
                  <div className="text-slate-500 text-[10px]"># Vector Similarity Match Log:</div>
                  <div className="text-slate-300">&gt; Query: "Eid discount validity?"</div>
                  <div className="text-emerald-400">&gt; Match: [doc_eid_2026.pdf (Chunk #4, Score: 0.94)]</div>
                  <div className="text-blue-300">&gt; Neural AI Synthesis: "Offer valid till 30th April."</div>
                  <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">Latency: 112ms • Status: 200 OK</div>
                </div>
              </div>
            )}

            {activeFeatureTab === "inbox" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-[11px] font-bold uppercase text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-800">
                    Human + AI Collaboration
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Unified Live Support Inbox
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Customer queries from all channels flow into a single collaborative inbox. Departmental routing sends sales queries to Sales agents and tech issues to Tech Support instantly.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      1-Click Human Agent Takeover with Real-time Chat
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      Automated Customer Sentiment & Intent Tagging
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      Canned Responses & Internal Team Notes
                    </li>
                  </ul>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                    <span className="font-bold text-white">Live Queues</span>
                    <span className="text-emerald-400 font-bold text-[10px]">3 Agents Online</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
                      <div>
                        <div className="font-bold text-white">Rahim Fashion</div>
                        <div className="text-[10px] text-slate-400">Order verification query</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold h-fit">Sales</span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex justify-between">
                      <div>
                        <div className="font-bold text-white">Sumon Ahmed</div>
                        <div className="text-[10px] text-slate-400">bKash payment confirmation</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold h-fit">Resolved</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === "bkash" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-[11px] font-bold uppercase text-pink-400 bg-pink-950/80 px-2.5 py-1 rounded-full border border-pink-800">
                    Native Bangladeshi Checkout
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                    bKash Payment Gateway & Token Billing
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Designed specifically for the Bangladeshi market. Clients can subscribe to packages in Bangladeshi Taka (৳ BDT) via bKash PGW with automated token provisioning.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
                      Official bKash Sandbox & Live Environment Switcher
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
                      Instant automated token allocation upon webhook validation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
                      Dynamic promo code discount calculation (e.g. EIDMEGA50)
                    </li>
                  </ul>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-[#e2136e] text-white flex items-center justify-center font-black mx-auto text-sm shadow-md">
                    bKash
                  </div>
                  <div className="font-bold text-sm text-white">1-Click PGW Checkout</div>
                  <p className="text-xs text-slate-400">Zero manual verification needed. Tokens are credited instantly.</p>
                  <button
                    onClick={() => setShowPricingModal(true)}
                    className="w-full py-2 bg-[#e2136e] hover:bg-[#c70f60] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    Test bKash Checkout
                  </button>
                </div>
              </div>
            )}

            {activeFeatureTab === "security" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-[11px] font-bold uppercase text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-800">
                    Enterprise Data Isolation
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Multi-Tenant Security & Super Admin
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Each organization workspace operates with strict PostgreSQL row-level isolation. Platform Super Admins have complete visibility over tokens, revenue, and feature flags.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      JWT Authentication + AES-256 Data Encryption
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      Dynamic Theme & Branding setup stored in PostgreSQL
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      Immutable audit logs for compliance
                    </li>
                  </ul>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 font-mono text-xs">
                  <div className="text-slate-500 text-[10px]"># Super Admin Master Node:</div>
                  <div className="text-amber-400">&gt; Tenant Isolation: ACTIVE (0 Leaks)</div>
                  <div className="text-slate-300">&gt; Active Tokens Metered: 4,892,100</div>
                  <div className="text-emerald-400">&gt; MRR Metered: ৳148,800 BDT</div>
                  <div className="text-blue-300">&gt; PostgreSQL 18 Engine: ONLINE</div>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. INTERACTIVE ROI SAVINGS CALCULATOR */}
      {/* ========================================================================= */}
      <section id="calculator" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 max-w-4xl mx-auto">
          
          <div className="text-center space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center justify-center gap-1.5">
              <Calculator className="w-4 h-4" /> ROI & Cost Savings Calculator
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Calculate How Much You Save With Autonomous AI
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              See the exact time and agent cost savings you achieve by automating repetitive customer support.
            </p>
          </div>

          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Monthly Customer Inquiries</span>
                <span className="text-base font-black font-mono text-blue-600">{monthlyChats.toLocaleString()} Chats</span>
              </div>
              <input
                type="range"
                min="500"
                max="50000"
                step="500"
                value={monthlyChats}
                onChange={(e) => setMonthlyChats(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>500</span>
                <span>10,000</span>
                <span>25,000</span>
                <span>50,000+</span>
              </div>
            </div>

            {/* Calculated Output Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <div className="text-[11px] text-slate-500 font-semibold">Hours Saved / Month</div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {Math.round((monthlyChats * 0.85 * 4) / 60)} hrs
                </div>
                <div className="text-[10px] text-emerald-600 font-bold">85% Automated Deflection</div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-center space-y-1">
                <div className="text-[11px] text-blue-800 font-semibold">Estimated Monthly Savings</div>
                <div className="text-2xl font-black text-blue-600 font-mono">
                  ৳{Math.round((monthlyChats * 0.85 * 35)).toLocaleString()}
                </div>
                <div className="text-[10px] text-blue-700 font-bold">vs Traditional Support Costs</div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-center space-y-1">
                <div className="text-[11px] text-emerald-800 font-semibold">Recommended Package</div>
                <div className="text-lg font-black text-emerald-700 mt-1">
                  {monthlyChats <= 1500 ? "Starter" : monthlyChats <= 6000 ? "Professional" : "Enterprise"}
                </div>
                <div className="text-[10px] text-emerald-700 font-bold">Optimal Token Capacity</div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowPricingModal(true)}
                className="px-6 py-2.5 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer hover:opacity-95"
                style={{ backgroundColor: currentTheme.primary_color }}
              >
                <span>Select Recommended Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. DYNAMIC PRICING SHOWCASE */}
      {/* ========================================================================= */}
      <section id="pricing" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600" /> Transparent Pricing in Bangladeshi Taka
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            Simple, Predictable Plans for Growing Brands
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            All plans include full Autonomous Neural AI Assistant, RAG document indexing, live agent inbox, and instant bKash checkout.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="inline-flex items-center p-1 bg-slate-200 rounded-xl text-xs font-bold mt-4">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                billingCycle === "monthly" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === "annual" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-extrabold">SAVE 15%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          
          {/* Card 1: Starter */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">For Early Startups</span>
                <h3 className="text-xl font-bold text-slate-900">Starter Package</h3>
                <p className="text-xs text-slate-500">Perfect for single website stores and small businesses.</p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 font-mono">
                    ৳{calculatePrice(4990, 4240).toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ month</span>
                </div>
                {billingCycle === "annual" && (
                  <div className="text-[11px] text-emerald-600 font-bold mt-0.5">Billed annually (Save ৳9,000/yr)</div>
                )}
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 pt-2">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 500,000 AI Tokens / month</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 1 Connected Website Widget</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 2 Human Support Seats</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 50 Knowledge Documents & URLs</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> bKash Automated Invoicing</li>
              </ul>
            </div>

            <button
              onClick={() => setShowPricingModal(true)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Choose Starter
            </button>
          </div>

          {/* Card 2: Professional (Popular) */}
          <div
            className="bg-white p-7 rounded-3xl border shadow-xl space-y-6 flex flex-col justify-between relative"
            style={{ borderColor: currentTheme.primary_color, borderWidth: "2px" }}
          >
            <span
              className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-wider text-white px-3 py-1 rounded-full shadow-sm"
              style={{ backgroundColor: currentTheme.primary_color }}
            >
              Most Popular Choice
            </span>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">For Growing Businesses</span>
                <h3 className="text-xl font-bold text-slate-900">Professional Plan</h3>
                <p className="text-xs text-slate-500">Website Live Chatbot with Instant RAG & Live Support Handover.</p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 font-mono">
                    ৳{calculatePrice(14990, 12740).toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ month</span>
                </div>
                {billingCycle === "annual" && (
                  <div className="text-[11px] text-emerald-600 font-bold mt-0.5">Billed annually (Save ৳27,000/yr)</div>
                )}
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 pt-2">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 2,000,000 AI Tokens / month</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 3 Connected Website Widgets</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 10 Team Support Seats</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Advanced Analytics & Role Queues</li>
              </ul>
            </div>

            <button
              onClick={() => setShowPricingModal(true)}
              className="w-full py-2.5 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer hover:opacity-95"
              style={{ backgroundColor: currentTheme.primary_color }}
            >
              Choose Professional
            </button>
          </div>

          {/* Card 3: Enterprise */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">For Large Scale Brands</span>
                <h3 className="text-xl font-bold text-slate-900">Enterprise Cloud</h3>
                <p className="text-xs text-slate-500">Unlimited scale, dedicated SLA, and custom personas.</p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 font-mono">
                    ৳{calculatePrice(34990, 29740).toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ month</span>
                </div>
                {billingCycle === "annual" && (
                  <div className="text-[11px] text-emerald-600 font-bold mt-0.5">Billed annually (Save ৳63,000/yr)</div>
                )}
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 pt-2">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 10,000,000+ AI Tokens / month</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Unlimited Widgets & Custom Domains</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Unlimited Team Seats & Roles</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Custom AI Model Fine-Tuning</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 24/7 Dedicated Account Manager</li>
              </ul>
            </div>

            <button
              onClick={() => setShowPricingModal(true)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Choose Enterprise
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FAQ ACCORDION SECTION */}
      {/* ========================================================================= */}
      <section id="faq" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600" /> Got Questions?
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Everything you need to know about our AI platform, setup time, and bKash payments.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How long does it take to train the AI on our products?",
                a: "Less than 60 seconds! You can upload your product catalogs, pricing PDFs, FAQ documents, or paste your website URL. Our RAG vector pipeline ingests and indexes the information automatically."
              },
              {
                q: "Can the AI speak and understand Bengali and Banglish?",
                a: "Yes, absolutely. Our proprietary Autonomous AI engine is fully fluent in formal Bengali, English, and phonetic Banglish (e.g. 'Aapnader delivery charge koto?')."
              },
              {
                q: "How does the bKash payment gateway work?",
                a: "We have native integration with bKash PGW. When you select a plan, you checkout directly with bKash in Bangladeshi Taka (৳ BDT). Your workspace and AI tokens are activated immediately upon payment confirmation."
              },
              {
                q: "What happens when the AI cannot answer a question?",
                a: "The AI politely acknowledges the query and automatically routes the conversation to your human support agents in the Unified Inbox with live sentiment analysis."
              },
              {
                q: "Can we customize the branding and colors of the chat widget?",
                a: "Yes! You can customize widget colors, avatar icons, welcome messages, quick reply pills, and domain whitelists directly from your organization settings."
              }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-2xl p-4 transition-all bg-slate-50/60 hover:bg-slate-50"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-900 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <p className="text-xs text-slate-600 leading-relaxed pt-3 mt-2 border-t border-slate-200">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. BOTTOM HIGH-IMPACT CONVERSION BANNER */}
      {/* ========================================================================= */}
      <section
        className="py-16 text-white border-t"
        style={{ backgroundColor: currentTheme.dark_surface, borderColor: currentTheme.dark_border }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Ready to Automate 85% of Your Customer Support?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Join 1,000+ businesses delivering instant 24/7 customer satisfaction. Setup takes less than 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowPricingModal(true)}
              className="w-full sm:w-auto px-8 py-3.5 text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer hover:opacity-95 active:scale-95"
              style={{ backgroundColor: currentTheme.primary_color }}
            >
              Get Started with bKash Checkout
            </button>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition-colors"
            >
              Sign In to Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. MODERN FOOTER */}
      {/* ========================================================================= */}
      <footer
        className="py-8 text-xs text-slate-400 border-t"
        style={{
          backgroundColor: currentTheme.dark_card,
          borderColor: currentTheme.dark_border
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {currentTheme.logo_url ? (
              <img src={currentTheme.logo_url} alt="Logo" className="h-6 w-auto max-w-[60px] object-contain rounded" />
            ) : (
              <div
                className="h-6 w-6 rounded-md flex items-center justify-center text-white font-bold text-[10px]"
                style={{ backgroundColor: currentTheme.primary_color }}
              >
                AI
              </div>
            )}
            <span className="font-bold text-white">{currentTheme.platform_name || "Enterprise AIaaS"}</span>
            <span>• {currentTheme.footer_text || "© 2026 All Rights Reserved"}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/superadmin" className="hover:text-white transition-colors">Super Admin</Link>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              All Systems Operational
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
