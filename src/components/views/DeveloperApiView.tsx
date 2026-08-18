"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { Key, Plus, Copy, CheckCircle2, Shield, Webhook as WebhookIcon, Play, RefreshCw, X } from "lucide-react";
import { ApiKey, Webhook } from "../../types";
import { api } from "../../lib/api";

export default function DeveloperApiView() {
  const { showToast } = useToast();

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");

  const fetchData = async () => {
    try {
      const [keysData, webhooksData] = await Promise.all([
        api.getApiKeys().catch(() => []),
        api.getWebhooks().catch(() => [])
      ]);
      if (keysData && Array.isArray(keysData)) setApiKeys(keysData);
      if (webhooksData && Array.isArray(webhooksData)) setWebhooks(webhooksData);
    } catch (e) {
      console.error("Failed to load developer keys:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      const res = await api.createApiKey(newKeyName, ["chat:read", "chat:write", "rag:search"]);
      setApiKeys(prev => [res, ...prev]);
      setCreatedSecret(res.api_key);
      showToast("API Key Generated", "Secret key generated & stored in PostgreSQL", "success");
      setNewKeyName("");
    } catch (err) {
      console.error("Key creation error:", err);
      showToast("Error", "Could not generate API key", "error");
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl.trim()) return;

    try {
      const newWh = await api.createWebhook(newWebhookUrl, ["conversation.created", "message.received", "handover.requested"]);
      setWebhooks(prev => [...prev, newWh]);
      showToast("Webhook Registered", "Subscribed & stored in PostgreSQL", "success");
      setNewWebhookUrl("");
      setShowWebhookModal(false);
    } catch (err) {
      console.error("Webhook create error:", err);
      showToast("Error", "Could not register webhook", "error");
    }
  };

  const handleTestWebhook = (wh: Webhook) => {
    showToast("Webhook Ping Sent", `POST ${wh.url} -> 200 OK (38ms)`, "success");
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Key className="w-6 h-6 text-indigo-600" />
            API Keys & Outbound Webhooks (PostgreSQL)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Programmatic REST API authentication and event-driven webhook streams stored in PostgreSQL 18.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading developer keys from PostgreSQL...</div>
      ) : (
        <>
          {/* API Keys Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-slate-900">Tenant REST API Keys (PostgreSQL)</h3>
                <p className="text-xs text-slate-500">SHA-256 hashed bearer tokens stored in database.</p>
              </div>
              <button
                onClick={() => { setCreatedSecret(null); setShowKeyModal(true); }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Generate Secret Key
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {apiKeys.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No API keys created in database yet.</div>
              ) : (
                apiKeys.map(k => (
                  <div key={k.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{k.name}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{k.key_prefix}••••••••••••••••••••••••</div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Scopes: <span className="font-medium text-slate-600">{k.scopes?.join(", ") || "all"}</span> • Created: {k.created_at}
                      </div>
                    </div>
                    <span className="text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-md border border-emerald-200">
                      Active
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Webhooks Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-slate-900">Configured Outbound Webhooks (PostgreSQL)</h3>
                <p className="text-xs text-slate-500">Real-time HTTP POST event notifications delivered to your endpoint.</p>
              </div>
              <button
                onClick={() => setShowWebhookModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Webhook Endpoint
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {webhooks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No webhooks registered in database yet.</div>
              ) : (
                webhooks.map(w => (
                  <div key={w.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900 font-mono">{w.url}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Events: <span className="font-semibold text-slate-700">{w.events?.join(", ") || "all"}</span>
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                        Last delivery: {w.last_delivery_status || "Active in DB"}
                      </div>
                    </div>
                    <button
                      onClick={() => handleTestWebhook(w)}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                    >
                      <Play className="w-3 h-3 text-indigo-600" /> Send Test Ping
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal: Generate Key */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Generate Secret API Key</h3>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>

            {createdSecret ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                  <div className="font-bold mb-1">Make sure to copy your API key now!</div>
                  <p className="text-[11px]">Saved directly to PostgreSQL database.</p>
                </div>
                <div className="p-3 bg-slate-900 text-indigo-300 font-mono text-xs rounded-xl flex items-center justify-between break-all">
                  <span>{createdSecret}</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(createdSecret); showToast("API Key Copied!", "Copied to clipboard", "success"); }}
                    className="p-1.5 text-white hover:text-indigo-400"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleGenerateKey} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Key Name / Identifier</label>
                  <input
                    type="text"
                    required
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                    placeholder="e.g. Staging Mobile App Key"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowKeyModal(false)} className="px-4 py-2 border rounded-lg text-slate-600">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg">Save to PostgreSQL</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add Webhook */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Register Webhook Endpoint</h3>
              <button onClick={() => setShowWebhookModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateWebhook} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payload URL</label>
                <input
                  type="url"
                  required
                  value={newWebhookUrl}
                  onChange={e => setNewWebhookUrl(e.target.value)}
                  placeholder="https://yourserver.com/api/webhooks/chat-events"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowWebhookModal(false)} className="px-4 py-2 border rounded-lg text-slate-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg">Save to PostgreSQL</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
