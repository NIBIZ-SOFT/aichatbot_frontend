"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContext";
import { api } from "../../lib/api";
import { Product, ProductCreateInput } from "../../types";
import {
  ShoppingBag, Plus, Search, Edit3, Trash2, Tag,
  CheckCircle2, AlertTriangle, Sparkles, Package,
  Image as ImageIcon, X, RefreshCw, ChevronUp, ChevronDown,
  ChevronsUpDown, Star, ArrowUpDown, Trophy
} from "lucide-react";

type SortField = "title" | "selling_price" | "stock_quantity" | "priority" | "created_at";
type SortDir = "asc" | "desc";

export default function ProductsView() {
  const { showToast } = useToast();
  const { currentTheme } = useTheme();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortField>("priority");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Priority editing state
  const [editingPriority, setEditingPriority] = useState<string | null>(null);
  const [priorityInputVal, setPriorityInputVal] = useState<string>("");
  const priorityInputRef = useRef<HTMLInputElement>(null);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);

  // Form State
  const [formData, setFormData] = useState<ProductCreateInput>({
    title: "",
    category: "Fashion",
    sku: "",
    unit_price: 0,
    selling_price: 0,
    stock_quantity: 100,
    stock_status: "in_stock",
    images: [""],
    description: "",
    specifications: {},
    is_active: true,
    priority: 0,
  });

  const fetchProducts = useCallback(async (sb?: SortField, sd?: SortDir, sq?: string, cat?: string) => {
    try {
      setIsLoading(true);
      const catFilter = (cat ?? selectedCategory) !== "all" ? (cat ?? selectedCategory) : undefined;
      const data = await api.getProducts({
        category: catFilter,
        search: (sq ?? searchQuery) || undefined,
        sort_by: sb ?? sortBy,
        sort_dir: sd ?? sortDir,
      });
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
      showToast("Error", "Could not load products catalog", "error");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery, sortBy, sortDir]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, sortDir]);

  // Debounced search
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout>>();
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      fetchProducts(undefined, undefined, val, undefined);
    }, 400);
  };

  // Column sort toggler
  const handleSort = (field: SortField) => {
    if (field === sortBy) {
      const newDir: SortDir = sortDir === "asc" ? "desc" : "asc";
      setSortDir(newDir);
      fetchProducts(field, newDir);
    } else {
      setSortBy(field);
      const defaultDir: SortDir = field === "priority" ? "asc" : "desc";
      setSortDir(defaultDir);
      fetchProducts(field, defaultDir);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (field !== sortBy) return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3.5 h-3.5" style={{ color: currentTheme.primary_color }} />
      : <ChevronDown className="w-3.5 h-3.5" style={{ color: currentTheme.primary_color }} />;
  };

  // Priority inline editor
  const startEditPriority = (p: Product) => {
    setEditingPriority(p.id);
    setPriorityInputVal(p.priority > 0 ? String(p.priority) : "");
    setTimeout(() => priorityInputRef.current?.focus(), 50);
  };

  const commitPriorityEdit = async (productId: string) => {
    const val = parseInt(priorityInputVal, 10);
    const priority = isNaN(val) || val < 0 ? 0 : val;
    setEditingPriority(null);
    try {
      const updated = await api.setProductPriority(productId, priority);
      // Re-fetch to reflect cascade reorder
      await fetchProducts();
      showToast(
        priority > 0 ? "Priority Set" : "Priority Removed",
        priority > 0
          ? `Product moved to rank #${priority}. Others auto-shifted.`
          : "Product removed from priority ranking.",
        "success"
      );
    } catch (err: any) {
      showToast("Error", err.message || "Could not update priority", "error");
    }
  };

  // Modal handlers
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      title: "",
      category: "Fashion",
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      unit_price: 2500,
      selling_price: 2190,
      stock_quantity: 50,
      stock_status: "in_stock",
      images: ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80"],
      description: "",
      specifications: { "Material": "Cotton", "Sizes": "M, L, XL" },
      tags: [],
      is_active: true,
      priority: 0,
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      category: product.category,
      sku: product.sku || "",
      unit_price: product.unit_price,
      selling_price: product.selling_price,
      stock_quantity: product.stock_quantity,
      stock_status: product.stock_status,
      images: product.images.length > 0 ? product.images : [""],
      description: product.description || "",
      specifications: product.specifications || {},
      tags: product.tags || [],
      is_active: product.is_active,
      priority: product.priority,
    });
    setShowAddModal(true);
  };

  const handleGenerateAiTags = async () => {
    if (!formData.title.trim()) {
      showToast("Validation", "Please enter a product title first", "info");
      return;
    }
    try {
      setIsGeneratingTags(true);
      const res = await api.generateProductTags({
        title: formData.title,
        category: formData.category,
        description: formData.description,
        specifications: formData.specifications
      });
      if (res && res.tags) {
        setFormData(prev => ({ ...prev, tags: res.tags }));
        showToast("AI Auto-Tagging Complete", `Generated ${res.tags.length} search keywords & synonyms!`, "success");
      }
    } catch (err: any) {
      showToast("Error", err.message || "Failed to generate AI tags", "error");
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Validation Error", "Product title is required", "error");
      return;
    }
    try {
      setIsSaving(true);
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
        await fetchProducts();
        showToast("Product Updated", `"${formData.title}" updated and auto-synced with pgvector AI embeddings.`, "success");
      } else {
        await api.createProduct(formData);
        await fetchProducts();
        showToast("Product Created", `"${formData.title}" added to catalog & 768-dim AI knowledge base.`, "success");
      }
      setShowAddModal(false);
    } catch (err: any) {
      showToast("Error", err.message || "Failed to save product", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.title}"? This will also remove it from the AI assistant knowledge base.`)) return;
    try {
      await api.deleteProduct(product.id);
      setProducts(prev => prev.filter(p => p.id !== product.id));
      showToast("Product Deleted", `"${product.title}" removed from catalog and AI vector database.`, "info");
    } catch (err: any) {
      showToast("Delete Failed", err.message || "Failed to delete product", "error");
    }
  };

  // KPIs
  const totalProducts = products.length;
  const inStockCount = products.filter(p => p.stock_status === "in_stock").length;
  const lowStockCount = products.filter(p => p.stock_quantity <= 10 && p.stock_status === "in_stock").length;
  const rankedCount = products.filter(p => p.priority > 0).length;

  const categories = ["all", "Fashion", "Gadgets", "Lifestyle", "Groceries", "Books", "General"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans antialiased">

      {/* Top Header Banner */}
      <div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden transition-all"
        style={{
          backgroundColor: currentTheme.dark_card,
          borderColor: currentTheme.dark_border,
          boxShadow: `0 20px 40px -15px ${currentTheme.primary_color}15`
        }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className="text-[10px] font-extrabold px-3 py-1 rounded-full border uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
              style={{
                backgroundColor: `${currentTheme.primary_color}15`,
                color: currentTheme.primary_color,
                borderColor: `${currentTheme.primary_color}35`
              }}
            >
              <Sparkles className="w-3 h-3 animate-pulse" />
              {currentTheme.name || "Curated Theme Active"}
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Live pgvector RAG Sync
            </span>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Smart Priority Ordering
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <div
              className="p-2 sm:p-2.5 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0"
              style={{ backgroundColor: currentTheme.primary_color }}
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span>E-Commerce Product Catalog</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl font-medium">
            Manage inventory, prices, specs, and drag-rank products to control CDN widget display order.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="relative z-10 w-full sm:w-auto px-5 py-3 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          style={{
            backgroundColor: currentTheme.primary_color,
            boxShadow: `0 10px 25px -5px ${currentTheme.primary_color}50`
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
        <div
          className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: currentTheme.primary_color }}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Catalog Items", value: totalProducts, icon: <Package className="w-4 h-4 text-slate-500" />, sub: "Synchronized with AI Knowledge", color: "text-white" },
          { label: "Active & In Stock", value: inStockCount, icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, sub: "Ready for instant in-chat orders", color: "text-emerald-400" },
          { label: "Low Stock Alert", value: lowStockCount, icon: <AlertTriangle className="w-4 h-4 text-amber-400" />, sub: "Stock quantity ≤ 10 units", color: "text-amber-400" },
          { label: "Priority Ranked", value: rankedCount, icon: <Trophy className="w-4 h-4 text-violet-400" />, sub: "Shown first in CDN widget", color: "text-violet-400" },
        ].map((kpi, i) => (
          <div
            key={i}
            className="p-4 sm:p-5 rounded-2xl border transition-all"
            style={{ backgroundColor: currentTheme.dark_card, borderColor: currentTheme.dark_border }}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
              <span className="truncate">{kpi.label}</span>
              {kpi.icon}
            </div>
            <div className={`text-xl sm:text-2xl font-black ${kpi.color}`}>{kpi.value}</div>
            <div className="text-[10.5px] text-slate-500 mt-1 font-medium truncate">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter, Search & Sort Bar */}
      <div
        className="p-4 rounded-2xl border flex flex-col gap-3 shadow-sm"
        style={{ backgroundColor: currentTheme.dark_card, borderColor: currentTheme.dark_border }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by title, SKU, or category..."
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-500 outline-none transition-all font-medium"
              style={{ borderColor: currentTheme.dark_border }}
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1.5 md:pb-0 custom-scrollbar-horizontal flex-nowrap sm:flex-wrap">
            {categories.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all capitalize whitespace-nowrap cursor-pointer shrink-0 ${
                    isSelected ? "text-white shadow-md" : "text-slate-400 hover:text-white bg-slate-950/50 hover:bg-slate-900"
                  }`}
                  style={isSelected ? { backgroundColor: currentTheme.primary_color } : {}}
                >
                  {cat === "all" ? "All Categories" : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort Quick-Access Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1"><ArrowUpDown className="w-3.5 h-3.5" /> Quick Sort:</span>
          {([
            { key: "priority", label: "🏆 Priority" },
            { key: "title", label: "A→Z Title" },
            { key: "selling_price", label: "৳ Price" },
            { key: "stock_quantity", label: "📦 Stock" },
            { key: "created_at", label: "🕐 Newest" },
          ] as { key: SortField; label: string }[]).map(s => {
            const isActive = sortBy === s.key;
            return (
              <button
                key={s.key}
                onClick={() => handleSort(s.key)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                  isActive
                    ? "text-white border-transparent"
                    : "text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                }`}
                style={isActive ? { backgroundColor: currentTheme.primary_color } : {}}
              >
                {s.label}
                {isActive && (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mb-3" style={{ color: currentTheme.primary_color }} />
          <p className="text-xs font-medium">Loading store catalog...</p>
        </div>
      ) : products.length === 0 ? (
        <div
          className="text-center py-20 rounded-3xl border border-dashed p-8"
          style={{ backgroundColor: currentTheme.dark_card, borderColor: currentTheme.dark_border }}
        >
          <div
            className="p-4 rounded-2xl w-14 h-14 mx-auto mb-3 flex items-center justify-center shadow-lg"
            style={{ backgroundColor: `${currentTheme.primary_color}15`, color: currentTheme.primary_color }}
          >
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No products found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4 font-medium">
            {searchQuery ? `No products matching "${searchQuery}".` : "Get started by adding your first product."}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-105"
            style={{ backgroundColor: currentTheme.primary_color }}
          >
            + Add First Product
          </button>
        </div>
      ) : (
        <div
          className="rounded-3xl border overflow-hidden shadow-sm"
          style={{ backgroundColor: currentTheme.dark_card, borderColor: currentTheme.dark_border }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800/80">
                <tr>
                  {/* Priority column */}
                  <th
                    className="px-4 py-4 cursor-pointer hover:text-white group transition-colors select-none"
                    onClick={() => handleSort("priority")}
                  >
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      Priority
                      <SortIcon field="priority" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer hover:text-white group transition-colors select-none"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center gap-1.5">
                      Product Details
                      <SortIcon field="title" />
                    </div>
                  </th>
                  <th className="px-6 py-4">Category & SKU</th>
                  <th
                    className="px-6 py-4 cursor-pointer hover:text-white group transition-colors select-none"
                    onClick={() => handleSort("selling_price")}
                  >
                    <div className="flex items-center gap-1.5">
                      Price (BDT)
                      <SortIcon field="selling_price" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer hover:text-white group transition-colors select-none"
                    onClick={() => handleSort("stock_quantity")}
                  >
                    <div className="flex items-center gap-1.5">
                      Stock Status
                      <SortIcon field="stock_quantity" />
                    </div>
                  </th>
                  <th className="px-6 py-4">AI Vector RAG</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {products.map((p, idx) => {
                  const hasDiscount = p.unit_price > p.selling_price && p.selling_price > 0;
                  const discountPercent = hasDiscount ? Math.round(((p.unit_price - p.selling_price) / p.unit_price) * 100) : 0;
                  const isEditingThisPriority = editingPriority === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition-colors group">
                      {/* Priority Cell */}
                      <td className="px-4 py-4">
                        {isEditingThisPriority ? (
                          <div className="flex items-center gap-1">
                            <input
                              ref={priorityInputRef}
                              type="number"
                              min="0"
                              className="w-14 px-2 py-1.5 bg-slate-950 border rounded-lg text-white text-xs font-bold outline-none text-center"
                              style={{ borderColor: currentTheme.primary_color }}
                              value={priorityInputVal}
                              onChange={e => setPriorityInputVal(e.target.value)}
                              onBlur={() => commitPriorityEdit(p.id)}
                              onKeyDown={e => {
                                if (e.key === "Enter") commitPriorityEdit(p.id);
                                if (e.key === "Escape") setEditingPriority(null);
                              }}
                            />
                            <button
                              className="text-emerald-400 hover:text-emerald-300"
                              onMouseDown={e => { e.preventDefault(); commitPriorityEdit(p.id); }}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditPriority(p)}
                            title="Click to set display priority rank"
                            className="group/rank flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            {p.priority > 0 ? (
                              <span
                                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-white shadow-md transition-transform group-hover/rank:scale-110"
                                style={{ backgroundColor: currentTheme.primary_color }}
                              >
                                #{p.priority}
                              </span>
                            ) : (
                              <span className="w-7 h-7 rounded-full flex items-center justify-center border-2 border-dashed border-slate-700 group-hover/rank:border-slate-500 transition-colors">
                                <Star className="w-3 h-3 text-slate-600 group-hover/rank:text-slate-400 transition-colors" />
                              </span>
                            )}
                            <span className="text-[10px] text-slate-600 group-hover/rank:text-slate-400 transition-colors opacity-0 group-hover/rank:opacity-100">
                              {p.priority > 0 ? "Edit" : "Set rank"}
                            </span>
                          </button>
                        )}
                      </td>

                      {/* Product Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0">
                            {p.images && p.images[0] ? (
                              <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-600">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <div className="text-white font-bold truncate group-hover:text-cyan-300 transition-colors">
                              {p.title}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {p.description || "No description provided"}
                            </div>
                            {p.tags && p.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {p.tags.slice(0, 3).map((t, tIdx) => (
                                  <span key={tIdx} className="text-[9.5px] font-mono px-1.5 py-0.5 bg-indigo-950/40 text-indigo-300 rounded border border-indigo-500/20">
                                    #{t}
                                  </span>
                                ))}
                                {p.tags.length > 3 && (
                                  <span className="text-[9.5px] text-slate-500 font-mono self-center">
                                    +{p.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category & SKU */}
                      <td className="px-6 py-4">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-md font-bold text-[10px] border mb-1"
                          style={{
                            backgroundColor: `${currentTheme.primary_color}10`,
                            color: currentTheme.primary_color,
                            borderColor: `${currentTheme.primary_color}30`
                          }}
                        >
                          {p.category}
                        </span>
                        <div className="font-mono text-[11px] text-slate-400">{p.sku || "N/A"}</div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4">
                        <div className="font-black text-white text-sm">
                          ৳{p.selling_price.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold">BDT</span>
                        </div>
                        {hasDiscount && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-slate-500 line-through text-[11px]">৳{p.unit_price.toLocaleString()}</span>
                            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-1.5 rounded border border-emerald-500/20">
                              -{discountPercent}%
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Stock Status */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${p.stock_status === "in_stock" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                          <span className="text-white capitalize font-semibold">
                            {p.stock_status === "in_stock" ? `${p.stock_quantity} in stock` : "Out of Stock"}
                          </span>
                          {p.stock_quantity <= 10 && p.stock_status === "in_stock" && (
                            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-bold">Low</span>
                          )}
                        </div>
                      </td>

                      {/* AI Vector RAG Badge */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>pgvector 768d</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-950/60 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-400 bg-slate-950/60 hover:bg-red-950/30 border border-slate-800 hover:border-red-500/30 transition-all cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          <div className="px-6 py-3 border-t border-slate-800/50 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Showing {products.length} product{products.length !== 1 ? "s" : ""}</span>
            <span className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-500" />
              {rankedCount} priority-ranked · {products.length - rankedCount} unranked
            </span>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div
            className="rounded-3xl border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200"
            style={{ backgroundColor: currentTheme.dark_card, borderColor: currentTheme.dark_border }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div
                  className="p-2 rounded-xl text-white shadow-md"
                  style={{ backgroundColor: currentTheme.primary_color }}
                >
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingProduct ? "Edit Product Details" : "Add New Product"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Product will automatically sync with PostgreSQL pgvector live embeddings.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-950 border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-300">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Men's Premium Cotton Panjabi Collection"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Fashion">Fashion & Apparel</option>
                    <option value="Gadgets">Gadgets & Electronics</option>
                    <option value="Lifestyle">Lifestyle & Accessories</option>
                    <option value="Groceries">Groceries & Daily Essentials</option>
                    <option value="Books">Books & Stationery</option>
                    <option value="General">General Retail</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">SKU Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SKU-PANJ-01"
                    value={formData.sku || ""}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">Unit Price / MSRP (৳)</label>
                  <input
                    type="number" min="0"
                    placeholder="2500"
                    value={formData.unit_price}
                    onChange={e => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">Selling / Offer Price (৳) *</label>
                  <input
                    type="number" min="0" required
                    placeholder="2190"
                    value={formData.selling_price}
                    onChange={e => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">Stock Quantity</label>
                  <input
                    type="number" min="0"
                    value={formData.stock_quantity}
                    onChange={e => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Priority Field */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-300 flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  CDN Widget Display Priority
                  <span className="text-[10px] font-normal text-slate-500">(1 = shown first, 0 = unranked / newest-first)</span>
                </label>
                <input
                  type="number" min="0"
                  placeholder="0 (unranked)"
                  value={formData.priority ?? 0}
                  onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-amber-500/30 rounded-xl text-amber-300 font-bold outline-none focus:border-amber-500"
                />
                <p className="text-[11px] text-slate-500">
                  Setting priority 1 will move this product to the top of the widget catalog. Existing products auto-shift.
                </p>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-300">Product Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.images?.[0] || ""}
                  onChange={e => setFormData({ ...formData, images: [e.target.value] })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-300">Description & Specifications</label>
                <textarea
                  rows={3}
                  placeholder="Describe material, warranty, sizing guide, or package contents for the AI..."
                  value={formData.description || ""}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              {/* Multilingual AI Search Keywords & Tags */}
              <div className="space-y-2 p-4 bg-indigo-950/20 rounded-2xl border border-indigo-500/20">
                <div className="flex justify-between items-center">
                  <label className="block font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    AI Search Keywords & Multilingual Tags
                  </label>
                  <button
                    type="button"
                    disabled={isGeneratingTags || !formData.title.trim()}
                    onClick={handleGenerateAiTags}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    {isGeneratingTags ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    <span>{isGeneratingTags ? "Generating..." : "✨ Auto-Generate with AI"}</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. smartwatch, watch, ঘড়ি, স্মার্টওয়াচ, fitness tracker, gadget (comma separated)"
                  value={formData.tags?.join(", ") || ""}
                  onChange={e => setFormData({ 
                    ...formData, 
                    tags: e.target.value.split(",").map(t => t.trim().toLowerCase()).filter(Boolean) 
                  })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-indigo-200 font-mono text-xs outline-none focus:border-indigo-500"
                />
                <p className="text-[10.5px] text-slate-400">
                  Tip: Leave empty to auto-generate keywords on save, or click "✨ Auto-Generate with AI" to preview and customize keywords now.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold rounded-xl border border-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor: currentTheme.primary_color,
                    boxShadow: `0 10px 20px -5px ${currentTheme.primary_color}40`
                  }}
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{isSaving ? "Saving & Syncing AI..." : (editingProduct ? "Update Product" : "Create Product")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
