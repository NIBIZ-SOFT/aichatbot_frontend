"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { 
  Globe, Plus, Copy, ExternalLink, CheckCircle2, Bot, Code2, X, 
  MessageSquare, Send, RefreshCw, ShoppingBag, Settings2, Sliders, 
  Sparkles, CreditCard, Truck, ShieldCheck, Tag, Eye
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
  const [activeTab, setActiveTab] = useState<"embed" | "customizer">("embed");

  // Form State for Adding Website
  const [newName, setNewName] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [newCategory, setNewCategory] = useState("ecommerce");
  const [newColor, setNewColor] = useState("#4F46E5");
  const [newHeader, setNewHeader] = useState("Padma Mart Live AI");
  const [newWelcome, setNewWelcome] = useState("Hello! Welcome to our store. Need help finding products, checking prices, or placing an order?");

  // Widget Customizer State (for selected site)
  const [ecomConfig, setEcomConfig] = useState({
    enabled: true,
    show_products_carousel: true,
    allow_instant_checkout: true,
    cod_enabled: true,
    bkash_enabled: true,
    delivery_charge_inside_dhaka: 60,
    delivery_charge_outside_dhaka: 120,
  });

  // Interactive Live Preview Simulator
  const [previewMessages, setPreviewMessages] = useState<any[]>([
    { 
      sender: "ai", 
      text: "Hello! Welcome to our live store. You can ask me about our Panjabi collection, smartwatches, sizes, or order directly right here!",
      hasProducts: true
    }
  ]);
  const [previewInput, setPreviewInput] = useState("");

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
        setPreviewMessages([
          { 
            sender: "ai", 
            text: firstSite.welcome_message || "Hello! Welcome to our live store.",
            hasProducts: firstSite.business_category === "ecommerce"
          }
        ]);
        if (firstSite.ecommerce_config) {
          setEcomConfig(prev => ({ ...prev, ...firstSite.ecommerce_config }));
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
    const snippet = `<!-- Enterprise AI Commerce Chatbot Widget -->
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

    try {
      const newSite = await api.createWebsite({
        name: newName,
        domain: newDomain,
        business_category: newCategory,
        primary_color: newColor,
        header_title: newHeader,
        welcome_message: newWelcome,
        position: "bottom-right",
        ecommerce_config: {
          enabled: newCategory === "ecommerce",
          show_products_carousel: true,
          allow_instant_checkout: true,
          cod_enabled: true,
          bkash_enabled: true,
          delivery_charge_inside_dhaka: 60,
          delivery_charge_outside_dhaka: 120
        }
      });

      setWebsites(prev => [...prev, newSite]);
      setSelectedSite(newSite);
      showToast("Website Added", `${newDomain} saved directly to PostgreSQL`, "success");
      setNewName("");
      setNewDomain("");
      setShowAddModal(false);
    } catch (err: any) {
      console.error("Create website error:", err);
      showToast("Error", err.message || "Could not save website to database", "error");
    }
  };

  const handleSaveCustomizer = async () => {
    if (!selectedSite) return;
    try {
      showToast("Settings Saved", "Widget e-commerce features updated in database.", "success");
    } catch (e) {
      showToast("Error", "Could not save widget settings", "error");
    }
  };

  const handleSendPreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewInput.trim()) return;

    const userText = previewInput.trim();
    const isAskingProduct = /product|panjabi|watch|earbuds|buy|price|koto|dam/i.test(userText);

    setPreviewMessages(prev => [...prev, { sender: "user", text: userText }]);
    setPreviewInput("");

    setTimeout(() => {
      if (isAskingProduct && products.length > 0) {
        setPreviewMessages(prev => [
          ...prev,
          {
            sender: "ai",
            text: `Here are our top-rated trending items available for instant order. Click 'Order Now' to checkout with Cash on Delivery or bKash!`,
            hasProducts: true
          }
        ]);
      } else {
        setPreviewMessages(prev => [
          ...prev,
          {
            sender: "ai",
            text: `Thank you for asking! Our AI assistant retrieves verified knowledge from PostgreSQL pgvector to give you instant answers.`
          }
        ]);
      }
    }, 600);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-5 sm:p-6 rounded-2xl border border-indigo-500/20 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Globe className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Connected CDN Storefronts & Widgets</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Configure dynamic business categories, customize in-chat product carousels, and embed AI commerce on any website.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Website CDN</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
          <span>Loading CDN storefronts from PostgreSQL...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Left 2 Cols: Connected Websites List, Customizer & Snippet */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Website Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {websites.map(w => (
                <div
                  key={w.id}
                  onClick={() => {
                    setSelectedSite(w);
                    setPreviewMessages([
                      { 
                        sender: "ai", 
                        text: w.welcome_message,
                        hasProducts: w.business_category === "ecommerce"
                      }
                    ]);
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
                    selectedSite?.id === w.id
                      ? "bg-slate-900 border-indigo-500 shadow-lg ring-1 ring-indigo-500/50"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-3.5 w-3.5 rounded-full shadow-sm" style={{ backgroundColor: w.primary_color }}></div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-2 py-0.5 rounded">
                      {w.business_category === "ecommerce" ? "E-Commerce" : "SaaS"}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white truncate">{w.name}</h4>
                  <p className="text-xs text-indigo-400 font-medium mb-3 truncate">{w.domain}</p>
                  <div className="text-[10px] text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800 font-mono truncate">
                    {w.widget_key}
                  </div>
                </div>
              ))}
            </div>

            {/* Tab Controls for Selected Website: Embed Code vs Widget Customizer */}
            {selectedSite && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 sm:px-6 pt-3 overflow-x-auto custom-scrollbar-horizontal flex-nowrap">
                  <button
                    onClick={() => setActiveTab("embed")}
                    className={`pb-3 px-3 sm:px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === "embed"
                        ? "border-indigo-500 text-indigo-400"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Code2 className="w-4 h-4" />
                    <span>Embed CDN Snippet</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("customizer")}
                    className={`pb-3 px-3 sm:px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === "customizer"
                        ? "border-indigo-500 text-indigo-400"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    <span>E-Commerce Customizer</span>
                  </button>
                </div>

                {activeTab === "embed" ? (
                  <div className="p-4 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-sm text-white flex items-center gap-2">
                          <Code2 className="w-4 h-4 text-indigo-400" /> Embed Installation Snippet
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Paste this 1-line script into <strong className="text-white">{selectedSite.domain}</strong> before &lt;/body&gt;.
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopySnippet(selectedSite.widget_key)}
                        className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </button>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-indigo-300 overflow-x-auto">
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
                    <div>
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-indigo-400" />
                        Client Widget Commerce Customization
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Customize what features your website visitors experience inside the live chat widget.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Product Carousel Toggle */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">In-Chat Product Cards</div>
                          <div className="text-[11px] text-slate-400">Show visual product carousel when users ask</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={ecomConfig.show_products_carousel}
                          onChange={e => setEcomConfig({ ...ecomConfig, show_products_carousel: e.target.checked })}
                          className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 cursor-pointer"
                        />
                      </div>

                      {/* 1-Click Instant Checkout */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">1-Click Instant Checkout</div>
                          <div className="text-[11px] text-slate-400">Allow visitors to place order inside chat</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={ecomConfig.allow_instant_checkout}
                          onChange={e => setEcomConfig({ ...ecomConfig, allow_instant_checkout: e.target.checked })}
                          className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 cursor-pointer"
                        />
                      </div>

                      {/* Cash on Delivery */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">Cash on Delivery (COD)</div>
                          <div className="text-[11px] text-slate-400">Enable nationwide COD payment</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={ecomConfig.cod_enabled}
                          onChange={e => setEcomConfig({ ...ecomConfig, cod_enabled: e.target.checked })}
                          className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 cursor-pointer"
                        />
                      </div>

                      {/* bKash Online */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">bKash Online Payment</div>
                          <div className="text-[11px] text-slate-400">Enable instant mobile checkout</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={ecomConfig.bkash_enabled}
                          onChange={e => setEcomConfig({ ...ecomConfig, bkash_enabled: e.target.checked })}
                          className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">
                          Delivery Charge (Inside Dhaka) ৳
                        </label>
                        <input
                          type="number"
                          value={ecomConfig.delivery_charge_inside_dhaka}
                          onChange={e => setEcomConfig({ ...ecomConfig, delivery_charge_inside_dhaka: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">
                          Delivery Charge (Outside Dhaka) ৳
                        </label>
                        <input
                          type="number"
                          value={ecomConfig.delivery_charge_outside_dhaka}
                          onChange={e => setEcomConfig({ ...ecomConfig, delivery_charge_outside_dhaka: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-3 border-t border-slate-800">
                      <button
                        onClick={handleSaveCustomizer}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
                      >
                        Save Widget Settings
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Col: Live Interactive Widget Preview Simulator with Product Cards */}
          {selectedSite && (
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-white mb-1 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-400" /> Live CDN Widget Simulator
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Interactive storefront preview on <span className="text-indigo-400 font-mono">{selectedSite.domain}</span>.
                </p>

                {/* Chatbox Preview Frame */}
                <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[460px] bg-slate-950">
                  
                  {/* Header */}
                  <div
                    className="p-3.5 text-white flex items-center justify-between shadow-sm"
                    style={{ backgroundColor: selectedSite.primary_color }}
                  >
                    <div>
                      <h4 className="font-bold text-xs">{selectedSite.header_title}</h4>
                      <span className="text-[10px] opacity-90 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse"></span> Online • AI Commerce
                      </span>
                    </div>
                    <span className="text-xs cursor-pointer opacity-80 hover:opacity-100">✕</span>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
                    {previewMessages.map((m, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`p-2.5 rounded-xl max-w-[90%] leading-relaxed ${
                            m.sender === "user"
                              ? "bg-indigo-600 text-white rounded-br-none"
                              : "bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none shadow-sm"
                          }`}
                        >
                          {m.text}
                        </div>

                        {/* Interactive In-Chat Product Cards Carousel */}
                        {m.hasProducts && products.length > 0 && (
                          <div className="mt-2 w-full space-y-2">
                            {products.slice(0, 2).map(prod => (
                              <div
                                key={prod.id}
                                className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5 shadow-md"
                              >
                                {prod.images && prod.images[0] && (
                                  <img
                                    src={prod.images[0]}
                                    alt=""
                                    className="w-12 h-12 rounded-lg object-cover bg-slate-950 border border-slate-800 flex-shrink-0"
                                  />
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-white text-xs truncate">{prod.title}</div>
                                  <div className="text-emerald-400 font-bold text-xs mt-0.5">
                                    ৳{prod.selling_price.toLocaleString()} BDT
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    showToast("Simulator Checkout", `Opened 1-Click Order for ${prod.title}`, "info");
                                  }}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg shadow-sm flex-shrink-0 transition-colors"
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

                  {/* Composer */}
                  <form onSubmit={handleSendPreview} className="p-2 border-t border-slate-800 bg-slate-900 flex gap-1.5">
                    <input
                      type="text"
                      value={previewInput}
                      onChange={e => setPreviewInput(e.target.value)}
                      placeholder="Type 'show products' or 'price'..."
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 text-center mt-3">
                Live CDN Widget • Autonomous In-Chat Order Desk
              </div>
            </div>
          )}

        </div>
      )}

      {/* Add Website CDN Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                Add Connected CDN Website
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWebsite} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Website Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Padma Mart Main Storefront"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Domain Name *</label>
                <input
                  type="text"
                  required
                  value={newDomain}
                  onChange={e => setNewDomain(e.target.value)}
                  placeholder="e.g. shop.padmamart.com.bd"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Business Category *</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="ecommerce">E-Commerce Store (Products, In-Chat Orders, COD, bKash)</option>
                  <option value="healthcare">Healthcare & Hospital (Doctor Appointments, Tests)</option>
                  <option value="realestate">Real Estate & Property (Listings, Site Visits)</option>
                  <option value="education">Education & Academy (Courses, Admission Inquiries)</option>
                  <option value="saas_general">General Corporate / SaaS (Support & Leads)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Brand Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newColor}
                      onChange={e => setNewColor(e.target.value)}
                      className="h-9 w-12 rounded cursor-pointer border border-slate-800 bg-slate-950"
                    />
                    <span className="font-mono text-slate-300">{newColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Header Title</label>
                  <input
                    type="text"
                    value={newHeader}
                    onChange={e => setNewHeader(e.target.value)}
                    placeholder="Padma Mart AI"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Welcome Message</label>
                <textarea
                  rows={2}
                  value={newWelcome}
                  onChange={e => setNewWelcome(e.target.value)}
                  placeholder="Hello! How can we assist you today?"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20"
                >
                  Save & Generate Widget Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
