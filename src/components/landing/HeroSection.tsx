"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, CheckCircle2, Bot, Send } from "lucide-react";

type IndustryKey = "b2b" | "helpline" | "erp" | "retail";

interface HeroSectionProps {
  onOpenPricing: (tier: string) => void;
}

export default function HeroSection({ onOpenPricing }: HeroSectionProps) {
  const [activeTab, setActiveTab] = useState<IndustryKey>("b2b");

  const scenarios = {
    b2b: {
      name: "B2B SaaS & Services",
      tag: "Lead Qualification & Demos",
      messages: [
        { sender: "user", text: "We need custom API integration and pricing for 80 team members." },
        { sender: "ai", text: "Hello! Our Enterprise plan includes custom webhooks, ERP API routing, and dedicated SLA. May I have your company email to send the technical proposal?" },
        { sender: "user", text: "Apex Tech Ltd, cto@apextech.com.bd" },
        { sender: "ai", text: "✅ Lead qualified! Proposal and demo slot sent to your email." }
      ]
    },
    helpline: {
      name: "24/7 Helpline & Clinic",
      tag: "Appointments & Lab Status",
      messages: [
        { sender: "user", text: "ডায়াগনস্টিক রিপোর্ট কখন পাওয়া যাবে এবং ডক্টর শিডিউল জানতে চাই।" },
        { sender: "ai", text: "আমাদের রিপোর্ট ডেলিভারি কাউন্টার রাত ১০টা পর্যন্ত খোলা। আপনার টেস্ট আইডি নম্বরটি দিলে এখনই স্ট্যাটাস জানিয়ে দিচ্ছি।" },
        { sender: "user", text: "টেস্ট আইডি: LAB-99214" },
        { sender: "ai", text: "✅ আপনার রিপোর্ট প্রস্তুত! ৩নং কাউন্টার থেকে সংগ্রহ করুন অথবা অনলাইন ডাউনলোড লিংকে ক্লিক করুন।" }
      ]
    },
    erp: {
      name: "ERP & Operations",
      tag: "Client & Staff Self-Service",
      messages: [
        { sender: "user", text: "What is the status of shipment #BATCH-4401 and invoice balance?" },
        { sender: "ai", text: "Batch #BATCH-4401 has cleared customs and will arrive tomorrow at 10 AM. Current unpaid invoice balance: ৳45,000 BDT." },
        { sender: "user", text: "Connect me with Accounts department." },
        { sender: "ai", text: "Connecting you to Mr. Tanvir from Accounts... Live agent joined!" }
      ]
    },
    retail: {
      name: "E-Commerce & Retail",
      tag: "In-Chat Orders & Checkout",
      messages: [
        { sender: "user", text: "আপনাদের প্রিমিয়াম পাঞ্জাবি কালেকশনটা দেখাবেন?" },
        { sender: "ai", text: "আমাদের প্রিমিয়াম কটন পাঞ্জাবি কালেকশন (৳2,190 BDT) স্টকে আছে। আপনি এখান থেকেই সরাসরি বিকাশ বা ক্যাশ অন ডেলিভারিতে অর্ডার করতে পারবেন।" },
        { sender: "user", text: "সাইজ L বিকাশ দিয়ে অর্ডার করবো।" },
        { sender: "ai", text: "✅ অর্ডার #ORD-882910 কনফার্ম! bKash পেমেন্ট লিংক ও SMS পাঠানো হয়েছে।" }
      ]
    }
  };

  return (
    <section className="relative pt-8 pb-12 sm:pt-14 sm:pb-16 bg-gradient-to-b from-indigo-50/60 via-white to-slate-50 border-b border-slate-200/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
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
              Empower your business with 24/7 bilingual AI assistants in Bengali & English. Qualify B2B leads, automate ERP self-service inquiries, and close sales seamlessly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
              <button
                onClick={() => onOpenPricing("growth")}
                className="w-full sm:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Start Free Trial</span>
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
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 100% Data Isolation
              </span>
            </div>
          </div>

          {/* Right Hero Interactive Simulator */}
          <div className="lg:col-span-5 space-y-2.5">
            {/* Pill Selector */}
            <div className="flex items-center justify-center lg:justify-start gap-1 overflow-x-auto pb-1 custom-scrollbar-horizontal">
              {[
                { id: "b2b", label: "🏢 B2B" },
                { id: "helpline", label: "📞 Helpline" },
                { id: "erp", label: "⚙️ ERP" },
                { id: "retail", label: "🛍️ Retail" },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as IndustryKey)}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Chat Frame */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-md mx-auto">
              <div className="bg-indigo-600 px-4 py-3 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">{scenarios[activeTab].name}</h4>
                    <p className="text-[10px] text-indigo-100 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {scenarios[activeTab].tag}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono">Live Demo</span>
              </div>

              <div className="p-3.5 space-y-2.5 bg-slate-50/80 text-xs min-h-[260px] max-h-[300px] overflow-y-auto">
                {scenarios[activeTab].messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`p-2.5 rounded-xl max-w-[90%] text-xs leading-relaxed ${
                        m.sender === "user"
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-2xs"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  disabled
                  placeholder={`Ask questions regarding ${scenarios[activeTab].name.toLowerCase()}...`}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-400 outline-none"
                />
                <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                  <Send className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
