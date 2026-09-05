"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import {
  Building2, Phone, Mail, MapPin, Clock, Globe,
  CheckCircle2, RefreshCw, Sparkles, ShieldCheck,
  ShoppingBag, Truck, CreditCard, Send, Lock,
  Eye, EyeOff, Smartphone, Zap, Key, Settings, Check
} from "lucide-react";
import { api } from "../../lib/api";

type ActiveTab = "profile" | "payments" | "sms";

export default function SettingsView() {
  const { showToast } = useToast();
  const { user, refreshUser } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");

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
    showToast("Sandbox Loaded", "bKash Tokenized Sandbox credentials applied! Click 'Save Changes' to activate.", "info");
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
    showToast("Sandbox Loaded", "EPS Sandbox credentials applied! Click 'Save Changes' to activate.", "info");
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
      showToast("Profile Updated", "Store profile saved successfully.", "success");

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
      
      showToast("Settings Saved", "Payment & SMS settings updated successfully.", "success");
    } catch (err: any) {
      showToast("Save Failed", err.message || "Failed to save settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestSms = async () => {
    if (!testPhone.trim()) {
      showToast("Phone Required", "Please enter a phone number to test SMS.", "error");
      return;
    }
    setIsSendingTestSms(true);
    try {
      const res = await api.testSmsGateway({ phone_number: testPhone.trim() });
      if (res.status === "sent") {
        showToast("SMS Delivered", `Test SMS delivered via SMSMatrix! Remaining Balance: ${res.remaining_balance || 'Active'}`, "success");
      } else if (res.status === "delivered_mock") {
        showToast("SMS Simulated", `Mock SMS logged successfully. Configure a live API Key for real SMS.`, "info");
      } else {
        showToast("SMS Failed", res.error || "Could not send SMS. Check API key.", "error");
      }
    } catch (err: any) {
      showToast("Test Failed", err.message || "Failed to send test SMS", "error");
    } finally {
      setIsSendingTestSms(false);
    }
  };

  const insertVariableToTemplate = (tag: string) => {
    setSmsTemplate(prev => prev + " " + tag);
    showToast("Tag Added", `Added ${tag} to template.`, "info");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-28 text-slate-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 max-w-5xl mx-auto space-y-6 font-sans text-slate-900">
      
      {/* Decent, High-Contrast Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </span>
              <span>Store & Organization Settings</span>
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Multi-Tenant Isolated</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Manage your store branding, online payment gateways (<span className="font-semibold text-[#E2136E]">bKash</span> & <span className="font-semibold text-emerald-600">EPS</span>), and automated SMS notifications.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${bkashEnabled || epsEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <span>{bkashEnabled || epsEnabled ? 'Online PGW Active' : 'COD Mode Active'}</span>
          </span>
        </div>
      </div>

      {/* Decent Flat Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-1 sm:gap-2">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === "profile"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Brand & Profile</span>
        </button>

        <button
          onClick={() => setActiveTab("payments")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === "payments"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment Gateways</span>
        </button>

        <button
          onClick={() => setActiveTab("sms")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === "sms"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Send className="w-4 h-4" />
          <span>SMS Notifications</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BUSINESS & BRAND PROFILE */}
      {/* ========================================================================= */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
          
          {/* Brand Identification */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              <h2 className="font-bold text-sm text-slate-900">Store Identity & Category</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">Company / Store Legal Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  placeholder="e.g. Padma Mart Ltd."
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs font-medium transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">Business Category</label>
                <select
                  value={businessCategory}
                  onChange={e => setBusinessCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer text-xs font-medium transition-all"
                >
                  <option value="ecommerce">🛍️ E-Commerce & Retail Store (Products & COD)</option>
                  <option value="services">💼 Services & Consulting (Leads, Bookings & WhatsApp)</option>
                  <option value="erp">🏢 ERP / Corporate B2B (SLA Tickets & Knowledge)</option>
                  <option value="healthcare">🏥 Healthcare & Clinic (Appointments)</option>
                  <option value="realestate">🏠 Real Estate & Property (Listings)</option>
                  <option value="education">🎓 Education & Coaching (Admissions)</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block font-semibold text-slate-700">Marketing Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  placeholder="e.g. Your Premier Online Lifestyle & Fashion Destination"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs font-medium transition-all"
                />
              </div>
            </div>
          </div>

          {/* Support Contacts */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Globe className="w-4 h-4 text-indigo-600" />
              <h2 className="font-bold text-sm text-slate-900">Support Contacts & Office Address</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">Support Hotline Phone</label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={e => setSupportPhone(e.target.value)}
                  placeholder="+880 1700-112233"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs font-mono transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={e => setSupportEmail(e.target.value)}
                  placeholder="support@yourbrand.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs transition-all"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block font-semibold text-slate-700">Physical Office Address</label>
                <input
                  type="text"
                  value={companyAddress}
                  onChange={e => setCompanyAddress(e.target.value)}
                  placeholder="Sector 3, Uttara, Dhaka - 1230, Bangladesh"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs font-medium transition-all"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block font-semibold text-slate-700">Customer Support Working Hours</label>
                <input
                  type="text"
                  value={workingHours}
                  onChange={e => setWorkingHours(e.target.value)}
                  placeholder="9:00 AM - 10:00 PM (Daily)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs font-medium transition-all"
                />
              </div>
            </div>
          </div>

          {/* Delivery Couriers */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Truck className="w-4 h-4 text-indigo-600" />
              <h2 className="font-bold text-sm text-slate-900">Logistics & Courier Partners</h2>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">Active Delivery Couriers</label>
              <input
                type="text"
                value={courierPartners}
                onChange={e => setCourierPartners(e.target.value)}
                placeholder="Steadfast Express, RedX, Pathao, Paperfly"
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs font-medium transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Brand Profile"}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PAYMENT GATEWAYS */}
      {/* ========================================================================= */}
      {activeTab === "payments" && (
        <form onSubmit={handleSaveGatewaysAndSms} className="space-y-5 text-xs">
          
          {/* 1. Cash on Delivery & Delivery Charges Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-slate-900">Cash on Delivery (COD) & Shipping Rates</h2>
                  <p className="text-slate-500 text-[11px]">Set standard delivery charges automatically applied during checkout.</p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-700 font-semibold">Enable COD:</span>
                <input
                  type="checkbox"
                  checked={codEnabled}
                  onChange={e => setCodEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 cursor-pointer accent-indigo-600"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">Delivery Fee (Inside Dhaka)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    value={deliveryChargeInside}
                    onChange={e => setDeliveryChargeInside(Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-bold transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">Delivery Fee (Outside Dhaka)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    value={deliveryChargeOutside}
                    onChange={e => setDeliveryChargeOutside(Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-bold transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. bKash Tokenized Checkout Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-50 text-[#E2136E] border border-pink-100 flex items-center justify-center font-black text-sm">
                  b
                </div>
                <div>
                  <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span>bKash Tokenized Direct PGW</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-pink-50 text-[#E2136E] border border-pink-200 font-bold">
                      v1.2.0-beta
                    </span>
                  </h2>
                  <p className="text-slate-500 text-[11px]">Accept automated bKash wallet payments directly inside chat widgets.</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleFillOfficialSandbox}
                  className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-[#E2136E] border border-pink-200 rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Fill Sandbox Keys</span>
                </button>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-700 font-semibold">Enable:</span>
                  <input
                    type="checkbox"
                    checked={bkashEnabled}
                    onChange={e => setBkashEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 cursor-pointer accent-[#E2136E]"
                  />
                </label>
              </div>
            </div>

            {/* Environment Toggle & Base URL */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Environment</label>
                <div className="flex bg-white p-1 rounded-lg border border-slate-200 gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleEnvironment(true)}
                    className={`flex-1 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                      isBkashSandbox ? "bg-pink-50 text-[#E2136E] border border-pink-200 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    🧪 Sandbox
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleEnvironment(false)}
                    className={`flex-1 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                      !isBkashSandbox ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    🚀 Live
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1.5">bKash Endpoint URL</label>
                <input
                  type="text"
                  value={bkashBaseUrl}
                  onChange={e => setBkashBaseUrl(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-xs outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Credentials Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">bKash App Key</label>
                <input
                  type="text"
                  value={bkashAppKey}
                  onChange={e => setBkashAppKey(e.target.value)}
                  placeholder="4f6o0cjiki2rfm34kfdadl1eqq"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-mono text-xs transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">bKash Merchant Username</label>
                <input
                  type="text"
                  value={bkashUsername}
                  onChange={e => setBkashUsername(e.target.value)}
                  placeholder="sandboxTokenizedUser02"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-mono text-xs transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">bKash App Secret (AES-256 Encrypted)</label>
                <div className="relative">
                  <input
                    type={showBkashSecret ? "text" : "password"}
                    value={bkashAppSecret}
                    onChange={e => setBkashAppSecret(e.target.value)}
                    placeholder="2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b"
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-mono text-xs pr-10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowBkashSecret(!showBkashSecret)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showBkashSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">bKash Merchant Password</label>
                <input
                  type="password"
                  value={bkashPassword}
                  onChange={e => setBkashPassword(e.target.value)}
                  placeholder="sandboxTokenizedUser02@12345"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-mono text-xs transition-all"
                />
              </div>
            </div>
          </div>

          {/* 3. EPS (Easy Payment System) Gateway Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-black text-xs">
                  EPS
                </div>
                <div>
                  <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span>EPS (Easy Payment System) Multi-Channel</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      Cards / MFS / Net Banking
                    </span>
                  </h2>
                  <p className="text-slate-500 text-[11px]">Accept Visa, MasterCard, Amex, Nagad, Rocket & Internet Banking from shoppers.</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleFillOfficialEpsSandbox}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Fill Sandbox Keys</span>
                </button>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-700 font-semibold">Enable:</span>
                  <input
                    type="checkbox"
                    checked={epsEnabled}
                    onChange={e => setEpsEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 cursor-pointer accent-emerald-600"
                  />
                </label>
              </div>
            </div>

            {/* Environment Toggle & Base URL */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Environment</label>
                <div className="flex bg-white p-1 rounded-lg border border-slate-200 gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleEpsEnvironment(true)}
                    className={`flex-1 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                      isEpsSandbox ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    🧪 Sandbox
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleEpsEnvironment(false)}
                    className={`flex-1 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                      !isEpsSandbox ? "bg-teal-50 text-teal-700 border border-teal-200 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    🚀 Live
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1.5">EPS Endpoint URL</label>
                <input
                  type="text"
                  value={epsBaseUrl}
                  onChange={e => setEpsBaseUrl(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-xs outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Credentials Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">EPS Merchant Email</label>
                <input
                  type="text"
                  value={epsUsername}
                  onChange={e => setEpsUsername(e.target.value)}
                  placeholder="Epsdemo@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-mono text-xs transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">EPS Password</label>
                <input
                  type={showEpsSecret ? "text" : "password"}
                  value={epsPassword}
                  onChange={e => setEpsPassword(e.target.value)}
                  placeholder="Enter EPS password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-mono text-xs transition-all"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block font-semibold text-slate-700">Secret Hash Key (HMAC-SHA512 Secret)</label>
                <div className="relative">
                  <input
                    type={showEpsSecret ? "text" : "password"}
                    value={epsHashKey}
                    onChange={e => setEpsHashKey(e.target.value)}
                    placeholder="FHZxyzeps56789gfhg678ygu876o="
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-mono text-xs pr-10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEpsSecret(!showEpsSecret)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showEpsSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">Merchant ID</label>
                <input
                  type="text"
                  value={epsMerchantId}
                  onChange={e => setEpsMerchantId(e.target.value)}
                  placeholder="29e86e70-0ac6-45eb-ba04-9fcb0aaed12a"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-mono text-xs transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">Store ID</label>
                <input
                  type="text"
                  value={epsStoreId}
                  onChange={e => setEpsStoreId(e.target.value)}
                  placeholder="d44e705f-9e3a-41de-98b1-1674631637da"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-mono text-xs transition-all"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block font-semibold text-slate-700">Merchant Support Mobile Number</label>
                <input
                  type="text"
                  value={epsMerchantNumber}
                  onChange={e => setEpsMerchantNumber(e.target.value)}
                  placeholder="e.g. 01700000000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-mono text-xs transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Payment Gateways"}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SMS NOTIFICATIONS GATEWAY */}
      {/* ========================================================================= */}
      {activeTab === "sms" && (
        <form onSubmit={handleSaveGatewaysAndSms} className="space-y-5 text-xs">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-slate-900">Automated SMS Notification Gateway</h2>
                  <p className="text-slate-500 text-[11px]">Send instant order confirmations and dispatch tracking SMS to shopper phones.</p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-700 font-semibold">Enable SMS:</span>
                <input
                  type="checkbox"
                  checked={smsEnabled}
                  onChange={e => setSmsEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 cursor-pointer accent-indigo-600"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">SMS Provider</label>
                <select
                  value={smsProvider}
                  onChange={e => setSmsProvider(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer text-xs font-medium transition-all"
                >
                  <option value="smsmatrix">SMSMatrix (N.I. BIZ Host)</option>
                  <option value="greenweb">Greenweb BD</option>
                  <option value="ssl_wireless">SSL Wireless</option>
                  <option value="bulksmsbd">BulkSMS BD</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">Sender ID / Brand Masking</label>
                <input
                  type="text"
                  value={smsSenderId}
                  onChange={e => setSmsSenderId(e.target.value)}
                  placeholder="e.g. PadmaMart"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-mono text-xs transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">API Key / Bearer Token</label>
                <div className="relative">
                  <input
                    type={showSmsKey ? "text" : "password"}
                    value={smsApiKey}
                    onChange={e => setSmsApiKey(e.target.value)}
                    placeholder="Enter SMS API Key"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-mono text-xs transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmsKey(!showSmsKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showSmsKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Real-time SMS Test Dispatcher */}
              <div className="sm:col-span-3 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-indigo-600" /> Live SMS Dispatch Tester
                  </span>
                  <span className="text-[11px] text-slate-500">Verify SMS delivery to your phone</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    value={testPhone}
                    onChange={e => setTestPhone(e.target.value)}
                    placeholder="Enter phone number (e.g. 017XXXXXXXX)"
                    className="flex-1 w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestSms}
                    disabled={isSendingTestSms || !smsEnabled}
                    className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingTestSms ? "Dispatching..." : "Send Test SMS"}</span>
                  </button>
                </div>
              </div>

              {/* Order Confirmation SMS Template */}
              <div className="space-y-2 sm:col-span-3">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-slate-700">Order Confirmation SMS Template</label>
                  <span className="text-[11px] text-slate-500">Click tags below to insert</span>
                </div>
                <textarea
                  rows={2}
                  value={smsTemplate}
                  onChange={e => setSmsTemplate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-sans text-xs leading-relaxed transition-all"
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-500 font-medium">Insert Variables:</span>
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
                      className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] border border-slate-200 transition-colors cursor-pointer"
                    >
                      +{v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save SMS Settings"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
