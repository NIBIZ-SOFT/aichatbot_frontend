"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import {
  ShieldAlert, Building2, DollarSign, Cpu, Globe, Users,
  CheckCircle2, AlertTriangle, Play, Pause, ArrowUpRight,
  Search, RefreshCw, Layers, ShieldCheck, MoreVertical, Sliders,
  Sparkles, Activity, Clock, Check, X, Trash2, Zap, ArrowRight,
  FileText, Download, Lock, CheckCircle, HelpCircle, ExternalLink,
  ChevronRight, ChevronLeft, Filter, TrendingUp, Key, Terminal, CreditCard, Eye, EyeOff, Smartphone,
  Package, Tag, Plus, Edit2, Percent, MessageSquare, Bot
} from "lucide-react";
import { api } from "../../lib/api";
import { useRouter, usePathname } from "next/navigation";
import ModuleConfigModal from "../superadmin/ModuleConfigModal";
import ThemeManagementTab from "../superadmin/ThemeManagementTab";

interface TenantItem {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  owner_name: string;
  owner_email: string;
  subscription_tier: string;
  subscription_status: string;
  monthly_token_limit: number;
  used_tokens: number;
  usage_percent: number;
  total_agents: number;
  total_websites: number;
  enabled_modules?: Record<string, boolean>;
  created_at: string;
  custom_domain?: string | null;
}

interface MetricsData {
  total_tenants: number;
  active_tenants: number;
  suspended_tenants: number;
  total_users: number;
  total_connected_widgets: number;
  total_tokens_consumed: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  estimated_platform_mrr_usd: number;
  platform_uptime_percent: number;
}

interface SuperAdminViewProps {
  defaultTab?: "overview" | "tenants" | "plans" | "coupons" | "revenue" | "bkash" | "infrastructure" | "audit" | "theme";
}

