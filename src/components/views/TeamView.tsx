"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import {
  Users, Plus, Shield, Mail, CheckCircle2, X, RefreshCw,
  Edit2, Trash2, ShieldCheck, Headphones, TrendingUp, Wrench,
  Eye, AlertTriangle, Sparkles, UserCheck, Lock
} from "lucide-react";
import { api } from "../../lib/api";

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  department?: string | null;
  is_active: boolean;
  is_online?: boolean;
  created_at: string;
}

interface SeatsSummary {
  total_members: number;
  max_seats: number;
  seats_available: number;
  is_limit_reached: boolean;
  members: TeamMember[];
}

export default function TeamView() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [summary, setSummary] = useState<SeatsSummary>({
    total_members: 0,
    max_seats: 4,
    seats_available: 4,
    is_limit_reached: false,
    members: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("DemoPass123!");
  const [role, setRole] = useState("support_agent");
  const [department, setDepartment] = useState("Customer Support");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Role Modal State
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("support_agent");
  const [editDept, setEditDept] = useState("Customer Support");
  const [editActive, setEditActive] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchTeam = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTeamSeatsSummary();
      setSummary(data);
    } catch (e: any) {
      console.error("Failed to load team from DB:", e);
      showToast("Error", "Could not load team members.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  // 1. Handle Adding New Member (Max 4 rule enforced by backend)
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (summary.total_members >= summary.max_seats) {
      showToast("Seat Limit Reached", "Your organization has reached the maximum 4-member limit.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createTeamMember({
        full_name: name,
        email: email,
        password: password,
        role: role,
        department: department
      });

      showToast("Member Added", `Successfully registered ${name} to your organization team.`, "success");
      setName("");
      setEmail("");
      setPassword("DemoPass123!");
      setShowInviteModal(false);
      fetchTeam();
    } catch (err: any) {
      console.error(err);
      showToast("Error", err.message || "Failed to add team member", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Open Edit Role Modal
  const handleOpenEdit = (m: TeamMember) => {
    setEditingMember(m);
    setEditName(m.full_name);
    setEditRole(m.role);
    setEditDept(m.department || "Customer Support");
    setEditActive(m.is_active);
  };

  // 3. Save Role / Dept Changes
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    setIsUpdating(true);
    try {
      await api.updateTeamMember(editingMember.id, {
        full_name: editName,
        role: editRole,
        department: editDept,
        is_active: editActive
      });

      showToast("Role Updated", `Updated ${editName}'s role and permissions.`, "success");
      setEditingMember(null);
      fetchTeam();
    } catch (err: any) {
      console.error(err);
      showToast("Error", err.message || "Failed to update member role", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // 4. Delete / Remove Member (Frees up a seat)
  const handleDeleteMember = async (m: TeamMember) => {
    if (m.id === user?.id) {
      showToast("Action Forbidden", "You cannot remove your own active owner account.", "error");
      return;
    }

    if (!confirm(`Are you sure you want to remove "${m.full_name}" from your organization? This will free up 1 team seat.`)) {
      return;
    }

    try {
      await api.deleteTeamMember(m.id);
      showToast("Member Removed", `${m.full_name} has been removed. 1 seat is now available.`, "info");
      fetchTeam();
    } catch (err: any) {
      console.error(err);
      showToast("Error", err.message || "Failed to delete team member", "error");
    }
  };

  const getRoleBadge = (roleName: string, dept: string | null = "") => {
    const d = (dept || "").toLowerCase();
    if (roleName === "tenant_owner" || roleName === "tenant_admin") {
      return { label: "Organization Owner", icon: ShieldCheck, color: "text-amber-700 bg-amber-50 border-amber-200" };
    }
    if (roleName === "support_agent" && d.includes("tech")) {
      return { label: "Technical Support", icon: Wrench, color: "text-purple-700 bg-purple-50 border-purple-200" };
    }
    if (roleName === "support_agent") {
      return { label: "Customer Support", icon: Headphones, color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    }
    if (roleName === "sales_agent") {
      return { label: "Sales Representative", icon: TrendingUp, color: "text-cyan-700 bg-cyan-50 border-cyan-200" };
    }
    if (roleName === "viewer") {
      return { label: "Analytics Viewer", icon: Eye, color: "text-slate-700 bg-slate-100 border-slate-200" };
    }
    return { label: roleName.replace("_", " "), icon: UserCheck, color: "text-indigo-700 bg-indigo-50 border-indigo-200" };
  };

  const capacityPercent = Math.min(100, Math.round((summary.total_members / summary.max_seats) * 100));

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-8">
      {/* Header with Title & Add Member CTA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
              <Lock className="w-3 h-3 text-indigo-600" /> Multi-Tenant Scoped
            </span>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
              Max 4 Seats Rule Active
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 shrink-0" />
            <span>Team Members & RBAC</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your organization's staff, assign support/sales roles, and customize permissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={fetchTeam}
            disabled={isLoading}
            className="p-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer shrink-0"
            title="Refresh Team Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowInviteModal(true)}
            disabled={summary.is_limit_reached}
            className={`flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
              summary.is_limit_reached
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{summary.is_limit_reached ? "Seat Limit Reached (4/4)" : "Add Team Member"}</span>
          </button>
        </div>
      </div>

      {/* Seat Utilization & Quota Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Organization Seat Utilization</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              summary.is_limit_reached ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}>
              {summary.total_members} / {summary.max_seats} Seats Used ({capacityPercent}%)
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {summary.is_limit_reached 
              ? "All 4 available seats are currently assigned. Remove an inactive member to invite a new staff member."
              : `${summary.seats_available} seat${summary.seats_available > 1 ? 's' : ''} available to invite new staff members.`}
          </p>
        </div>

        <div className="w-full sm:w-64 space-y-1.5 shrink-0">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="font-bold text-slate-700">{summary.total_members} Assigned</span>
            <span className="text-slate-400">{summary.seats_available} Remaining</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/60">
            <div
              className={`h-full rounded-full transition-all ${
                summary.is_limit_reached ? 'bg-amber-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            Loading isolated organization members...
          </div>
        ) : summary.members.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No team members found in your organization.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100 text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-6">Staff Member</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Assigned Role</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {summary.members.map(m => {
                  const badge = getRoleBadge(m.role, m.department);
                  const BadgeIcon = badge.icon;
                  const isCurrentUser = m.id === user?.id;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-6 font-bold text-slate-900 flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold flex items-center justify-center text-xs shadow-sm shadow-indigo-600/20 shrink-0">
                          {(m.full_name || "M").split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span>{m.full_name}</span>
                            {isCurrentUser && (
                              <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-200">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            Joined {new Date(m.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {m.email}
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 w-fit ${badge.color}`}>
                          <BadgeIcon className="w-3.5 h-3.5 shrink-0" />
                          {badge.label}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {m.department || "Operations"}
                      </td>

                      {/* Online / Active Status */}
                      <td className="py-3.5 px-4">
                        <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 w-max ${
                          m.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${m.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          {m.is_active ? "Active" : "Disabled"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-all"
                            title="Edit Role & Department"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {!isCurrentUser && (
                            <button
                              onClick={() => handleDeleteMember(m)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition-all"
                              title="Remove Member (Free up 1 seat)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Add Team Member (Max 4 Limit Enforced) */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Add Organization Team Member</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Seat {summary.total_members + 1} of {summary.max_seats} (Max 4 Members)
                </p>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Rachel Adams"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="rachel@acmedigital.example"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Temporary Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Role</label>
                  <select
                    value={role}
                    onChange={e => {
                      const r = e.target.value;
                      setRole(r);
                      if (r === "support_agent") setDepartment("Customer Support");
                      if (r === "sales_agent") setDepartment("Sales");
                      if (r === "viewer") setDepartment("Analytics");
                      if (r === "tenant_owner") setDepartment("Executive");
                    }}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 bg-white font-medium"
                  >
                    <option value="support_agent">Customer Support</option>
                    <option value="sales_agent">Sales Representative</option>
                    <option value="viewer">Analytics Viewer</option>
                    <option value="tenant_owner">Organization Owner</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="Customer Support"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Register Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Member Role & Permissions */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Edit Member Role & Department</h3>
                <p className="text-xs text-slate-500 mt-0.5">{editingMember.email}</p>
              </div>
              <button onClick={() => setEditingMember(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role / Permissions</label>
                  <select
                    value={editRole}
                    onChange={e => setEditRole(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 bg-white font-medium"
                  >
                    <option value="support_agent">Customer Support</option>
                    <option value="sales_agent">Sales Representative</option>
                    <option value="viewer">Analytics Viewer</option>
                    <option value="tenant_owner">Organization Owner</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={editDept}
                    onChange={e => setEditDept(e.target.value)}
                    placeholder="e.g. Technical Support"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editActive}
                    onChange={e => setEditActive(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-semibold text-slate-700">Account Active (Permit login to workspace)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
