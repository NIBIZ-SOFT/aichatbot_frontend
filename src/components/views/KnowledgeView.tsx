"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { 
  BookOpen, Plus, Search, Sparkles, FileText, CheckCircle2, 
  X, RefreshCw, Trash2, HelpCircle, Globe, Code, Layers, 
  ArrowRight, FileCode, Check, Bot, Settings2, Sliders, Shield,
  MessageSquare, Send, Cpu, Zap, AlertCircle, Play, UserCheck
} from "lucide-react";
import { KnowledgeBase, AIAssistant } from "../../types";
import { api } from "../../lib/api";
import MarkdownMessage from "../common/MarkdownMessage";

export default function KnowledgeView() {
  const { showToast } = useToast();

  // Top-Level Studio Navigation
  const [studioTab, setStudioTab] = useState<"knowledge" | "personality" | "guardrails" | "simulator">("knowledge");

  // ==================== TAB 1: KNOWLEDGE BASES ====================
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeBase[]>([]);
  const [isLoadingKnowledge, setIsLoadingKnowledge] = useState(true);
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [ingestType, setIngestType] = useState<"markdown" | "faq" | "url">("markdown");

  // Text Doc State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Products & Pricing");
  const [content, setContent] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);

  // FAQ State
  const [faqTitle, setFaqTitle] = useState("");
  const [faqCategory, setFaqCategory] = useState("Support FAQ");
  const [faqItems, setFaqItems] = useState<Array<{ question: string; answer: string }>>([
    { question: "", answer: "" }
  ]);

  // URL State
  const [urlTitle, setUrlTitle] = useState("");
  const [urlCategory, setUrlCategory] = useState("API Documentation");
  const [sourceUrl, setSourceUrl] = useState("");
  const [urlContent, setUrlContent] = useState("");

  // ==================== TAB 2: BOT PERSONALITY & RULES ====================
  const [assistant, setAssistant] = useState<AIAssistant | null>(null);
  const [botName, setBotName] = useState("Padma Live Support AI");
  const [personalityType, setPersonalityType] = useState("professional");
  const [systemInstruction, setSystemInstruction] = useState("You are Padma Digital's official AI Support Assistant. Greet customers warmly and answer accurately using our knowledge base.");
  const [welcomeMessage, setWelcomeMessage] = useState("Hello! Welcome to Padma Digital Solutions. How can we assist you today?");
  const [fallbackMessage, setFallbackMessage] = useState("I am connecting you with a human customer support specialist.");
  const [handoverKeywords, setHandoverKeywords] = useState("agent, human, talk to human, representative, support, help, bKash issue");
  const [isSavingBot, setIsSavingBot] = useState(false);

  // ==================== TAB 3: AI GUARDRAILS & BUSINESS RULES ====================
  const [guardrailsEnabled, setGuardrailsEnabled] = useState(true);
  const [industryPreset, setIndustryPreset] = useState("ecommerce");
  const [allowedTopics, setAllowedTopics] = useState<string[]>([
    "Product Specifications & Sizing",
    "Order Tracking & Placement",
    "Shipping Rates & Delivery Times",
    "bKash & Card Payment Methods",
    "Return, Exchange & Refund Policies",
    "Store Location & Operating Hours"
  ]);
  const [newAllowedTag, setNewAllowedTag] = useState("");

  const [restrictedTopics, setRestrictedTopics] = useState<string[]>([
    "Politics & Controversial Topics",
    "Personal Advice & Casual Chit-Chat",
    "Competitor Comparisons & Disparagement",
    "Programming, Math & Homework Assistance",
    "Unrelated Non-Store Discussions"
  ]);
  const [newRestrictedTag, setNewRestrictedTag] = useState("");

  const [guardrailWarningMessage, setGuardrailWarningMessage] = useState(
    "I specialize in assisting with our store products, pricing, orders, and deliveries. How can I help with your shopping today?"
  );
  const [maxOffTopicStrikes, setMaxOffTopicStrikes] = useState<number>(2);
  const [autoPauseOnBreach, setAutoPauseOnBreach] = useState(true);
  const [guardrailHandoverMessage, setGuardrailHandoverMessage] = useState(
    "This inquiry appears to be outside our automated store support scope. I am now pausing automated AI and transferring your request to our customer care team."
  );
  const [isSavingGuardrails, setIsSavingGuardrails] = useState(false);

  const INDUSTRY_PRESETS = [
    {
      id: "ecommerce",
      name: "E-Commerce & Online Store",
      icon: "🛍️",
      desc: "For retail shops, multi-vendor stores, and digital commerce.",
      allowed: [
        "Product Specifications & Sizing",
        "Order Tracking & Placement",
        "Shipping Rates & Delivery Times",
        "bKash & Card Payment Methods",
        "Return, Exchange & Refund Policies",
        "Store Location & Operating Hours"
      ],
      restricted: [
        "Politics & Controversial Topics",
        "Personal Advice & Casual Chit-Chat",
        "Competitor Comparisons & Disparagement",
        "Programming, Math & Homework Assistance",
        "Unrelated Non-Store Discussions"
      ],
      warning: "I am our online store AI assistant. I specialize in product information, orders, pricing, and deliveries. How can I assist you with your purchase today?",
      handover: "This inquiry appears to be outside our automated store support scope. I am now pausing automated AI and transferring your request to our customer care team."
    },
    {
      id: "healthcare",
      name: "Healthcare & Clinic",
      icon: "🏥",
      desc: "For medical clinics, diagnostic centers, and doctor appointments.",
      allowed: [
        "Doctor Schedules & Departments",
        "Appointment Booking & Visiting Hours",
        "Clinic Locations & Contact Numbers",
        "Diagnostic Lab Tests & Pricing (৳ BDT)",
        "General Clinic Services & Facilities"
      ],
      restricted: [
        "Medical Prescriptions & Self-Medication Advice",
        "Personal Health Diagnosis",
        "Politics & Controversial Debates",
        "Programming & General Homework",
        "Non-Healthcare Commercial Inquiries"
      ],
      warning: "I am the clinic's digital assistant. I can assist with doctor appointments, test pricing, and department schedules. For medical emergencies, please dial our emergency hotline directly.",
      handover: "Your question requires clinical evaluation or specialized guidance. I am transferring this conversation to our medical coordination desk."
    },
    {
      id: "saas",
      name: "SaaS & Tech Platform",
      icon: "💼",
      desc: "For cloud software, APIs, developer tools, and subscription services.",
      allowed: [
        "Platform Features & Capabilities",
        "Subscription Packages & Pricing (৳ BDT)",
        "API Documentation & Webhooks",
        "Account Setup & Billing Support",
        "Bug Reports & System Status"
      ],
      restricted: [
        "General World News & Politics",
        "Competitor Endorsements",
        "Casual Chit-Chat & Personal Inquiries",
        "Unrelated Code Writing / Homework",
        "Illegal or Dangerous Activities"
      ],
      warning: "I am our software platform AI assistant. I can assist with platform capabilities, APIs, subscriptions, and integrations. How can I help your software workflow today?",
      handover: "This inquiry requires direct technical escalation. Routing this thread directly to our senior support engineers."
    },
    {
      id: "realestate",
      name: "Real Estate & Property",
      icon: "🏢",
      desc: "For property developers, flat sales, and commercial rentals.",
      allowed: [
        "Property Listings & Floor Plans",
        "Pricing, Installments & Payment Plans (৳ BDT)",
        "Site Visit & Inspection Bookings",
        "Location Advantages & Nearby Amenities",
        "Sales Agent Contact Details"
      ],
      restricted: [
        "Legal Disputes & Court Cases",
        "Politics & General Discussions",
        "Programming & Non-Property Topics",
        "Personal Advice"
      ],
      warning: "I can provide details about our properties, flat pricing, location highlights, and schedule site visits. Which property or project are you interested in?",
      handover: "Connecting you with our senior property sales consultant for personalized consultation."
    },
    {
      id: "education",
      name: "Education & Coaching",
      icon: "🎓",
      desc: "For coaching centers, schools, online academies, and skill courses.",
      allowed: [
        "Course Modules & Syllabus Overview",
        "Admissions, Batches & Schedules",
        "Tuition Fees & Scholarship Discounts (৳ BDT)",
        "Certificate Accreditation & Exams",
        "Campus Location & Contact Info"
      ],
      restricted: [
        "Direct Exam Question Solving / Cheating",
        "Politics & Non-Academic Controversies",
        "Unrelated Commercial Discussions",
        "Personal Life Advice"
      ],
      warning: "I am the academy's admission guide. I can assist with course modules, batch schedules, and enrollment fees. How can I assist your learning journey today?",
      handover: "Routing your inquiry to our academic counseling department for one-on-one guidance."
    },
    {
      id: "custom",
      name: "Custom Enterprise Rules",
      icon: "⚙️",
      desc: "Custom tailored business rules and unique topic restrictions.",
      allowed: [
        "Company Products & Services",
        "Billing & Invoices",
        "Office Hours & Address"
      ],
      restricted: [
        "Off-Topic Questions",
        "Competitors",
        "Politics"
      ],
      warning: "I am designed to assist exclusively with our organization's services and support. How can I help you today?",
      handover: "This inquiry is outside our automated scope. Routing you to a human representative."
    }
  ];

  const applyIndustryPreset = (presetId: string) => {
    const found = INDUSTRY_PRESETS.find(p => p.id === presetId);
    if (!found) return;
    setIndustryPreset(presetId);
    setAllowedTopics(found.allowed);
    setRestrictedTopics(found.restricted);
    setGuardrailWarningMessage(found.warning);
    setGuardrailHandoverMessage(found.handover);
    showToast("Template Applied", `Loaded '${found.name}' rules. Click 'Save Guardrails' to apply.`, "info");
  };

  const handleAddAllowedTopic = () => {
    if (!newAllowedTag.trim()) return;
    const trimmed = newAllowedTag.trim();
    if (!allowedTopics.includes(trimmed)) {
      setAllowedTopics(prev => [...prev, trimmed]);
    }
    setNewAllowedTag("");
  };

  const handleRemoveAllowedTopic = (tag: string) => {
    setAllowedTopics(prev => prev.filter(t => t !== tag));
  };

  const handleAddRestrictedTopic = () => {
    if (!newRestrictedTag.trim()) return;
    const trimmed = newRestrictedTag.trim();
    if (!restrictedTopics.includes(trimmed)) {
      setRestrictedTopics(prev => [...prev, trimmed]);
    }
    setNewRestrictedTag("");
  };

  const handleRemoveRestrictedTopic = (tag: string) => {
    setRestrictedTopics(prev => prev.filter(t => t !== tag));
  };

  const handleSaveGuardrails = async () => {
    if (!assistant) return;
    setIsSavingGuardrails(true);
    try {
      const updatedSafety = {
        ...(assistant.safety_settings || {}),
        guardrails: {
          enabled: guardrailsEnabled,
          industry_type: industryPreset,
          allowed_topics: allowedTopics,
          restricted_topics: restrictedTopics,
          warning_message: guardrailWarningMessage,
          max_off_topic_strikes: maxOffTopicStrikes,
          auto_pause_on_breach: autoPauseOnBreach,
          handover_message: guardrailHandoverMessage
        }
      };

      await api.updateAssistant(assistant.id, {
        safety_settings: updatedSafety
      });

      showToast("Guardrail Rules Saved", "AI business scope, humble warning, and auto-pause policy updated successfully.", "success");
      fetchAssistant();
    } catch (e: any) {
      showToast("Error", e.message || "Failed to save guardrail rules", "error");
    } finally {
      setIsSavingGuardrails(false);
    }
  };

  // ==================== TAB 4: LIVE AI SIMULATOR ====================
  const [chatMessages, setChatMessages] = useState<Array<{
    sender: "user" | "ai";
    text: string;
    sources?: Array<{ title: string; similarity: number; content: string }>;
    tokens?: number;
    latencyMs?: number;
  }>>([
    {
      sender: "ai",
      text: "Hello! I am your pre-trained AI Assistant. Ask me any question about your products, pricing (BDT ৳), or business policies to test my answers in real-time."
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

  // Fetch Knowledge Bases
  const fetchKnowledge = async () => {
    try {
      const data = await api.getKnowledgeBases();
      if (data && Array.isArray(data)) {
        setKnowledgeList(data);
      }
    } catch (e) {
      console.error("Failed to load knowledge bases:", e);
    } finally {
      setIsLoadingKnowledge(false);
    }
  };

  // Fetch Assistant
  const fetchAssistant = async () => {
    try {
      const data = await api.getAssistants();
      if (data && Array.isArray(data) && data.length > 0) {
        const asst = data[0];
        setAssistant(asst);
        setBotName(asst.name || "Padma Live Support AI");
        setPersonalityType(asst.personality_type || "professional");
        setSystemInstruction(asst.system_instruction || "");
        setFallbackMessage(asst.fallback_message || "I am connecting you with a human support specialist.");
        if (Array.isArray(asst.auto_handover_keywords)) {
          setHandoverKeywords(asst.auto_handover_keywords.join(", "));
        }
        if (asst.safety_settings && asst.safety_settings.guardrails) {
          const g = asst.safety_settings.guardrails;
          setGuardrailsEnabled(g.enabled ?? true);
          setIndustryPreset(g.industry_type || "ecommerce");
          if (Array.isArray(g.allowed_topics) && g.allowed_topics.length > 0) setAllowedTopics(g.allowed_topics);
          if (Array.isArray(g.restricted_topics) && g.restricted_topics.length > 0) setRestrictedTopics(g.restricted_topics);
          if (g.warning_message) setGuardrailWarningMessage(g.warning_message);
          if (g.max_off_topic_strikes !== undefined) setMaxOffTopicStrikes(g.max_off_topic_strikes);
          if (g.auto_pause_on_breach !== undefined) setAutoPauseOnBreach(g.auto_pause_on_breach);
          if (g.handover_message) setGuardrailHandoverMessage(g.handover_message);
        }
      }
    } catch (e) {
      console.error("Failed to load assistant:", e);
    }
  };

  useEffect(() => {
    fetchKnowledge();
    fetchAssistant();
  }, []);

  // Ingestion Handlers
  const handleIngestText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsIngesting(true);
    try {
      await api.createKnowledgeBase({
        title,
        category,
        content,
        source_type: "document"
      });
      showToast("Knowledge Trained", `Document '${title}' was successfully vectorized into PostgreSQL.`, "success");
      setTitle("");
      setContent("");
      setShowIngestModal(false);
      fetchKnowledge();
    } catch (e: any) {
      showToast("Training Failed", e.message || "Could not ingest document", "error");
    } finally {
      setIsIngesting(false);
    }
  };

  const handleIngestFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = faqItems.filter(i => i.question.trim() && i.answer.trim());
    if (!faqTitle.trim() || validItems.length === 0) {
      showToast("Validation Error", "Please provide a title and at least one valid Q&A pair", "error");
      return;
    }

    setIsIngesting(true);
    try {
      await api.ingestKnowledgeFAQ({
        title: faqTitle,
        category: faqCategory,
        faq_items: validItems
      });
      showToast("FAQ Collection Trained", `Successfully vectorized ${validItems.length} Q&A items into PostgreSQL.`, "success");
      setFaqTitle("");
      setFaqItems([{ question: "", answer: "" }]);
      setShowIngestModal(false);
      fetchKnowledge();
    } catch (e: any) {
      showToast("Training Failed", e.message || "Could not ingest FAQ collection", "error");
    } finally {
      setIsIngesting(false);
    }
  };

  const handleDeleteKnowledge = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete '${name}' and its vector embeddings?`)) return;
    try {
      await api.deleteKnowledgeBase(id);
      showToast("Deleted", `Removed '${name}' from knowledge base`, "info");
      fetchKnowledge();
    } catch (e: any) {
      showToast("Error", e.message || "Failed to delete document", "error");
    }
  };

  // Save Bot Personality & Rules
  const handleSaveBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistant) return;

    setIsSavingBot(true);
    try {
      const keywordsArray = handoverKeywords
        .split(",")
        .map(k => k.trim())
        .filter(Boolean);

      await api.updateAssistant(assistant.id, {
        name: botName,
        personality_type: personalityType,
        system_instruction: systemInstruction,
        fallback_message: fallbackMessage,
        auto_handover_keywords: keywordsArray
      });

      showToast("AI Rules Updated", "Bot personality, system prompts, and handover rules saved to PostgreSQL.", "success");
      fetchAssistant();
    } catch (e: any) {
      showToast("Error", e.message || "Failed to update assistant rules", "error");
    } finally {
      setIsSavingBot(false);
    }
  };

  // Live Simulator Chat Message Send
  const handleSendSimulatorMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputMessage.trim();
    if (!query || isSimulating) return;

    // Append User message
    setChatMessages(prev => [...prev, { sender: "user", text: query }]);
    setInputMessage("");
    setIsSimulating(true);

    try {
      const res = await api.testAIChatSimulator(query, assistant?.id);
      setChatMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: res.reply || "I am ready to help.",
          sources: res.retrieved_sources || [],
          tokens: (res.prompt_tokens || 0) + (res.completion_tokens || 0),
          latencyMs: res.latency_ms || 350
        }
      ]);
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: "⚠️ Simulation Error: Could not connect to AI engine. Please verify your knowledge base."
        }
      ]);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600" /> Unified AI Brain Studio
            </span>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
              pgvector RAG + Neural AI
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            AI Brain & Knowledge Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Train your AI with products and policies, customize bot tone and handover rules, and simulate live conversations.
          </p>
        </div>

        {studioTab === "knowledge" && (
          <button
            onClick={() => setShowIngestModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Knowledge Document
          </button>
        )}
      </div>

      {/* 4 Main Studio Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto custom-scrollbar pb-0.5">
        <button
          type="button"
          onClick={() => setStudioTab("knowledge")}
          className={`pb-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            studioTab === "knowledge"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Layers className="w-4 h-4" /> 1. Train Knowledge & Products ({knowledgeList.length})
        </button>

        <button
          type="button"
          onClick={() => setStudioTab("personality")}
          className={`pb-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            studioTab === "personality"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Bot className="w-4 h-4" /> 2. Bot Personality & Tone
        </button>

        <button
          type="button"
          onClick={() => setStudioTab("guardrails")}
          className={`pb-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            studioTab === "guardrails"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Shield className="w-4 h-4 text-emerald-600" /> 3. 🛡️ AI Guardrails & Business Rules
        </button>

        <button
          type="button"
          onClick={() => setStudioTab("simulator")}
          className={`pb-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            studioTab === "simulator"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" /> 4. Live AI Simulator & Playground
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TRAIN KNOWLEDGE & PRODUCTS                                         */}
      {/* ========================================================================= */}
      {studioTab === "knowledge" && (
        <div className="space-y-6">
          {isLoadingKnowledge ? (
            <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center gap-3 bg-white rounded-3xl border border-slate-200">
              <div className="h-8 w-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              Loading vectorized knowledge bases from PostgreSQL...
            </div>
          ) : knowledgeList.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No business knowledge uploaded yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Add your product catalog, refund policies, and delivery areas to train the AI before answering customer inquiries.
              </p>
              <button
                onClick={() => setShowIngestModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add First Document
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {knowledgeList.map(kb => (
                <div
                  key={kb.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {kb.category || "General"}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Indexed
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900">{kb.title}</h3>
                    {kb.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{kb.description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="text-[11px] text-slate-400 font-mono">
                      {kb.chunk_count || 1} Vector Chunks
                    </div>
                    <button
                      onClick={() => handleDeleteKnowledge(kb.id, kb.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Delete Knowledge Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BOT PERSONALITY & RULES                                            */}
      {/* ========================================================================= */}
      {studioTab === "personality" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Bot Personality & Handover Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure how your AI speaks to customers and when it should transfer conversations to human agents.
            </p>
          </div>

          <form onSubmit={handleSaveBot} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Bot Display Name *</label>
                <input
                  type="text"
                  required
                  value={botName}
                  onChange={e => setBotName(e.target.value)}
                  placeholder="e.g. Padma Live Support AI"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Personality & Tone Preset</label>
                <select
                  value={personalityType}
                  onChange={e => setPersonalityType(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 bg-white font-medium"
                >
                  <option value="professional">Professional & Formal 👔</option>
                  <option value="friendly">Friendly & Warm 😊</option>
                  <option value="sales">Sales & High-Conversion 🎯</option>
                  <option value="technical">Technical & Concise 🛠️</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">System Instruction / Business Context *</label>
              <textarea
                rows={3}
                required
                value={systemInstruction}
                onChange={e => setSystemInstruction(e.target.value)}
                placeholder="You are the official AI Support specialist for our company. Answer politely using our knowledge base."
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium leading-relaxed"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                The core prompt that guides the AI's behavior and tone for all visitor chats.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Human Agent Handover Trigger Keywords *</label>
              <input
                type="text"
                required
                value={handoverKeywords}
                onChange={e => setHandoverKeywords(e.target.value)}
                placeholder="agent, human, talk to human, representative, support, bKash issue"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Comma-separated words. If a customer types any of these, the AI automatically pauses and transfers to a live agent.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Handover / Fallback Message *</label>
              <input
                type="text"
                required
                value={fallbackMessage}
                onChange={e => setFallbackMessage(e.target.value)}
                placeholder="I am connecting you with a human customer support specialist."
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSavingBot}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSavingBot ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Save Bot Personality & Rules
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: 🛡️ AI GUARDRAILS & BUSINESS SCOPE RESTRICTIONS                     */}
      {/* ========================================================================= */}
      {studioTab === "guardrails" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Banner & Master Switch */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Business Scope & AI Topic Guardrails
                  </h2>
                  <span className={`text-[10.5px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                    guardrailsEnabled 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}>
                    {guardrailsEnabled ? "Protection Active" : "Disabled"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
                  Confine your AI exclusively to your business domain (products, orders, services). When visitors ask off-topic questions (e.g. coding, politics, personal chats), the AI delivers a polite humble notice. Repeated off-topic inquiries will gracefully auto-pause the AI and alert human support.
                </p>
              </div>

              {/* Master Switch Toggle */}
              <label className="flex items-center gap-3 cursor-pointer self-start sm:self-center shrink-0">
                <span className="text-xs font-bold text-slate-700 select-none">Strict Guardrails</span>
                <input
                  type="checkbox"
                  checked={guardrailsEnabled}
                  onChange={e => setGuardrailsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 relative"></div>
              </label>
            </div>

            {/* 1-Click Industry Templates */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  ⚡ 1-Click Industry Scope Presets:
                </label>
                <span className="text-[11px] text-slate-400">Click any preset to pre-fill business rules</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {INDUSTRY_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => applyIndustryPreset(preset.id)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer select-none space-y-1.5 ${
                      industryPreset === preset.id
                        ? "border-emerald-600 bg-emerald-50/70 text-slate-900 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <span className="text-base">{preset.icon}</span>
                        <span>{preset.name}</span>
                      </div>
                      {industryPreset === preset.id && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {preset.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 2-Column: Permitted vs Forbidden Scopes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-slate-100">
              
              {/* Left: Permitted Topics */}
              <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Permitted Business Topics ({allowedTopics.length})</span>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">
                  Topics the AI is authorized and pre-trained to answer using your knowledge base.
                </p>

                {/* Tags List */}
                <div className="flex flex-wrap gap-1.5 min-h-[80px] p-2.5 bg-white rounded-xl border border-emerald-200/60 max-h-48 overflow-y-auto custom-scrollbar">
                  {allowedTopics.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200/80 shadow-2xs"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAllowedTopic(tag)}
                        className="text-emerald-600 hover:text-rose-600 cursor-pointer font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {allowedTopics.length === 0 && (
                    <span className="text-[11px] text-slate-400 italic">No permitted topics added.</span>
                  )}
                </div>

                {/* Add Allowed Tag Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newAllowedTag}
                    onChange={e => setNewAllowedTag(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddAllowedTopic(); } }}
                    placeholder="e.g. Warranty Claim Policy..."
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddAllowedTopic}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
                  >
                    + Add Topic
                  </button>
                </div>
              </div>

              {/* Right: Restricted / Forbidden Topics */}
              <div className="space-y-3 p-4 rounded-2xl bg-rose-50/30 border border-rose-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Strictly Forbidden / Off-Topic Scopes ({restrictedTopics.length})</span>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">
                  Topics where the AI will refuse to answer and politely redirect the customer.
                </p>

                {/* Tags List */}
                <div className="flex flex-wrap gap-1.5 min-h-[80px] p-2.5 bg-white rounded-xl border border-rose-200/60 max-h-48 overflow-y-auto custom-scrollbar">
                  {restrictedTopics.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 text-[11px] font-semibold border border-rose-200/80 shadow-2xs"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRestrictedTopic(tag)}
                        className="text-rose-600 hover:text-rose-900 cursor-pointer font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {restrictedTopics.length === 0 && (
                    <span className="text-[11px] text-slate-400 italic">No restricted topics added.</span>
                  )}
                </div>

                {/* Add Restricted Tag Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newRestrictedTag}
                    onChange={e => setNewRestrictedTag(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddRestrictedTopic(); } }}
                    placeholder="e.g. Competitor Price Inquiries..."
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-rose-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddRestrictedTopic}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
                  >
                    + Add Topic
                  </button>
                </div>
              </div>

            </div>

            {/* Strike & Escalation Policy Configuration */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Multi-Strike Escalation & Humble Warning Policy</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 1st Strike Humble Message */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">
                    1st Strike: Humble Scope Notice (Polite Warning) *
                  </label>
                  <textarea
                    rows={3}
                    value={guardrailWarningMessage}
                    onChange={e => setGuardrailWarningMessage(e.target.value)}
                    placeholder="Enter humble polite warning message..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-medium leading-relaxed resize-none"
                  />
                  <p className="text-[10.5px] text-slate-400">
                    Delivered when the visitor asks their first off-topic question.
                  </p>
                </div>

                {/* Handover Notice */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800">
                    Consecutive Breach: Human Handover Notice *
                  </label>
                  <textarea
                    rows={3}
                    value={guardrailHandoverMessage}
                    onChange={e => setGuardrailHandoverMessage(e.target.value)}
                    placeholder="Enter handover notification message..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-rose-500 font-medium leading-relaxed resize-none"
                  />
                  <p className="text-[10.5px] text-slate-400">
                    Delivered when the visitor breaches the strike threshold and AI pauses itself.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/80">
                {/* Max Strikes */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 text-xs">
                    Max Allowed Off-Topic Warnings Before AI Auto-Pause
                  </label>
                  <div className="flex items-center gap-3">
                    <select
                      value={maxOffTopicStrikes}
                      onChange={e => setMaxOffTopicStrikes(parseInt(e.target.value) || 2)}
                      className="p-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-xs"
                    >
                      <option value={1}>1 Warning (Auto-pause on 2nd off-topic query)</option>
                      <option value={2}>2 Warnings (Auto-pause on 3rd off-topic query)</option>
                      <option value={3}>3 Warnings (Auto-pause on 4th off-topic query)</option>
                    </select>
                  </div>
                </div>

                {/* Auto Pause Toggle */}
                <div className="flex items-center gap-3 pt-4 sm:pt-0">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoPauseOnBreach}
                      onChange={e => setAutoPauseOnBreach(e.target.checked)}
                      className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Auto-Pause AI & Route to Live Agent Inbox on Breach</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={isSavingGuardrails}
                onClick={handleSaveGuardrails}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 text-xs"
              >
                {isSavingGuardrails ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Save AI Guardrails & Rules</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: LIVE AI SIMULATOR & PLAYGROUND                                     */}
      {/* ========================================================================= */}
      {studioTab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chat Simulator (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[580px] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">{botName} (Simulation Mode)</div>
                  <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live RAG Knowledge Active
                  </div>
                </div>
              </div>

              <button
                onClick={() => setChatMessages([
                  {
                    sender: "ai",
                    text: "Hello! I am your pre-trained AI Assistant. Ask me any question about your products, pricing (BDT ৳), or business policies to test my answers in real-time."
                  }
                ])}
                className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold"
              >
                Clear Chat
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/40 text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {msg.sender === "user" ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <MarkdownMessage content={msg.text} className="text-slate-800 text-xs leading-relaxed" />
                    )}

                    {/* Sources Badge if any */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-500 space-y-1">
                        <div className="font-bold text-indigo-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Retrieved from Knowledge:
                        </div>
                        {msg.sources.map((s, sIdx) => (
                          <div key={sIdx} className="bg-slate-50 p-1.5 rounded border border-slate-100 font-mono text-[9.5px]">
                            • {s.title} (Match: {(s.similarity * 100).toFixed(0)}%)
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.latencyMs && (
                    <div className="text-[9.5px] text-slate-400 mt-1 font-mono">
                      {msg.latencyMs}ms • {msg.tokens} tokens
                    </div>
                  )}
                </div>
              ))}

              {isSimulating && (
                <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl w-fit text-slate-500 text-xs">
                  <div className="h-3 w-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  Generating answer using pre-trained knowledge...
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendSimulatorMessage} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder="Ask a question (e.g. 'What is the Enterprise plan price?' or 'Do you deliver to Mirpur?')..."
                className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isSimulating}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Suggestion Sandbox Questions (1 col) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 h-fit">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Test Questions
            </h3>
            <p className="text-xs text-slate-500">
              Click any question below to test how your AI retrieves answers from your trained knowledge:
            </p>

            <div className="space-y-2">
              {[
                "What is the Enterprise plan price in BDT?",
                "What are your delivery areas in Dhaka?",
                "How can I pay via bKash or Nagad?",
                "I want to speak with a human support agent."
              ].map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputMessage(q);
                  }}
                  className="w-full p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-left text-xs font-medium text-slate-700 transition-all"
                >
                  "{q}"
                </button>
              ))}
            </div>

            <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed">
              💡 <strong>Instant Pre-Training:</strong> When you add new documents in Tab 1, they are vectorized immediately into PostgreSQL. You can test them here instantly without needing to restart!
            </div>
          </div>

        </div>
      )}

      {/* MODAL: ADD KNOWLEDGE DOCUMENT */}
      {showIngestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Add Business Knowledge</h3>
                <p className="text-xs text-slate-500 mt-0.5">Vectorize product info & policies into PostgreSQL</p>
              </div>
              <button onClick={() => setShowIngestModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ingest Mode Tabs */}
            <div className="flex border-b border-slate-100 gap-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setIngestType("markdown")}
                className={`pb-2 border-b-2 ${ingestType === 'markdown' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}
              >
                Text / Document
              </button>
              <button
                type="button"
                onClick={() => setIngestType("faq")}
                className={`pb-2 border-b-2 ${ingestType === 'faq' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}
              >
                Q&A / FAQ Pair
              </button>
            </div>

            {ingestType === "markdown" ? (
              <form onSubmit={handleIngestText} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Document Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Return Policy & Delivery Areas"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 bg-white font-medium"
                  >
                    <option value="Products & Pricing">Products & Pricing</option>
                    <option value="Shipping & Delivery">Shipping & Delivery</option>
                    <option value="Policies & Terms">Policies & Terms</option>
                    <option value="Support FAQ">Support FAQ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Content / Details *</label>
                  <textarea
                    rows={6}
                    required
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Paste product specifications, prices in BDT (৳), delivery charges (e.g. ৳60 inside Dhaka, ৳120 outside), and return guidelines..."
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowIngestModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isIngesting}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2"
                  >
                    {isIngesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Train AI
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleIngestFAQ} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">FAQ Collection Title *</label>
                  <input
                    type="text"
                    required
                    value={faqTitle}
                    onChange={e => setFaqTitle(e.target.value)}
                    placeholder="e.g. General Customer Inquiries"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {faqItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <input
                        type="text"
                        placeholder={`Question ${idx + 1}`}
                        value={item.question}
                        onChange={e => {
                          const updated = [...faqItems];
                          updated[idx].question = e.target.value;
                          setFaqItems(updated);
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <textarea
                        rows={2}
                        placeholder={`Answer ${idx + 1}`}
                        value={item.answer}
                        onChange={e => {
                          const updated = [...faqItems];
                          updated[idx].answer = e.target.value;
                          setFaqItems(updated);
                        }}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setFaqItems([...faqItems, { question: "", answer: "" }])}
                  className="text-indigo-600 font-bold text-xs hover:underline"
                >
                  + Add Another Q&A Pair
                </button>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowIngestModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isIngesting}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2"
                  >
                    {isIngesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Train FAQ Collection
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
