"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PricingModal from "../auth/PricingModal";
import { api, API_BASE_URL, CDN_WIDGET_URL } from "../../lib/api";
import {
  MessageSquare, Bot, Sparkles, CheckCircle2,
  ArrowRight, ShieldCheck, Zap, Globe, Cpu,
  TrendingUp, Users, Smartphone, ShoppingBag,
  CreditCard, Check, ChevronDown, ChevronUp,
  Menu, X, Send, Phone, RefreshCw, Star,
  Building2, Headphones, Activity, GraduationCap,
  Briefcase, Database, HelpCircle
} from "lucide-react";

type IndustryTab = "b2b" | "helpline" | "erp" | "ecommerce";

export default function LandingPage() {
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedPlanTier, setSelectedPlanTier] = useState<string>("growth");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeIndustry, setActiveIndustry] = useState<IndustryTab>("b2b");

  // Dynamic Subscription Plans State loaded from PostgreSQL database
  const [dbPlans, setDbPlans] = useState<any[]>([
    {
      code: "starter",
      name: "Starter",
      description: "Perfect for single website businesses, B2B startups, and local service providers.",
      monthly_price_bdt: 4990,
      annual_price_bdt: 4240,
      monthly_token_limit: 500000,
      max_agents: 2,
      max_websites: 1,
      max_knowledge_docs: 50,
      features: [
        "500,000 AI Tokens / month",
        "1 Connected Website or Portal Widget",
        "2 Human Support Seats",
        "50 Knowledge Docs & URL Crawls",
        "Automated Lead Capture & CRM Sync",
        "bKash & COD Checkout (Optional)"
      ],
      is_popular: false
    },
    {
      code: "growth",
      name: "Growth",
      description: "For scaling companies needing multi-portal AI, department queues & human agent handover.",
      badge_text: "Most Popular",
      monthly_price_bdt: 19990,
      annual_price_bdt: 16990,
      monthly_token_limit: 2500000,
      max_agents: 10,
      max_websites: 5,
      max_knowledge_docs: 250,
      features: [
        "2,500,000 AI Tokens / month",
        "5 Connected Website / ERP Portals",
        "10 Human Support Seats",
        "250 Knowledge Docs & URL Crawls",
        "Live Human Agent Handover Inbox",
        "Department Queues (Sales / Support / Tech)",
        "bKash & EPS Multi-Channel Billing"
      ],
      is_popular: true
    },
    {
      code: "enterprise",
      name: "Enterprise",
      description: "Complete custom AI solution for ERP integration, healthcare, and corporate helplines.",
      monthly_price_bdt: 49990,
      annual_price_bdt: 42490,
      monthly_token_limit: 10000000,
      max_agents: 25,
      max_websites: 9999,
      max_knowledge_docs: 1000,
      features: [
        "10,000,000 AI Tokens / month",
        "Unlimited Connected Portals & Sites",
        "25 Human Support Seats",
        "1,000 Knowledge Docs & URL Crawls",
        "Full White-Label & Custom Domain",
        "Custom ERP Webhooks & Database APIs",
        "Dedicated 24/7 Account Manager & SLA"
      ],
      is_popular: false
    }
  ]);

  // Fetch live Super Admin pricing plans from backend
  useEffect(() => {
    api.getPublicPlans()
      .then((plans: any[]) => {
        if (plans && Array.isArray(plans) && plans.length > 0) {
          const activePaidPlans = plans.filter(p => p.monthly_price_bdt > 0 && p.is_active !== false);
          if (activePaidPlans.length > 0) {
            setDbPlans(activePaidPlans);
          }
        }
      })
      .catch((err) => console.warn("Could not fetch public plans for landing page:", err));
  }, []);

  // Platform Super Admin Live Chat Widget injection
  useEffect(() => {
    const scriptId = "platform-superadmin-chat-widget";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = CDN_WIDGET_URL;
      script.setAttribute("data-widget-key", "wgt_platform_live_support");
      script.setAttribute("data-api-url", API_BASE_URL);
      script.setAttribute("data-primary-color", "#4F46E5");
      script.setAttribute("data-position", "bottom-right");
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      const scriptEl = document.getElementById(scriptId);
      if (scriptEl) scriptEl.remove();
      const widgetHosts = document.querySelectorAll("#aiaas-widget-host, #enterprise-ai-widget-root, [id^='aiaas-'], [id^='enterprise-ai-widget']");
      widgetHosts.forEach(el => el.remove());
    };
  }, []);

  const handleOpenPlan = (tier: string) => {
    setSelectedPlanTier(tier);
    setShowPricingModal(true);
  };

  // Industry Simulation Scenarios
  const industryDemos = {
    b2b: {
      title: "B2B SaaS & Corporate Services",
      subtitle: "Lead Qualification, Demo Scheduling & Pricing Inquiries",
      chat: [
        { sender: "user", text: "We need custom pricing and ERP API integration for 85 team members." },
        { sender: "ai", text: "Hello! Our Enterprise plan covers unlimited users, custom ERP webhooks, and 99.99% SLA. May I have your company name and email to send the technical proposal?" },
        { sender: "user", text: "Apex Tech Ltd, ctotech@apextech.com.bd." },
        { sender: "ai", text: "Thank you! Lead qualified and routed to our Senior Solutions Engineer. You'll receive the proposal within 15 minutes." }
      ]
    },
    helpline: {
      title: "24/7 Helpline & Healthcare Support",
      subtitle: "Instant Patient Inquiries, Doctor Schedules & Test Reports",
      chat: [
        { sender: "user", text: "ডায়াগনস্টিক রিপোর্ট সংগ্রহের সময় এবং ডক্টর অ্যাপয়েন্টমেন্ট শিডিউল জানতে চাই।" },
        { sender: "ai", text: "আমাদের রিপোর্ট ডেলিভারি কাউন্টার প্রতিদিন সকাল ৮টা থেকে রাত ১০টা পর্যন্ত খোলা থাকে। আপনার টেস্ট আইডি নম্বরটি দিলে এখনই স্ট্যাটাস চেক করে দিচ্ছি।" },
        { sender: "user", text: "টেস্ট আইডি: LAB-99214" },
        { sender: "ai", text: "✅ আপনার রিপোর্ট প্রস্তুত রয়েছে। আপনি অনলাইন থেকে ডাউনলোড করতে পারেন অথবা ৩নং কাউন্টারে সংগ্রহ করতে পারেন।" }
      ]
    },
    erp: {
      title: "ERP & Operations Self-Service",
      subtitle: "Client Account Status, Ticket Queries & Internal Policies",
      chat: [
        { sender: "user", text: "What is the status of our shipment batch #BATCH-4401 and invoice balance?" },
        { sender: "ai", text: "Batch #BATCH-4401 has cleared customs and is scheduled for warehouse dispatch tomorrow at 10:00 AM. Outstanding balance: ৳45,000 BDT." },
        { sender: "user", text: "Please connect me to accounts for payment clearance." },
        { sender: "ai", text: "Connecting you to Mr. Tanvir from Accounts Department (Seat #4)... Live agent connected!" }
      ]
    },
    ecommerce: {
      title: "E-Commerce & Online Storefronts",
      subtitle: "In-Chat Product Catalog, Orders & bKash / EPS Checkout",
      chat: [
        { sender: "user", text: "আপনাদের প্রিমিয়াম পাঞ্জাবি কালেকশনটা একটু দেখাবেন?" },
        { sender: "ai", text: "অবশ্যই! আমাদের প্রিমিয়াম কটন পাঞ্জাবি কালেকশন (৳2,190) স্টকে রয়েছে। আপনি এখান থেকেই ১-ক্লিকে বিকাশ বা ক্যাশ অন ডেলিভারিতে অর্ডার করতে পারবেন।" },
        { sender: "user", text: "সাইজ L বিকাশ দিয়ে অর্ডার করবো।" },
        { sender: "ai", text: "✅ অর্ডার #ORD-882910 কনফার্ম হয়েছে! bKash পেমেন্ট লিংক ও SMS আপনার মোবাইলে পাঠানো হয়েছে।" }
      ]
    }
  };

  const faqs = [
    {
      q: "Is Jobab.chat only for e-commerce, or can other industries use it?",
      a: "Jobab.chat is a universal conversational AI platform designed for all sectors. It is actively used by B2B corporate firms (for lead capture & demos), ERP systems (for client self-service), Healthcare & Clinics (for appointments & test inquiries), Educational Academies (for admissions), and E-Commerce stores (for product orders & payment settlements)."
    },
    {
      q: "How does the AI train on our specific business knowledge?",
      a: "Simply upload your PDF manuals, policy docs, employee handbooks, FAQ spreadsheets, or paste website URLs. Our PostgreSQL vector database (pgvector) indexes your data and enables the AI to answer accurately in Bengali, English, or Banglish."
    },
    {
      q: "Can the AI route conversations to different human departments?",
      a: "Yes! With our Live Support Inbox, conversations can be assigned to specialized department queues (e.g., Sales, Technical Support, Accounts, or Customer Care). When complex issues arise, human agents can take over the chat in 1 click."
    },
    {
      q: "How easy is it to install on our website, portal, or ERP?",
      a: "It takes less than 2 minutes. Copy our 1-line JavaScript snippet and paste it into your website, client portal, or ERP HTML. It works with WordPress, Shopify, Next.js, React, Laravel, or custom web portals."
    },
    {
      q: "How is our company data protected?",
      a: "Every tenant is strictly multi-tenant isolated. Your business knowledge, customer conversations, and API keys are protected with AES-256 encryption and isolated database partitions. No data is ever shared across organizations."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-indigo-600/30">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-lg tracking-tight leading-none">
                Jobab<span className="text-indigo-600">.chat</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">Universal AI Support & Operations</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#industries" className="hover:text-indigo-600 transition-colors">Solutions</a>
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
          </nav>

          {/* Auth & CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link>
            <button
              onClick={() => handleOpenPlan("growth")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
            <a
              href="#industries"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 hover:text-indigo-600 py-1"
            >
              Solutions
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 hover:text-indigo-600 py-1"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 hover:text-indigo-600 py-1"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 hover:text-indigo-600 py-1"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 hover:text-indigo-600 py-1"
            >
              FAQ
            </a>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full text-center py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
              >
                Sign In
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleOpenPlan("growth");
                }}
                className="w-full text-center py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl"
              >
                Get Started Free
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Conversational AI for B2B, Helplines, ERP & Retail</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Automate Support & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600">
                  Operations with Smart AI
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Empower your business with 24/7 autonomous customer service in Bengali & English. Handle customer queries, qualify B2B leads, automate ERP self-service, and take orders seamlessly.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => handleOpenPlan("growth")}
                  className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#industries"
                  className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-xl border border-slate-200 shadow-xs transition-colors text-center"
                >
                  Explore Industry Solutions
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1-Line Embed on Any Website
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Multi-Agent Human Handover
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Tenant Data Isolation
                </span>
              </div>
            </div>

            {/* Hero Right Mockup: Multi-Industry Interactive Demo */}
            <div className="lg:col-span-5 space-y-3">
              {/* Industry Selector Tabs */}
              <div className="flex items-center justify-center lg:justify-start gap-1.5 overflow-x-auto pb-1">
                {[
                  { id: "b2b", label: "🏢 B2B & SaaS" },
                  { id: "helpline", label: "📞 24/7 Helpline" },
                  { id: "erp", label: "⚙️ ERP Self-Service" },
                  { id: "ecommerce", label: "🛍️ E-Commerce" },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveIndustry(tab.id as IndustryTab)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                      activeIndustry === tab.id
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-w-md mx-auto">
                {/* Chatbox Header */}
                <div className="bg-indigo-600 p-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{industryDemos[activeIndustry].title}</h4>
                      <p className="text-[11px] text-indigo-100 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online • Multi-Channel AI Assistant
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded-md font-mono text-[10px]">Active</span>
                </div>

                {/* Chat Messages */}
                <div className="p-4 space-y-3 bg-slate-50/80 text-xs min-h-[320px]">
                  {industryDemos[activeIndustry].chat.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`p-3 rounded-2xl max-w-[88%] leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-indigo-600 text-white rounded-br-none"
                            : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Composer Mock */}
                <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                  <input
                    type="text"
                    disabled
                    placeholder={`Ask about ${industryDemos[activeIndustry].subtitle.toLowerCase()}...`}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 outline-none"
                  />
                  <div className="p-2 bg-indigo-600 text-white rounded-xl">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Multi-Industry Solutions Section */}
      <section id="industries" className="py-16 sm:py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Universal Solutions</h2>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Engineered for Every Business Sector
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              One unified AI platform that adapts to your unique workflows and operational needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: B2B & SaaS */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:border-indigo-300 hover:bg-white transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">B2B & SaaS Companies</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Qualify incoming leads automatically, answer RFP/pricing inquiries, and schedule discovery demos directly into your CRM.
              </p>
            </div>

            {/* Card 2: 24/7 Helpline & Healthcare */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:border-indigo-300 hover:bg-white transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Helplines & Healthcare</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instant patient and caller resolution. Provide diagnostic lab report status, doctor consultation timings, and clinic locations.
              </p>
            </div>

            {/* Card 3: ERP & Business Operations */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:border-indigo-300 hover:bg-white transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">ERP & Enterprise Portals</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enable 24/7 self-service for clients and staff. Look up shipment batches, invoice summaries, policy documents, and ticket status.
              </p>
            </div>

            {/* Card 4: E-Commerce & Retail */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:border-indigo-300 hover:bg-white transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E2136E] border border-pink-100 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">E-Commerce & Retail</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Visual in-chat product cards, size selection, 1-click order checkout with automated bKash, EPS cards, and SMS delivery alerts.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Core Features Section */}
      <section id="features" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Platform Capabilities</h2>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Designed for Real Operational Excellence
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Enterprise-grade capabilities built on PostgreSQL pgvector, modern LLMs, and real-time WebSockets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Bilingual Bengali & English AI</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Understands complex Bengali, Banglish, and English inquiries with high accuracy. Retrieves verified information from your knowledge base with zero hallucinations.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Multi-Agent Live Support Inbox</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              When human touch is required, conversations seamlessly transfer to your staff. Includes department queues, internal whispering notes, and real-time typing indicators.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">bKash & Multi-Channel PGW</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Native integration with bKash Tokenized Checkout and EPS (Easy Payment System) for Cards, Nagad, Rocket, and Internet Banking with automated SMS receipts.
            </p>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Instant Deployment</h2>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Live on Your Portal in 3 Steps
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              No machine learning engineers or complex DevOps required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900">Upload Knowledge & Services</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload your company PDFs, product catalogs, FAQ documents, or paste your website URLs to train your AI in seconds.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900">Paste 1-Line Embed Snippet</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Copy your unique CDN script tag and embed it into your WordPress site, custom ERP portal, or web app before &lt;/body&gt;.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900">Automate Inquiries & Leads 24/7</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your AI assistant will start resolving inquiries, capturing leads, and routing complex cases to your human agents in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Transparent Plans</h2>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Predictable Pricing for Every Business Scale
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Choose the right capacity for your organization. All packages include full multi-channel AI capabilities.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 mt-2">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === "annual"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                15% OFF
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch pt-4">
          {dbPlans.map((plan) => {
            const isPopular = plan.is_popular;
            const price = billingCycle === "annual" ? (plan.annual_price_bdt || Math.round(plan.monthly_price_bdt * 0.85)) : plan.monthly_price_bdt;

            return (
              <div
                key={plan.code}
                className={`p-6 sm:p-7 rounded-3xl border flex flex-col justify-between transition-all ${
                  isPopular
                    ? "bg-white border-indigo-600 shadow-xl ring-2 ring-indigo-600/20 relative"
                    : "bg-white border-slate-200 shadow-xs hover:border-slate-300"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm">
                    Most Popular Choice
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{plan.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.description}</p>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900 font-mono">
                        ৳{price.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">/ month</span>
                    </div>
                    {billingCycle === "annual" && (
                      <div className="text-[10.5px] text-emerald-700 font-semibold mt-0.5">
                        Billed annually (৳{(price * 12).toLocaleString()} / yr)
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-700">
                    <div className="font-semibold text-slate-900 text-[11px] uppercase tracking-wider">Features included:</div>
                    {plan.features?.map((f: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    onClick={() => handleOpenPlan(plan.code)}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isPopular
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    <span>Choose {plan.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section id="faq" className="py-16 sm:py-24 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Questions & Answers</h2>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left font-bold text-slate-900 text-sm flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-indigo-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-200/80 pt-3 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Bottom Call to Action Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-indigo-600 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl shadow-indigo-600/20">
          <div className="max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight">
              Ready to Modernize Your Customer & Client Support?
            </h3>
            <p className="text-xs sm:text-sm text-indigo-100">
              Join leading B2B companies, healthcare clinics, ERP providers, and online retailers automating operations with Jobab.chat.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => handleOpenPlan("growth")}
              className="px-6 py-3.5 bg-white text-indigo-600 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Get Started Free Today
            </button>
            <Link
              href="/login"
              className="px-6 py-3.5 bg-indigo-700/60 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl border border-indigo-400/40 transition-colors"
            >
              Sign In to Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* 9. Simple Clean Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800">Jobab.chat</span>
            <span>• &copy; {new Date().getFullYear()} All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#industries" className="hover:text-slate-800">Solutions</a>
            <a href="#features" className="hover:text-slate-800">Features</a>
            <a href="#pricing" className="hover:text-slate-800">Pricing</a>
            <a href="#faq" className="hover:text-slate-800">FAQ</a>
            <Link href="/login" className="hover:text-slate-800">Login</Link>
          </div>
        </div>
      </footer>

      {/* Registration & Subscription Checkout Modal */}
      {showPricingModal && (
        <PricingModal
          isOpen={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          initialSelectedTier={selectedPlanTier}
        />
      )}
    </div>
  );
}
