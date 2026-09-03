"use client";

import React from "react";
import PublicPageShell from "../../components/public/PublicPageShell";

const defaultPrivacyData = {
  slug: "privacy",
  title: "Privacy Policy",
  subtitle: "Transparent data protection, strict tenant isolation, and regulatory compliance standards.",
  meta_title: "Privacy Policy — Jobab.chat Enterprise Data Protection",
  meta_description: "Read Jobab.chat's comprehensive privacy policy, customer data encryption protocols, bKash financial privacy, and user rights.",
  last_updated: "September 2026",
  badge: "DATA PROTECTION & COMPLIANCE",
  content: `## 1. Introduction
At Jobab.chat ("we", "our", or "us"), we prioritize the privacy, confidentiality, and security of our business clients ("Tenants") and their end-user customers ("End Users"). This Privacy Policy explains how we collect, store, process, and safeguard information when you use the Jobab.chat platform, website, live chat widgets, and developer APIs.

---

## 2. Information We Collect
We collect information strictly necessary to provide our conversational AI and billing services:
- **Account & Profile Data:** Organization name, administrator email, contact details, and authentication credentials.
- **Customer Conversation Logs:** Chat transcripts submitted through website widgets or messaging integrations, utilized exclusively to generate AI responses and populate your team inbox.
- **Knowledge Base Materials:** Documents, FAQs, product catalogs, and policies uploaded by your team for Retrieval-Augmented Generation (RAG).
- **Billing & Transaction Data:** Transaction identifiers, invoice numbers, and payment status received from licensed gateways (bKash Direct Merchant and EPS Payment Gateway). **We do not store your bKash PIN or credit card numbers.**

---

## 3. Strict AI Confidentiality Guarantee
**We do not use your business documents or customer chat data to train public foundational AI models.**
All AI prompts and context retrievals are executed inside isolated private sessions. Your data remains strictly your intellectual property.

---

## 4. How We Protect Your Data
- **Multi-Tenant Logical Isolation:** Each tenant's data is partitioned using strict tenant ID tenancy filters and encrypted storage.
- **Encryption in Transit & Rest:** All communications are secured using SSL/TLS 1.3 encryption. Storage volumes are protected with AES-256 encryption.
- **Role-Based Access Control (RBAC):** Only authorized staff members within your organization have access to customer conversation transcripts.
- **Automated Audit Logging:** Every administrative action, contract change, and data export is permanently recorded in our security audit log.

---

## 5. Third-Party Integrations
Jobab.chat integrates with certified infrastructure partners:
- **Payment Gateways:** bKash Limited and EPS Payment Gateway for processing subscription and wallet recharges under Bangladesh Bank regulations.
- **LLM Infrastructure Providers:** Enterprise LLM endpoints operating under strict business data confidentiality agreements.

---

## 6. Data Retention & Deletion Rights
You retain full ownership of your data. You may at any time:
- Request a full JSON/CSV export of your conversations and contacts.
- Request permanent deletion of all stored transcripts, uploaded knowledge documents, and organization records upon subscription cancellation.

---

## 7. Contact Us Regarding Privacy
For inquiries regarding our data practices or to submit a data protection request, please contact:
- **Email:** privacy@jobab.chat / support@jobab.chat
- **Address:** Jobab.chat Headquarters, Dhaka, Bangladesh.`
};

export default function PrivacyPage() {
  return (
    <PublicPageShell initialSlug="privacy" fallbackData={defaultPrivacyData} />
  );
}
