"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import {
  Building2, Phone, Mail, MapPin, Clock, Globe,
  Palette, Bot, CheckCircle2, RefreshCw, Sparkles,
  ShieldCheck, ShoppingBag, Truck, Info, CreditCard,
  Send, Lock, Eye, EyeOff, Smartphone, Zap, Key
} from "lucide-react";
import { api } from "../../lib/api";

export default function SettingsView() {
  const { showToast } = useToast();
  const { user, refreshUser } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "payment_sms">("profile");

  // Business Profile Form State
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

  // E-Commerce Payment & SMS Gateways State
  const [codEnabled, setCodEnabled] = useState(true);
  const [bkashEnabled, setBkashEnabled] = useState(true);
  const [isBkashSandbox, setIsBkashSandbox] = useState(true);
  const [bkashBaseUrl, setBkashBaseUrl] = useState("https://tokenized.sandbox.bka.sh/v1.2.0-beta");
  const [bkashAppKey, setBkashAppKey] = useState("");
  const [bkashAppSecret, setBkashAppSecret] = useState("");
  const [bkashUsername, setBkashUsername] = useState("");
  const [bkashPassword, setBkashPassword] = useState("");
  const [showBkashSecret, setShowBkashSecret] = useState(false);

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
          setCodEnabled(ecom.cod_enabled);
          setBkashEnabled(ecom.bkash_enabled);
          setIsBkashSandbox(ecom.bkash_is_sandbox !== undefined ? ecom.bkash_is_sandbox : true);
          setBkashBaseUrl(ecom.bkash_base_url || (ecom.bkash_is_sandbox !== false ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta" : "https://tokenized.pay.bka.sh/v1.2.0-beta"));
          setBkashAppKey(ecom.bkash_app_key_masked || "");
          setBkashUsername(ecom.bkash_username_masked || "");
          setSmsEnabled(ecom.sms_notifications_enabled);
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
    showToast("Official Sandbox Loaded", "bKash Tokenized Sandbox credentials applied! Click 'Save Gateways' to activate.", "info");
  };

  const handleToggleEnvironment = (sandbox: boolean) => {
    setIsBkashSandbox(sandbox);
    setBkashBaseUrl(sandbox ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta" : "https://tokenized.pay.bka.sh/v1.2.0-beta");
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
      showToast("Profile Updated", "Store profile & identity saved to database.", "success");

      if (refreshUser) await refreshUser();
    } catch (err: any) {
      showToast("Save Failed", err.message || "Failed to update business settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGateways = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: any = {
        business_category: businessCategory,
        cod_enabled: codEnabled,
        bkash_enabled: bkashEnabled,
        bkash_is_sandbox: isBkashSandbox,
        bkash_base_url: bkashBaseUrl,
        sms_notifications_enabled: smsEnabled,
        sms_provider: smsProvider,
        sms_sender_id: smsSenderId,
        sms_order_template: smsTemplate
      };

      if (bkashAppKey && !bkashAppKey.includes("...")) payload.bkash_app_key = bkashAppKey;
      if (bkashAppSecret) payload.bkash_app_secret = bkashAppSecret;
      if (bkashUsername) payload.bkash_username = bkashUsername;
      if (bkashPassword) payload.bkash_password = bkashPassword;
      if (smsApiKey && !smsApiKey.includes("...")) payload.sms_api_key = smsApiKey;

      const updated = await api.updateEcommerceSettings(payload);
      if (updated.sms_api_key_masked) setSmsApiKey(updated.sms_api_key_masked);
      if (updated.bkash_app_key_masked) setBkashAppKey(updated.bkash_app_key_masked);
      showToast("Gateways Updated", "bKash credentials and SMS notification settings saved successfully!", "success");
    } catch (err: any) {
      showToast("Save Failed", err.message || "Failed to save gateways", "error");
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium">Loading organization profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans antialiased">

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-extrabold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 uppercase tracking-wide">
              Store Profile & Gateways
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Active Enterprise
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 shrink-0" />
            <span>Organization Business Settings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Setup your business category, bKash Merchant Payment Gateway, and Automated SMS triggers.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/50 rounded-2xl p-1.5 gap-1.5 sm:gap-2 overflow-x-auto custom-scrollbar-horizontal flex-nowrap">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 min-w-[170px] py-2.5 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${activeTab === "profile"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-400 hover:text-white"
            }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Business & Support Profile</span>
        </button>
        <button
          onClick={() => setActiveTab("payment_sms")}
          className={`flex-1 min-w-[170px] py-2.5 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${activeTab === "payment_sms"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-400 hover:text-white"
            }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>bKash Payment & SMS Gateway</span>
        </button>
      </div>

      {activeTab === "profile" ? (
        <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
          {/* 1. General Business Profile */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Brand & Category Configuration</h3>
                <p className="text-[11px] text-slate-400">Basic identification of your business displayed to shoppers.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block font-bold text-slate-300">Company Legal Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  placeholder="e.g. Padma Mart Ltd."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-300">Business Category</label>
                <select
                  value={businessCategory}
                  onChange={e => setBusinessCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="ecommerce">E-Commerce Store (Full Commerce Module)</option>
                  <option value="healthcare">Healthcare & Diagnostic Clinic</option>
                  <option value="realestate">Real Estate & Construction</option>
                  <option value="education">Education & Coaching Academy</option>
                  <option value="saas_general">General Corporate / SaaS</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="block font-bold text-slate-300">Marketing Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  placeholder="e.g. Fastest Fashion, Gadgets & Lifestyle in Bangladesh"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* 2. Customer Support & Contact */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Contact & Support Hotline</h3>
                <p className="text-[11px] text-slate-400">Used by the AI bot to answer hotline and location inquiries.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block font-bold text-slate-300">Support Hotline Phone</label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={e => setSupportPhone(e.target.value)}
                  placeholder="+880 1700-112233"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-300">Official Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={e => setSupportEmail(e.target.value)}
                  placeholder="support@padmamart.com.bd"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="block font-bold text-slate-300">Physical Office / Store Address</label>
                <textarea
                  rows={2}
                  value={companyAddress}
                  onChange={e => setCompanyAddress(e.target.value)}
                  placeholder="House 14, Road 7, Sector 3, Uttara, Dhaka-1230"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
            >
              {isSaving ? "Saving..." : "Save Business Profile"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSaveGateways} className="space-y-6 text-xs">

          {/* bKash Tokenized Merchant Gateway Configuration */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-pink-500/10 text-pink-400 rounded-2xl font-bold text-base flex items-center justify-center">
                  bKash
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    bKash Tokenized Payment Gateway (v1.2.0-beta)
                  </h3>
                  <p className="text-[11px] text-slate-400">Accept automated mobile wallet payments directly inside the CDN live chat widget.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleFillOfficialSandbox}
                  className="px-3 py-1.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/30 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>1-Click Fill Sandbox Keys</span>
                </button>
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-300 font-medium">Enable bKash:</span>
                  <input
                    type="checkbox"
                    checked={bkashEnabled}
                    onChange={e => setBkashEnabled(e.target.checked)}
                    className="w-4 h-4 text-pink-600 rounded bg-slate-900 border-slate-700 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Environment Toggle & Base URL */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Environment Mode</label>
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleEnvironment(true)}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${isBkashSandbox ? "bg-pink-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                      }`}
                  >
                    🧪 Sandbox (Testing)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleEnvironment(false)}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${!isBkashSandbox ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                      }`}
                  >
                    🚀 Live (Production)
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-300 mb-1.5">bKash API Endpoint URL</label>
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
              <div className="space-y-1">
                <label className="block font-bold text-slate-300">bKash App Key</label>
                <input
                  type="text"
                  value={bkashAppKey}
                  onChange={e => setBkashAppKey(e.target.value)}
                  placeholder="4f6o0cjiki2rfm34kfdadl1eqq"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-pink-500 font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-300">bKash Merchant Username</label>
                <input
                  type="text"
                  value={bkashUsername}
                  onChange={e => setBkashUsername(e.target.value)}
                  placeholder="sandboxTokenizedUser02"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-pink-500 font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
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
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showBkashSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
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
            <div className="bg-pink-950/20 border border-pink-500/20 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-pink-400 font-bold text-xs">
                <Smartphone className="w-4 h-4" />
                <span>bKash Official Sandbox Test Data (for Demo Orders)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-slate-300 pt-1">
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

          {/* SMS Notification Gateway */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Automated SMS Notification Gateway</h3>
                  <p className="text-[11px] text-slate-400">Send instant order confirmations and dispatch tracking SMS.</p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-slate-400 font-medium">Enable SMS:</span>
                <input
                  type="checkbox"
                  checked={smsEnabled}
                  onChange={e => setSmsEnabled(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded bg-slate-950 border-slate-700 cursor-pointer"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block font-bold text-slate-300">SMS Gateway Provider</label>
                <select
                  value={smsProvider}
                  onChange={e => setSmsProvider(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="smsmatrix">SMSMatrix (N.I. BIZ Host - Recommended)</option>
                  <option value="greenweb">Greenweb BD</option>
                  <option value="ssl_wireless">SSL Wireless (SSL SMS)</option>
                  <option value="bulksmsbd">BulkSMS BD</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-300">Sender ID / Brand Name</label>
                <input
                  type="text"
                  value={smsSenderId}
                  onChange={e => setSmsSenderId(e.target.value)}
                  placeholder="e.g. PadmaMart"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
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
                    placeholder="Enter SMSMatrix API Key"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmsKey(!showSmsKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                  >
                    {showSmsKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {smsProvider === "smsmatrix" && (
                <div className="sm:col-span-3 bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-emerald-300">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-400">⚡ SMSMatrix Endpoint:</span>
                    <code className="bg-slate-950 px-2 py-0.5 rounded text-slate-300 font-mono text-[10.5px]">https://smsmatrix.nibizhost.com/api/v1/sms/send</code>
                  </div>
                  <span className="text-[10px] text-slate-400">Header: Authorization: Bearer &lt;API_KEY&gt;</span>
                </div>
              )}

              {/* Real-time SMS Test Dispatcher */}
              <div className="sm:col-span-3 bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs text-white">Live SMS Gateway Tester</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Test live delivery to your phone</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    value={testPhone}
                    onChange={e => setTestPhone(e.target.value)}
                    placeholder="Enter phone number (e.g. 01770618575)"
                    className="flex-1 w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestSms}
                    disabled={isSendingTestSms || !smsEnabled}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingTestSms ? "Dispatching..." : "Send Test SMS"}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1 sm:col-span-3">
                <label className="block font-bold text-slate-300">Order Confirmation SMS Template</label>
                <textarea
                  rows={2}
                  value={smsTemplate}
                  onChange={e => setSmsTemplate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 font-sans"
                />
                <div className="text-[10px] text-slate-500 mt-1">
                  Variables available: <code className="text-emerald-400">{"{{customer_name}}"}</code>, <code className="text-emerald-400">{"{{order_id}}"}</code>, <code className="text-emerald-400">{"{{total_amount}}"}</code>, <code className="text-emerald-400">{"{{store_name}}"}</code>.
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all"
            >
              {isSaving ? "Saving..." : "Save Gateways & SMS Settings"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
