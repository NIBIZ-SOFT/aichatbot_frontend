"use client";

import React from "react";
import PublicPageShell from "../../components/public/PublicPageShell";

const defaultTermsData = {
  slug: "terms",
  title: "Terms and Conditions of Service",
  subtitle: "Clear usage guidelines, subscription terms, AI token quotas, and service commitments.",
  meta_title: "Terms of Service — Jobab.chat Commercial Agreement",
  meta_description: "Review the Jobab.chat terms and conditions, subscription billing rules, AI token usage, refund policy, and 99.9% uptime SLA.",
  last_updated: "September 2026",
  badge: "LEGAL AGREEMENT",
  content: `## 1. Agreement to Terms
By creating an account, embedding our live chat widget, or subscribing to any Jobab.chat plan, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not access or use the platform.

---

## 2. Platform Access & Account Responsibility
- **Authorized Representative:** You represent that you have the authority to bind your business organization to these terms.
- **Account Security:** You are responsible for safeguarding your administrator credentials and ensuring authorized access among your team seats.
- **Acceptable Use:** You agree not to use Jobab.chat to transmit unlawful, defamatory, fraudulent, or harmful materials, or to engage in unauthorized spam distribution.

---

## 3. Subscriptions, AI Tokens & Billing
- **Subscription Tiers:** We offer monthly and annual subscriptions (Starter, Growth, Enterprise) as well as Pay-As-You-Go prepaid wallet plans.
- **Token Quotas:** Each plan includes a designated monthly AI token allotment. If your token quota is exhausted, you may recharge your prepaid AI wallet or upgrade your plan.
- **Automated Billing:** Payments are processed in Bangladeshi Taka (BDT) via official bKash Merchant APIs and EPS Payment Gateway.
- **Taxes & Invoicing:** Automated VAT and tax-compliant digital invoices are generated and accessible within your organization billing desk.

---

## 4. Refund & Cancellation Policy
- **Subscription Cancellation:** You may cancel your subscription at any time via the Subscription tab in your dashboard. Access will continue until the end of your prepaid billing period.
- **Refund Eligibility:** Due to direct computational costs incurred with AI processing, subscription fees and consumed AI tokens are generally non-refundable. However, if a billing discrepancy or gateway double-charge occurs, our support team will issue a refund within 5–7 business days upon verification.

---

## 5. Service Level Agreement (SLA) & Uptime
- **99.9% Uptime Commitment:** We strive to maintain continuous platform availability, excluding scheduled maintenance announced at least 24 hours in advance.
- **Support Response SLAs:** Priority email and ticket support response times are determined by your subscribed plan tier (Starter: 24h SLA, Growth: 6h SLA, Enterprise: 1h dedicated SLA).

---

## 6. Limitation of Liability
Jobab.chat provides autonomous AI assistance based on your uploaded documentation and prompts. While our models are tuned for high accuracy, you are advised to maintain human oversight for critical business transactions and medical/legal advice. Jobab.chat shall not be liable for indirect or consequential damages arising from service interruptions.

---

## 7. Governing Law & Dispute Resolution
These Terms shall be governed by and construed in accordance with the laws of the People's Republic of Bangladesh. Any disputes shall be resolved through good-faith negotiation or arbitration in Dhaka, Bangladesh.`
};

export default function TermsPage() {
  return (
    <PublicPageShell initialSlug="terms" fallbackData={defaultTermsData} />
  );
}
