"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { Globe, Plus, Copy, ExternalLink, CheckCircle2, Bot, Code2, X, MessageSquare, Send, RefreshCw } from "lucide-react";
import { Website } from "../../types";
import { api } from "../../lib/api";

export default function WebsitesView() {
  const { showToast } = useToast();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<Website | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newName, setNewName] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [newColor, setNewColor] = useState("#4F46E5");
  const [newHeader, setNewHeader] = useState("AI Support");
  const [newWelcome, setNewWelcome] = useState("Hi! How can we help you today?");

  // Interactive Live Preview Simulator
  const [previewMessages, setPreviewMessages] = useState<any[]>([
    { sender: "ai", text: "Hello! How can we assist your business today?" }
  ]);
  const [previewInput, setPreviewInput] = useState("");

  const fetchWebsites = async () => {
    try {
      const data = await api.getWebsites();
      if (data && Array.isArray(data) && data.length > 0) {
        setWebsites(data);
        setSelectedSite(data[0]);
        setPreviewMessages([{ sender: "ai", text: data[0].welcome_message }]);
      }
    } catch (e) {
      console.error("Failed to load websites from DB:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  const handleCopySnippet = (key: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || "http://127.0.0.1:8000";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
    
    const snippet = `<!-- Enterprise AI Chatbot Widget -->
<script src="${baseUrl}/static/widget.js"></script>
<script>
  EnterpriseChatWidget.init({
    widgetKey: "${key}",
    apiUrl: "${apiUrl}"
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
        primary_color: newColor,
        header_title: newHeader,
        welcome_message: newWelcome,
        position: "bottom-right"
      });

      setWebsites(prev => [...prev, newSite]);
      setSelectedSite(newSite);
      showToast("Website Added", `${newDomain} saved directly to PostgreSQL`, "success");
      setNewName("");
      setNewDomain("");
      setShowAddModal(false);
    } catch (err) {
      console.error("Create website error:", err);
      showToast("Error", "Could not save website to database", "error");
    }
  };

  const handleSendPreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewInput.trim()) return;

    const userText = previewInput.trim();
    setPreviewMessages(prev => [...prev, { sender: "user", text: userText }]);
    setPreviewInput("");

    setTimeout(() => {
      setPreviewMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: `Thank you for asking: "${userText}". Our AI assistant has retrieved relevant knowledge context to assist you!`
        }
      ]);
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Globe className="w-6 h-6 text-indigo-600" />
            Connected Websites & Widgets (PostgreSQL)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Embed customizable AI live support widgets on unlimited client websites with isolated knowledge bases stored in PostgreSQL 18.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Website Domain
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading websites from PostgreSQL...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Connected Websites List & Embed Snippet */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {websites.map(w => (
                <div
                  key={w.id}
                  onClick={() => {
                    setSelectedSite(w);
                    setPreviewMessages([{ sender: "ai", text: w.welcome_message }]);
                  }}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    selectedSite?.id === w.id
                      ? "bg-indigo-50/70 border-indigo-600 shadow-md ring-2 ring-indigo-500/20"
                      : "bg-white border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-4 w-4 rounded-full shadow-sm" style={{ backgroundColor: w.primary_color }}></div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">Active</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{w.name}</h4>
                  <p className="text-xs text-indigo-600 font-medium mb-3 truncate">{w.domain}</p>
                  <div className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-100 font-mono truncate">
                    {w.widget_key}
                  </div>
                </div>
              ))}
            </div>

            {/* Embed Code Snippet Card */}
            {selectedSite && (
              <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-indigo-400" /> Embed Installation Snippet
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Paste this snippet into <strong className="text-white">{selectedSite.domain}</strong> before the closing &lt;/body&gt; tag.
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopySnippet(selectedSite.widget_key)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Snippet
                  </button>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-indigo-300 overflow-x-auto">
                  <code>{`<!-- Enterprise AI Chatbot Widget -->
<script src="${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || "http://127.0.0.1:8000"}/static/widget.js"></script>
<script>
  EnterpriseChatWidget.init({
    widgetKey: "${selectedSite.widget_key}",
    apiUrl: "${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1"}"
  });
</script>`}</code>
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Live Interactive Widget Preview Simulator */}
          {selectedSite && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600" /> Interactive Widget Simulator
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Real-time preview of how visitors see your widget on {selectedSite.domain}.
                </p>

                {/* Chatbox Preview Frame */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-lg flex flex-col h-[420px] bg-slate-50">
                  
                  {/* Header */}
                  <div
                    className="p-3.5 text-white flex items-center justify-between shadow-sm"
                    style={{ backgroundColor: selectedSite.primary_color }}
                  >
                    <div>
                      <h4 className="font-bold text-xs">{selectedSite.header_title}</h4>
                      <span className="text-[10px] opacity-90 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse"></span> Powered by N.I. BIZ Soft
                      </span>
                    </div>
                    <span className="text-xs cursor-pointer opacity-80 hover:opacity-100">✕</span>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 p-3.5 overflow-y-auto space-y-2 text-xs">
                    {previewMessages.map((m, idx) => (
                      <div
                        key={idx}
                        className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                            m.sender === "user"
                              ? "bg-indigo-600 text-white rounded-br-none"
                              : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm"
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Composer */}
                  <form onSubmit={handleSendPreview} className="p-2 border-t border-slate-200 bg-white flex gap-1.5">
                    <input
                      type="text"
                      value={previewInput}
                      onChange={e => setPreviewInput(e.target.value)}
                      placeholder="Type message to test AI..."
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 text-center mt-3">
                Widget key registered in PostgreSQL • Fast loading &lt;48KB
              </div>
            </div>
          )}

        </div>
      )}

      {/* Add Website Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Add Connected Website</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddWebsite} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Website Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Acme Mobile Store"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Domain Name</label>
                <input
                  type="text"
                  required
                  value={newDomain}
                  onChange={e => setNewDomain(e.target.value)}
                  placeholder="e.g. store.acmedigital.com"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newColor}
                      onChange={e => setNewColor(e.target.value)}
                      className="h-8 w-12 rounded cursor-pointer border border-slate-200"
                    />
                    <span className="font-mono">{newColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Header Title</label>
                  <input
                    type="text"
                    value={newHeader}
                    onChange={e => setNewHeader(e.target.value)}
                    placeholder="AI Support"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Welcome Message</label>
                <input
                  type="text"
                  value={newWelcome}
                  onChange={e => setNewWelcome(e.target.value)}
                  placeholder="Hello! How can we assist you today?"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md"
                >
                  Save & Generate in PostgreSQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
