"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "Is Jobab.chat only for e-commerce, or can other industries use it?",
      a: "Jobab.chat is a universal conversational AI platform designed for all sectors. It is actively used by B2B companies (for lead capture & demos), ERP systems (for client self-service), Healthcare & Clinics (for appointments & test inquiries), and E-Commerce stores (for product orders & payment settlements)."
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
    <section id="faq" className="py-10 sm:py-14 bg-white border-t border-slate-200/80">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Section Header */}
        <div className="text-center space-y-1.5">
          <h2 className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">Common Inquiries</h2>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h3>
        </div>

        {/* Accordions */}
        <div className="space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-slate-50/80 border border-slate-200 rounded-xl overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-3.5 sm:p-4 text-left font-bold text-slate-900 text-xs sm:text-sm flex items-center justify-between gap-3 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-indigo-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-3.5 sm:px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-2.5 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