export default function SuperAdminView({ defaultTab = "overview" }: SuperAdminViewProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const pathname = usePathname() || "";

  // Active Tab state (initialized from prop or route)
  const [activeTab, setActiveTab] = useState<"overview" | "tenants" | "plans" | "coupons" | "revenue" | "bkash" | "infrastructure" | "audit" | "theme">(defaultTab);

  // Sync tab when prop changes
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Tab Navigation Handler
  const navigateTab = (tab: "overview" | "tenants" | "plans" | "coupons" | "revenue" | "bkash" | "infrastructure" | "audit" | "theme") => {
    setActiveTab(tab);
    if (tab === "overview") {
      router.push("/superadmin");
    } else {
      router.push(`/superadmin/${tab}`);
    }
  };

  // Core Data
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [revenueData, setRevenueData] = useState<any | null>(null);
  const [infraData, setInfraData] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // SaaS Plans & Offers State
  const [plansList, setPlansList] = useState<any[]>([]);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [planFormData, setPlanFormData] = useState({
    code: "",
    name: "",
    description: "",
    badge_text: "",
    monthly_price_bdt: 4990,
    annual_price_bdt: 4240,
    monthly_token_limit: 500000,
    max_agents: 2,
    max_websites: 1,
    max_knowledge_docs: 50,
    monthly_conversation_limit: 1000,
    features_text: "500,000 AI Tokens / mo\n1 Connected Website Widget\n2 Support Seats\nGoogle Gemini 1.5 Flash AI",
    is_popular: false,
    is_active: true,
    is_custom_offer: false,
    display_order: 1
  });

  // Coupons & Promo Codes State
  const [couponsList, setCouponsList] = useState<any[]>([]);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [isSavingCoupon, setIsSavingCoupon] = useState(false);
  const [couponFormData, setCouponFormData] = useState({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: 20,
    min_purchase_amount_bdt: 0,
    max_discount_amount_bdt: 0,
    applicable_tiers: [] as string[],
    max_redemptions: 100,
    is_active: true,
    valid_until: ""
  });

  // bKash PGW Gateway Customization State
  const [bkashSettings, setBkashSettings] = useState<any>({
    is_sandbox: true,
    base_url: "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized",
    app_key: "4f6o0cjiki2rfm34kfdadl1eqq",
    app_secret: "2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b",
    username: "sandboxTokenizedUser02",
    password: "sandboxTokenizedUser02@12345",
    merchant_number: "01837586105",
    status: "Sandbox Test Mode"
  });
  const [isSavingBkash, setIsSavingBkash] = useState(false);
  const [isTestingBkash, setIsTestingBkash] = useState(false);
  const [bkashPingResult, setBkashPingResult] = useState<any | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);

  // Tenants Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");

  // Audit Logs Filter State
  const [auditActionFilter, setAuditActionFilter] = useState<string>("all");
  const [inspectingAudit, setInspectingAudit] = useState<any | null>(null);

  // AI Ping Test & Live Configuration State
  const [aiSettings, setAiSettings] = useState<any>({
    api_key: "",
    api_key_masked: "",
    ai_base_url: "https://generativelanguage.googleapis.com/v1beta/openai/",
    master_model: "gemini-2.5-flash",
    fallback_model: "gemini-1.5-flash",
    embedding_model: "text-embedding-004",
    temperature: 0.3,
    max_tokens: 2048,
    rate_limit_rpm: 120,
    system_prompt_prefix: "You are an enterprise AI customer support specialist.",
    status: "Operational — High Throughput",
    available_models: ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-3.6-flash"]
  });
  const [isSavingAI, setIsSavingAI] = useState(false);
  const [showAIKey, setShowAIKey] = useState(false);
  const [isTestingAI, setIsTestingAI] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<any | null>(null);

  // Plan Edit Modal State
  const [editingTenant, setEditingTenant] = useState<TenantItem | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>("enterprise");
  const [customTokens, setCustomTokens] = useState<number>(10000000);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  
  // Dynamic Module Configuration Modal State
  const [configuringModulesTenant, setConfiguringModulesTenant] = useState<TenantItem | null>(null);

  // Suspension Reason Modal State (Best-Practice Business Account Lifecycle)
  const [suspensionModalTenant, setSuspensionModalTenant] = useState<TenantItem | null>(null);
  const [suspensionCategory, setSuspensionCategory] = useState<string>("payment_overdue");
  const [suspensionReasonText, setSuspensionReasonText] = useState<string>("Subscription renewal is overdue. Please settle invoice to reactivate.");
  const [isProcessingSuspension, setIsProcessingSuspension] = useState<boolean>(false);

  // Horizontal Drag-to-Scroll State for Tabs Bar
  const tabsContainerRef = React.useRef<HTMLDivElement>(null);
  const [isDraggingTabs, setIsDraggingTabs] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);
  const [hasDraggedTabs, setHasDraggedTabs] = useState(false);

  const handleTabsMouseDown = (e: React.MouseEvent) => {
    if (!tabsContainerRef.current) return;
    setIsDraggingTabs(true);
    setHasDraggedTabs(false);
    setDragStartX(e.pageX - tabsContainerRef.current.offsetLeft);
    setDragScrollLeft(tabsContainerRef.current.scrollLeft);
  };

  const handleTabsMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingTabs || !tabsContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabsContainerRef.current.offsetLeft;
    const walk = (x - dragStartX) * 1.6;
    if (Math.abs(walk) > 4) {
      setHasDraggedTabs(true);
    }
    tabsContainerRef.current.scrollLeft = dragScrollLeft - walk;
  };

  const handleTabsMouseUpOrLeave = () => {
    setIsDraggingTabs(false);
  };

  const handleTabClick = (tab: "overview" | "tenants" | "plans" | "coupons" | "revenue" | "bkash" | "infrastructure" | "audit" | "theme") => {
    if (hasDraggedTabs) return;
    navigateTab(tab);
  };

  const handleTabsWheel = (e: React.WheelEvent) => {
    if (!tabsContainerRef.current) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    tabsContainerRef.current.scrollLeft += e.deltaY;
  };

  const scrollTabsDirection = (direction: 'left' | 'right') => {
    if (!tabsContainerRef.current) return;
    tabsContainerRef.current.scrollBy({
      left: direction === 'left' ? -220 : 220,
      behavior: 'smooth'
    });
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [m, tList, rev, infra, logs, bkashCfg, plans, coupons, aiCfg] = await Promise.all([
        api.getSuperAdminMetrics(),
        api.getSuperAdminTenants(),
        api.getSuperAdminRevenue(),
        api.getSuperAdminInfrastructure(),
        api.getSuperAdminAuditLogs(),
        api.getSuperAdminBkashSettings().catch(() => null),
        api.getSuperAdminPlans().catch(() => []),
        api.getSuperAdminCoupons().catch(() => []),
        api.getSuperAdminAISettings().catch(() => null)
      ]);
      setMetrics(m);
      setTenants(tList);
      setRevenueData(rev);
      setInfraData(infra);
      setAuditLogs(logs);
      if (bkashCfg) setBkashSettings(bkashCfg);
      if (plans) setPlansList(plans);
      if (coupons) setCouponsList(coupons);
      if (aiCfg) setAiSettings(aiCfg);
    } catch (err) {
      console.error("Super Admin data load error:", err);
      showToast("Error loading Super Admin control plane", "Ensure you are logged in as super_admin.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1-Click Activate / Suspend Tenant with Best-Practice Business Modal
  const handleToggleStatus = async (tenant: TenantItem) => {
    if (tenant.is_active) {
      // Open professional suspension reason modal
      setSuspensionModalTenant(tenant);
      setSuspensionCategory("payment_overdue");
      setSuspensionReasonText("Subscription renewal is overdue. Please settle pending invoice to restore full 24/7 AI capabilities.");
    } else {
      // 1-Click Direct Instant Activation
      try {
        await api.updateTenantStatus(tenant.id, true, "Super Admin 1-Click Reactivated");
        setTenants(prev =>
          prev.map(t => (t.id === tenant.id ? { ...t, is_active: true } : t))
        );
        showToast(
          "Tenant Reactivated",
          `${tenant.name} is now LIVE & ACTIVE across all AI widgets & APIs!`,
          "success"
        );
        api.getSuperAdminMetrics().then(setMetrics).catch(() => { });
        api.getSuperAdminAuditLogs().then(setAuditLogs).catch(() => { });
      } catch (e: any) {
        showToast("Reactivation Failed", e.message || "Failed to activate tenant", "error");
      }
    }
  };

  const handleConfirmSuspension = async () => {
    if (!suspensionModalTenant) return;
    setIsProcessingSuspension(true);
    try {
      await api.updateTenantStatus(
        suspensionModalTenant.id,
        false,
        suspensionReasonText
      );
      setTenants(prev =>
        prev.map(t => (t.id === suspensionModalTenant.id ? { ...t, is_active: false } : t))
      );
      showToast(
        "Tenant Gracefully Suspended",
        `${suspensionModalTenant.name} is now paused (${suspensionCategory.replace('_', ' ')}). Graceful maintenance notice enabled on widgets.`,
        "info"
      );
      setSuspensionModalTenant(null);
      api.getSuperAdminMetrics().then(setMetrics).catch(() => { });
      api.getSuperAdminAuditLogs().then(setAuditLogs).catch(() => { });
    } catch (e: any) {
      showToast("Suspension Failed", e.message || "Failed to suspend tenant", "error");
    } finally {
      setIsProcessingSuspension(false);
    }
  };

  // Delete / Purge Tenant
  const handleDeleteTenant = async (tenant: TenantItem) => {
    if (!confirm(`CAUTION: Permanently delete "${tenant.name}"? All product knowledge, chats, and configurations will be permanently purged.`)) {
      return;
    }

    try {
      await api.deleteTenant(tenant.id);
      setTenants(prev => prev.filter(t => t.id !== tenant.id));
      showToast("Tenant Deleted", `Organization "${tenant.name}" permanently purged.`, "success");
      api.getSuperAdminMetrics().then(setMetrics).catch(() => { });
      api.getSuperAdminAuditLogs().then(setAuditLogs).catch(() => { });
    } catch (e: any) {
      showToast("Delete Failed", e.message || "Could not delete tenant", "error");
    }
  };

  // Open Tenant Quota Adjustment Modal
  const handleOpenEditTenantPlan = (tenant: TenantItem) => {
    setEditingTenant(tenant);
    setSelectedTier(tenant.subscription_tier.toLowerCase());
    setCustomTokens(tenant.monthly_token_limit);
  };

  // Save Tenant Quota Adjustment
  const handleSaveTenantPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    setIsUpdatingPlan(true);
    try {
      await api.updateTenantPlan(
        editingTenant.id,
        selectedTier,
        customTokens
      );

      setTenants(prev =>
        prev.map(t =>
          t.id === editingTenant.id
            ? {
              ...t,
              subscription_tier: selectedTier.toUpperCase(),
              monthly_token_limit: customTokens,
              usage_percent: Math.min(100, Math.round((t.used_tokens / customTokens) * 100))
            }
            : t
        )
      );

      showToast("Plan Updated", `Updated ${editingTenant.name} to ${selectedTier.toUpperCase()} (${(customTokens / 1000000).toFixed(1)}M tokens/mo)`, "success");
      setEditingTenant(null);
      api.getSuperAdminMetrics().then(setMetrics).catch(() => { });
      api.getSuperAdminAuditLogs().then(setAuditLogs).catch(() => { });
    } catch (err: any) {
      showToast("Update Failed", err.message || "Failed to update subscription tier", "error");
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  // AI Settings Handler
  const handleSaveAISettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAI(true);
    try {
      await api.updateSuperAdminAISettings(aiSettings);
      showToast("AI Cluster Updated", "Global Gemini API configuration and model parameters saved successfully.", "success");
      const updated = await api.getSuperAdminAISettings();
      setAiSettings(updated);
      api.getSuperAdminInfrastructure().then(setInfraData).catch(() => { });
      api.getSuperAdminAuditLogs().then(setAuditLogs).catch(() => { });
    } catch (err: any) {
      showToast("Error", err.message || "Failed to update AI settings", "error");
    } finally {
      setIsSavingAI(false);
    }
  };

  // Live AI Ping Benchmark
  const handleTestAIPing = async () => {
    setIsTestingAI(true);
    setAiTestResult(null);
    try {
      const res = await api.testSuperAdminAIPing();
      setAiTestResult(res);
      if (res.status === "online") {
        showToast("AI Cluster Operational", `Response received in ${res.latency_ms}ms`, "success");
      } else {
        showToast("AI Ping Warning", res.error || "Degraded latency", "info");
      }
    } catch (e: any) {
      showToast("AI Test Failed", e.message || "Network error", "error");
    } finally {
      setIsTestingAI(false);
    }
  };

  // bKash PGW Gateway Handlers
  const handleSaveBkashSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBkash(true);
    try {
      await api.updateSuperAdminBkashSettings(bkashSettings);
      showToast("bKash Gateway Updated", "Platform bKash credentials and environment settings saved successfully.", "success");
      const updated = await api.getSuperAdminBkashSettings();
      setBkashSettings(updated);
      api.getSuperAdminAuditLogs().then(setAuditLogs).catch(() => { });
    } catch (err: any) {
      showToast("Error", err.message || "Failed to update bKash settings", "error");
    } finally {
      setIsSavingBkash(false);
    }
  };

  const handleTestBkashPing = async () => {
    setIsTestingBkash(true);
    setBkashPingResult(null);
    try {
      const res = await api.testSuperAdminBkashConnection();
      setBkashPingResult(res);
      if (res.status === "healthy") {
        showToast("bKash API Active", `Latency: ${res.latency_ms}ms • Token Grant Successful`, "success");
      } else {
        showToast("bKash Ping Warning", res.message, "info");
      }
    } catch (err: any) {
      showToast("Connection Error", err.message || "bKash ping test failed", "error");
    } finally {
      setIsTestingBkash(false);
    }
  };

  // Plan Handlers
  const handleOpenCreatePlan = () => {
    setEditingPlanId(null);
    setPlanFormData({
      code: `custom_tier_${Math.floor(Math.random() * 900 + 100)}`,
      name: "New Campaign Offer",
      description: "Custom promotional AIaaS package for Bangladeshi startups and businesses.",
      badge_text: "LIMITED OFFER",
      monthly_price_bdt: 9990,
      annual_price_bdt: 8490,
      monthly_token_limit: 1500000,
      max_agents: 5,
      max_websites: 3,
      max_knowledge_docs: 100,
      monthly_conversation_limit: 5000,
      features_text: "1,500,000 AI Tokens / mo\n3 Website Widgets\n5 Support Seats\nCustom Campaign Support",
      is_popular: false,
      is_active: true,
      is_custom_offer: true,
      display_order: plansList.length + 1
    });
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (p: any) => {
    setEditingPlanId(p.id);
    setPlanFormData({
      code: p.code,
      name: p.name,
      description: p.description,
      badge_text: p.badge_text || "",
      monthly_price_bdt: p.monthly_price_bdt,
      annual_price_bdt: p.annual_price_bdt,
      monthly_token_limit: p.monthly_token_limit,
      max_agents: p.max_agents,
      max_websites: p.max_websites,
      max_knowledge_docs: p.max_knowledge_docs || 50,
      monthly_conversation_limit: p.monthly_conversation_limit || 1000,
      features_text: (p.features || []).join("\n"),
      is_popular: p.is_popular || false,
      is_active: p.is_active !== false,
      is_custom_offer: p.is_custom_offer || false,
      display_order: p.display_order || 1
    });
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPlan(true);
    try {
      const featuresArray = planFormData.features_text
        .split("\n")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const payload = {
        code: planFormData.code,
        name: planFormData.name,
        description: planFormData.description,
        badge_text: planFormData.badge_text || null,
        monthly_price_bdt: Number(planFormData.monthly_price_bdt),
        annual_price_bdt: Number(planFormData.annual_price_bdt),
        monthly_token_limit: Number(planFormData.monthly_token_limit),
        max_agents: Number(planFormData.max_agents),
        max_websites: Number(planFormData.max_websites),
        max_knowledge_docs: Number(planFormData.max_knowledge_docs),
        monthly_conversation_limit: Number(planFormData.monthly_conversation_limit),
        features: featuresArray,
        is_popular: planFormData.is_popular,
        is_active: planFormData.is_active,
        is_custom_offer: planFormData.is_custom_offer,
        display_order: Number(planFormData.display_order)
      };

      if (editingPlanId) {
        await api.updateSuperAdminPlan(editingPlanId, payload);
        showToast("Plan Updated", `Successfully updated "${planFormData.name}".`, "success");
      } else {
        await api.createSuperAdminPlan(payload);
        showToast("Plan Created", `Successfully created new tier "${planFormData.name}".`, "success");
      }

      setIsPlanModalOpen(false);
      const updated = await api.getSuperAdminPlans();
      setPlansList(updated);
      api.getSuperAdminAuditLogs().then(setAuditLogs).catch(() => { });
    } catch (err: any) {
      showToast("Error", err.message || "Failed to save plan", "error");
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleDeletePlan = async (planId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete/archive the plan "${name}"?`)) return;
    try {
      await api.deleteSuperAdminPlan(planId);
      showToast("Plan Deleted", `Plan "${name}" removed from platform.`, "success");
      setPlansList(prev => prev.filter(p => p.id !== planId));
      api.getSuperAdminAuditLogs().then(setAuditLogs).catch(() => { });
    } catch (err: any) {
      showToast("Delete Failed", err.message || "Failed to delete plan", "error");
    }
  };

  // Coupon Handlers
  const handleOpenCreateCoupon = () => {
    setEditingCouponId(null);
    const defaultTiers = plansList.filter(p => p.monthly_price_bdt > 0).map(p => p.code);
    setCouponFormData({
      code: "EID2026",
      description: "Eid Mega Campaign 20% Discount",
      discount_type: "percentage",
      discount_value: 20,
      min_purchase_amount_bdt: 4000,
      max_discount_amount_bdt: 5000,
      applicable_tiers: defaultTiers.length > 0 ? defaultTiers : ["starter", "growth", "enterprise"],
      max_redemptions: 100,
      is_active: true,
      valid_until: ""
    });
    setIsCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (c: any) => {
    setEditingCouponId(c.id);
    setCouponFormData({
      code: c.code,
      description: c.description,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      min_purchase_amount_bdt: c.min_purchase_amount_bdt || 0,
      max_discount_amount_bdt: c.max_discount_amount_bdt || 0,
      applicable_tiers: Array.isArray(c.applicable_tiers) ? c.applicable_tiers : [],
      max_redemptions: c.max_redemptions || 100,
      is_active: c.is_active !== false,
      valid_until: c.valid_until ? new Date(c.valid_until).toISOString().split("T")[0] : ""
    });
    setIsCouponModalOpen(true);
  };

  const toggleCouponTier = (tierCode: string) => {
    setCouponFormData(prev => {
      const exists = prev.applicable_tiers.includes(tierCode);
      const updated = exists
        ? prev.applicable_tiers.filter(t => t !== tierCode)
        : [...prev.applicable_tiers, tierCode];
      return { ...prev, applicable_tiers: updated };
    });
  };

  const selectAllCouponTiers = () => {
    const allCodes = plansList.map(p => p.code);
    setCouponFormData(prev => ({ ...prev, applicable_tiers: allCodes }));
  };

  const clearAllCouponTiers = () => {
    setCouponFormData(prev => ({ ...prev, applicable_tiers: [] }));
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCoupon(true);
    try {
      const payload = {
        code: couponFormData.code.trim().toUpperCase(),
        description: couponFormData.description,
        discount_type: couponFormData.discount_type,
        discount_value: Number(couponFormData.discount_value),
        min_purchase_amount_bdt: Number(couponFormData.min_purchase_amount_bdt),
        max_discount_amount_bdt: couponFormData.max_discount_amount_bdt ? Number(couponFormData.max_discount_amount_bdt) : null,
        applicable_tiers: couponFormData.applicable_tiers.length > 0 ? couponFormData.applicable_tiers : null,
        max_redemptions: couponFormData.max_redemptions ? Number(couponFormData.max_redemptions) : null,
        is_active: couponFormData.is_active,
        valid_until: couponFormData.valid_until ? new Date(couponFormData.valid_until).toISOString() : null
      };

      if (editingCouponId) {
        await api.updateSuperAdminCoupon(editingCouponId, payload);
        showToast("Coupon Updated", `Promo code "${payload.code}" updated.`, "success");
      } else {
        await api.createSuperAdminCoupon(payload);
        showToast("Coupon Created", `Promo code "${payload.code}" is now LIVE!`, "success");
      }

      setIsCouponModalOpen(false);
      const updated = await api.getSuperAdminCoupons();
      setCouponsList(updated);
      api.getSuperAdminAuditLogs().then(setAuditLogs).catch(() => { });
    } catch (err: any) {
      showToast("Error", err.message || "Failed to save coupon", "error");
    } finally {
      setIsSavingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (couponId: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon code "${code}"?`)) return;
    try {
      await api.deleteSuperAdminCoupon(couponId);
      showToast("Coupon Deleted", `Coupon "${code}" has been removed.`, "success");
      setCouponsList(prev => prev.filter(c => c.id !== couponId));
      api.getSuperAdminAuditLogs().then(setAuditLogs).catch(() => { });
    } catch (err: any) {
      showToast("Delete Failed", err.message || "Failed to delete coupon", "error");
    }
  };

  // Filtered Tenants
  const filteredTenants = tenants.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      t.name.toLowerCase().includes(q) ||
      t.slug.toLowerCase().includes(q) ||
      (t.owner_email && t.owner_email.toLowerCase().includes(q)) ||
      (t.owner_name && t.owner_name.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && t.is_active) ||
      (statusFilter === "suspended" && !t.is_active);

    const matchesTier =
      tierFilter === "all" ||
      t.subscription_tier.toLowerCase() === tierFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesTier;
  });

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter(log => {
    if (auditActionFilter === "all") return true;
    return log.action === auditActionFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Loading Platform SaaS Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans antialiased">

      {/* Top Command Center Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-indigo-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-extrabold text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-800/80 uppercase tracking-wide flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Root Master Controller
              </span>
              <span className="text-[10.5px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                1,000+ Tenants Engine Active
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight mt-2 flex items-center gap-3">
              Platform SaaS Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Global multi-tenant governance, revenue metering in Bangladeshi Taka (৳), AI token throughput, and dynamic feature flag authorization.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Metrics
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar with Drag-to-Scroll & Smooth Chevrons */}
        <div className="relative mt-6 pt-5 border-t border-slate-800 group">
          
          {/* Scroll Left Button */}
          <button
            type="button"
            onClick={() => scrollTabsDirection("left")}
            className="hidden sm:flex absolute -left-2.5 top-[60%] -translate-y-1/2 z-20 h-7 w-7 rounded-full bg-slate-800/95 text-slate-300 hover:text-white hover:bg-indigo-600 border border-slate-700 shadow-xl items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
            title="Scroll Tabs Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Draggable Tabs Container */}
          <div
            ref={tabsContainerRef}
            onMouseDown={handleTabsMouseDown}
            onMouseMove={handleTabsMouseMove}
            onMouseUp={handleTabsMouseUpOrLeave}
            onMouseLeave={handleTabsMouseUpOrLeave}
            onWheel={handleTabsWheel}
            className={`flex items-center gap-2 overflow-x-auto text-xs pb-1 select-none custom-scrollbar-horizontal scroll-smooth transition-colors ${
              isDraggingTabs ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            <button
              onClick={() => handleTabClick("overview")}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${activeTab === "overview"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
            >
              <Layers className="w-4 h-4" /> Global Overview
            </button>

            <button
              onClick={() => handleTabClick("tenants")}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${activeTab === "tenants"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
            >
              <Building2 className="w-4 h-4" /> Subscribed Tenants ({tenants.length})
            </button>

            <button
              onClick={() => handleTabClick("plans")}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${activeTab === "plans"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
            >
              <Package className="w-4 h-4 text-indigo-400" /> SaaS Plans ({plansList.length})
            </button>

            <button
              onClick={() => handleTabClick("coupons")}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${activeTab === "coupons"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
            >
              <Tag className="w-4 h-4 text-emerald-400" /> Coupons & Promos ({couponsList.length})
            </button>

            <button
              onClick={() => handleTabClick("revenue")}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${activeTab === "revenue"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
            >
              <DollarSign className="w-4 h-4" /> Revenue & MRR (৳ BDT)
            </button>

            <button
              onClick={() => handleTabClick("bkash")}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${activeTab === "bkash"
                ? "bg-[#e2136e] text-white shadow-md shadow-pink-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
            >
              <CreditCard className="w-4 h-4 text-pink-400" /> bKash PGW Gateway
            </button>

            <button
              onClick={() => handleTabClick("infrastructure")}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${activeTab === "infrastructure"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
            >
              <Cpu className="w-4 h-4" /> AI Infrastructure
            </button>

            <button
              onClick={() => handleTabClick("audit")}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${activeTab === "audit"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
            >
              <Activity className="w-4 h-4" /> Security & Audit Logs ({auditLogs.length})
            </button>

            <button
              onClick={() => handleTabClick("theme")}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${activeTab === "theme"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> Theme & Branding
            </button>
          </div>

          {/* Scroll Right Button */}
          <button
            type="button"
            onClick={() => scrollTabsDirection("right")}
            className="hidden sm:flex absolute -right-2.5 top-[60%] -translate-y-1/2 z-20 h-7 w-7 rounded-full bg-slate-800/95 text-slate-300 hover:text-white hover:bg-indigo-600 border border-slate-700 shadow-xl items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
            title="Scroll Tabs Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GLOBAL SAAS OVERVIEW & KPI METRICS */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-200">

          {/* 6 Top Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Total Tenants */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-extrabold uppercase tracking-wider">Subscribed Tenants</span>
                <Building2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {metrics ? metrics.total_tenants : 0}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {metrics ? metrics.active_tenants : 0} Active • {metrics ? metrics.suspended_tenants : 0} Suspended
              </div>
            </div>

            {/* Platform MRR in BDT */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-extrabold uppercase tracking-wider">Platform MRR (BDT)</span>
                <span className="font-mono text-xs text-indigo-600 font-bold">৳ BDT</span>
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                ৳{metrics ? (metrics.estimated_platform_mrr_usd).toLocaleString() : 0}
              </div>
              <div className="text-[11px] text-indigo-600 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Projected ARR: ৳{metrics ? (metrics.estimated_platform_mrr_usd * 12).toLocaleString() : 0}
              </div>
            </div>

            {/* Total AI Tokens Consumed */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-extrabold uppercase tracking-wider">Global AI Tokens</span>
                <Cpu className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {metrics ? (metrics.total_tokens_consumed / 1000000).toFixed(2) : 0}M
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {metrics ? (metrics.total_prompt_tokens / 1000).toFixed(0) : 0}k Prompt • {metrics ? (metrics.total_completion_tokens / 1000).toFixed(0) : 0}k Output
              </div>
            </div>

            {/* Connected Storefronts */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-extrabold uppercase tracking-wider">Storefront Widgets</span>
                <Globe className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {metrics ? metrics.total_connected_widgets : 0}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Live Chat Integration
              </div>
            </div>

            {/* Total Staff Accounts */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-extrabold uppercase tracking-wider">Total Client Staff</span>
                <Users className="w-4 h-4 text-cyan-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {metrics ? metrics.total_users : 0}
              </div>
              <div className="text-[11px] text-slate-500">
                Owners, Support, Sales & Tech Agents
              </div>
            </div>

            {/* SLA Guaranteed Uptime */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-extrabold uppercase tracking-wider">Platform SLA Uptime</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight text-emerald-600">
                99.99%
              </div>
              <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> All Services Operational
              </div>
            </div>
          </div>

          {/* Platform Live Operations & Studio Card (Full Width) */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl border border-indigo-800/50 shadow-xl space-y-4 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse"></span>
                <h3 className="font-extrabold text-base text-white">Platform Live Support & AI Studio</h3>
                <span className="text-[10px] bg-emerald-950/90 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-700">
                  Landing Page & Platform Master
                </span>
              </div>
              <span className="text-xs text-indigo-300 font-medium">Real-time visitor chats & autonomous intelligence</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              Interact directly with landing page visitors in real-time, take over from the autonomous AI assistant, ingest documentation into the platform RAG knowledge base, and manage official live chat storefront widgets.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 text-xs">
              <button
                type="button"
                onClick={() => router.push("/inbox")}
                className="p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white flex items-center justify-between transition-all cursor-pointer shadow-lg shadow-indigo-600/30 active:scale-95"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white text-xs">Support Live Inbox</div>
                    <div className="text-[10px] text-indigo-200">Visitor Chats & Leads</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-200" />
              </button>

              <button
                type="button"
                onClick={() => router.push("/assistants")}
                className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 font-bold text-slate-200 flex items-center justify-between transition-all cursor-pointer border border-slate-700 hover:border-slate-600 active:scale-95"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white text-xs">AI Assistants Studio</div>
                    <div className="text-[10px] text-slate-400">Prompts, Tone & Model</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => router.push("/knowledge")}
                className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 font-bold text-slate-200 flex items-center justify-between transition-all cursor-pointer border border-slate-700 hover:border-slate-600 active:scale-95"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white text-xs">RAG Knowledge Base</div>
                    <div className="text-[10px] text-slate-400">PDFs, Docs & FAQs</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => router.push("/websites")}
                className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 font-bold text-slate-200 flex items-center justify-between transition-all cursor-pointer border border-slate-700 hover:border-slate-600 active:scale-95"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white text-xs">Storefront Widgets</div>
                    <div className="text-[10px] text-slate-400">Embed Keys & Styling</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Quick Shortcuts & Top Tenants Table Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Quick Shortcuts */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-600" /> Quick Operations
              </h3>

              <div className="space-y-2.5 text-xs">
                <button
                  onClick={() => navigateTab("tenants")}
                  className="w-full p-3 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 font-bold flex items-center justify-between transition-all cursor-pointer border border-indigo-100"
                >
                  <div className="flex items-center gap-2.5">
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    <span>Manage Tenant Feature Flags</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-indigo-500" />
                </button>

                <button
                  onClick={() => navigateTab("revenue")}
                  className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold flex items-center justify-between transition-all cursor-pointer border border-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Inspect Monthly Invoices (BDT)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => navigateTab("infrastructure")}
                  className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold flex items-center justify-between transition-all cursor-pointer border border-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <span>Test AI Model Latency & Ping</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* AI Health Benchmark Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-indigo-600" /> Live AI Engine Health Benchmark
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Google Gemini 1.5 Flash platform infrastructure connection status.</p>
                </div>

                <button
                  onClick={handleTestAIPing}
                  disabled={isTestingAI}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isTestingAI ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  {isTestingAI ? "Testing Latency..." : "Ping AI Cluster"}
                </button>
              </div>

              {aiTestResult ? (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between font-bold text-emerald-800">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> AI Engine Online & Operational
                    </span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300">
                      ⚡ Latency: {aiTestResult.latency_ms}ms
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-mono">
                    Model: {aiTestResult.model} • Prompt: {aiTestResult.prompt_tokens} tokens • Output: {aiTestResult.completion_tokens} tokens
                  </div>
                  <div className="text-[11px] bg-white p-2.5 rounded-xl border border-emerald-200 font-mono text-slate-700">
                    &quot;{aiTestResult.response}&quot;
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between text-slate-600">
                  <span>AI cluster running with 245ms average response speed. Click &apos;Ping AI Cluster&apos; to run live diagnostic test.</span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SUBSCRIBED TENANTS HUB (1,000+ SCALE) */}
      {/* ========================================================================= */}
      {activeTab === "tenants" && (
        <div className="space-y-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in duration-200">

          {/* Controls & Search */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" /> Subscribed Organizations & Module Feature Flags
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Scale to 1,000+ organizations. 1-Click customize active modules, override token quotas, or suspend non-paying clients.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto text-xs">
              {/* Search */}
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search organization or owner..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              {/* Tier Filter */}
              <select
                value={tierFilter}
                onChange={e => setTierFilter(e.target.value)}
                className="py-2 px-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 bg-white font-medium shrink-0"
              >
                <option value="all">All Tiers ({tenants.length})</option>
                <option value="enterprise">Enterprise (৳49,990/mo)</option>
                <option value="growth">Growth (৳19,990/mo)</option>
                <option value="starter">Starter (৳4,990/mo)</option>
                <option value="free">Free Trial</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="py-2 px-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 bg-white font-medium shrink-0"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>
            </div>
          </div>

          {/* Tenants Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Organization / Client</th>
                  <th className="py-3.5 px-4">Owner & Contact</th>
                  <th className="py-3.5 px-4">Plan & Tier</th>
                  <th className="py-3.5 px-4">Token Meter</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Lifecycle Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No organizations match the search filter.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map(t => {
                    const isEnterprise = t.subscription_tier.toLowerCase() === "enterprise";
                    const isGrowth = t.subscription_tier.toLowerCase() === "growth";
                    const tierBadgeColor = isEnterprise
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : isGrowth
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                        : "bg-slate-100 text-slate-700 border-slate-200";

                    const activeModCount = Object.values(t.enabled_modules || {}).filter(Boolean).length || 10;

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* Org Name */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {t.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            /{t.slug} • {t.total_websites} Widgets • {t.total_agents} Staff
                          </div>
                        </td>

                        {/* Owner */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">{t.owner_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{t.owner_email}</div>
                        </td>

                        {/* Tier */}
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${tierBadgeColor}`}>
                            {t.subscription_tier}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-1 font-medium">
                            {t.subscription_tier.toLowerCase() === 'enterprise' ? '৳49,990/mo' : t.subscription_tier.toLowerCase() === 'growth' ? '৳19,990/mo' : '৳4,990/mo'}
                          </div>
                        </td>

                        {/* Token Meter */}
                        <td className="py-3.5 px-4 min-w-[160px]">
                          <div className="flex justify-between text-[11px] font-mono mb-1">
                            <span className="font-bold text-slate-700">{(t.used_tokens / 1000).toFixed(0)}k</span>
                            <span className="text-slate-400">/ {(t.monthly_token_limit / 1000).toFixed(0)}k ({t.usage_percent}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/60">
                            <div
                              className={`h-full rounded-full transition-all ${t.usage_percent > 90 ? 'bg-red-500' : t.usage_percent > 70 ? 'bg-amber-500' : 'bg-indigo-600'
                                }`}
                              style={{ width: `${Math.min(100, Math.max(4, t.usage_percent))}%` }}
                            />
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit ${t.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                            }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${t.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {t.is_active ? "Live Active" : "Suspended"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">

                            {/* Feature Flags Module Config */}
                            <button
                              onClick={() => setConfiguringModulesTenant(t)}
                              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl border border-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                              title="Configure Feature Flags & Visible Modules"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              <span>Modules</span>
                              <span className="bg-indigo-600 text-white text-[9.5px] px-1.5 py-0.2 rounded-full font-mono">
                                {activeModCount}/10
                              </span>
                            </button>

                            {/* Suspend / Activate Toggle */}
                            <button
                              onClick={() => handleToggleStatus(t)}
                              className={`px-2.5 py-1.5 font-bold rounded-xl border transition-all flex items-center gap-1 cursor-pointer ${t.is_active
                                ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                                }`}
                              title={t.is_active ? "Suspend Organization" : "Activate Organization"}
                            >
                              {t.is_active ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                              {t.is_active ? "Suspend" : "Activate"}
                            </button>

                            {/* Quota Override */}
                            <button
                              onClick={() => handleOpenEditTenantPlan(t)}
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                              title="Upgrade / Override Token Limit"
                            >
                              <Sliders className="w-4 h-4" />
                            </button>

                            {/* Delete Tenant */}
                            <button
                              onClick={() => handleDeleteTenant(t)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                              title="Purge / Delete Tenant"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: SAAS PLANS & PROMOTIONAL OFFERS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === "plans" && (
        <div className="space-y-6 animate-in fade-in duration-200">

          {/* Header & Create Offer Action */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">Dynamic Pricing Engine</span>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">{plansList.length} Packages Configured</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 mt-1">SaaS Subscription Packages & Campaign Offers</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update prices in BDT (৳), modify AI token limits, adjust seat allocations, or launch custom limited-time campaign offers.
              </p>
            </div>

            <button
              onClick={handleOpenCreatePlan}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Create New Package / Offer
            </button>
          </div>

          {/* Pricing Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {plansList.map((plan: any) => {
              const isFree = plan.monthly_price_bdt === 0;
              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-3xl border transition-all flex flex-col justify-between overflow-hidden relative shadow-sm hover:shadow-md ${plan.is_popular
                    ? "border-indigo-500 ring-2 ring-indigo-500/20"
                    : plan.is_custom_offer
                      ? "border-amber-400 ring-1 ring-amber-400/30"
                      : "border-slate-200"
                    }`}
                >
                  {/* Top Badges */}
                  <div className="p-5 pb-3">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase">
                        {plan.code}
                      </span>
                      {plan.badge_text && (
                        <span className="text-[10px] font-black tracking-wide text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full uppercase">
                          {plan.badge_text}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-black text-slate-900">{plan.name}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 min-h-[32px]">{plan.description}</p>

                    {/* Price in BDT */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900 tracking-tight">
                        {isFree ? "৳0" : `৳${plan.monthly_price_bdt.toLocaleString()}`}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold">/ month</span>
                    </div>
                    {!isFree && (
                      <div className="text-[10px] text-slate-400">
                        Annual: ৳{plan.annual_price_bdt.toLocaleString()}/mo (billed annually)
                      </div>
                    )}

                    {/* Quotas breakdown */}
                    <div className="mt-4 space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="text-[11px] text-slate-500">AI Tokens:</span>
                        <span className="font-bold font-mono text-indigo-600">{(plan.monthly_token_limit / 1000).toLocaleString()}k /mo</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="text-[11px] text-slate-500">Support Seats:</span>
                        <span className="font-bold">{plan.max_agents} Seats</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="text-[11px] text-slate-500">Website Widgets:</span>
                        <span className="font-bold">{plan.max_websites} Widgets</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="text-[11px] text-slate-500">Knowledge Docs:</span>
                        <span className="font-bold">{plan.max_knowledge_docs || 50} Docs</span>
                      </div>
                    </div>

                    {/* Feature bullets */}
                    <div className="mt-4 space-y-1.5 text-[11px] text-slate-600">
                      {(plan.features || []).slice(0, 4).map((feat: string, i: number) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{feat}</span>
                        </div>
                      ))}
                      {(plan.features || []).length > 4 && (
                        <div className="text-[10px] text-slate-400 font-semibold pl-5">
                          + {(plan.features || []).length - 4} more features
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${plan.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                      }`}>
                      {plan.is_active ? "Active" : "Archived"}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditPlan(plan)}
                        className="p-1.5 bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 rounded-lg transition-all cursor-pointer shadow-2xs"
                        title="Edit Package"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id, plan.name)}
                        className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 rounded-lg transition-all cursor-pointer shadow-2xs"
                        title="Delete / Archive Package"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: COUPONS & PROMOTIONS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === "coupons" && (
        <div className="space-y-6 animate-in fade-in duration-200">

          {/* Header & Create Coupon Action */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase">Promotions & Vouchers</span>
                <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-bold">{couponsList.length} Active Codes</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 mt-1">Coupon Codes & Discount Engine</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate percentage or flat BDT discounts applicable during self-serve registration and workspace subscription upgrades.
              </p>
            </div>

            <button
              onClick={handleOpenCreateCoupon}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Create Promo Code
            </button>
          </div>

          {/* Coupons Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Coupon Code</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Discount Value</th>
                    <th className="py-3 px-4">Min. Spend / Cap</th>
                    <th className="py-3 px-4">Applicable Tiers</th>
                    <th className="py-3 px-4">Usage / Limit</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {couponsList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                        No coupon codes created yet. Click "+ Create Promo Code" above to launch a discount.
                      </td>
                    </tr>
                  ) : (
                    couponsList.map((c: any) => {
                      const isPct = c.discount_type === "percentage";
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Code */}
                          <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                            <span className="bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                              {c.code}
                            </span>
                          </td>

                          {/* Description */}
                          <td className="py-3.5 px-4 text-slate-700 font-medium max-w-xs truncate">
                            {c.description}
                          </td>

                          {/* Discount Value */}
                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px]">
                              {isPct ? `${c.discount_value}% OFF` : `৳${c.discount_value.toLocaleString()} BDT OFF`}
                            </span>
                          </td>

                          {/* Min Spend / Cap */}
                          <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                            <div>Min: ৳{c.min_purchase_amount_bdt.toLocaleString()}</div>
                            {c.max_discount_amount_bdt && (
                              <div className="text-[10px] text-slate-400">Cap: ৳{c.max_discount_amount_bdt.toLocaleString()}</div>
                            )}
                          </td>

                          {/* Applicable Tiers */}
                          <td className="py-3.5 px-4">
                            {c.applicable_tiers && c.applicable_tiers.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {c.applicable_tiers.map((t: string, i: number) => (
                                  <span key={i} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">All Packages</span>
                            )}
                          </td>

                          {/* Usage meter */}
                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            <span className="font-bold text-slate-800">{c.redeemed_count}</span>
                            <span className="text-slate-400"> / {c.max_redemptions ? c.max_redemptions : "∞"}</span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.is_active ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"
                              }`}>
                              {c.is_active ? "Active" : "Disabled"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditCoupon(c)}
                                className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-all cursor-pointer"
                                title="Edit Coupon"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCoupon(c.id, c.code)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-all cursor-pointer"
                                title="Delete Coupon"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GLOBAL MRR & REVENUE ENGINE (BDT ৳) */}
      {/* ========================================================================= */}
      {activeTab === "revenue" && revenueData && (
        <div className="space-y-6 animate-in fade-in duration-200">

          {/* Revenue Overview Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Platform MRR</div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">৳{revenueData.total_mrr_bdt.toLocaleString()} <span className="text-xs text-slate-400">BDT/mo</span></div>
              <div className="text-[11px] text-emerald-600 font-bold">100% Verified Recurring Revenue</div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Projected Annual ARR</div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">৳{revenueData.total_arr_bdt.toLocaleString()} <span className="text-xs text-slate-400">BDT/yr</span></div>
              <div className="text-[11px] text-indigo-600 font-bold">{revenueData.total_subscribers} Total Subscribed Clients</div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Average Revenue Per User (ARPU)</div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                ৳{revenueData.total_subscribers > 0 ? (revenueData.total_mrr_bdt / revenueData.total_subscribers).toFixed(0) : 0}
              </div>
              <div className="text-[11px] text-slate-500">Across Enterprise & Growth tiers</div>
            </div>
          </div>

          {/* Tier Distribution Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {revenueData.tier_breakdown.map((item: any, idx: number) => (
              <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-extrabold text-slate-900 text-xs">{item.tier}</span>
                  <span className="font-mono text-indigo-600 font-bold text-xs">৳{item.price_bdt.toLocaleString()}</span>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {item.active_count} <span className="text-xs text-slate-400 font-semibold">Clients</span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Total MRR: <span className="font-bold text-slate-800">৳{item.total_mrr_bdt.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Invoices & Transactions Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" /> Recent Billing Transactions & Invoices (BDT ৳)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Tier Plan</th>
                    <th className="py-3 px-4">Amount BDT</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {revenueData.recent_transactions.map((tx: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">{tx.invoice_number}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{tx.tenant_name}</td>
                      <td className="py-3 px-4">{tx.tier}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">৳{tx.amount_bdt.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-500">{tx.payment_method}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: BKASH PAYMENT GATEWAY CONFIGURATION & CONTROL PLANE */}
      {/* ========================================================================= */}
      {activeTab === "bkash" && (
        <div className="space-y-6 animate-in fade-in duration-200">

          {/* Top Status & Ping Hero Card */}
          <div className="bg-gradient-to-r from-[#e2136e] via-[#c00f5c] to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  bKash Tokenized Checkout (v1.2.0-beta)
                </span>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${bkashSettings.is_sandbox ? 'bg-amber-400 text-slate-950' : 'bg-emerald-400 text-slate-950'
                  }`}>
                  {bkashSettings.is_sandbox ? 'Sandbox Mode' : 'Live Production'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                bKash Payment Gateway Management
              </h2>
              <p className="text-xs text-pink-100/90 leading-relaxed">
                Configure your official bKash credentials, merchant parameters, and toggle between Sandbox simulation and live payment collection for all client subscriptions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={handleTestBkashPing}
                disabled={isTestingBkash}
                className="px-5 py-2.5 bg-white hover:bg-pink-50 text-[#e2136e] font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isTestingBkash ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-[#e2136e]" />}
                <span>{isTestingBkash ? "Testing Ping..." : "Test Connection / Ping"}</span>
              </button>
            </div>
          </div>

          {/* Test Ping Response Box if triggered */}
          {bkashPingResult && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-xs border border-slate-800 space-y-2 animate-in fade-in">
              <div className="flex justify-between items-center">
                <span className="text-emerald-400 font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {bkashPingResult.message}
                </span>
                <span className="text-amber-400 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                  Latency: {bkashPingResult.latency_ms}ms
                </span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Token Preview: <span className="text-pink-400 font-semibold">{bkashPingResult.token_preview}</span>
              </div>
            </div>
          )}

          {/* Configuration Form Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Main Form (2 cols) */}
            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#e2136e]" /> API Credentials & Gateway Parameters
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Updates will take effect immediately across all client checkout sessions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSecrets(!showSecrets)}
                  className="text-xs text-slate-500 hover:text-slate-700 font-semibold flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  {showSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showSecrets ? "Hide Secrets" : "Show Secrets"}</span>
                </button>
              </div>

              <form onSubmit={handleSaveBkashSettings} className="space-y-4 text-xs">

                {/* Environment Mode Toggle */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="font-bold text-slate-900">Gateway Environment Mode</div>
                    <div className="text-[11px] text-slate-500">
                      Toggle to switch between Sandbox developer testing and Live payment capture.
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setBkashSettings({
                        ...bkashSettings,
                        is_sandbox: true,
                        base_url: "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized"
                      })}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${bkashSettings.is_sandbox
                        ? "bg-amber-400 text-slate-950 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                      Sandbox
                    </button>
                    <button
                      type="button"
                      onClick={() => setBkashSettings({
                        ...bkashSettings,
                        is_sandbox: false,
                        base_url: "https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized"
                      })}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${!bkashSettings.is_sandbox
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                      Production Live
                    </button>
                  </div>
                </div>

                {/* Base URL */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">bKash Base API URL</label>
                  <input
                    type="text"
                    required
                    value={bkashSettings.base_url}
                    onChange={e => setBkashSettings({ ...bkashSettings, base_url: e.target.value })}
                    placeholder="https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-semibold outline-none focus:border-pink-500 focus:bg-white transition-all"
                  />
                </div>

                {/* App Key & App Secret */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">App Key</label>
                    <input
                      type="text"
                      required
                      value={bkashSettings.app_key}
                      onChange={e => setBkashSettings({ ...bkashSettings, app_key: e.target.value })}
                      placeholder="Enter bKash App Key"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-semibold outline-none focus:border-pink-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">App Secret</label>
                    <input
                      type={showSecrets ? "text" : "password"}
                      required
                      value={bkashSettings.app_secret}
                      onChange={e => setBkashSettings({ ...bkashSettings, app_secret: e.target.value })}
                      placeholder="Enter bKash App Secret"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-semibold outline-none focus:border-pink-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Username & Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">bKash API Username</label>
                    <input
                      type="text"
                      required
                      value={bkashSettings.username}
                      onChange={e => setBkashSettings({ ...bkashSettings, username: e.target.value })}
                      placeholder="sandboxTokenizedUser02"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-semibold outline-none focus:border-pink-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">bKash API Password</label>
                    <input
                      type={showSecrets ? "text" : "password"}
                      required
                      value={bkashSettings.password}
                      onChange={e => setBkashSettings({ ...bkashSettings, password: e.target.value })}
                      placeholder="Enter password"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-semibold outline-none focus:border-pink-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Merchant Short Code */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Merchant Short Code / Wallet Number</label>
                  <input
                    type="text"
                    value={bkashSettings.merchant_number || ""}
                    onChange={e => setBkashSettings({ ...bkashSettings, merchant_number: e.target.value })}
                    placeholder="e.g. 01837586105"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-semibold outline-none focus:border-pink-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Submit Action */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSavingBkash}
                    className="px-6 py-2.5 bg-[#e2136e] hover:bg-[#c00f5c] text-white font-bold rounded-xl shadow-md shadow-pink-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingBkash ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>{isSavingBkash ? "Saving Settings..." : "Save bKash PGW Settings"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Side Card: Official Sandbox Reference */}
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#e2136e]" /> Official Sandbox Credentials
                </div>
                <p className="text-slate-500 text-[11.5px] leading-relaxed">
                  These verified sandbox test credentials can be used anytime to simulate client subscription checkout in development.
                </p>

                <div className="p-3.5 bg-pink-50/70 rounded-2xl border border-pink-200/80 space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Success Wallet 1:</span>
                    <span className="font-bold text-pink-900">01770618575</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Success Wallet 2:</span>
                    <span className="font-bold text-pink-900">01929918378</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Test OTP:</span>
                    <span className="font-bold text-pink-900">123456</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Test PIN:</span>
                    <span className="font-bold text-pink-900">12121</span>
                  </div>
                  <div className="flex justify-between border-t border-pink-200/60 pt-1.5">
                    <span className="text-slate-600">Insufficient Bal:</span>
                    <span className="font-bold text-red-700">01823074817</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                  <div className="font-bold text-slate-800">Checkout Mode:</div>
                  <div className="font-mono text-slate-600">&quot;0011&quot; (URL-based Hosted PGW)</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: GLOBAL AI INFRASTRUCTURE & MODEL MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === "infrastructure" && (
        <div className="space-y-6 animate-in fade-in duration-200">

          {/* Top 3 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Active Master Model</div>
              <div className="text-xl font-black text-indigo-950 font-mono flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-600" />
                {aiSettings.master_model || "gemini-2.5-flash"}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> High-Throughput RAG Vector Engine
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Platform API Configuration</div>
              <div className="text-xl font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                {aiSettings.api_key ? "Live Connected" : "API Key Required"}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {aiSettings.api_key_masked || "Master AI Pool Active"}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Rate Limit Policy</div>
              <div className="text-xl font-black text-slate-900 font-mono">{aiSettings.rate_limit_rpm || 120} RPM</div>
              <div className="text-[11px] text-indigo-600 font-bold">Per-Tenant Token Throttling</div>
            </div>
          </div>

          {/* 2-Column AI Cluster Control Center */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left 2 Cols: Interactive Configuration Form */}
            <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-600" /> Global AI Model & API Configuration
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure Google Gemini credentials, select LLM models, and tune temperature for all multi-tenant workspaces.
                  </p>
                </div>
                <span className="text-[10.5px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-200">
                  Global LLM Engine
                </span>
              </div>

              <form onSubmit={handleSaveAISettings} className="space-y-4 text-xs">

                {/* API Key Input with Eye Toggle */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block font-bold text-slate-800">
                      Google Gemini / AI API Key *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAIKey(!showAIKey)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {showAIKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {showAIKey ? "Hide Secret" : "Reveal Secret"}
                    </button>
                  </div>
                  <input
                    type={showAIKey ? "text" : "password"}
                    required
                    value={aiSettings.api_key || ""}
                    onChange={e => setAiSettings({ ...aiSettings, api_key: e.target.value })}
                    placeholder="Enter Google Gemini API Key (e.g. AIzaSy... or sk-...)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-semibold outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-xs"
                  />
                  <p className="text-[10.5px] text-slate-400">
                    Powers all tenant AI chat widgets, prompt execution, and dynamic pgvector RAG context generation.
                  </p>
                </div>

                {/* AI Base URL */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">AI Base URL / OpenAI-Compatible Gateway</label>
                  <input
                    type="text"
                    value={aiSettings.ai_base_url || ""}
                    onChange={e => setAiSettings({ ...aiSettings, ai_base_url: e.target.value })}
                    placeholder="https://generativelanguage.googleapis.com/v1beta/openai/"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-semibold outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Model Selection Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-800">
                      Primary Master AI Model *
                    </label>
                    <select
                      value={aiSettings.master_model}
                      onChange={e => setAiSettings({ ...aiSettings, master_model: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-bold outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="gemini-2.5-flash">gemini-2.5-flash (Recommended — Ultra Fast)</option>
                      <option value="gemini-2.0-flash">gemini-2.0-flash (Multimodal & Fast)</option>
                      <option value="gemini-1.5-flash">gemini-1.5-flash (Standard Production)</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro (High Reasoning & 2M Context)</option>
                      <option value="gemini-3.6-flash">gemini-3.6-flash (Vector Engine Preview)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-800">Fallback Failover Model</label>
                    <select
                      value={aiSettings.fallback_model || "gemini-1.5-flash"}
                      onChange={e => setAiSettings({ ...aiSettings, fallback_model: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-semibold outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                      <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                      <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                    </select>
                  </div>
                </div>

                {/* Embeddings & Hyperparameters Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-800">Embedding Model (pgvector)</label>
                    <select
                      value={aiSettings.embedding_model || "text-embedding-004"}
                      onChange={e => setAiSettings({ ...aiSettings, embedding_model: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-semibold outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="text-embedding-004">text-embedding-004 (768-dim)</option>
                      <option value="models/embedding-001">models/embedding-001</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-800">
                      Temperature ({aiSettings.temperature ?? 0.3})
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.0"
                      max="1.0"
                      value={aiSettings.temperature ?? 0.3}
                      onChange={e => setAiSettings({ ...aiSettings, temperature: parseFloat(e.target.value) || 0.3 })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-semibold outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-800">Max Output Tokens</label>
                    <input
                      type="number"
                      step="256"
                      min="256"
                      max="8192"
                      value={aiSettings.max_tokens ?? 2048}
                      onChange={e => setAiSettings({ ...aiSettings, max_tokens: parseInt(e.target.value) || 2048 })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-semibold outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Global System Instruction Prefix */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">Global System Instruction Baseline</label>
                  <textarea
                    rows={2}
                    value={aiSettings.system_prompt_prefix || ""}
                    onChange={e => setAiSettings({ ...aiSettings, system_prompt_prefix: e.target.value })}
                    placeholder="Baseline enterprise safety rules prepended to all tenant agent prompts"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium outline-none focus:border-indigo-500 focus:bg-white transition-all text-xs"
                  />
                </div>

                {/* Submit Action */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSavingAI}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingAI ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>{isSavingAI ? "Saving Configuration..." : "Save AI Model Configuration"}</span>
                  </button>
                </div>

              </form>
            </div>

            {/* Right Column: Live Benchmark Diagnostics & Cluster Health */}
            <div className="space-y-5">

              {/* AI Connectivity Benchmark Panel */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-600" /> Live AI Cluster Health Benchmark
                  </h3>
                  <p className="text-slate-500 text-[11.5px] mt-0.5">
                    Executes an end-to-end prompt test through the primary Google Gemini model cluster using the configured key.
                  </p>
                </div>

                <button
                  onClick={handleTestAIPing}
                  disabled={isTestingAI}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isTestingAI ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {isTestingAI ? "Measuring Latency..." : "Execute AI Ping Benchmark"}
                </button>

                {aiTestResult && (
                  <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-xs space-y-2 animate-in fade-in">
                    <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Cluster Status: {aiTestResult.status.toUpperCase()}
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Latency: <span className="text-amber-400 font-bold">{aiTestResult.latency_ms}ms</span> | Model: <span className="text-indigo-300 font-bold">{aiTestResult.model}</span>
                    </div>
                    <div className="text-slate-300 bg-slate-800/90 p-2.5 rounded-xl border border-slate-700 text-[11px] leading-relaxed">
                      AI Response: &quot;{aiTestResult.response || aiTestResult.error}&quot;
                    </div>
                  </div>
                )}
              </div>

              {/* RAG & Token Architecture Reference */}
              <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-sm space-y-3 text-xs">
                <div className="font-extrabold text-sm text-indigo-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> RAG & Multitenancy Engine
                </div>
                <p className="text-slate-400 text-[11.5px] leading-relaxed">
                  PostgreSQL <code className="text-amber-300 font-mono">pgvector</code> performs 768-dimensional cosine vector searches with multi-tenant workspace isolation.
                </p>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1.5 font-mono text-[10.5px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Embedding Vector:</span>
                    <span className="text-emerald-400 font-bold">768 Dim</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Context Window:</span>
                    <span className="text-indigo-400 font-bold">Up to 2M Tokens</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Metering Engine:</span>
                    <span className="text-emerald-400 font-bold">Real-time UsageRecord</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PLATFORM SECURITY & AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === "audit" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-200">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" /> Platform Security & Audit Trail
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Immutable records of all administrative actions, module authorization changes, and lifecycle events.
              </p>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={auditActionFilter}
                onChange={e => setAuditActionFilter(e.target.value)}
                className="py-2 px-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 bg-white font-medium"
              >
                <option value="all">All Event Types ({auditLogs.length})</option>
                <option value="tenant.modules_updated">Module Flags Changed</option>
                <option value="tenant.activated">Tenant Activated</option>
                <option value="tenant.suspended">Tenant Suspended</option>
                <option value="tenant.plan_updated">Plan / Quota Override</option>
                <option value="tenant.deleted">Tenant Deleted</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Resource Target</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No security audit records match the filter.
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{log.tenant_name}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{log.resource_type}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setInspectingAudit(log)}
                          className="px-2.5 py-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-200 transition-all cursor-pointer font-semibold text-[11px]"
                        >
                          Inspect JSON
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Plan Override Modal */}
      {editingTenant && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                  Super Admin Quota Override
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  Adjust Plan for {editingTenant.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingTenant(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTenantPlan} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Package Subscription Tier</label>
                <select
                  value={selectedTier}
                  onChange={e => {
                    const t = e.target.value;
                    setSelectedTier(t);
                    if (t === "starter") setCustomTokens(500000);
                    if (t === "growth") setCustomTokens(2500000);
                    if (t === "enterprise") setCustomTokens(10000000);
                  }}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 bg-white font-medium"
                >
                  <option value="starter">Starter Plan (৳4,990/mo - 500k tokens)</option>
                  <option value="growth">Growth Plan (৳19,990/mo - 2.5M tokens)</option>
                  <option value="enterprise">Enterprise Plan (৳49,990/mo - 10M tokens)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Monthly AI Token Limit Override</label>
                <input
                  type="number"
                  value={customTokens}
                  onChange={e => setCustomTokens(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono"
                />
                <span className="text-[10px] text-slate-400">
                  {customTokens.toLocaleString()} tokens per month
                </span>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPlan}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isUpdatingPlan ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Save Quota Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Module Configuration Modal */}
      {configuringModulesTenant && (
        <ModuleConfigModal
          tenantId={configuringModulesTenant.id}
          tenantName={configuringModulesTenant.name}
          initialModules={configuringModulesTenant.enabled_modules || {}}
          onClose={() => setConfiguringModulesTenant(null)}
          onSuccess={(updatedModules) => {
            setTenants(prev =>
              prev.map(t =>
                t.id === configuringModulesTenant.id
                  ? { ...t, enabled_modules: updatedModules }
                  : t
              )
            );
          }}
        />
      )}

      {/* Audit Metadata Inspector Modal */}
      {inspectingAudit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 font-mono text-xs">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-amber-400 font-bold">{inspectingAudit.action}</span>
                <div className="text-[11px] text-slate-400 mt-0.5">{inspectingAudit.tenant_name} • {new Date(inspectingAudit.created_at).toLocaleString()}</div>
              </div>
              <button
                onClick={() => setInspectingAudit(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 overflow-x-auto text-[11px]">
              <pre className="text-emerald-400">
                {JSON.stringify(inspectingAudit.metadata_json, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectingAudit(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: PLATFORM THEME & BRANDING APPEARANCE SETUP */}
      {/* ========================================================================= */}
      {activeTab === "theme" && <ThemeManagementTab />}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT SAAS PRICING PLAN */}
      {/* ========================================================================= */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                  {editingPlanId ? "Edit Pricing Tier" : "New SaaS Package"}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  {editingPlanId ? `Configure Package: ${planFormData.name}` : "Create SaaS Package / Campaign Offer"}
                </h3>
              </div>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Package Code (Identifier) *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingPlanId}
                    value={planFormData.code}
                    onChange={e => setPlanFormData({ ...planFormData, code: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                    placeholder="e.g. starter, eid_special"
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono disabled:bg-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Package Display Name *</label>
                  <input
                    type="text"
                    required
                    value={planFormData.name}
                    onChange={e => setPlanFormData({ ...planFormData, name: e.target.value })}
                    placeholder="e.g. Starter Package, Eid Mega Deal"
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Description *</label>
                <input
                  type="text"
                  required
                  value={planFormData.description}
                  onChange={e => setPlanFormData({ ...planFormData, description: e.target.value })}
                  placeholder="e.g. Perfect for early-stage startups and small online businesses."
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Monthly Price (BDT ৳) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={planFormData.monthly_price_bdt}
                    onChange={e => setPlanFormData({ ...planFormData, monthly_price_bdt: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Annual Price (BDT ৳/mo)</label>
                  <input
                    type="number"
                    min="0"
                    value={planFormData.annual_price_bdt}
                    onChange={e => setPlanFormData({ ...planFormData, annual_price_bdt: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Badge Text (Optional)</label>
                  <input
                    type="text"
                    value={planFormData.badge_text}
                    onChange={e => setPlanFormData({ ...planFormData, badge_text: e.target.value })}
                    placeholder="e.g. MOST POPULAR, 50% OFF"
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-semibold text-indigo-600"
                  />
                </div>
              </div>

              {/* Quotas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 text-[11px]">AI Tokens / mo</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={planFormData.monthly_token_limit}
                    onChange={e => setPlanFormData({ ...planFormData, monthly_token_limit: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-mono text-xs font-bold bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 text-[11px]">Support Seats</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={planFormData.max_agents}
                    onChange={e => setPlanFormData({ ...planFormData, max_agents: parseInt(e.target.value) || 1 })}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-mono text-xs font-bold bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 text-[11px]">Website Widgets</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={planFormData.max_websites}
                    onChange={e => setPlanFormData({ ...planFormData, max_websites: parseInt(e.target.value) || 1 })}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-mono text-xs font-bold bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 text-[11px]">Knowledge Docs</label>
                  <input
                    type="number"
                    min="1"
                    value={planFormData.max_knowledge_docs}
                    onChange={e => setPlanFormData({ ...planFormData, max_knowledge_docs: parseInt(e.target.value) || 10 })}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-mono text-xs font-bold bg-white"
                  />
                </div>
              </div>

              {/* Features list */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Feature Bullet Points (1 per line)</label>
                <textarea
                  rows={4}
                  value={planFormData.features_text}
                  onChange={e => setPlanFormData({ ...planFormData, features_text: e.target.value })}
                  placeholder="500,000 AI Tokens / mo&#10;1 Connected Website Widget&#10;2 Support Seats&#10;bKash & Card Gateway"
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono text-[11px]"
                />
              </div>

              {/* Checkbox Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={planFormData.is_popular}
                    onChange={e => setPlanFormData({ ...planFormData, is_popular: e.target.checked })}
                    className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  Featured "Most Popular" Card
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={planFormData.is_custom_offer}
                    onChange={e => setPlanFormData({ ...planFormData, is_custom_offer: e.target.checked })}
                    className="h-4 w-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  Special Limited-Time Campaign Offer
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={planFormData.is_active}
                    onChange={e => setPlanFormData({ ...planFormData, is_active: e.target.checked })}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  Active & Available for Purchase
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPlan}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSavingPlan ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {editingPlanId ? "Save Changes" : "Create & Launch Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT COUPON CODE */}
      {/* ========================================================================= */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                  {editingCouponId ? "Edit Promo Code" : "New Discount Coupon"}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  {editingCouponId ? `Configure Code: ${couponFormData.code}` : "Generate Promo / Voucher Code"}
                </h3>
              </div>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingCouponId}
                    value={couponFormData.code}
                    onChange={e => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. EID2026, STARTUP50"
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-mono font-bold uppercase disabled:bg-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Discount Type *</label>
                  <select
                    value={couponFormData.discount_type}
                    onChange={e => setCouponFormData({ ...couponFormData, discount_type: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 bg-white font-medium"
                  >
                    <option value="percentage">Percentage Discount (% OFF)</option>
                    <option value="fixed_amount">Fixed Amount (৳ BDT Flat OFF)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Description *</label>
                <input
                  type="text"
                  required
                  value={couponFormData.description}
                  onChange={e => setCouponFormData({ ...couponFormData, description: e.target.value })}
                  placeholder="e.g. Eid 2026 20% discount on all packages"
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    {couponFormData.discount_type === "percentage" ? "Discount (%) *" : "Discount (৳ BDT) *"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={couponFormData.discount_value}
                    onChange={e => setCouponFormData({ ...couponFormData, discount_value: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Min Spend (৳ BDT)</label>
                  <input
                    type="number"
                    min="0"
                    value={couponFormData.min_purchase_amount_bdt}
                    onChange={e => setCouponFormData({ ...couponFormData, min_purchase_amount_bdt: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Max Cap (৳ BDT)</label>
                  <input
                    type="number"
                    min="0"
                    value={couponFormData.max_discount_amount_bdt}
                    onChange={e => setCouponFormData({ ...couponFormData, max_discount_amount_bdt: parseFloat(e.target.value) || 0 })}
                    placeholder="Optional"
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Applicable Subscription Packages Selector */}
              <div className="space-y-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div>
                    <label className="block font-bold text-slate-800 text-xs">
                      Applicable Subscription Packages
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Pick the exact packages this discount applies to (no manual typing needed)
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10.5px]">
                    <button
                      type="button"
                      onClick={selectAllCouponTiers}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 transition-all cursor-pointer"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={clearAllCouponTiers}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-all cursor-pointer"
                    >
                      Clear All (All Plans)
                    </button>
                  </div>
                </div>

                {/* Available Plan Chips Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {plansList.map(p => {
                    const isChecked = couponFormData.applicable_tiers.includes(p.code);
                    return (
                      <div
                        key={p.id || p.code}
                        onClick={() => toggleCouponTier(p.code)}
                        className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2 select-none ${
                          isChecked
                            ? "border-emerald-600 bg-emerald-50/80 text-emerald-950 shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                            isChecked ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white"
                          }`}>
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs truncate flex items-center gap-1.5">
                              <span>{p.name}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              <span className="font-mono uppercase font-bold text-slate-400 bg-slate-100 px-1 rounded mr-1">
                                {p.code}
                              </span>
                              ৳{p.monthly_price_bdt.toLocaleString()} BDT
                            </div>
                          </div>
                        </div>
                        {p.is_popular && (
                          <span className="text-[9px] font-extrabold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded shrink-0">
                            POPULAR
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="text-[11px] pt-1 border-t border-slate-200/60">
                  {couponFormData.applicable_tiers.length === 0 ? (
                    <span className="text-indigo-600 font-medium">
                      ✓ No restrictions: Promo code applies to <strong>all {plansList.length} packages</strong>.
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-semibold">
                      ✓ Selected for <strong>{couponFormData.applicable_tiers.length}</strong> package(s): {couponFormData.applicable_tiers.join(", ")}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Usage Limit (Max Uses)</label>
                  <input
                    type="number"
                    min="1"
                    value={couponFormData.max_redemptions}
                    onChange={e => setCouponFormData({ ...couponFormData, max_redemptions: parseInt(e.target.value) || 100 })}
                    placeholder="e.g. 100"
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Valid Until (Expiry Date)</label>
                  <input
                    type="date"
                    value={couponFormData.valid_until}
                    onChange={e => setCouponFormData({ ...couponFormData, valid_until: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={couponFormData.is_active}
                    onChange={e => setCouponFormData({ ...couponFormData, is_active: e.target.checked })}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  Active & Redeemable
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCoupon}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSavingCoupon ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {editingCouponId ? "Save Changes" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Best-Practice Organization Suspension Modal */}
      {suspensionModalTenant && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Pause className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                    Suspend Organization
                  </h3>
                  <p className="text-xs text-slate-500">
                    {suspensionModalTenant.name} ({suspensionModalTenant.slug})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSuspensionModalTenant(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Business Impact Summary</span>
                </div>
                <p className="text-[11.5px] text-amber-800 leading-relaxed">
                  • AI LLM token billing will immediately halt to protect platform bandwidth.<br/>
                  • Storefront live widgets will display a graceful maintenance message to customers.<br/>
                  • The client will see a dignified renewal banner with 1-click bKash reactivation.
                </p>
              </div>

              {/* Suspension Category Radio Selection */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-800">Select Business Reason *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: "payment_overdue", label: "💳 Overdue Invoice / Non-Payment", desc: "Subscription past due" },
                    { id: "quota_exhausted", label: "⚡ Token Quota Exhaustion", desc: "Excessive token burn" },
                    { id: "policy_review", label: "🛡️ Security & Policy Review", desc: "Compliance check" },
                    { id: "maintenance", label: "🔧 Scheduled Maintenance", desc: "Temporary system upgrade" },
                  ].map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setSuspensionCategory(cat.id);
                        if (cat.id === "payment_overdue") setSuspensionReasonText("Subscription renewal is overdue. Please settle invoice to restore 24/7 AI services.");
                        else if (cat.id === "quota_exhausted") setSuspensionReasonText("Monthly AI token limit reached. Upgrade your package to resume live chatbot.");
                        else if (cat.id === "policy_review") setSuspensionReasonText("Account is undergoing scheduled security and compliance review.");
                        else setSuspensionReasonText("Account is in temporary maintenance mode.");
                      }}
                      className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer select-none ${
                        suspensionCategory === cat.id
                          ? "border-amber-500 bg-amber-50/60 text-slate-900 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      <div className="font-bold text-[11px]">{cat.label}</div>
                      <div className="text-[10px] text-slate-500">{cat.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Note for Client */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">
                  Client Dashboard Notice Note
                </label>
                <textarea
                  rows={2}
                  value={suspensionReasonText}
                  onChange={(e) => setSuspensionReasonText(e.target.value)}
                  placeholder="Enter custom polite notice for the client..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 font-medium text-xs resize-none"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSuspensionModalTenant(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isProcessingSuspension}
                  onClick={handleConfirmSuspension}
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-xl shadow-md shadow-amber-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isProcessingSuspension ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>Confirm Graceful Suspension</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
