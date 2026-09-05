"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { 
  Globe, Plus, Copy, ExternalLink, CheckCircle2, Bot, Code2, X, 
  MessageSquare, Send, RefreshCw, ShoppingBag, Settings2, Sliders, 
  Sparkles, CreditCard, Truck, ShieldCheck, Tag, Eye, Edit2,
  Calendar, Phone, Check, Building2, HelpCircle, Users
} from "lucide-react";
import { Website, Product } from "../../types";
import { api, API_BASE_URL, CDN_WIDGET_URL } from "../../lib/api";

export default function WebsitesView() {
  const { showToast } = useToast();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<Website | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSiteName, setEditSiteName] = useState("");
  const [editSiteDomain, setEditSiteDomain] = useState("");
  const [editSiteCategory, setEditSiteCategory] = useState<"ecommerce" | "erp" | "services">("ecommerce");
  const [isUpdatingSite, setIsUpdatingSite] = useState(false);
  const [activeTab, setActiveTab] = useState<"embed" | "customizer">("embed");

  // Form State for Adding Website
  const [newName, setNewName] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [newCategory, setNewCategory] = useState("ecommerce");
  const [newColor, setNewColor] = useState("#4F46E5");
  const [newHeader, setNewHeader] = useState("Live AI Assistant");
  const [newWelcome, setNewWelcome] = useState("Hello! How can we assist your business today?");

  // Adaptive Widget Customizer State (for selected site)
  const [customizerConfig, setCustomizerConfig] = useState({
    // E-Commerce
    enabled: true,
    show_products_carousel: true,
    allow_instant_checkout: true,
    cod_enabled: true,
    bkash_enabled: true,
    eps_enabled: true,
    delivery_charge_inside_dhaka: 60,
    delivery_charge_outside_dhaka: 120,
    // Services & Bookings
    lead_capture_enabled: true,
    booking_enabled: true,
    whatsapp_connect_enabled: true,
    service_catalog_enabled: true,
    // ERP / B2B
    sla_tickets_enabled: true,
    demo_scheduler_enabled: true,
    dedicated_manager_enabled: true
  });

  // Interactive Live Preview Simulator
  const [previewMessages, setPreviewMessages] = useState<any[]>([
    { 
      sender: "ai", 
      text: "Hello! Welcome to our portal. How can we assist your business today?",
      hasProducts: false
    }
  ]);
  const [previewInput, setPreviewInput] = useState("");

  const getCategoryBadge = (cat?: string) => {
    const c = (cat || "").toLowerCase();
    if (c === "services") {
      return { label: "Services & Bookings", icon: "💼", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
    if (c === "erp") {
      return { label: "ERP / B2B", icon: "🏢", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" };
    }
    return { label: "E-Commerce", icon: "🛍️", badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200" };
  };

  const getInitialGreeting = (site: Website) => {
    const cat = (site.business_category || "").toLowerCase();
    if (site.welcome_message && !site.welcome_message.includes(".example.com")) {
      return site.welcome_message;
    }
    if (cat === "services") {
      return `Hello! Welcome to ${site.name}. How can we assist with your consultation, project inquiry, or appointment booking today?`;
    }
    if (cat === "erp") {
      return `Welcome to ${site.name}. How can we assist with enterprise support, SLA ticket submission, or live demo scheduling today?`;
    }
    return `Hello! Welcome to our store. Need help finding products, checking prices, or placing an order?`;
  };

  const fetchWebsitesAndProducts = async () => {
    try {
      setIsLoading(true);
      const [sitesData, prodsData] = await Promise.all([
        api.getWebsites(),
        api.getProducts().catch(() => [])
      ]);

      if (sitesData && Array.isArray(sitesData) && sitesData.length > 0) {
        setWebsites(sitesData);
        const firstSite = sitesData[0];
        setSelectedSite(firstSite);
        const cat = (firstSite.business_category || "ecommerce").toLowerCase();
        setPreviewMessages([
          { 
            sender: "ai", 
            text: getInitialGreeting(firstSite),
            hasProducts: cat === "ecommerce"
          }
        ]);
        if (firstSite.ecommerce_config) {
          setCustomizerConfig(prev => ({ ...prev, ...firstSite.ecommerce_config }));
        }
      }
      setProducts(prodsData);
    } catch (e) {
      console.error("Failed to load websites from DB:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsitesAndProducts();
  }, []);

  const handleCopySnippet = (key: string) => {
    const snippet = `<!-- Enterprise AI Chatbot Widget -->
<script src="${CDN_WIDGET_URL}"></script>
<script>
  EnterpriseChatWidget.init({
    widgetKey: "${key}",
    apiUrl: "${API_BASE_URL}"
  });
</script>`;
    navigator.clipboard.writeText(snippet);
    showToast("Embed Code Copied!", "Paste into your website's HTML before </body>", "success");
  };

  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDomain.trim()) return;

    let cleanDomain = newDomain.trim().toLowerCase();
    if (cleanDomain.includes("://")) cleanDomain = cleanDomain.split("://")[1];
    cleanDomain = cleanDomain.split("/")[0].split("?")[0].split(":")[0].trim();

    try {
      const isEcom = newCategory === "ecommerce";
      const newSite = await api.createWebsite({
        name: newName.trim(),
        domain: cleanDomain,
        business_category: newCategory,
        primary_color: newColor,
        header_title: newHeader.trim() || `${newName} Live AI`,
        welcome_message: newWelcome.trim() || `Hello! Welcome to ${newName}. How can we assist you today?`,
        position: "bottom-right",
        ecommerce_config: {
          enabled: isEcom,
          show_products_carousel: isEcom,
          allow_instant_checkout: isEcom,
          cod_enabled: isEcom,
          bkash_enabled: true,
          eps_enabled: true,
          lead_capture_enabled: true,
          booking_enabled: newCategory === "services" || newCategory === "erp",
          whatsapp_connect_enabled: true,
          service_catalog_enabled: newCategory === "services",
          sla_tickets_enabled: newCategory === "erp",
          delivery_charge_inside_dhaka: 60,
          delivery_charge_outside_dhaka: 120
        }
      });

      setWebsites(prev => [...prev, newSite]);
      setSelectedSite(newSite);
      showToast("Website Added", `${cleanDomain} (${getCategoryBadge(newCategory).label}) added successfully`, "success");
      setNewName("");
      setNewDomain("");
      setShowAddModal(false);
    } catch (err: any) {
      console.error("Create website error:", err);
      showToast("Error", err.message || "Could not add website", "error");
    }
  };

  const handleSaveCustomizer = async () => {
    if (!selectedSite) return;
    try {
      const updated = await api.updateWebsite(selectedSite.id, {
        ecommerce_config: customizerConfig
      });
      setSelectedSite(updated);
      setWebsites(prev => prev.map(s => s.id === updated.id ? updated : s));
      showToast("Settings Saved", "Widget features and workflows updated successfully.", "success");
    } catch (e: any) {
      showToast("Error", e.message || "Could not save widget settings", "error");
    }
  };

  const handleUpdateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSite) return;

    let cleanDomain = editSiteDomain.trim().toLowerCase();
    if (cleanDomain.includes("://")) cleanDomain = cleanDomain.split("://")[1];
    cleanDomain = cleanDomain.split("/")[0].split("?")[0].split(":")[0].trim();

    setIsUpdatingSite(true);
    try {
      const isEcom = (editSiteCategory === "ecommerce");
      const updated = await api.updateWebsite(selectedSite.id, {
        name: editSiteName.trim() || selectedSite.name,
        domain: cleanDomain,
        business_category: editSiteCategory,
        ecommerce_config: {
          ...selectedSite.ecommerce_config,
          enabled: isEcom,
          show_products_carousel: isEcom,
          allow_instant_checkout: isEcom,
          cod_enabled: isEcom,
          booking_enabled: editSiteCategory === "services" || editSiteCategory === "erp",
          lead_capture_enabled: true
        }
      });
      setSelectedSite(updated);
      setWebsites(prev => prev.map(s => s.id === updated.id ? updated : s));
      setCustomizerConfig(prev => ({
        ...prev,
        enabled: isEcom,
        show_products_carousel: isEcom,
        allow_instant_checkout: isEcom,
        cod_enabled: isEcom,
        booking_enabled: editSiteCategory === "services" || editSiteCategory === "erp"
      }));

      // Update simulator greeting
      setPreviewMessages([
        { 
          sender: "ai", 
          text: getInitialGreeting(updated),
          hasProducts: editSiteCategory === "ecommerce"
        }
      ]);

      showToast("Storefront Updated", `Configured as ${getCategoryBadge(editSiteCategory).label} on ${cleanDomain}`, "success");
      setShowEditModal(false);
    } catch (err: any) {
      showToast("Update Failed", err.message || "Could not update domain", "error");
    } finally {
      setIsUpdatingSite(false);
    }
  };

  const handleSendPreview = (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const userText = customPrompt || previewInput.trim();
    if (!userText) return;

    const cat = (selectedSite?.business_category || "ecommerce").toLowerCase();
    const isAskingProduct = /product|panjabi|watch|earbuds|buy|price|koto|dam|item|catalog/i.test(userText);
    const isAskingBooking = /book|consult|appointment|schedule|time|slot|meeting/i.test(userText);
    const isAskingService = /service|offer|package|cost|quote|pricing/i.test(userText);
    const isAskingTicket = /ticket|sla|issue|bug|error|problem|urgent|critical/i.test(userText);
    const isAskingDemo = /demo|walkthrough|presentation|trial/i.test(userText);
    const isAskingAgent = /agent|human|talk|representative|consultant|specialist/i.test(userText);

    setPreviewMessages(prev => [...prev, { sender: "user", text: userText }]);
    if (!customPrompt) setPreviewInput("");

    setTimeout(() => {
      if (cat === "services") {
        if (isAskingBooking) {
          setPreviewMessages(prev => [
            ...prev,
            {
              sender: "ai",
              text: "📅 **Appointment & Consultation Booking**\n\nWe'd be delighted to schedule a consultation with our senior specialist! Please provide:\n• Your Preferred Date & Time\n• Contact Phone / WhatsApp Number\n\nOur team will confirm your slot immediately."
            }
          ]);
        } else if (isAskingService) {
          setPreviewMessages(prev => [
            ...prev,
            {
              sender: "ai",
              text: "💼 **Our Professional Services**\n\nWe provide tailored consulting, digital implementation, and ongoing retainer support. Would you like us to generate a personalized quotation or proposal for your business?"
            }
          ]);
        } else if (isAskingAgent) {
          setPreviewMessages(prev => [
            ...prev,
            {
              sender: "ai",
              text: "👤 Connecting you with an available senior consultant right away. You can also reach our direct WhatsApp hotline."
            }
          ]);
        } else {
          setPreviewMessages(prev => [
            ...prev,
            {
              sender: "ai",
              text: `Thank you for your inquiry! Our AI assistant for ${selectedSite?.name || "our services"} is ready to answer questions, schedule bookings, or connect you with our specialists.`
            }
          ]);
        }
      } else if (cat === "erp") {
        if (isAskingTicket) {
          setPreviewMessages(prev => [
            ...prev,
            {
              sender: "ai",
              text: "🎫 **Enterprise SLA Ticket Intake**\n\nTicket created: `TKT-8842` (Priority: High).\nOur enterprise engineering team has been notified. You can expect initial response within 15 minutes as per SLA."
            }
          ]);
        } else if (isAskingDemo) {
          setPreviewMessages(prev => [
            ...prev,
            {
              sender: "ai",
              text: "📅 **Executive Live Demo Scheduling**\n\nWe would be pleased to schedule a 30-minute tailored walkthrough of our enterprise platform for your team. Please share your company email and convenient day."
            }
          ]);
        } else if (isAskingAgent) {
          setPreviewMessages(prev => [
            ...prev,
            {
              sender: "ai",
              text: "👤 Handing over to your assigned Enterprise Technical Account Manager..."
            }
          ]);
        } else {
          setPreviewMessages(prev => [
            ...prev,
            {
              sender: "ai",
              text: `Thank you for contacting ${selectedSite?.name || "Enterprise Support"}. Our enterprise knowledge engine indexes corporate SOPs, API docs, and ticket queues.`
            }
          ]);
        }
      } else {
        // E-Commerce
        if (isAskingProduct && products.length > 0) {
          setPreviewMessages(prev => [
            ...prev,
            {
              sender: "ai",
              text: `Here are our top-rated trending items available for instant order. Click 'Order' to checkout with Cash on Delivery or bKash!`,
              hasProducts: true
            }
          ]);
        } else if (isAskingAgent) {
          setPreviewMessages(prev => [
            ...prev,
            {
              sender: "ai",
              text: "Connecting you with an available live customer support agent. One moment please..."
            }
          ]);
        } else {
          setPreviewMessages(prev => [
            ...prev,
            {
              sender: "ai",
              text: `Thank you for asking! Our AI shopping assistant can help you discover products, check delivery charges, and place instant orders.`
            }
          ]);
        }
      }
    }, 500);
  };

  const currentCategory = (selectedSite?.business_category || "ecommerce").toLowerCase();

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-8 font-sans text-slate-900">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Connected Storefronts & CDN Widgets</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure dynamic business models (E-Commerce, Services, ERP), customize in-chat actions & booking workflows, and embed AI widgets on any website.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Website CDN</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          <div className="animate-spin w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
          <span>Loading CDN storefronts...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Left 2 Cols: Connected Websites List, Customizer & Snippet */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Website Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {websites.map(w => {
                const badgeInfo = getCategoryBadge(w.business_category);
                return (
                  <div
                    key={w.id}
                    onClick={() => {
                      setSelectedSite(w);
                      setPreviewMessages([
                        { 
                          sender: "ai", 
                          text: getInitialGreeting(w),
                          hasProducts: (w.business_category || "").toLowerCase() === "ecommerce"
                        }
                      ]);
                      if (w.ecommerce_config) {
                        setCustomizerConfig(prev => ({ ...prev, ...w.ecommerce_config }));
                      }
                    }}
                    className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
                      selectedSite?.id === w.id
                        ? "bg-indigo-50/50 border-indigo-500 shadow-sm ring-1 ring-indigo-500/30"
                        : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="h-3.5 w-3.5 rounded-full shadow-xs border border-white" style={{ backgroundColor: w.primary_color }}></div>
                      <span className={`text-[10px] border font-bold px-2 py-0.5 rounded flex items-center gap-1 ${badgeInfo.badgeClass}`}>
                        <span>{badgeInfo.icon}</span>
                        <span>{badgeInfo.label}</span>
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 truncate">{w.name}</h4>
                    <div className="flex items-center justify-between mb-3">
                      <p className={`text-xs font-medium truncate ${w.domain ? "text-indigo-600" : "text-amber-600 italic"}`}>
                        {w.domain || "Domain not configured"}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSite(w);
                          setEditSiteName(w.name);
                          setEditSiteDomain(w.domain || "");
                          setEditSiteCategory((w.business_category as any) || "ecommerce");
                          setShowEditModal(true);
                        }}
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Edit Domain & Business Category"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-[10.5px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 font-mono truncate">
                      {w.widget_key}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tab Controls for Selected Website: Embed Code vs Widget Customizer */}
            {selectedSite && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 pt-3 overflow-x-auto custom-scrollbar-horizontal flex-nowrap">
                  <button
                    onClick={() => setActiveTab("embed")}
                    className={`pb-3 px-3 sm:px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === "embed"
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Code2 className="w-4 h-4" />
                    <span>Embed CDN Snippet</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("customizer")}
                    className={`pb-3 px-3 sm:px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === "customizer"
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    <span>
                      {currentCategory === "services"
                        ? "Services & Booking Customizer"
                        : (currentCategory === "erp"
                          ? "ERP / B2B Customizer"
                          : "E-Commerce Customizer")}
                    </span>
                  </button>
                </div>

                {activeTab === "embed" ? (
                  <div className="p-4 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                            <Code2 className="w-4 h-4 text-indigo-600" /> Embed Installation Snippet
                          </h3>
                          <button
                            type="button"
                            onClick={() => {
                              setEditSiteName(selectedSite.name);
                              setEditSiteDomain(selectedSite.domain || "");
                              setEditSiteCategory((selectedSite.business_category as any) || "ecommerce");
                              setShowEditModal(true);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer border border-slate-200"
                            title="Edit Storefront Domain & Category"
                          >
                            <Edit2 className="w-3 h-3 text-indigo-600" />
                            <span>Edit Domain</span>
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Paste this 1-line script into <strong className="text-slate-800 font-mono">{selectedSite.domain || "your website HTML"}</strong> before &lt;/body&gt;.
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopySnippet(selectedSite.widget_key)}
                        className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </button>
                    </div>

                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-indigo-200 overflow-x-auto shadow-inner">
                      <code>{`<!-- Enterprise AI Chatbot Widget -->
<script src="${CDN_WIDGET_URL}"></script>
<script>
  EnterpriseChatWidget.init({
    widgetKey: "${selectedSite.widget_key}",
    apiUrl: "${API_BASE_URL}"
  });
</script>`}</code>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 space-y-5">
                    {/* ADAPTIVE CUSTOMIZER CONTENT BASED ON BUSINESS CATEGORY */}
                    {currentCategory === "services" ? (
                      <>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-emerald-600" />
                            Services, Lead Capture & Booking Customization
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Configure appointment scheduling, lead capture forms, and direct consultation channels for website visitors.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Pre-Chat Lead Intake */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-900">Pre-Chat Lead Intake Form</div>
                              <div className="text-[11px] text-slate-500">Collect visitor name, phone & inquiry before chat</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={customizerConfig.lead_capture_enabled}
                              onChange={e => setCustomizerConfig({ ...customizerConfig, lead_capture_enabled: e.target.checked })}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 cursor-pointer accent-emerald-600"
                            />
                          </div>

                          {/* Consultation Booking */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-900">Consultation / Slot Booking</div>
                              <div className="text-[11px] text-slate-500">Allow visitors to schedule appointment times in chat</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={customizerConfig.booking_enabled}
                              onChange={e => setCustomizerConfig({ ...customizerConfig, booking_enabled: e.target.checked })}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 cursor-pointer accent-emerald-600"
                            />
                          </div>

                          {/* WhatsApp Direct Connect */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-900">WhatsApp 1-Click Escalation</div>
                              <div className="text-[11px] text-slate-500">Direct handover button to your official WhatsApp hotline</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={customizerConfig.whatsapp_connect_enabled}
                              onChange={e => setCustomizerConfig({ ...customizerConfig, whatsapp_connect_enabled: e.target.checked })}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 cursor-pointer accent-emerald-600"
                            />
                          </div>

                          {/* Service Catalog & Quotes */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-900">Service Catalog & Quotes</div>
                              <div className="text-[11px] text-slate-500">Provide automated pricing estimates and package details</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={customizerConfig.service_catalog_enabled}
                              onChange={e => setCustomizerConfig({ ...customizerConfig, service_catalog_enabled: e.target.checked })}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 cursor-pointer accent-emerald-600"
                            />
                          </div>

                          {/* bKash Advance Booking Fee */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between sm:col-span-2">
                            <div>
                              <div className="text-xs font-bold text-slate-900">bKash Consultation Deposit / Advance Booking</div>
                              <div className="text-[11px] text-slate-500">Accept advance token payment or booking fee via bKash</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={customizerConfig.bkash_enabled}
                              onChange={e => setCustomizerConfig({ ...customizerConfig, bkash_enabled: e.target.checked })}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 cursor-pointer accent-emerald-600"
                            />
                          </div>
                        </div>
                      </>
                    ) : currentCategory === "erp" ? (
                      <>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            Enterprise B2B, Knowledge & SLA Customization
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Configure enterprise SLA ticket intake, multi-document knowledge base search, and corporate demo scheduling.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* SLA Ticket Intake */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-900">Urgent SLA Ticket Submission</div>
                              <div className="text-[11px] text-slate-500">Allow corporate users to log high-severity support tickets</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={customizerConfig.sla_tickets_enabled}
                              onChange={e => setCustomizerConfig({ ...customizerConfig, sla_tickets_enabled: e.target.checked })}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer accent-blue-600"
                            />
                          </div>

                          {/* Schedule Live Demo */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-900">Executive Demo Booking</div>
                              <div className="text-[11px] text-slate-500">Enable prospective B2B buyers to request a guided walkthrough</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={customizerConfig.demo_scheduler_enabled}
                              onChange={e => setCustomizerConfig({ ...customizerConfig, demo_scheduler_enabled: e.target.checked })}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer accent-blue-600"
                            />
                          </div>

                          {/* Dedicated Account Handover */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-900">Dedicated Account Manager Handover</div>
                              <div className="text-[11px] text-slate-500">Escalate customer threads directly to their assigned account manager</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={customizerConfig.dedicated_manager_enabled}
                              onChange={e => setCustomizerConfig({ ...customizerConfig, dedicated_manager_enabled: e.target.checked })}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer accent-blue-600"
                            />
                          </div>

                          {/* Corporate Identity Intake */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-900">Corporate Identity Verification</div>
                              <div className="text-[11px] text-slate-500">Collect organization name & work email before chat session</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={customizerConfig.lead_capture_enabled}
                              onChange={e => setCustomizerConfig({ ...customizerConfig, lead_capture_enabled: e.target.checked })}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer accent-blue-600"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-indigo-600" />
                            Client Widget Commerce Customization
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Customize what features your website visitors experience inside the live chat widget.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Product Carousel Toggle */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-900">In-Chat Product Cards</div>
                              <div className="text-[11px] text-slate-500">Show visual product carousel when users ask</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={customizerConfig.show_products_carousel}
                              onChange={e => setCustomizerConfig({ ...customizerConfig, show_products_carousel: e.target.checked })}
                              className="w-4 h-4 text-indigo-600 rounded border-slate-300 cursor-pointer accent-indigo-600"
                            />
                          </div>

                          {/* 1-Click Instant Checkout */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-900">1-Click Instant Checkout</div>
                              <div className="text-[11px] text-slate-500">Allow visitors to place order inside chat</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={customizerConfig.allow_instant_checkout}
                              onChange={e => setCustomizerConfig({ ...customizerConfig, allow_instant_checkout: e.target.checked })}
                              className="w-4 h-4 text-indigo-600 rounded border-slate-300 cursor-pointer accent-indigo-600"
                            />
                          </div>

                          {/* Cash on Delivery */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-900">Cash on Delivery (COD)</div>
                              <div className="text-[11px] text-slate-500">Enable nationwide COD payment</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={customizerConfig.cod_enabled}
                              onChange={e => setCustomizerConfig({ ...customizerConfig, cod_enabled: e.target.checked })}
                              className="w-4 h-4 text-indigo-600 rounded border-slate-300 cursor-pointer accent-indigo-600"
                            />
                          </div>

                          {/* bKash Online */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-900">bKash Online Payment</div>
                              <div className="text-[11px] text-slate-500">Enable instant mobile checkout</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={customizerConfig.bkash_enabled}
                              onChange={e => setCustomizerConfig({ ...customizerConfig, bkash_enabled: e.target.checked })}
                              className="w-4 h-4 text-indigo-600 rounded border-slate-300 cursor-pointer accent-indigo-600"
                            />
                          </div>

                          {/* EPS Gateway */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between sm:col-span-2">
                            <div>
                              <div className="text-xs font-bold text-slate-900">EPS Easy Payment System</div>
                              <div className="text-[11px] text-slate-500">Accept debit/credit cards and internet banking in chat</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={customizerConfig.eps_enabled}
                              onChange={e => setCustomizerConfig({ ...customizerConfig, eps_enabled: e.target.checked })}
                              className="w-4 h-4 text-indigo-600 rounded border-slate-300 cursor-pointer accent-indigo-600"
                            />
                          </div>
                        </div>

                        {/* Delivery Charges */}
                        <div className="pt-2 border-t border-slate-200">
                          <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-indigo-600" />
                            Default Delivery Fees
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Inside Dhaka (BDT)</label>
                              <input
                                type="number"
                                value={customizerConfig.delivery_charge_inside_dhaka}
                                onChange={e => setCustomizerConfig({ ...customizerConfig, delivery_charge_inside_dhaka: Number(e.target.value) })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Outside Dhaka (BDT)</label>
                              <input
                                type="number"
                                value={customizerConfig.delivery_charge_outside_dhaka}
                                onChange={e => setCustomizerConfig({ ...customizerConfig, delivery_charge_outside_dhaka: Number(e.target.value) })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleSaveCustomizer}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                        <span>Save Customization</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Col: Live CDN Widget Simulator */}
          {selectedSite && (
            <div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm sticky top-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-600" /> Live CDN Widget Simulator
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getCategoryBadge(selectedSite.business_category).badgeClass}`}>
                    {getCategoryBadge(selectedSite.business_category).label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Interactive storefront preview on <span className="text-indigo-600 font-mono font-semibold">{selectedSite.domain || "connected site"}</span>.
                </p>

                {/* Chatbox Preview Frame */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-md flex flex-col h-[490px] bg-slate-50">
                  
                  {/* Header */}
                  <div
                    className="p-3.5 text-white flex items-center justify-between shadow-xs"
                    style={{ backgroundColor: selectedSite.primary_color }}
                  >
                    <div>
                      <h4 className="font-bold text-xs">{selectedSite.header_title}</h4>
                      <span className="text-[10px] opacity-90 flex items-center gap-1">
                        <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                          currentCategory === "erp" ? "bg-blue-300" : "bg-emerald-300"
                        }`}></span>
                        <span>
                          {currentCategory === "services"
                            ? "Online • Services & Bookings"
                            : (currentCategory === "erp"
                              ? "Online • Enterprise B2B & SLA"
                              : "Online • AI Commerce")}
                        </span>
                      </span>
                    </div>
                    <span className="text-xs cursor-pointer opacity-80 hover:opacity-100">✕</span>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs bg-slate-50">
                    {previewMessages.map((m, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`p-2.5 rounded-xl max-w-[90%] leading-relaxed whitespace-pre-line ${
                            m.sender === "user"
                              ? "bg-indigo-600 text-white rounded-br-none"
                              : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs"
                          }`}
                        >
                          {m.text}
                        </div>

                        {/* Interactive In-Chat Product Cards Carousel (E-Commerce only) */}
                        {m.hasProducts && currentCategory === "ecommerce" && products.length > 0 && (
                          <div className="mt-2 w-full space-y-2">
                            {products.slice(0, 2).map(prod => (
                              <div
                                key={prod.id}
                                className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center gap-2.5 shadow-xs"
                              >
                                {prod.images && prod.images[0] && (
                                  <img
                                    src={prod.images[0]}
                                    alt=""
                                    className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                                  />
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-slate-900 text-xs truncate">{prod.title}</div>
                                  <div className="text-emerald-600 font-bold text-xs mt-0.5">
                                    ৳{prod.selling_price.toLocaleString()} BDT
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    showToast("Simulator Checkout", `Opened 1-Click Order for ${prod.title}`, "info");
                                  }}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow-xs flex-shrink-0 transition-colors cursor-pointer"
                                >
                                  Order
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Adaptive Quick Action Chips (Strictly Enforces Enabled Customizer Flags) */}
                  {(() => {
                    const hasChips = (
                      (currentCategory === "services" && (
                        customizerConfig.booking_enabled ||
                        customizerConfig.service_catalog_enabled ||
                        customizerConfig.whatsapp_connect_enabled
                      )) ||
                      (currentCategory === "erp" && (
                        customizerConfig.demo_scheduler_enabled ||
                        customizerConfig.sla_tickets_enabled ||
                        customizerConfig.dedicated_manager_enabled
                      )) ||
                      (currentCategory === "ecommerce" && (
                        customizerConfig.show_products_carousel !== false ||
                        customizerConfig.allow_instant_checkout !== false
                      ))
                    );

                    if (!hasChips) return null;

                    return (
                      <div className="px-2.5 py-1.5 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[10.5px]">
                        {currentCategory === "services" ? (
                          <>
                            {customizerConfig.booking_enabled && (
                              <button
                                type="button"
                                onClick={() => handleSendPreview(undefined, "I want to schedule a consultation appointment")}
                                className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg shrink-0 font-medium cursor-pointer transition-colors shadow-2xs"
                              >
                                📅 Book Consultation
                              </button>
                            )}
                            {customizerConfig.service_catalog_enabled && (
                              <button
                                type="button"
                                onClick={() => handleSendPreview(undefined, "Tell me about your available services and pricing")}
                                className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg shrink-0 font-medium cursor-pointer transition-colors shadow-2xs"
                              >
                                💼 Our Services
                              </button>
                            )}
                            {customizerConfig.whatsapp_connect_enabled && (
                              <button
                                type="button"
                                onClick={() => handleSendPreview(undefined, "Can I talk to a consultant?")}
                                className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg shrink-0 font-medium cursor-pointer transition-colors shadow-2xs"
                              >
                                👤 Talk to Consultant
                              </button>
                            )}
                          </>
                        ) : currentCategory === "erp" ? (
                          <>
                            {customizerConfig.demo_scheduler_enabled && (
                              <button
                                type="button"
                                onClick={() => handleSendPreview(undefined, "I want to schedule a live product demo")}
                                className="px-2 py-1 bg-white hover:bg-blue-50 text-blue-800 border border-blue-200 rounded-lg shrink-0 font-medium cursor-pointer transition-colors shadow-2xs"
                              >
                                📅 Book Live Demo
                              </button>
                            )}
                            {customizerConfig.sla_tickets_enabled && (
                              <button
                                type="button"
                                onClick={() => handleSendPreview(undefined, "I need to open an urgent support ticket")}
                                className="px-2 py-1 bg-white hover:bg-blue-50 text-blue-800 border border-blue-200 rounded-lg shrink-0 font-medium cursor-pointer transition-colors shadow-2xs"
                              >
                                🎫 Open SLA Ticket
                              </button>
                            )}
                            {customizerConfig.dedicated_manager_enabled && (
                              <button
                                type="button"
                                onClick={() => handleSendPreview(undefined, "Escalate to dedicated specialist")}
                                className="px-2 py-1 bg-white hover:bg-blue-50 text-blue-800 border border-blue-200 rounded-lg shrink-0 font-medium cursor-pointer transition-colors shadow-2xs"
                              >
                                👤 Talk to Specialist
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            {customizerConfig.show_products_carousel !== false && (
                              <button
                                type="button"
                                onClick={() => handleSendPreview(undefined, "show products")}
                                className="px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg shrink-0 font-medium cursor-pointer transition-colors shadow-2xs"
                              >
                                🛍️ Browse Products
                              </button>
                            )}
                            {customizerConfig.allow_instant_checkout !== false && (
                              <button
                                type="button"
                                onClick={() => handleSendPreview(undefined, "I want to track my order")}
                                className="px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg shrink-0 font-medium cursor-pointer transition-colors shadow-2xs"
                              >
                                📦 Track Order
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleSendPreview(undefined, "Talk to human agent")}
                              className="px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg shrink-0 font-medium cursor-pointer transition-colors shadow-2xs"
                            >
                              👤 Support Agent
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })()}

                  {/* Composer */}
                  <form onSubmit={handleSendPreview} className="p-2 border-t border-slate-200 bg-white flex gap-1.5">
                    <input
                      type="text"
                      value={previewInput}
                      onChange={e => setPreviewInput(e.target.value)}
                      placeholder={
                        currentCategory === "services"
                          ? "Type 'book consultation' or 'our services'..."
                          : (currentCategory === "erp"
                            ? "Type 'open ticket' or 'book demo'..."
                            : "Type 'show products' or 'price'...")
                      }
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 text-center mt-3">
                {currentCategory === "services"
                  ? "Live CDN Widget • Autonomous Consultation & Booking Desk"
                  : (currentCategory === "erp"
                    ? "Live CDN Widget • Autonomous Enterprise Support & SLA Desk"
                    : "Live CDN Widget • Autonomous In-Chat Order Desk")}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Add Website CDN Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600" />
                Add Connected CDN Website
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWebsite} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Website / Storefront Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Padma Mart Main Storefront or Apex Consulting Portal"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Domain Name *</label>
                <input
                  type="text"
                  required
                  value={newDomain}
                  onChange={e => setNewDomain(e.target.value)}
                  placeholder="e.g. yourstore.com or consulting.bd"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business Category *</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 cursor-pointer transition-all font-medium"
                >
                  <option value="ecommerce">🛍️ E-Commerce Store (Products, In-Chat Orders, COD, bKash)</option>
                  <option value="services">💼 Services & Bookings (Leads, Appointments, WhatsApp)</option>
                  <option value="erp">🏢 ERP / Corporate B2B (SLA Support, Knowledge Base, Demo Booking)</option>
                  <option value="healthcare">🏥 Healthcare & Clinic (Doctor Appointments)</option>
                  <option value="realestate">🏠 Real Estate & Property (Listings, Site Visits)</option>
                  <option value="education">🎓 Education & Academy (Course Inquiries, Admissions)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newColor}
                      onChange={e => setNewColor(e.target.value)}
                      className="h-9 w-12 rounded cursor-pointer border border-slate-200 bg-white"
                    />
                    <span className="font-mono text-slate-700">{newColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Header Title</label>
                  <input
                    type="text"
                    value={newHeader}
                    onChange={e => setNewHeader(e.target.value)}
                    placeholder="Live AI Assistant"
                    className="w-full px-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Welcome Message</label>
                <textarea
                  rows={2}
                  value={newWelcome}
                  onChange={e => setNewWelcome(e.target.value)}
                  placeholder="Hello! How can we assist you today?"
                  className="w-full px-3.5 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 transition-all font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Save & Generate Widget Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Website Domain & Business Model */}
      {showEditModal && selectedSite && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Globe className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Edit Storefront & Category</h3>
                  <p className="text-xs text-slate-500">Update website domain and business model category</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSite} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Storefront / Portal Name *</label>
                <input
                  type="text"
                  required
                  value={editSiteName}
                  onChange={e => setEditSiteName(e.target.value)}
                  placeholder="e.g. CRM Matrix Portal"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Connected Website Domain *</label>
                <input
                  type="text"
                  required
                  value={editSiteDomain}
                  onChange={e => setEditSiteDomain(e.target.value)}
                  placeholder="e.g. crmmatrix.com or yourstore.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 transition-all font-medium"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Enter your real website domain where the chat widget is embedded
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Business Model / Category *</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditSiteCategory("ecommerce")}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                      editSiteCategory === "ecommerce"
                        ? "bg-indigo-50 border-indigo-600 ring-1 ring-indigo-600 text-indigo-950 font-bold shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">🛍️</span>
                      {editSiteCategory === "ecommerce" && <Check className="w-3 h-3 text-indigo-600" />}
                    </div>
                    <div>
                      <div className="font-bold text-[11px]">E-Commerce</div>
                      <div className="text-[9px] text-slate-500 font-normal leading-tight">Products & COD</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditSiteCategory("erp")}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                      editSiteCategory === "erp"
                        ? "bg-blue-50 border-blue-600 ring-1 ring-blue-600 text-blue-950 font-bold shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">🏢</span>
                      {editSiteCategory === "erp" && <Check className="w-3 h-3 text-blue-600" />}
                    </div>
                    <div>
                      <div className="font-bold text-[11px]">ERP / B2B</div>
                      <div className="text-[9px] text-slate-500 font-normal leading-tight">SLA & Knowledge</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditSiteCategory("services")}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                      editSiteCategory === "services"
                        ? "bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600 text-emerald-950 font-bold shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">💼</span>
                      {editSiteCategory === "services" && <Check className="w-3 h-3 text-emerald-600" />}
                    </div>
                    <div>
                      <div className="font-bold text-[11px]">Services</div>
                      <div className="text-[9px] text-slate-500 font-normal leading-tight">Leads & Bookings</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingSite}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  {isUpdatingSite && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
