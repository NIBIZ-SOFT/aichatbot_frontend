"use client";

import React, { useState, useEffect } from "react";
import PricingModal from "../auth/PricingModal";
import { api, API_BASE_URL, CDN_WIDGET_URL } from "../../lib/api";

// Modular Clean Landing Components
import LandingNavbar from "./LandingNavbar";
import HeroSection from "./HeroSection";
import IndustrySolutions from "./IndustrySolutions";
import PlatformCapabilities from "./PlatformCapabilities";
import InstantDeployment from "./InstantDeployment";
import PricingSection from "./PricingSection";
import FaqSection from "./FaqSection";
import CtaBanner from "./CtaBanner";
import LandingFooter from "./LandingFooter";

export default function LandingPage() {
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedPlanTier, setSelectedPlanTier] = useState<string>("growth");

  // Dynamic Subscription Plans loaded from PostgreSQL database
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

  // Platform Super Admin / Owner Live Chat Widget CDN injection
  useEffect(() => {
    const scriptId = "platform-superadmin-chat-widget";

    const initWidget = () => {
      if ((window as any).EnterpriseChatWidget && typeof (window as any).EnterpriseChatWidget.init === "function") {
        (window as any).EnterpriseChatWidget.init({
          widgetKey: "wgt_platform_live_support",
          apiUrl: API_BASE_URL,
          primaryColor: "#4F46E5",
          position: "bottom-right"
        });
      }
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = CDN_WIDGET_URL;
      script.setAttribute("data-widget-key", "wgt_platform_live_support");
      script.setAttribute("data-api-url", API_BASE_URL);
      script.setAttribute("data-primary-color", "#4F46E5");
      script.setAttribute("data-position", "bottom-right");
      script.async = true;
      script.onload = () => {
        initWidget();
      };
      document.body.appendChild(script);
    } else {
      initWidget();
    }

    return () => {
      const scriptEl = document.getElementById(scriptId);
      if (scriptEl) scriptEl.remove();
      const widgetHosts = document.querySelectorAll("#aiaas-widget-host, #enterprise-ai-widget-root, [id^='aiaas-'], [id^='enterprise-ai-widget']");
      widgetHosts.forEach(el => el.remove());
    };
  }, []);

  const handleOpenPricing = (tier: string) => {
    setSelectedPlanTier(tier);
    setShowPricingModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* 1. Sticky Clean Navbar */}
      <LandingNavbar onOpenPricing={handleOpenPricing} />

      {/* 2. Compact Hero Section */}
      <HeroSection onOpenPricing={handleOpenPricing} />

      {/* 3. Industry Verticals (B2B, Helpline, ERP, Retail) */}
      <IndustrySolutions />

      {/* 4. Platform Capabilities (Bento Grid) */}
      <PlatformCapabilities />

      {/* 5. Instant Deployment (3 Steps) */}
      <InstantDeployment />

      {/* 6. Transparent Pricing */}
      <PricingSection dbPlans={dbPlans} onOpenPricing={handleOpenPricing} />

      {/* 7. Frequently Asked Questions */}
      <FaqSection />

      {/* 8. Call to Action Banner */}
      <CtaBanner onOpenPricing={handleOpenPricing} />

      {/* 9. Clean Footer */}
      <LandingFooter />

      {/* Subscription Checkout & Register Modal */}
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
