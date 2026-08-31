"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import {
  Building2, Phone, Mail, MapPin, Clock, Globe,
  Palette, Bot, CheckCircle2, RefreshCw, Sparkles,
  ShieldCheck, ShoppingBag, Truck, Info, CreditCard,
  Send, Lock, Eye, EyeOff, Smartphone, Zap, Key,
  Settings, Check, Copy, ExternalLink, HelpCircle
} from "lucide-react";
import { api } from "../../lib/api";

type ActiveTab = "profile" | "payments" | "sms";
type PaymentFilter = "all" | "cod" | "bkash" | "eps";

export default function SettingsView() {
  const { showToast } = useToast();
  const { user, refreshUser } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");

  // 1. Business Profile Form State
  const [orgName, setOrgName] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [businessCategory, setBusinessCategory] = useState("ecommerce");
  const [industry, setIndustry] = useState("E-Commerce & Retail");
  const [tagline, setTagline] = useState("");

  // Customer Support & Contact State
  const [supportPhone, setSupportPhone] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");

  // Operations & Delivery State
  const [workingHours, setWorkingHours] = useState("9:00 AM - 10:00 PM (Daily)");
  const [courierPartners, setCourierPartners] = useState("Steadfast Express, RedX, Pathao");
  const [currencySymbol, setCurrencySymbol] = useState("৳");
  const [primaryColor, setPrimaryColor] = useState("#4F46E5");

  // 2. Shipping & Delivery Charges State
  const [codEnabled, setCodEnabled] = useState(true);
  const [deliveryChargeInside, setDeliveryChargeInside] = useState<number>(60);
  const [deliveryChargeOutside, setDeliveryChargeOutside] = useState<number>(120);

  // 3. bKash Gateway State
  const [bkashEnabled, setBkashEnabled] = useState(false);
  const [isBkashSandbox, setIsBkashSandbox] = useState(true);
  const [bkashBaseUrl, setBkashBaseUrl] = useState("https://tokenized.sandbox.bka.sh/v1.2.0-beta");
  const [bkashAppKey, setBkashAppKey] = useState("");
  const [bkashAppSecret, setBkashAppSecret] = useState("");
  const [bkashUsername, setBkashUsername] = useState("");
  const [bkashPassword, setBkashPassword] = useState("");
  const [showBkashSecret, setShowBkashSecret] = useState(false);

  // 4. EPS (Easy Payment System) State
  const [epsEnabled, setEpsEnabled] = useState(false);
  const [isEpsSandbox, setIsEpsSandbox] = useState(true);
  const [epsBaseUrl, setEpsBaseUrl] = useState("https://sandboxpgapi.eps.com.bd");
  const [epsUsername, setEpsUsername] = useState("");
  const [epsPassword, setEpsPassword] = useState("");
  const [epsHashKey, setEpsHashKey] = useState("");
  const [epsMerchantId, setEpsMerchantId] = useState("");
  const [epsStoreId, setEpsStoreId] = useState("");
  const [epsMerchantNumber, setEpsMerchantNumber] = useState("");
  const [showEpsSecret, setShowEpsSecret] = useState(false);

  // 5. SMS Gateway State
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [smsProvider, setSmsProvider] = useState("smsmatrix");
  const [smsApiKey, setSmsApiKey] = useState("");
  const [showSmsKey, setShowSmsKey] = useState(false);
  const [smsSenderId, setSmsSenderId] = useState("PadmaMart");
  const [smsTemplate, setSmsTemplate] = useState("Dear {{customer_name}}, your order #{{order_id}} for ৳{{total_amount}} has been placed at Padma Mart! Thank you for shopping with us.");
  const [testPhone, setTestPhone] = useState("");
  const [isSendingTestSms, setIsSendingTestSms] = useState(false);

  // Load existing tenant settings & ecommerce settings
  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const [tenant, ecom] = await Promise.all([
          api.getTenantSettings(),
          api.getEcommerceSettings().catch(() => null)
        ]);

        if (tenant) {
          setOrgName(tenant.name || "");
          setCustomDomain(tenant.custom_domain || "");
          setBusinessCategory(tenant.business_category || "ecommerce");

          const cfg = tenant.branding_config || {};
          setTagline(cfg.tagline || "");
          setIndustry(cfg.industry || "E-Commerce & Retail");
          setSupportPhone(cfg.support_phone || "+880 1700-112233");
          setSupportEmail(cfg.support_email || `support@${tenant.slug}.example`);
          setCompanyAddress(cfg.company_address || "Uttara, Dhaka, Bangladesh");
          setWorkingHours(cfg.working_hours || "9:00 AM - 10:00 PM (Daily)");
          setCourierPartners(cfg.courier_partners || "Steadfast Express, RedX, Pathao");
          setCurrencySymbol(cfg.currency_symbol || "৳");
          setPrimaryColor(cfg.primary_color || "#4F46E5");
        }

        if (ecom) {
          setCodEnabled(ecom.cod_enabled ?? true);
          setDeliveryChargeInside(ecom.delivery_charge_inside_dhaka ?? 60);
          setDeliveryChargeOutside(ecom.delivery_charge_outside_dhaka ?? 120);

          setBkashEnabled(ecom.bkash_enabled ?? false);
          setIsBkashSandbox(ecom.bkash_is_sandbox !== undefined ? ecom.bkash_is_sandbox : true);
          setBkashBaseUrl(ecom.bkash_base_url || (ecom.bkash_is_sandbox !== false ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta" : "https://tokenized.pay.bka.sh/v1.2.0-beta"));
          setBkashAppKey(ecom.bkash_app_key_masked || "");
          setBkashUsername(ecom.bkash_username_masked || "");

          setEpsEnabled(ecom.eps_enabled ?? false);
          setIsEpsSandbox(ecom.eps_is_sandbox !== undefined ? ecom.eps_is_sandbox : true);
          setEpsBaseUrl(ecom.eps_base_url || (ecom.eps_is_sandbox !== false ? "https://sandboxpgapi.eps.com.bd" : "https://pgapi.eps.com.bd"));
          setEpsUsername(ecom.eps_username_masked || "");
          setEpsMerchantId(ecom.eps_merchant_id_masked || "");
          setEpsStoreId(ecom.eps_store_id_masked || "");
          setEpsMerchantNumber(ecom.eps_merchant_number || "");

          setSmsEnabled(ecom.sms_notifications_enabled ?? true);
          setSmsProvider(ecom.sms_provider || "smsmatrix");
          setSmsSenderId(ecom.sms_sender_id_masked || "PadmaMart");
          setSmsApiKey(ecom.sms_api_key_masked || "");
          if (ecom.sms_order_template) setSmsTemplate(ecom.sms_order_template);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleFillOfficialSandbox = () => {
    setIsBkashSandbox(true);
    setBkashBaseUrl("https://tokenized.sandbox.bka.sh/v1.2.0-beta");
    setBkashUsername("sandboxTokenizedUser02");
    setBkashPassword("sandboxTokenizedUser02@12345");
    setBkashAppKey("4f6o0cjiki2rfm34kfdadl1eqq");
    setBkashAppSecret("2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b");
    setBkashEnabled(true);
    showToast("Official Sandbox Loaded", "bKash Tokenized Sandbox credentials applied! Click 'Save Changes' to activate.", "info");
  };

  const handleFillOfficialEpsSandbox = () => {
    setIsEpsSandbox(true);
    setEpsBaseUrl("https://sandboxpgapi.eps.com.bd");
    setEpsUsername("Epsdemo@gmail.com");
    setEpsPassword("Epsdemo258@");
    setEpsHashKey("FHZxyzeps56789gfhg678ygu876o=");
    setEpsMerchantId("29e86e70-0ac6-45eb-ba04-9fcb0aaed12a");
    setEpsStoreId("d44e705f-9e3a-41de-98b1-1674631637da");
    setEpsMerchantNumber("01700000000");
    setEpsEnabled(true);
    showToast("Official EPS Sandbox Loaded", "EPS Sandbox test credentials applied! Click 'Save Changes' to activate.", "info");
  };

  const handleToggleEnvironment = (sandbox: boolean) => {
    setIsBkashSandbox(sandbox);
    setBkashBaseUrl(sandbox ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta" : "https://tokenized.pay.bka.sh/v1.2.0-beta");
  };

  const handleToggleEpsEnvironment = (sandbox: boolean) => {
    setIsEpsSandbox(sandbox);
    setEpsBaseUrl(sandbox ? "https://sandboxpgapi.eps.com.bd" : "https://pgapi.eps.com.bd");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name: orgName,
        custom_domain: customDomain,
        business_category: businessCategory,
        branding_config: {
          tagline: tagline,
          industry: industry,
          support_phone: supportPhone,
          support_email: supportEmail,
          company_address: companyAddress,
          working_hours: workingHours,
          courier_partners: courierPartners,
          currency: "BDT",
          currency_symbol: currencySymbol,
          primary_color: primaryColor,
          logo_url: "/logo.svg"
        }
      };

      await api.updateTenantSettings(payload);
      showToast("Profile Updated", "Store profile & branding settings saved successfully.", "success");

      if (refreshUser) await refreshUser();
    } catch (err: any) {
      showToast("Save Failed", err.message || "Failed to update business settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGatewaysAndSms = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: any = {
        business_category: businessCategory,
        cod_enabled: codEnabled,
        delivery_charge_inside_dhaka: Number(deliveryChargeInside) || 60,
        delivery_charge_outside_dhaka: Number(deliveryChargeOutside) || 120,
        bkash_enabled: bkashEnabled,
        bkash_is_sandbox: isBkashSandbox,
        bkash_base_url: bkashBaseUrl,
        eps_enabled: epsEnabled,
        eps_is_sandbox: isEpsSandbox,
        eps_base_url: epsBaseUrl,
        sms_notifications_enabled: smsEnabled,
        sms_provider: smsProvider,
        sms_sender_id: smsSenderId,
        sms_order_template: smsTemplate
      };

      if (bkashAppKey && !bkashAppKey.includes("...")) payload.bkash_app_key = bkashAppKey;
      if (bkashAppSecret) payload.bkash_app_secret = bkashAppSecret;
      if (bkashUsername) payload.bkash_username = bkashUsername;
      if (bkashPassword) payload.bkash_password = bkashPassword;

      if (epsUsername) payload.eps_username = epsUsername;
      if (epsPassword) payload.eps_password = epsPassword;
      if (epsHashKey) payload.eps_hash_key = epsHashKey;
      if (epsMerchantId && !epsMerchantId.includes("...")) payload.eps_merchant_id = epsMerchantId;
      if (epsStoreId && !epsStoreId.includes("...")) payload.eps_store_id = epsStoreId;
      if (epsMerchantNumber) payload.eps_merchant_number = epsMerchantNumber;

      if (smsApiKey && !smsApiKey.includes("...")) payload.sms_api_key = smsApiKey;

      const updated = await api.updateEcommerceSettings(payload);
      if (updated.sms_api_key_masked) setSmsApiKey(updated.sms_api_key_masked);
      if (updated.bkash_app_key_masked) setBkashAppKey(updated.bkash_app_key_masked);
      if (updated.eps_merchant_id_masked) setEpsMerchantId(updated.eps_merchant_id_masked);
      if (updated.eps_store_id_masked) setEpsStoreId(updated.eps_store_id_masked);
      
      showToast("Settings Saved", "Payment gateways & SMS notification settings updated successfully!", "success");
    } catch (err: any) {
      showToast("Save Failed", err.message || "Failed to save settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestSms = async () => {
    if (!testPhone.trim()) {
      showToast("Phone Required", "Please enter a valid mobile number (e.g. 017XXXXXXXX) to test SMS.", "error");
      return;
    }
    setIsSendingTestSms(true);
    try {
      const res = await api.testSmsGateway({ phone_number: testPhone.trim() });
      if (res.status === "sent") {
        showToast("Test SMS Sent", `SMS delivered via SMSMatrix! Remaining Balance: ${res.remaining_balance || 'Active'}`, "success");
      } else if (res.status === "delivered_mock") {
        showToast("Test SMS Simulated", `Mock SMS logged successfully! Configure a live API Key to dispatch real SMS.`, "info");
      } else {
        showToast("SMS Failed", res.error || "Could not send SMS. Check your API key and balance.", "error");
      }
    } catch (err: any) {
      showToast("Test SMS Error", err.message || "Failed to send test SMS", "error");
    } finally {
      setIsSendingTestSms(false);
    }
  };

  const insertVariableToTemplate = (tag: string) => {
    setSmsTemplate(prev => prev + " " + tag);
    showToast("Variable Inserted", `Added ${tag} to your SMS template.`, "info");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-28 text-slate-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium tracking-wide">Loading store configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6 font-sans">
      {/* Modern High-Impact Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-7 shadow-xl">
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30 shrink-0">
              <Settings className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Store & Organization Settings
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Multi-Tenant Isolated</span>
                </span>
              </div>
              <p className="text-sm text-slate-300 font-medium leading-relaxed max-w-2xl">
                Configure your store branding, online payment channels (<span className="text-pink-400 font-bold">bKash</span> & <span className="text-emerald-400 font-bold">EPS</span>), and automated SMS gateways with tenant data isolation.
              </p>
            </div>
          </div>

          {/* Quick Gateway Status Indicator */}
          <div className="flex items-center gap-3 shrink-0 bg-slate-950/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800 shadow-inner">
            <div className="flex flex-col">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Gateway Status</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-slate-200 font-mono">
                  {bkashEnabled || epsEnabled ? "Online PGW Active" : "COD Active"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simplified Modern Tab Switcher */}
      <div className="flex border border-slate-800 bg-slate-900/70 backdrop-blur-md rounded-2xl p-1.5 gap-1.5 overflow-x-auto custom-scrollbar-horizontal flex-nowrap shadow-inner">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "profile"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Brand & Store Profile</span>
        </button>

        <button
          onClick={() => setActiveTab("payments")}
          className={`flex-1 min-w-[180px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "payments"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment Gateways</span>
          <span className="px-1.5 py-0.2 rounded-md bg-slate-950/60 text-[10px] text-slate-300 font-mono">
            bKash/EPS/COD
          </span>
        </button>

        <button
          onClick={() => setActiveTab("sms")}
          className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "sms"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Send className="w-4 h-4" />
          <span>SMS Notifications</span>
          {smsEnabled && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BUSINESS & BRAND PROFILE */}
      {/* ========================================================================= */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
          {/* 1. General Identification */}
          <div className="bg-slate-900/90 p-5 sm:p-6 rounded-3xl border border-slate-800/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Store Identity & Industry Category</h3>
                <p className="text-[11px] text-slate-400">Basic identification of your business displayed to shoppers and AI assistant.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300">Company / Store Legal Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  placeholder="e.g. Padma Mart Ltd."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300">Business Sector / Category</label>
                <select
                  value={businessCategory}
                  onChange={e => setBusinessCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 cursor-pointer font-medium"
                >
                  <option value="ecommerce">E-Commerce & Retail Store (Full Commerce Module)</option>
                  <option value="healthcare">Healthcare & Diagnostic Clinic</option>
                  <option value="realestate">Real Estate & Property Development</option>
                  <option value="education">Education & Coaching Academy</option>
                  <option value="saas_general">General Corporate / SaaS Service</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block font-bold text-slate-300">Marketing Tagline / Headline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  placeholder="e.g. Your Premier Online Lifestyle, Gadgets & Fashion Destination"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* 2. Public Support Contacts */}
          <div className="bg-slate-900/90 p-5 sm:p-6 rounded-3xl border border-slate-800/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Public Support Contacts & Office Location</h3>
                <p className="text-[11px] text-slate-400">Informed to customers by AI chatbots when they ask for hotline numbers or address.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300">Support Hotline Phone</label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={e => setSupportPhone(e.target.value)}
                  placeholder="+880 1700-112233"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-medium font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300">Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={e => setSupportEmail(e.target.value)}
                  placeholder="support@yourbrand.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-medium text-xs"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block font-bold text-slate-300">Physical Office / Store Address</label>
                <input
                  type="text"
                  value={companyAddress}
                  onChange={e => setCompanyAddress(e.target.value)}
                  placeholder="Sector 3, Uttara, Dhaka - 1230, Bangladesh"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block font-bold text-slate-300">Customer Support Working Hours</label>
                <input
                  type="text"
                  value={workingHours}
                  onChange={e => setWorkingHours(e.target.value)}
                  placeholder="9:00 AM - 10:00 PM (Daily)"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* 3. Logistics & Courier Delivery Partners */}
          <div className="bg-slate-900/90 p-5 sm:p-6 rounded-3xl border border-slate-800/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Logistics & Delivery Partners</h3>
                <p className="text-[11px] text-slate-400">Used by AI assistants to inform customers about tracking services and couriers.</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300">Active Delivery Couriers</label>
              <input
                type="text"
                value={courierPartners}
                onChange={e => setCourierPartners(e.target.value)}
                placeholder="Steadfast Express, RedX, Pathao, Paperfly"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Brand Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PAYMENT GATEWAYS (COD, bKash, EPS) */}
      {/* ========================================================================= */}
      {activeTab === "payments" && (
        <form onSubmit={handleSaveGatewaysAndSms} className="space-y-5 text-xs">
          
          {/* Security & Multi-Tenant Banner */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <span>Client Storefront Isolated Gateways</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold uppercase">
                  AES-256 Encrypted
                </span>
              </div>
              <p className="text-[11.5px] text-slate-400 mt-1 leading-relaxed">
                Configure your own merchant keys for receiving shopper payments directly into your account.
                Credentials are encrypted, stored in your tenant silo, and never mixed with other clients or platform revenue.
              </p>
            </div>
          </div>

          {/* Quick Gateway Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold text-slate-400">View Channel:</span>
            {[
              { id: "all", label: "All Gateways (3)" },
              { id: "cod", label: "💵 Cash on Delivery (COD)" },
              { id: "bkash", label: "📱 bKash Direct PGW" },
              { id: "eps", label: "💳 EPS Multi-Channel" },
            ].map(pill => (
              <button
                key={pill.id}
                type="button"
                onClick={() => setPaymentFilter(pill.id as PaymentFilter)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0 ${
                  paymentFilter === pill.id
                    ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                    : "bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/60"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* 1. Cash on Delivery & Delivery Charges Card */}
          {(paymentFilter === "all" || paymentFilter === "cod") && (
            <div className="bg-slate-900/90 p-5 sm:p-6 rounded-3xl border border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Cash on Delivery (COD) & Nationwide Shipping</h3>
                    <p className="text-[11px] text-slate-400">Set standard delivery fees automatically applied during checkout.</p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-300 font-bold">Enable COD:</span>
                  <input
                    type="checkbox"
                    checked={codEnabled}
                    onChange={e => setCodEnabled(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded bg-slate-900 border-slate-700 cursor-pointer accent-amber-500"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-300">Delivery Fee (Inside Dhaka)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">৳</span>
                    <input
                      type="number"
                      value={deliveryChargeInside}
                      onChange={e => setDeliveryChargeInside(Number(e.target.value))}
                      className="w-full pl-8 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-300">Delivery Fee (Outside Dhaka)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">৳</span>
                    <input
                      type="number"
                      value={deliveryChargeOutside}
                      onChange={e => setDeliveryChargeOutside(Number(e.target.value))}
                      className="w-full pl-8 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. bKash Tokenized Direct Checkout Card */}
          {(paymentFilter === "all" || paymentFilter === "bkash") && (
            <div className="bg-slate-900/90 p-5 sm:p-6 rounded-3xl border border-pink-900/30 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#E2136E]/10 text-[#E2136E] border border-[#E2136E]/30 flex items-center justify-center font-black text-sm">
                    b
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <span>bKash Tokenized Direct Checkout</span>
                      <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-pink-500/10 text-pink-400 border border-pink-500/20">
                        v1.2.0-beta
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Accept automated bKash wallet payments directly inside chat widgets.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleFillOfficialSandbox}
                    className="px-3 py-1.5 bg-pink-950/40 hover:bg-pink-900/50 text-pink-400 border border-pink-700/50 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    <span>Fill Sandbox Credentials</span>
                  </button>

                  <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-300 font-bold">Enable:</span>
                    <input
                      type="checkbox"
                      checked={bkashEnabled}
                      onChange={e => setBkashEnabled(e.target.checked)}
                      className="w-4 h-4 text-pink-600 rounded bg-slate-900 border-slate-700 cursor-pointer accent-pink-500"
                    />
                  </label>
                </div>
              </div>

              {/* Environment Toggle & Base URL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">Environment Mode</label>
                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleEnvironment(true)}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        isBkashSandbox ? "bg-pink-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      🧪 Sandbox
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleEnvironment(false)}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        !isBkashSandbox ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      🚀 Live
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1.5">bKash Endpoint URL</label>
                  <input
                    type="text"
                    value={bkashBaseUrl}
                    onChange={e => setBkashBaseUrl(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 font-mono text-xs outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Credentials Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-300">bKash App Key</label>
                  <input
                    type="text"
                    value={bkashAppKey}
                    onChange={e => setBkashAppKey(e.target.value)}
                    placeholder="4f6o0cjiki2rfm34kfdadl1eqq"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-pink-500 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-300">bKash Merchant Username</label>
                  <input
                    type="text"
                    value={bkashUsername}
                    onChange={e => setBkashUsername(e.target.value)}
                    placeholder="sandboxTokenizedUser02"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-pink-500 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-300">bKash App Secret (AES-256 Encrypted)</label>
                  <div className="relative">
                    <input
                      type={showBkashSecret ? "text" : "password"}
                      value={bkashAppSecret}
                      onChange={e => setBkashAppSecret(e.target.value)}
                      placeholder="2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-pink-500 font-mono text-xs pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowBkashSecret(!showBkashSecret)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showBkashSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-300">bKash Merchant Password</label>
                  <input
                    type="password"
                    value={bkashPassword}
                    onChange={e => setBkashPassword(e.target.value)}
                    placeholder="sandboxTokenizedUser02@12345"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-pink-500 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Official Sandbox Testing Reference Box */}
              <div className="bg-pink-950/20 border border-pink-500/20 p-3.5 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-pink-400 font-bold text-xs">
                  <Smartphone className="w-4 h-4" />
                  <span>bKash Official Sandbox Test Wallets</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-slate-300 pt-0.5">
                  <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Test Wallet 1:</span>
                    <span className="text-pink-300 font-bold">01770618575</span>
                  </div>
                  <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Test Wallet 2:</span>
                    <span className="text-pink-300 font-bold">01929918378</span>
                  </div>
                  <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Test OTP:</span>
                    <span className="text-emerald-400 font-bold">123456</span>
                  </div>
                  <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Test PIN:</span>
                    <span className="text-emerald-400 font-bold">12121</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. EPS (Easy Payment System) Multi-Channel PGW Card */}
          {(paymentFilter === "all" || paymentFilter === "eps") && (
            <div className="bg-slate-900/90 p-5 sm:p-6 rounded-3xl border border-emerald-900/30 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xs">
                    EPS
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <span>EPS (Easy Payment System) Multi-Channel PGW</span>
                      <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Cards / MFS / Net Banking
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Accept Visa, MasterCard, Amex, Nagad, Rocket & Internet Banking from shoppers.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleFillOfficialEpsSandbox}
                    className="px-3 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-700/50 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Fill Sandbox Credentials</span>
                  </button>

                  <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-300 font-bold">Enable:</span>
                    <input
                      type="checkbox"
                      checked={epsEnabled}
                      onChange={e => setEpsEnabled(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded bg-slate-900 border-slate-700 cursor-pointer accent-emerald-500"
                    />
                  </label>
                </div>
              </div>

              {/* Environment Toggle & Base URL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">Environment Mode</label>
                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleEpsEnvironment(true)}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        isEpsSandbox ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      🧪 Sandbox
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleEpsEnvironment(false)}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        !isEpsSandbox ? "bg-teal-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      🚀 Live
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1.5">EPS Endpoint URL</label>
                  <input
                    type="text"
                    value={epsBaseUrl}
                    onChange={e => setEpsBaseUrl(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 font-mono text-xs outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Credentials Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-300">EPS Merchant Email</label>
                  <input
                    type="text"
                    value={epsUsername}
                    onChange={e => setEpsUsername(e.target.value)}
                    placeholder="Epsdemo@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-300">EPS Password</label>
                  <input
                    type={showEpsSecret ? "text" : "password"}
                    value={epsPassword}
                    onChange={e => setEpsPassword(e.target.value)}
                    placeholder="Enter EPS password"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block font-bold text-slate-300">Secret Hash Key (HMAC-SHA512 Secret)</label>
                  <div className="relative">
                    <input
                      type={showEpsSecret ? "text" : "password"}
                      value={epsHashKey}
                      onChange={e => setEpsHashKey(e.target.value)}
                      placeholder="FHZxyzeps56789gfhg678ygu876o="
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 font-mono text-xs pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEpsSecret(!showEpsSecret)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showEpsSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-300">Merchant ID</label>
                  <input
                    type="text"
                    value={epsMerchantId}
                    onChange={e => setEpsMerchantId(e.target.value)}
                    placeholder="29e86e70-0ac6-45eb-ba04-9fcb0aaed12a"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-300">Store ID</label>
                  <input
                    type="text"
                    value={epsStoreId}
                    onChange={e => setEpsStoreId(e.target.value)}
                    placeholder="d44e705f-9e3a-41de-98b1-1674631637da"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block font-bold text-slate-300">Merchant Contact / Support Mobile</label>
                  <input
                    type="text"
                    value={epsMerchantNumber}
                    onChange={e => setEpsMerchantNumber(e.target.value)}
                    placeholder="e.g. 01700000000"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Gateways...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Payment Gateways</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SMS NOTIFICATIONS GATEWAY */}
      {/* ========================================================================= */}
      {activeTab === "sms" && (
        <form onSubmit={handleSaveGatewaysAndSms} className="space-y-5 text-xs">
          
          <div className="bg-slate-900/90 p-5 sm:p-6 rounded-3xl border border-cyan-900/30 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Automated SMS Notification Gateway</h3>
                  <p className="text-[11px] text-slate-400">Send instant order confirmations and dispatch tracking SMS to shopper phones.</p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-300 font-bold">Enable SMS:</span>
                <input
                  type="checkbox"
                  checked={smsEnabled}
                  onChange={e => setSmsEnabled(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 rounded bg-slate-900 border-slate-700 cursor-pointer accent-cyan-500"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300">SMS Gateway Provider</label>
                <select
                  value={smsProvider}
                  onChange={e => setSmsProvider(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="smsmatrix">SMSMatrix (N.I. BIZ Host - Recommended)</option>
                  <option value="greenweb">Greenweb BD</option>
                  <option value="ssl_wireless">SSL Wireless (SSL SMS)</option>
                  <option value="bulksmsbd">BulkSMS BD</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300">Sender ID / Brand Masking</label>
                <input
                  type="text"
                  value={smsSenderId}
                  onChange={e => setSmsSenderId(e.target.value)}
                  placeholder="e.g. PadmaMart"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-cyan-500 font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-300">API Key / Bearer Token</label>
                  {smsApiKey && (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Configured
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showSmsKey ? "text" : "password"}
                    value={smsApiKey}
                    onChange={e => setSmsApiKey(e.target.value)}
                    placeholder="Enter SMS API Key"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-cyan-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmsKey(!showSmsKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                  >
                    {showSmsKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {smsProvider === "smsmatrix" && (
                <div className="sm:col-span-3 bg-cyan-950/20 border border-cyan-500/20 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-cyan-300">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-400">⚡ SMSMatrix Direct API:</span>
                    <code className="bg-slate-950 px-2 py-0.5 rounded text-slate-300 font-mono text-[10.5px]">https://smsmatrix.nibizhost.com/api/v1/sms/send</code>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Authorization: Bearer &lt;API_KEY&gt;</span>
                </div>
              )}

              {/* Real-time SMS Test Dispatcher */}
              <div className="sm:col-span-3 bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-xs text-white">Live SMS Dispatch Tester</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Test real-time delivery to your mobile phone</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    value={testPhone}
                    onChange={e => setTestPhone(e.target.value)}
                    placeholder="Enter phone number (e.g. 01770618575)"
                    className="flex-1 w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-cyan-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestSms}
                    disabled={isSendingTestSms || !smsEnabled}
                    className="w-full sm:w-auto px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingTestSms ? "Dispatching..." : "Send Test SMS"}</span>
                  </button>
                </div>
              </div>

              {/* Order Confirmation SMS Template */}
              <div className="space-y-2 sm:col-span-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-300">Order Confirmation SMS Template</label>
                  <span className="text-[10px] text-slate-400">Click tags below to insert</span>
                </div>
                <textarea
                  rows={2}
                  value={smsTemplate}
                  onChange={e => setSmsTemplate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-cyan-500 font-sans text-xs leading-relaxed"
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-semibold">Insert Variables:</span>
                  {[
                    "{{customer_name}}",
                    "{{order_id}}",
                    "{{total_amount}}",
                    "{{store_name}}"
                  ].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertVariableToTemplate(v)}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[10.5px] border border-slate-700 transition-colors cursor-pointer"
                    >
                      +{v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving SMS Gateway...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save SMS Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
