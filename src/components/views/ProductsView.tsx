"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContext";
import { api } from "../../lib/api";
import { Product, ProductCreateInput } from "../../types";
import { 
  ShoppingBag, Plus, Search, Filter, Edit3, Trash2, Tag, 
  CheckCircle2, AlertTriangle, Sparkles, Layers, Package,
  DollarSign, ArrowUpRight, Image as ImageIcon, X, RefreshCw
} from "lucide-react";

export default function ProductsView() {
  const { showToast } = useToast();
  const { currentTheme } = useTheme();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStockStatus, setSelectedStockStatus] = useState("all");

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
    is_active: true
  });

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await api.getProducts({
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        search: searchQuery || undefined,
      });
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
      showToast("Error", "Could not load products catalog", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

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
      is_active: true
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
      is_active: product.is_active
    });
    setShowAddModal(true);
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
        const updated = await api.updateProduct(editingProduct.id, formData);
        setProducts(prev => prev.map(p => (p.id === editingProduct.id ? updated : p)));
        showToast("Product Updated", `"${updated.title}" updated and auto-synced with pgvector AI embeddings.`, "success");
      } else {
        const created = await api.createProduct(formData);
        setProducts(prev => [created, ...prev]);
        showToast("Product Created", `"${created.title}" added to catalog & 768-dim AI knowledge base.`, "success");
      }
      setShowAddModal(false);
    } catch (err: any) {
      console.error("Save product error:", err);
      showToast("Error", err.message || "Failed to save product", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.title}"? This will also remove it from the AI assistant knowledge base.`)) {
      return;
    }

    try {
      await api.deleteProduct(product.id);
      setProducts(prev => prev.filter(p => p.id !== product.id));
      showToast("Product Deleted", `"${product.title}" removed from catalog and AI vector database.`, "info");
    } catch (err: any) {
      console.error("Delete product error:", err);
      showToast("Delete Failed", err.message || "Failed to delete product", "error");
    }
  };

  // KPIs
  const totalProducts = products.length;
  const inStockCount = products.filter(p => p.stock_status === "in_stock").length;
  const lowStockCount = products.filter(p => p.stock_quantity <= 10 && p.stock_status === "in_stock").length;
  const avgPrice = totalProducts > 0 
    ? products.reduce((acc, p) => acc + p.selling_price, 0) / totalProducts 
    : 0;

  const categories = ["all", "Fashion", "Gadgets", "Lifestyle", "Groceries", "Books", "General"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans antialiased">
      
      {/* Top Header Banner themed dynamically */}
      <div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden transition-all"
        style={{
          backgroundColor: currentTheme.dark_card,
          borderColor: currentTheme.dark_border,
          boxShadow: `0 20px 40px -15px ${currentTheme.primary_color}15`
        }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
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
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <div 
              className="p-2.5 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: currentTheme.primary_color }}
            >
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span>E-Commerce Product Catalog</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl font-medium">
            Manage your store's inventory, MSRP & selling prices, specs, and live AI vector embeddings.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="relative z-10 px-5 py-3 rounded-2xl text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
          style={{
            backgroundColor: currentTheme.primary_color,
            boxShadow: `0 10px 25px -5px ${currentTheme.primary_color}50`
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>

        {/* Ambient background glow matching theme */}
        <div 
          className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: currentTheme.primary_color }}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          className="p-5 rounded-2xl border transition-all"
          style={{ backgroundColor: currentTheme.dark_card, borderColor: currentTheme.dark_border }}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>Total Catalog Items</span>
            <Package className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-black text-white">{totalProducts}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Synchronized with AI Knowledge
          </div>
        </div>

        <div 
          className="p-5 rounded-2xl border transition-all"
          style={{ backgroundColor: currentTheme.dark_card, borderColor: currentTheme.dark_border }}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>Active & In Stock</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{inStockCount}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Ready for instant in-chat orders
          </div>
        </div>

        <div 
          className="p-5 rounded-2xl border transition-all"
          style={{ backgroundColor: currentTheme.dark_card, borderColor: currentTheme.dark_border }}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>Low Stock Alert</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{lowStockCount}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Stock quantity &le; 10 units
          </div>
        </div>

        <div 
          className="p-5 rounded-2xl border transition-all"
          style={{ backgroundColor: currentTheme.dark_card, borderColor: currentTheme.dark_border }}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>Average Product Price</span>
            <Tag className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">৳{avgPrice.toLocaleString("en-US", { maximumFractionDigits: 0 })} <span className="text-xs text-slate-400 font-bold">BDT</span></div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Across active categories
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div 
        className="p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm"
        style={{ backgroundColor: currentTheme.dark_card, borderColor: currentTheme.dark_border }}
      >
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title, SKU or keyword..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-500 outline-none transition-all font-medium"
            style={{ borderColor: currentTheme.dark_border }}
          />
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all capitalize whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "text-white shadow-md"
                    : "text-slate-400 hover:text-white bg-slate-950/50 hover:bg-slate-900"
                }`}
                style={isSelected ? { backgroundColor: currentTheme.primary_color } : {}}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product List Table / Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mb-3" style={{ color: currentTheme.primary_color }} />
          <p className="text-xs font-medium">Loading store catalog & pgvector embeddings...</p>
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
            {searchQuery ? `No products matching "${searchQuery}" in this category.` : "Get started by adding your first product to activate live Conversational AI commerce."}
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
                  <th className="px-6 py-4">Product Details</th>
                  <th className="px-6 py-4">Category & SKU</th>
                  <th className="px-6 py-4">Price (BDT)</th>
                  <th className="px-6 py-4">Stock Status</th>
                  <th className="px-6 py-4">AI Vector RAG</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {products.map(p => {
                  const hasDiscount = p.unit_price > p.selling_price && p.selling_price > 0;
                  const discountPercent = hasDiscount ? Math.round(((p.unit_price - p.selling_price) / p.unit_price) * 100) : 0;
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition-colors group">
                      {/* Product Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0 relative">
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
                        <div className="font-mono text-[11px] text-slate-400">
                          {p.sku || "N/A"}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4">
                        <div className="font-black text-white text-sm">
                          ৳{p.selling_price.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold">BDT</span>
                        </div>
                        {hasDiscount && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-slate-500 line-through text-[11px]">৳{p.unit_price.toLocaleString()}</span>
                            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-1.5 py-0.2 rounded border border-emerald-500/20">
                              -{discountPercent}%
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Stock Status */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            p.stock_status === "in_stock" ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                          }`} />
                          <span className="text-white capitalize font-semibold">
                            {p.stock_status === "in_stock" ? `${p.stock_quantity} in stock` : "Out of Stock"}
                          </span>
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
                    type="number"
                    min="0"
                    placeholder="2500"
                    value={formData.unit_price}
                    onChange={e => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">Selling / Offer Price (৳) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="2190"
                    value={formData.selling_price}
                    onChange={e => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-emerald-400 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-300">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={e => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-300">Product Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.images[0] || ""}
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
