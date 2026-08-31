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
  Menu, X, Send, Phone, RefreshCw, Star
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedPlanTier, setSelectedPlanTier] = useState<string>("growth");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Dynamic Subscription Plans State loaded from PostgreSQL database
  const [dbPlans, setDbPlans] = useState<any[]>([
    {
      code: "starter",
      name: "Starter",
      description: "Ideal for early-stage online shops and local businesses in Bangladesh.",
      monthly_price_bdt: 4990,
      annual_price_bdt: 4240,
      monthly_token_limit: 500000,
      max_agents: 2,
      max_websites: 1,
      max_knowledge_docs: 50,
      features: [
        "500,000 AI Tokens / month",
        "1 Connected Website Widget",
        "2 Support Staff Seats",
        "50 Knowledge Docs & URLs",
        "bKash & COD Direct Checkout",
        "Automated Order SMS Alerts"
      ],
      is_popular: false
    },
    {
      code: "growth",
      name: "Growth",
      description: "For fast-growing storefronts needing high-volume AI and live agent handover.",
      badge_text: "Most Popular",
      monthly_price_bdt: 19990,
      annual_price_bdt: 16990,
      monthly_token_limit: 2500000,
      max_agents: 10,
      max_websites: 5,
      max_knowledge_docs: 250,
      features: [
        "2,500,000 AI Tokens / month",
        "5 Connected Website Widgets",
        "10 Support Staff Seats",
        "250 Knowledge Docs & URLs",
        "bKash & EPS Multi-Channel PGW",
        "Live Human Agent Handover Inbox",
        "Real-Time Customer Sentiment Tracking"
      ],
      is_popular: true
    },
    {
      code: "enterprise",
      name: "Enterprise",
      description: "Complete custom AI solution for enterprise retailers & multi-brand chains.",
      monthly_price_bdt: 49990,
      annual_price_bdt: 42490,
      monthly_token_limit: 10000000,
      max_agents: 25,
      max_websites: 9999,
      max_knowledge_docs: 1000,
      features: [
        "10,000,000 AI Tokens / month",
        "Unlimited Connected Websites",
        "25 Support Staff Seats",
        "1,000 Knowledge Docs & URLs",
        "Custom Branding & White-Label",
        "Role-Based Department Routing",
        "Dedicated 24/7 Account Support"
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

  const faqs = [
    {
      q: "How does the AI assistant answer customer inquiries?",
      a: "The AI automatically reads your product catalog, website URLs, and FAQ documents stored in our secure vector database (pgvector). When a customer asks in Bengali, Banglish, or English, it answers instantly with verified details."
    },
    {
      q: "Can customers place orders and pay directly in the chat widget?",
      a: "Yes! Customers can view product carousels with prices, select sizes, and checkout via Cash on Delivery, bKash Direct Checkout, or EPS Multi-Channel (Cards, Nagad, Rocket, Internet Banking) with automated verification."
    },
    {
      q: "How long does it take to integrate onto our website?",
      a: "Less than 2 minutes. Simply copy our 1-line JavaScript snippet and paste it before the </body> tag of your website. It works seamlessly with WordPress, Shopify, custom HTML, React, and Next.js."
    },
    {
      q: "What happens if the AI cannot answer a complex question?",
      a: "The conversation is instantly routed to your Live Support Inbox. Your human agents receive a real-time notification and can take over the chat with 1 click."
    },
    {
      q: "Is my business data and payment credentials secure?",
      a: "Absolutely. Every tenant operates in a dedicated, isolated environment. All merchant passwords, API keys, and hash keys are encrypted with AES-256 and never shared with other tenants or platform logs."
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
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">AI-Powered Commerce</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
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
                <span>AI-Powered Customer Service & Sales Desk</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Automate Support & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600">
                  Drive Sales with AI
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Connect your website in 2 minutes. Answer customer questions instantly in Bengali & English, showcase products in-chat, and accept bKash & card payments automatically.
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
                  href="#how-it-works"
                  className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-xl border border-slate-200 shadow-xs transition-colors text-center"
                >
                  See How It Works
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> No coding required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1-Line JavaScript Embed
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Official bKash & EPS PGW
                </span>
              </div>
            </div>

            {/* Hero Right Mockup: Clean Live Chat Simulator */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-w-md mx-auto">
                {/* Chatbox Header */}
                <div className="bg-indigo-600 p-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Padma Mart Live AI</h4>
                      <p className="text-[11px] text-indigo-100 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online • Instant Answers
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded-md font-mono text-[10px]">v2.0</span>
                </div>

                {/* Chat Messages */}
                <div className="p-4 space-y-3.5 bg-slate-50/80 text-xs min-h-[340px]">
                  {/* Message 1 (User) */}
                  <div className="flex flex-col items-end">
                    <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-br-none max-w-[85%] leading-relaxed">
                      আপনাদের প্রিমিয়াম পাঞ্জাবি কালেকশনটা একটু দেখাবেন?
                    </div>
                  </div>

                  {/* Message 2 (AI Response with Product Card) */}
                  <div className="flex flex-col items-start space-y-2">
                    <div className="bg-white text-slate-800 border border-slate-200 p-3 rounded-2xl rounded-bl-none max-w-[90%] shadow-xs leading-relaxed">
                      অবশ্যই! আমাদের প্রিমিয়াম কটন পাঞ্জাবি কালেকশনটি নিচে দেওয়া হলো। আপনি সরাসরি এখান থেকেই অর্ডার করতে পারবেন:
                    </div>

                    {/* Product Card */}
                    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs w-full space-y-2">
                      <div className="flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&auto=format&fit=crop&q=80"
                          alt="Panjabi"
                          className="w-14 h-14 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 text-xs truncate">Men's Premium Cotton Panjabi</div>
                          <div className="text-emerald-700 font-bold text-xs mt-0.5">৳2,190 BDT</div>
                          <div className="text-[10px] text-slate-500">Sizes: M, L, XL • In Stock</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                        >
                          ১-ক্লিকে অর্ডার করুন
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Message 3 (User Order Action) */}
                  <div className="flex flex-col items-end">
                    <div className="bg-indigo-600 text-white p-2.5 rounded-2xl rounded-br-none max-w-[85%]">
                      সাইজ L বিকাশ দিয়ে পেমেন্ট করবো।
                    </div>
                  </div>

                  {/* Message 4 (AI Confirmation) */}
                  <div className="flex flex-col items-start">
                    <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-2.5 rounded-2xl rounded-bl-none max-w-[90%] font-medium">
                      ✅ অর্ডার #ORD-882910 কনফার্ম হয়েছে! bKash পেমেন্ট লিংক ও SMS আপনার মোবাইলে পাঠানো হয়েছে।
                    </div>
                  </div>
                </div>

                {/* Chat Composer Mock */}
                <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                  <input
                    type="text"
                    disabled
                    placeholder="Type your message..."
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

      {/* 3. Core Features Section */}
      <section id="features" className="py-16 sm:py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Built for Fast Commerce</h2>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Everything Your Business Needs to Grow
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Powerful features engineered to eliminate waiting times and maximize conversions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5 hover:border-indigo-200 hover:bg-white transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">24/7 Smart AI Support</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Answers questions in Bengali, English, and Banglish. Retrieves accurate answers from your documents, product specs, and return policies.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5 hover:border-indigo-200 hover:bg-white transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Direct In-Chat Ordering</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Visitors can browse product pictures, select sizes or colors, and place orders directly without ever leaving the chat widget.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5 hover:border-indigo-200 hover:bg-white transition-all shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E2136E] border border-pink-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">bKash & EPS Gateways</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated instant payment verification for bKash Tokenized Checkout, Cards, MFS, and internet banking with instant SMS alerts.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Simple Onboarding</h2>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Live on Your Website in 3 Steps
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            No complex setup or engineering needed. Get started in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="text-sm font-bold text-slate-900">Add Products & Knowledge</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload your product catalog, store FAQs, and business policies into your dashboard.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="text-sm font-bold text-slate-900">Paste 1-Line Embed Code</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Copy your unique widget script tag and paste it onto WordPress, Shopify, or custom HTML.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="text-sm font-bold text-slate-900">Convert Visitors Automatically</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your AI assistant will start engaging customers, answering questions, and taking orders 24/7.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Transparent Pricing</h2>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Predictable Plans for Every Stage
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Choose the package that fits your storefront. All plans include full e-commerce support.
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

        </div>
      </section>

      {/* 6. FAQ Section */}
      <section id="faq" className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
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
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs transition-all"
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
                  <div className="px-4 sm:px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Bottom Call to Action Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-indigo-600 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl shadow-indigo-600/20">
          <div className="max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight">
              Ready to Supercharge Your Storefront?
            </h3>
            <p className="text-xs sm:text-sm text-indigo-100">
              Join hundreds of modern e-commerce stores automating customer support and order checkouts.
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

      {/* 8. Simple Clean Footer */}
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
