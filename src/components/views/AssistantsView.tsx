"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { Bot, Plus, Sparkles, Settings2, Sliders, Shield, CheckCircle2, X, RefreshCw, Variable, Lightbulb, Play, Pause } from "lucide-react";
import { AIAssistant } from "../../types";
import { api } from "../../lib/api";

export default function AssistantsView() {
  const { showToast } = useToast();
  const [assistants, setAssistants] = useState<AIAssistant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAssistant, setEditingAssistant] = useState<AIAssistant | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [modelName, setModelName] = useState("gemini-1.5-flash");
  const [temperature, setTemperature] = useState(0.3);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [systemInstruction, setSystemInstruction] = useState("You are an intelligent enterprise AI assistant.");
  const [fallbackMessage, setFallbackMessage] = useState("I am connecting you with a human support specialist.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAssistants = async () => {
    try {
      const data = await api.getAssistants();
      if (data && Array.isArray(data)) {
        setAssistants(data);
      }
    } catch (e) {
      console.error("Failed to load assistants from DB:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssistants();
  }, []);

  const handleOpenCreate = () => {
    setName("");
    setDescription("");
    setModelName("gemini-1.5-flash");
    setTemperature(0.3);
    setMaxTokens(1024);
    setSystemInstruction("You are {{company_name}}'s official AI Support Specialist. Greet {{visitor_name}} warmly and use retrieved knowledge chunks to provide crisp, accurate answers.");
    setFallbackMessage("Connecting you to our agent...");
    setEditingAssistant(null);
    setShowModal(true);
  };

  const handleOpenEdit = (a: AIAssistant) => {
    setEditingAssistant(a);
    setName(a.name);
    setDescription(a.description || "");
    setModelName(a.model_name);
    setTemperature(a.temperature);
    setMaxTokens(a.max_output_tokens || 1024);
    setSystemInstruction(a.system_instruction);
    setFallbackMessage(a.fallback_message);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingAssistant) {
        const updated = await api.updateAssistant(editingAssistant.id, {
          name,
          description,
          model_name: modelName,
          temperature,
          top_p: 0.95,
          max_output_tokens: maxTokens,
          system_instruction: systemInstruction,
          fallback_message: fallbackMessage,
          auto_handover_keywords: ["agent", "human", "help", "support", "representative"]
        });
        setAssistants(prev => prev.map(a => a.id === editingAssistant.id ? updated : a));
        showToast("System Prompt Updated", `${name} saved directly to PostgreSQL`, "success");
      } else {
        const newAst = await api.createAssistant({
          name,
          description,
          model_name: modelName,
          temperature,
          top_p: 0.95,
          max_output_tokens: maxTokens,
          system_instruction: systemInstruction,
          fallback_message: fallbackMessage,
          auto_handover_keywords: ["agent", "human", "help", "support"]
        });
        setAssistants(prev => [...prev, newAst]);
        showToast("AI Assistant Created", `${name} configured and ready for live chat`, "success");
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      showToast("Error", "Could not save assistant configuration", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (a: AIAssistant) => {
    try {
      const res = await api.toggleAssistant(a.id);
      setAssistants(prev =>
        prev.map(item => (item.id === a.id ? { ...item, is_active: res.is_active } : item))
      );
      showToast(
        res.is_active ? "AI Assistant Resumed" : "AI Assistant Paused",
        res.is_active ? `${a.name} is now actively answering visitor queries.` : `${a.name} is paused. Queries routed to human support.`,
        res.is_active ? "success" : "info"
      );
    } catch (e) {
      console.error(e);
      showToast("Error", "Could not toggle assistant state", "error");
    }
  };

  // Insert Variable Token
  const insertVariable = (token: string) => {
    setSystemInstruction(prev => prev + ` ${token} `);
  };

  // Preset Prompt Archetypes
  const applyArchetype = (type: string) => {
    if (type === "support") {
      setSystemInstruction(
        `You are the Senior Customer Support Assistant for {{company_name}}.
1. Greet {{visitor_name}} courteously.
2. Address questions specifically related to their department: {{department}}.
3. Use the provided Knowledge Base documentation to answer accurately. If uncertain, offer to connect with a human specialist.`
      );
      setTemperature(0.2);
    } else if (type === "sales") {
      setSystemInstruction(
        `You are the Executive Sales Consultant for {{company_name}}.
1. Welcome {{visitor_name}} enthusiastically.
2. Highlight the key value proposition and ROI of our Enterprise Plan ($499/mo).
3. Inquire about their monthly token needs and team size to qualify them for a personalized demo.`
      );
      setTemperature(0.5);
    } else if (type === "technical") {
      setSystemInstruction(
        `You are the Developer Support & Integration Engineer for {{company_name}}.
1. Provide precise technical solutions, code snippets (Python, cURL, Next.js), and HMAC webhook verification steps.
2. Strictly adhere to technical documentation and cite API endpoints.`
      );
      setTemperature(0.1);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F1713] tracking-tight flex items-center gap-2.5">
            <Bot className="w-5 h-5 text-[#008750] shrink-0" />
            <span>AI Assistant Engine Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#4F7863] mt-1">
            Configure dynamic system prompts, variable placeholders, safety guardrails, and pause/resume AI models.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="w-full sm:w-auto px-4 py-2.5 bg-[#00C978] hover:bg-[#00B36B] text-[#080D0A] text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Create New Assistant
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-[#759B87]">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#008750]" />
          Loading assistants from PostgreSQL...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {assistants.map(a => (
            <div
              key={a.id}
              className={`bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between transition-all group ${
                a.is_active !== false ? "border-[#CBD7D0] hover:border-[#00C978]" : "border-amber-200 bg-amber-50/20 opacity-90"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-semibold text-[#008750] bg-[#00C978]/10 px-2.5 py-1 rounded-md border border-[#00C978]/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#008750]" /> {a.model_name}
                  </span>
                  
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                    a.is_active !== false ? "bg-[#00C978]/15 text-[#008750] border border-[#00C978]/30" : "bg-amber-100 text-amber-800"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${a.is_active !== false ? "bg-[#00C978]" : "bg-amber-600"}`}></span>
                    {a.is_active !== false ? "Live Active" : "Paused"}
                  </span>
                </div>

                <h3 className="font-bold text-base text-[#0F1713] mb-1 group-hover:text-[#008750] transition-colors">
                  {a.name}
                </h3>
                <p className="text-xs text-[#4F7863] mb-4 line-clamp-2 leading-relaxed">
                  {a.description || "General customer support AI assistant."}
                </p>

                <div className="space-y-2 text-xs text-[#263D31] bg-[#F4F7F5] p-3.5 rounded-xl border border-[#E1E8E4] mb-4">
                  <div className="flex justify-between">
                    <span className="text-[#759B87]">Temperature:</span>
                    <strong className="text-[#0F1713]">{a.temperature}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Tokens:</span>
                    <strong className="text-slate-800">{a.max_output_tokens}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Storage Engine:</span>
                    <strong className="text-emerald-700 font-mono">PostgreSQL 18</strong>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100 mb-4">
                  <span className="font-semibold text-indigo-900 block mb-1">Dynamic System Prompt:</span>
                  <p className="text-slate-600 line-clamp-3 italic font-mono text-[10.5px] leading-relaxed">
                    &quot;{a.system_instruction}&quot;
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleToggleActive(a)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                    a.is_active !== false
                      ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                      : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {a.is_active !== false ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {a.is_active !== false ? "Pause AI" : "Resume AI"}
                </button>
                <button
                  onClick={() => handleOpenEdit(a)}
                  className="p-2 border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1 text-xs font-semibold px-3"
                  title="Configure Prompt & Safety"
                >
                  <Settings2 className="w-3.5 h-3.5" /> Edit Prompt
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog: Dynamic System Prompt & Assistant Configurator */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {editingAssistant ? `Configure ${editingAssistant.name}` : "Create AI Assistant"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dynamic system instructions with variable macro placeholders.
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assistant Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Acme Support AI"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="e.g. Primary live chat specialist"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Model & Temperature Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">AI Model Engine</label>
                  <select
                    value={modelName}
                    onChange={e => setModelName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 bg-white font-medium"
                  >
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra Fast)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Advanced Reasoning)</option>
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash (Next-Gen)</option>
                    <option value="gemini-3.6-flash">Gemini 3.6 Flash (Enterprise Web2API)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Temperature ({temperature})</label>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={temperature}
                    onChange={e => setTemperature(parseFloat(e.target.value))}
                    className="w-full mt-1 accent-indigo-600"
                  />
                </div>
              </div>

              {/* Preset Archetype Helpers */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    Load Role Archetype:
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyArchetype("support")}
                      className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-100 transition-colors"
                    >
                      Customer Support
                    </button>
                    <button
                      type="button"
                      onClick={() => applyArchetype("sales")}
                      className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-100 transition-colors"
                    >
                      Sales Closer
                    </button>
                    <button
                      type="button"
                      onClick={() => applyArchetype("technical")}
                      className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-100 transition-colors"
                    >
                      Tech Support
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Variables */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10.5px] font-bold text-slate-500 flex items-center gap-1">
                    <Variable className="w-3 h-3 text-indigo-500" /> Click to Insert Variables:
                  </span>
                  {[
                    "{{visitor_name}}",
                    "{{company_name}}",
                    "{{department}}",
                    "{{current_date}}"
                  ].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertVariable(v)}
                      className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-1.5 py-0.5 rounded border border-slate-200 transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic System Instruction Prompt Input */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">
                  Dynamic System Instruction & Behavioral Guardrail *
                </label>
                <textarea
                  rows={6}
                  required
                  value={systemInstruction}
                  onChange={e => setSystemInstruction(e.target.value)}
                  placeholder="You are {{company_name}}'s AI support assistant..."
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono text-[11px] leading-relaxed"
                />
              </div>

              {/* Fallback Message */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Human Handover Fallback Message</label>
                <input
                  type="text"
                  required
                  value={fallbackMessage}
                  onChange={e => setFallbackMessage(e.target.value)}
                  placeholder="I am transferring you to a human support representative."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {editingAssistant ? "Save Prompt Changes" : "Create Assistant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
