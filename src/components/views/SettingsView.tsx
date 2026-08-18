"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { 
  Building2, Phone, Mail, MapPin, Clock, Globe, 
  Palette, Bot, CheckCircle2, RefreshCw, Sparkles,
  ShieldCheck, ShoppingBag, Truck, Info
} from "lucide-react";
import { api } from "../../lib/api";

export default function SettingsView() {
  const { showToast } = useToast();
  const { user, refreshUser } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Business Profile Form State
  const [orgName, setOrgName] = useState("");
  const [customDomain, setCustomDomain] = useState("");
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

  // Visual Branding State
  const [brandName, setBrandName] = useState("Padma Mart Live AI");
  const [primaryColor, setPrimaryColor] = useState("#4F46E5");

  // Load existing tenant business settings
  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const tenant = await api.getTenantSettings();
        if (tenant) {
          setOrgName(tenant.name || "");
          setCustomDomain(tenant.custom_domain || "");
          
          const cfg = tenant.branding_config || {};
          setBrandName(cfg.brand_name || tenant.name || "Padma Mart Live AI");
          setTagline(cfg.tagline || "");
          setIndustry(cfg.industry || "E-Commerce & Retail");
          setSupportPhone(cfg.support_phone || "+880 1837-586105");
          setSupportEmail(cfg.support_email || `support@${tenant.slug}.example`);
          setCompanyAddress(cfg.company_address || "Uttara, Dhaka, Bangladesh");
          setWorkingHours(cfg.working_hours || "9:00 AM - 10:00 PM (Daily)");
          setCourierPartners(cfg.courier_partners || "Steadfast Express, RedX, Pathao");
          setCurrencySymbol(cfg.currency_symbol || "৳");
          setPrimaryColor(cfg.primary_color || "#4F46E5");
        }
      } catch (err) {
        console.error("Failed to load tenant settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name: orgName,
        custom_domain: customDomain,
        branding_config: {
          brand_name: brandName,
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
      showToast("Business Settings Updated", "Your store profile and customer support information have been saved.", "success");
      
      // Re-sync auth context profile
      if (refreshUser) {
        await refreshUser();
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("aiaas:refresh_user"));
      }
    } catch (err: any) {
      showToast("Save Failed", err.message || "Failed to update business settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Loading organization profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 font-sans antialiased">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 uppercase tracking-wide">
              Store Profile & Identity
            </span>
            <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Verified Business Account
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            Organization Business Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Setup and manage your brand details, contact hotline, physical address, and store support policies.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          {isSaving ? "Saving..." : "Save Business Profile"}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        
        {/* 1. General Business Profile */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Brand & Store Identity</h3>
              <p className="text-[11px] text-slate-400">Basic identification of your business displayed to shoppers.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Company / Organization Legal Name</label>
              <input
                type="text"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                placeholder="e.g. Padma Mart Ltd."
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Business Industry / Category</label>
              <select
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium bg-white"
              >
                <option value="E-Commerce & Retail">E-Commerce & Online Retail</option>
                <option value="Fashion & Apparel">Fashion & Apparel</option>
                <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                <option value="Groceries & Superstore">Groceries & Superstore</option>
                <option value="Health & Beauty">Health & Beauty</option>
                <option value="Corporate & B2B Services">Corporate & B2B Services</option>
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block font-bold text-slate-700">Brand Tagline / Slogan</label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                placeholder="e.g. Fastest Fashion, Gadgets & Lifestyle E-Commerce in Bangladesh"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block font-bold text-slate-700 flex items-center justify-between">
                <span>Official Storefront URL / Custom Domain</span>
                <span className="text-[10.5px] text-indigo-600 font-semibold font-mono">CNAME Supported</span>
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={customDomain}
                  onChange={e => setCustomDomain(e.target.value)}
                  placeholder="e.g. support.padmadigital.com.bd"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono text-slate-800 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Customer Support & Operational Contacts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Customer Support & Hotline Contacts</h3>
              <p className="text-[11px] text-slate-400">Used by AI when transferring visitors or providing direct helpline numbers.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Official Helpline / WhatsApp Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={supportPhone}
                  onChange={e => setSupportPhone(e.target.value)}
                  placeholder="e.g. +880 1837-586105"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Official Support Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={supportEmail}
                  onChange={e => setSupportEmail(e.target.value)}
                  placeholder="e.g. support@padmadigital.example"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block font-bold text-slate-700">Physical Store / Office Address (Bangladesh)</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={companyAddress}
                  onChange={e => setCompanyAddress(e.target.value)}
                  placeholder="e.g. House 14, Road 7, Sector 3, Uttara, Dhaka-1230, Bangladesh"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Operations, Logistics & Working Hours */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Working Hours & Delivery Operations</h3>
              <p className="text-[11px] text-slate-400">Informs visitors about delivery timeframes and agent availability.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Customer Service Working Hours</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={workingHours}
                  onChange={e => setWorkingHours(e.target.value)}
                  placeholder="e.g. 9:00 AM - 10:00 PM (Sat - Thu)"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Primary Store Currency</label>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold flex items-center justify-between">
                <span>Bangladeshi Taka (BDT)</span>
                <span className="font-mono text-indigo-600 bg-white px-2 py-0.5 rounded border border-slate-200">৳ BDT</span>
              </div>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block font-bold text-slate-700">Courier & Delivery Partners</label>
              <div className="relative">
                <Truck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={courierPartners}
                  onChange={e => setCourierPartners(e.target.value)}
                  placeholder="e.g. Steadfast Express, RedX, Pathao Logistics"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Visual Theme & AI Branding */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">AI Widget Name & Theme Accent</h3>
              <p className="text-[11px] text-slate-400">Match your chat widget appearance with your e-commerce brand colors.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">AI Assistant Greeting Name</label>
              <div className="relative">
                <Bot className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  placeholder="e.g. Padma Mart Live AI"
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Brand Theme Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="h-10 w-16 rounded-xl cursor-pointer border border-slate-200 p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono uppercase font-bold text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Footer Action */}
        <div className="flex items-center justify-between pt-4 pb-8">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-500" />
            AI models, token meters, and platform infrastructure are securely managed by Platform Super Admin.
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {isSaving ? "Saving Settings..." : "Save Business Profile"}
          </button>
        </div>

      </form>
    </div>
  );
}
