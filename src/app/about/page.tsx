"use client";

import React from "react";
import PublicPageShell from "../../components/public/PublicPageShell";

const defaultAboutData = {
  slug: "about",
  title: "About Jobab.chat — Next-Gen Conversational AI Infrastructure",
  subtitle: "Pioneering enterprise AI for Bangladeshi commerce, healthcare, fintech, and omnichannel support desks.",
  meta_title: "About Us — Jobab.chat | Enterprise AI Platform Bangladesh",
  meta_description: "Discover Jobab.chat's mission, autonomous multilingual AI agents, multi-tenant database isolation, and native bKash commerce automation.",
  last_updated: "September 2026",
  badge: "ENTERPRISE AI PLATFORM",
  content: `## Who We Are
Jobab.chat is an enterprise-grade AI conversational automation platform purpose-built for the fast-evolving digital commerce, ERP, and customer helpline landscape in Bangladesh. We bridge the gap between complex Large Language Models (LLMs) and everyday commercial operations, enabling businesses to provide 24/7 instant, accurate, and human-like customer care in both Bengali and English.

---

## The Problem We Solve
Traditional support in Bangladesh relies heavily on manual social media teams, leading to delayed response times, lost orders during off-hours, and high staff turnover. Off-the-shelf global chatbot tools fail to understand colloquial Bangladeshi contexts, regional dialects, and direct mobile financial services like bKash.

Jobab.chat solves this with:
- **Bilingual & Colloquial Understanding:** Natural language processing trained on localized Bengali and Banglish nuances.
- **Automated bKash & EPS Billing:** Instant merchant checkouts, tokenized recurring billing, and prepaid wallet top-ups.
- **Omnichannel Integration:** A single unified inbox connecting website widgets, WhatsApp, Facebook Messenger, and custom APIs.
- **Seamless Human Handover:** When complex queries arise, the AI smoothly routes conversations to human agents with full context summaries.

---

## Enterprise Multi-Tenant Architecture
Security and data integrity are the bedrock of Jobab.chat. Our cloud infrastructure features:
1. **Isolated Tenant Workspaces:** Your customer conversations, products, orders, and knowledge base documents are strictly segregated.
2. **Zero Cross-Tenant Model Training:** Your proprietary business data and customer transcripts are never used to train global public models.
3. **99.9% Uptime Guarantee:** High-availability server clusters with automated failovers and low-latency response delivery.
4. **Bank-Grade Encryption:** TLS 1.3 in transit and AES-256 at rest across all databases.

---

## Our Vision
We envision a future where every business in Bangladesh—from emerging direct-to-consumer retailers to nationwide financial helplines—can deliver world-class, instantaneous customer delight without runaway staffing overheads.`
};

export default function AboutPage() {
  return (
    <PublicPageShell initialSlug="about" fallbackData={defaultAboutData} />
  );
}
