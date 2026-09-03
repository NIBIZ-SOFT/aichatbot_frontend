"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Bot,
  Send,
  Check,
  ShoppingBag,
  Calendar,
  FileText,
  Truck,
  CreditCard,
  RotateCcw,
  Minus,
  Plus,
  ShieldCheck,
  User,
  ExternalLink,
  MessageSquare
} from "lucide-react";

type IndustryKey = "b2b" | "helpline" | "erp" | "retail";

interface HeroSectionProps {
  onOpenPricing: (tier: string) => void;
}

export default function HeroSection({ onOpenPricing }: HeroSectionProps) {
  const [activeTab, setActiveTab] = useState<IndustryKey>("b2b");

  // Retail Interactive Generative UI State
  const [selectedSize, setSelectedSize] = useState<string>("L");
  const [selectedQty, setSelectedQty] = useState<number>(1);
  const [cartCount, setCartCount] = useState<number>(1);
  const [addedToCartToast, setAddedToCartToast] = useState<boolean>(false);
  const [isAiMode, setIsAiMode] = useState<boolean>(true);
  const [chatInput, setChatInput] = useState<string>("");

  const handleAddToCart = () => {
    setCartCount(prev => prev + selectedQty);
    setAddedToCartToast(true);
    setTimeout(() => setAddedToCartToast(false), 2200);
  };

  const scenarios = {
    b2b: {
      name: "B2B SaaS & Services",
      assistantName: "Jobab B2B Concierge",
      tag: "Lead Qualification & Demos",
      quickReplies: ["📊 Feature Matrix", "🔒 SLA & Security", "📞 Schedule Live Demo"],
      messages: [
        {
          id: 1,
          sender: "user",
          time: "03:41 PM",
          text: "We need custom API integration and pricing for 80 team members."
        },
        {
          id: 2,
          sender: "ai",
          time: "03:41 PM",
          text: "Hello! Our Enterprise plan includes custom webhooks, ERP API routing, and dedicated 99.9% SLA. May I have your company email to send the technical proposal?",
        },
        {
          id: 3,
          sender: "user",
          time: "03:42 PM",
          text: "Apex Tech Ltd, cto@apextech.com.bd"
        },
        {
          id: 4,
          sender: "ai",
          time: "03:42 PM",
          text: "✅ Lead qualified! Proposal and demo slot reserved with our Head of Solutions.",
          cardType: "b2b_lead",
          cardData: {
            company: "Apex Tech Ltd",
            email: "cto@apextech.com.bd",
            plan: "Enterprise (80+ Seats)",
            slot: "Tomorrow at 3:30 PM (Google Meet)",
            host: "Engr. Shakib Ahmed (Solutions Architect)"
          }
        }
      ]
    },
    helpline: {
      name: "24/7 Helpline & Clinic",
      assistantName: "CareDesk 24/7 AI",
      tag: "Appointments & Lab Status",
      quickReplies: ["🧪 Test Status", "👨‍⚕️ Doctor Schedule", "📄 Download Report"],
      messages: [
        {
          id: 1,
          sender: "user",
          time: "10:14 AM",
          text: "ডায়াগনস্টিক রিপোর্ট কখন পাওয়া যাবে এবং ডক্টর শিডিউল জানতে চাই।"
        },
        {
          id: 2,
          sender: "ai",
          time: "10:14 AM",
          text: "আমাদের রিপোর্ট ডেলিভারি কাউন্টার রাত ১০টা পর্যন্ত খোলা। আপনার টেস্ট আইডি নম্বরটি দিলে এখনই স্ট্যাটাস জানিয়ে দিচ্ছি।"
        },
        {
          id: 3,
          sender: "user",
          time: "10:15 AM",
          text: "টেস্ট আইডি: LAB-99214"
        },
        {
          id: 4,
          sender: "ai",
          time: "10:15 AM",
          text: "✅ আপনার রিপোর্ট প্রস্তুত! ৩নং কাউন্টার থেকে সংগ্রহ করতে পারেন অথবা অনলাইন পিডিএফ ডাউনলোড করুন:",
          cardType: "helpline_lab",
          cardData: {
            testId: "LAB-99214",
            testName: "Comprehensive Metabolic & Lipid Profile",
            doctor: "Prof. Dr. Farhana Rahman (Cardiology)",
            counter: "Counter #3 (1st Floor)",
            status: "Verified by Chief Pathologist"
          }
        }
      ]
    },
    erp: {
      name: "ERP & Operations",
      assistantName: "Jobab ERP Assistant",
      tag: "Client & Staff Self-Service",
      quickReplies: ["🚚 Track Shipment", "🧾 Invoice Balance", "👤 Handover to Accounts"],
      messages: [
        {
          id: 1,
          sender: "user",
          time: "02:20 PM",
          text: "What is the status of shipment #BATCH-4401 and invoice balance?"
        },
        {
          id: 2,
          sender: "ai",
          time: "02:20 PM",
          text: "Batch #BATCH-4401 has cleared customs and will arrive tomorrow at 10 AM. Current unpaid invoice balance: ৳45,000 BDT.",
          cardType: "erp_shipment",
          cardData: {
            batchId: "BATCH-4401",
            origin: "Chittagong Seaport",
            destination: "Dhaka Central Warehouse",
            status: "Customs Cleared • In Transit",
            eta: "Tomorrow, 10:00 AM",
            balance: 45000
          }
        },
        {
          id: 3,
          sender: "user",
          time: "02:21 PM",
          text: "Connect me with Accounts department."
        },
        {
          id: 4,
          sender: "ai",
          time: "02:21 PM",
          text: "Connecting you to Accounts Specialist... Mr. Tanvir Hasan joined the session! 👤"
        }
      ]
    },
    retail: {
      name: "E-Commerce & Retail",
      assistantName: "Royal Heritage Store Assistant",
      tag: "In-Chat Orders & Generative UI",
      quickReplies: ["🛍️ View Size Chart", "⚡ bKash Payment Info", "🚚 Express Delivery Rates"],
      messages: [
        {
          id: 1,
          sender: "user",
          time: "04:05 PM",
          text: "আপনাদের প্রিমিয়াম পাঞ্জাবি কালেকশনটা দেখাবেন?"
        },
        {
          id: 2,
          sender: "ai",
          time: "04:05 PM",
          text: "আমাদের বেস্টসেলার রয়্যাল কটন পাঞ্জাবি এখন লাইভ স্টকে আছে! আপনি সরাসরি এখান থেকেই সাইজ ও কোয়ান্টিটি সিলেক্ট করে বিকাশ বা ক্যাশ অন ডেলিভারিতে অর্ডার করতে পারবেন:",
          cardType: "retail_product",
          cardData: {
            id: "panjabi_royal_01",
            title: "Royal Heritage Semi-Fitted Cotton Panjabi",
            category: "PREMIUM ETHNIC",
            sku: "RHL-PJB-402",
            sellingPrice: 2190,
            unitPrice: 2800,
            discount: 22,
            stock: 14,
            sizes: ["M", "L", "XL", "XXL"],
            image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80"
          }
        },
        {
          id: 3,
          sender: "user",
          time: "04:06 PM",
          text: "সাইজ L বিকাশ দিয়ে অর্ডার করবো।"
        },
        {
          id: 4,
          sender: "ai",
          time: "04:06 PM",
          text: "✅ অর্ডার #ORD-882910 কনফার্ম! bKash পেমেন্ট লিংক ও SMS ট্র্যাকিং পাঠানো হয়েছে:",
          cardType: "retail_order_confirmed",
          cardData: {
            orderId: "ORD-882910",
            item: "Royal Heritage Panjabi",
            size: "L",
            qty: 1,
            total: 2190,
            trxId: "9K28XLP2",
            delivery: "Express Courier (Within 24 Hours in Dhaka)"
          }
        }
      ]
    }
  };

  const currentScenario = scenarios[activeTab];

  return (
    <section className="relative pt-8 pb-12 sm:pt-14 sm:pb-16 bg-gradient-to-b from-indigo-50/60 via-white to-slate-50 border-b border-slate-200/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Universal AI Support for B2B, Helplines, ERP & Retail</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Automate Support & Operations with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600">
                Smart Conversational AI
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Empower your business with 24/7 bilingual AI assistants in Bengali & English. Qualify B2B leads, automate ERP self-service inquiries, and close sales seamlessly with rich Generative UI cards.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
              <button
                onClick={() => onOpenPricing("growth")}
                className="w-full sm:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#solutions"
                className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition-colors text-center"
              >
                Explore Solutions
              </a>
            </div>

            {/* Micro Trust Indicators */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 1-Line Embed
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Live Human Handover
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Interactive Generative UI
              </span>
            </div>
          </div>

          {/* Right Hero Interactive Simulator (CDN widget.js Design Fidelity) */}
          <div className="lg:col-span-6 space-y-3">

            {/* Pill Selector for 4 Industry Scenarios */}
            <div className="flex items-center justify-center lg:justify-start gap-1.5 overflow-x-auto pb-1 custom-scrollbar-horizontal">
              {[
                { id: "b2b", label: "🏢 B2B SaaS" },
                { id: "helpline", label: "📞 24/7 Helpline" },
                { id: "erp", label: "⚙️ ERP & Logistics" },
                { id: "retail", label: "🛍️ Retail & Commerce" },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as IndustryKey)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/20"
                      : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/90 shadow-2xs"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.id === "retail" && (
                    <span className="text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full">
                      Gen UI
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* CDN Widget Window Container (Exact widget.js Shadow DOM Visual Standards) */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden max-w-[430px] mx-auto flex flex-col transition-all duration-300 ring-1 ring-slate-900/5 relative">

              {/* Toast Notification when adding to cart */}
              {addedToCartToast && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-slate-900 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-xl flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Added {selectedQty}x Panjabi (Size {selectedSize}) to Cart!</span>
                </div>
              )}

              {/* 1. Official widget.js Header */}
              <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white px-4 py-3.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {/* Bot Avatar with Active Online Pulse */}
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-xs border border-white/30 flex items-center justify-center text-white font-bold shadow-inner">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-indigo-700 animate-pulse" />
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-white tracking-tight flex items-center gap-1.5">
                        <span>{currentScenario.assistantName}</span>
                      </h4>
                      <p className="text-[10px] text-indigo-100/90 flex items-center gap-1 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Online • Typically replies instantly</span>
                      </p>
                    </div>
                  </div>

                  {/* Header Actions matching widget.js */}
                  <div className="flex items-center gap-1.5">
                    {/* AI / Human Mode Switcher */}
                    <button
                      type="button"
                      onClick={() => setIsAiMode(!isAiMode)}
                      title="Switch AI / Human Agent Mode"
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/15 hover:bg-white/25 border border-white/20 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {isAiMode ? (
                        <>
                          <Bot className="w-3 h-3 text-emerald-300" />
                          <span>AI Active</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3 text-amber-300" />
                          <span>Human Staff</span>
                        </>
                      )}
                    </button>

                    {/* Cart Icon in Retail Mode */}
                    {activeTab === "retail" && (
                      <div className="relative px-2 py-1 rounded-full bg-white/15 border border-white/20 text-white text-[10px] font-bold flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3 text-amber-300" />
                        <span>{cartCount}</span>
                      </div>
                    )}

                    {/* Reset Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedQty(1);
                        setSelectedSize("L");
                      }}
                      className="p-1 rounded-full text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
                      title="Reset view"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub-bar with branding */}
                <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[9.5px] text-indigo-100/80 font-medium">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-300" />
                    <span>256-bit SSL Data Isolation</span>
                  </span>
                  <span>⚡ Powered by Jobab Chat</span>
                </div>
              </div>

              {/* 2. Chat Stream Container (Realistic spacing, scrollable, timestamps & Generative UI) */}
              <div className="p-3.5 space-y-3 bg-slate-50/90 text-xs min-h-[310px] max-h-[350px] overflow-y-auto">

                {/* Day Divider */}
                <div className="text-center my-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Today • 03:40 PM
                  </span>
                </div>

                {/* Message Stream */}
                {currentScenario.messages.map(m => {
                  const isUser = m.sender === "user";

                  return (
                    <div
                      key={m.id}
                      className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"} items-end`}
                    >
                      {/* Bot Avatar beside AI messages */}
                      {!isUser && (
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mb-1 shadow-2xs">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[88%]`}>
                        {/* Text Message Bubble */}
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                            isUser
                              ? "bg-indigo-600 text-white rounded-br-xs font-normal"
                              : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs font-normal"
                          }`}
                        >
                          <p>{m.text}</p>
                        </div>

                        {/* Interactive Generative UI Component Embeds */}
                        {m.cardType === "retail_product" && (
                          <div className="w-full mt-2 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-md space-y-2.5 animate-in fade-in">
                            {/* Product Header & Image */}
                            <div className="flex gap-2.5 items-start">
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                                <img
                                  src={m.cardData.image}
                                  alt={m.cardData.title}
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute bottom-0 left-0 right-0 bg-slate-900/80 text-[8px] font-bold text-white text-center py-0.5 uppercase">
                                  In Stock
                                </span>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                                    {m.cardData.category}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-400">{m.cardData.sku}</span>
                                </div>
                                <h5 className="font-bold text-xs text-slate-900 mt-0.5 line-clamp-1">
                                  {m.cardData.title}
                                </h5>
                                <div className="flex items-baseline gap-1.5 mt-1">
                                  <span className="text-sm font-black text-slate-900 font-mono">
                                    ৳{m.cardData.sellingPrice.toLocaleString()} BDT
                                  </span>
                                  <span className="text-[10px] text-slate-400 line-through font-mono">
                                    ৳{m.cardData.unitPrice.toLocaleString()}
                                  </span>
                                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200">
                                    -{m.cardData.discount}%
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Interactive Size Variant Chips */}
                            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                              <span className="text-[10.5px] font-bold text-slate-600">Select Size:</span>
                              <div className="flex items-center gap-1">
                                {m.cardData.sizes.map((s: string) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => setSelectedSize(s)}
                                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                      selectedSize === s
                                        ? "bg-indigo-600 text-white shadow-2xs"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Interactive Quantity Stepper & Actions */}
                            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                              {/* Quantity Stepper */}
                              <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                                  className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-white rounded transition-colors text-xs font-bold cursor-pointer"
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>
                                <span className="w-5 text-center text-xs font-bold font-mono text-slate-800">
                                  {selectedQty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedQty(selectedQty + 1)}
                                  className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-white rounded transition-colors text-xs font-bold cursor-pointer"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>

                              {/* Add to Cart Button */}
                              <button
                                type="button"
                                onClick={handleAddToCart}
                                className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10.5px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <ShoppingBag className="w-3 h-3 text-slate-600" />
                                <span>Add to Cart</span>
                              </button>

                              {/* Buy Now via bKash */}
                              <button
                                type="button"
                                onClick={handleAddToCart}
                                className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                              >
                                <span>⚡ Buy (৳{(m.cardData.sellingPrice * selectedQty).toLocaleString()})</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Generative Order Confirmation Card */}
                        {m.cardType === "retail_order_confirmed" && (
                          <div className="w-full mt-2 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 shadow-xs space-y-2 text-slate-900 animate-in fade-in">
                            <div className="flex items-center justify-between border-b border-emerald-200/80 pb-1.5">
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                                  <Check className="w-3 h-3" />
                                </div>
                                <span className="font-bold text-[11px] text-emerald-950">
                                  Order #{m.cardData.orderId}
                                </span>
                              </div>
                              <span className="text-[9.5px] font-black uppercase bg-[#e2136e] text-white px-2 py-0.5 rounded-full shadow-2xs">
                                bKash Paid
                              </span>
                            </div>

                            <div className="space-y-1 text-[11px] text-slate-700 font-medium">
                              <div className="flex justify-between">
                                <span>Item:</span>
                                <span className="font-bold text-slate-900">{m.cardData.item} ({m.cardData.size})</span>
                              </div>
                              <div className="flex justify-between">
                                <span>TrxID:</span>
                                <span className="font-mono font-bold text-emerald-800">{m.cardData.trxId}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total Paid:</span>
                                <span className="font-mono font-bold text-slate-900">৳{m.cardData.total.toLocaleString()} BDT</span>
                              </div>
                            </div>

                            <div className="pt-1.5 border-t border-emerald-200/60 flex items-center justify-between text-[10px] text-emerald-800 font-semibold">
                              <span className="flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{m.cardData.delivery}</span>
                              </span>
                            </div>
                          </div>
                        )}

                        {/* B2B Generative Meeting Card */}
                        {m.cardType === "b2b_lead" && (
                          <div className="w-full mt-2 rounded-2xl border border-indigo-200 bg-indigo-50/80 p-3 shadow-xs space-y-2 text-slate-900 animate-in fade-in">
                            <div className="flex items-center justify-between border-b border-indigo-200/80 pb-1.5">
                              <span className="text-[9.5px] font-black uppercase text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                                Enterprise Lead Qualified
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> High Priority
                              </span>
                            </div>
                            <div className="space-y-1 text-[11px] text-slate-700 font-medium">
                              <div className="flex justify-between">
                                <span>Company:</span>
                                <span className="font-bold text-slate-900">{m.cardData.company}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Meeting Slot:</span>
                                <span className="font-bold text-indigo-900">{m.cardData.slot}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Host:</span>
                                <span className="text-slate-800">{m.cardData.host}</span>
                              </div>
                            </div>
                            <div className="pt-1.5 border-t border-indigo-200/60 flex items-center gap-1.5">
                              <button
                                type="button"
                                className="flex-1 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Calendar className="w-3 h-3" />
                                <span>Add to Google Calendar</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Helpline Lab Report Card */}
                        {m.cardType === "helpline_lab" && (
                          <div className="w-full mt-2 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 shadow-xs space-y-2 text-slate-900 animate-in fade-in">
                            <div className="flex items-center justify-between border-b border-emerald-200/80 pb-1.5">
                              <span className="font-mono font-black text-xs text-emerald-950">
                                {m.cardData.testId}
                              </span>
                              <span className="text-[9.5px] font-black uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                                Ready for Pickup
                              </span>
                            </div>
                            <div className="space-y-1 text-[11px] text-slate-700 font-medium">
                              <div className="font-bold text-slate-900">{m.cardData.testName}</div>
                              <div className="text-[10px] text-slate-600">Consultant: {m.cardData.doctor}</div>
                              <div className="text-[10px] text-emerald-800 font-bold">{m.cardData.counter}</div>
                            </div>
                            <div className="pt-1.5 border-t border-emerald-200/60">
                              <button
                                type="button"
                                className="w-full py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <FileText className="w-3 h-3 text-emerald-400" />
                                <span>Download PDF Report (1.8 MB)</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* ERP Shipment Tracker Card */}
                        {m.cardType === "erp_shipment" && (
                          <div className="w-full mt-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs space-y-2 text-slate-900 animate-in fade-in">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                              <span className="font-mono font-bold text-xs text-slate-900">
                                #{m.cardData.batchId}
                              </span>
                              <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                {m.cardData.status}
                              </span>
                            </div>
                            <div className="space-y-1 text-[11px] text-slate-600">
                              <div className="flex justify-between">
                                <span>Route:</span>
                                <span className="font-medium text-slate-800">{m.cardData.origin} ➔ {m.cardData.destination}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Expected Arrival:</span>
                                <span className="font-bold text-slate-900">{m.cardData.eta}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Unpaid Balance:</span>
                                <span className="font-mono font-bold text-rose-600">৳{m.cardData.balance.toLocaleString()} BDT</span>
                              </div>
                            </div>
                            <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5">
                              <button
                                type="button"
                                className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <CreditCard className="w-3 h-3" />
                                <span>Pay via bKash</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Timestamp & Read Receipts */}
                        <div className={`flex items-center gap-1 text-[9.5px] text-slate-400 mt-1 ${isUser ? "justify-end" : "justify-start"}`}>
                          <span>{m.time}</span>
                          {isUser && <span className="text-indigo-600 font-bold">✓✓</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 3. Quick Suggestions Pills */}
              <div className="px-3 py-1.5 bg-slate-100/80 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto custom-scrollbar-horizontal">
                {currentScenario.quickReplies.map((qr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setChatInput(qr)}
                    className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 text-[10px] font-medium transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
                  >
                    {qr}
                  </button>
                ))}
              </div>

              {/* 4. Chat Input Box matching CDN widget */}
              <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Ask ${currentScenario.assistantName.toLowerCase()}...`}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (chatInput.trim()) setChatInput("");
                  }}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
