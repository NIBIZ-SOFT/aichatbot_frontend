"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { Users, Plus, Search, Mail, Phone, Building2, Tag, X, RefreshCw } from "lucide-react";
import { Contact } from "../../types";
import { api } from "../../lib/api";

export default function ContactsView() {
  const { showToast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [tagInput, setTagInput] = useState("");

  const fetchContacts = async () => {
    try {
      const data = await api.getContacts();
      if (data && Array.isArray(data)) {
        setContacts(data);
      }
    } catch (e) {
      console.error("Failed to load contacts from DB:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter(c =>
    (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
    (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const newContact = await api.createContact({
        name,
        email: email || null,
        phone: phone || null,
        company: company || null,
        tags: tagInput ? tagInput.split(",").map(t => t.trim()).filter(Boolean) : ["Customer"]
      });

      setContacts(prev => [newContact, ...prev]);
      showToast("Contact Added", `${name} saved successfully`, "success");
      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setTagInput("");
      setShowModal(false);
    } catch (err) {
      console.error("Create contact error:", err);
      showToast("Error", "Could not save contact", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-5 h-5 text-blue-600 shrink-0" />
            <span>CRM Contacts & Leads</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Centralized contact directory with automatic AI lead capture.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Contact
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, company, email..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">{filteredContacts.length} Contacts</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading contacts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[550px]">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 px-6">Name</th>
                  <th className="p-3.5">Company</th>
                  <th className="p-3.5">Contact Info</th>
                  <th className="p-3.5">Tags</th>
                  <th className="p-3.5 px-6 text-right">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredContacts.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 px-6 font-semibold text-slate-900 flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-blue-50 text-blue-700 font-semibold flex items-center justify-center text-xs shrink-0">
                        {(c.name || "C").split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="truncate">{c.name}</span>
                    </td>
                    <td className="p-3.5 text-slate-600">{c.company || "—"}</td>
                    <td className="p-3.5 space-y-0.5">
                      {c.email && <div className="text-slate-800 font-medium">{c.email}</div>}
                      {c.phone && <div className="text-slate-500 text-[11px]">{c.phone}</div>}
                    </td>
                    <td className="p-3.5">
                      <div className="flex gap-1 flex-wrap">
                        {c.tags?.map((t, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200/60">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 px-6 text-right text-slate-400 font-mono text-[11px]">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : "Live"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Add New CRM Contact</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tanvir@example.com"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Phone Number (Bangladesh)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+880 1711-XXXXXX"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="e.g. Padma Mart"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  placeholder="VIP, Wholesale, bKash Payer"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
