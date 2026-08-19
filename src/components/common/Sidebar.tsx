"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, MessageSquare, Users, Globe,
  BarChart3, Cpu, UserPlus, Settings, CreditCard, Sparkles, LogOut,
  ShieldCheck, Headphones, TrendingUp, Wrench, Eye, Building2,
  DollarSign, Activity, Shield, Package, Tag, Layers, Palette, Bot, FileText,
  ShoppingBag
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { UserRole } from "../../types";

interface SidebarProps {
  activeNav?: string;
  onSelectNav?: (nav: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  route: string;
  icon: React.ElementType;
  badge?: string;
  checkPermission?: (role?: UserRole, dept?: string | null) => boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export default function Sidebar({ activeNav, onSelectNav }: SidebarProps) {
  const { user, logout } = useAuth();
  const { currentTheme } = useTheme();
  const pathname = usePathname() || "";
  const role = user?.role;
  const dept = user?.department?.toLowerCase() || "";
  const enabledModules = user?.enabled_modules || {};

  const isSuperAdmin = role === "super_admin";
  const isOwner = role === "tenant_owner" || role === "tenant_admin";
  const isTechSupport = role === "support_agent" && dept.includes("tech");
  const isCustomerSupport = role === "support_agent" && !dept.includes("tech");
  const isSales = role === "sales_agent";
  const isViewer = role === "viewer";

  // Dedicated Navigation for Platform Super Admin
  const superAdminNavGroups: NavGroup[] = [
    {
      title: "LIVE SUPPORT & STUDIO",
      items: [
        {
          id: "inbox",
          label: "Support Live Inbox",
          route: "/inbox",
          icon: MessageSquare,
          badge: "Live"
        },
        {
          id: "assistants",
          label: "AI Assistants Studio",
          route: "/assistants",
          icon: Bot
        },
        {
          id: "knowledge",
          label: "RAG Knowledge Base",
          route: "/knowledge",
          icon: FileText
        },
        {
          id: "websites",
          label: "Storefront & Widgets",
          route: "/websites",
          icon: Globe
        }
      ]
    },
    {
      title: "PLATFORM MASTER CONTROL",
      items: [
        {
          id: "superadmin",
          label: "Global SaaS Overview",
          route: "/superadmin",
          icon: ShieldCheck,
          badge: "Master"
        },
        {
          id: "tenants",
          label: "Subscribed Tenants",
          route: "/superadmin/tenants",
          icon: Building2
        },
        {
          id: "plans",
          label: "SaaS Plans & Pricing",
          route: "/superadmin/plans",
          icon: Package,
          badge: "Pricing"
        },
        {
          id: "coupons",
          label: "Coupons & Discounts",
          route: "/superadmin/coupons",
          icon: Tag,
          badge: "Promo"
        },
        {
          id: "revenue",
          label: "MRR & Revenue Analytics",
          route: "/superadmin/revenue",
          icon: DollarSign
        },
        {
          id: "bkash",
          label: "bKash PGW Gateway",
          route: "/superadmin/bkash",
          icon: CreditCard,
          badge: "bKash"
        },
        {
          id: "infrastructure",
          label: "AI Infrastructure",
          route: "/superadmin/infrastructure",
          icon: Cpu
        },
        {
          id: "audit",
          label: "Audit & Security Logs",
          route: "/superadmin/audit",
          icon: ShieldCheck
        },
        {
          id: "theme",
          label: "Theme & Branding",
          route: "/superadmin/theme",
          icon: Palette,
          badge: "Theme"
        }
      ]
    }
  ];

  // Client Organizations Navigation
  const clientNavGroups: NavGroup[] = [
    {
      title: "MAIN",
      items: [
        { 
          id: "dashboard", 
          label: "Dashboard", 
          route: "/dashboard",
          icon: LayoutDashboard,
          checkPermission: () => true 
        },
        { 
          id: "inbox", 
          label: "Support Inbox", 
          route: "/support-inbox",
          icon: MessageSquare,
          badge: "Live",
          checkPermission: () => true 
        },
        { 
          id: "contacts", 
          label: "Customers & Leads", 
          route: "/contacts",
          icon: Users,
          checkPermission: (r) => isOwner || isCustomerSupport || isSales 
        }
      ]
    },
    {
      title: "E-COMMERCE STORE",
      items: [
        { 
          id: "products", 
          label: "Product Catalog", 
          route: "/products",
          icon: ShoppingBag,
          checkPermission: () => isOwner || isSales || isCustomerSupport 
        },
        { 
          id: "orders", 
          label: "Order Management", 
          route: "/orders",
          icon: Package,
          badge: "Orders",
          checkPermission: () => isOwner || isSales || isCustomerSupport 
        }
      ]
    },
    {
      title: "AI & KNOWLEDGE",
      items: [
        { 
          id: "assistants", 
          label: "AI Assistants", 
          route: "/assistants",
          icon: Sparkles,
          checkPermission: (r) => isOwner || isTechSupport 
        },
        { 
          id: "knowledge", 
          label: "RAG Knowledge Base", 
          route: "/knowledge",
          icon: Cpu,
          checkPermission: (r) => isOwner || isCustomerSupport || isTechSupport 
        },
        { 
          id: "websites", 
          label: "Storefront Widgets", 
          route: "/websites",
          icon: Globe,
          checkPermission: (r) => isOwner 
        }
      ]
    },
    {
      title: "INSIGHTS & TEAM",
      items: [
        { 
          id: "analytics", 
          label: "Analytics & CSAT", 
          route: "/analytics",
          icon: BarChart3,
          checkPermission: (r) => isOwner || isSales || isViewer 
        },
        { 
          id: "usage", 
          label: "Token Consumption", 
          route: "/usage",
          icon: Activity,
          checkPermission: (r) => isOwner || isViewer 
        },
        { 
          id: "team", 
          label: "Team & Staff Seats", 
          route: "/team",
          icon: UserPlus,
          checkPermission: (r) => isOwner 
        }
      ]
    },
    {
      title: "WORKSPACE",
      items: [
        { 
          id: "subscription", 
          label: "Subscription & Billing", 
          route: "/subscription",
          icon: CreditCard,
          badge: "BDT",
          checkPermission: (r) => isOwner 
        },
        { 
          id: "settings", 
          label: "Store Settings", 
          route: "/settings",
          icon: Settings,
          checkPermission: (r) => isOwner 
        }
      ]
    }
  ];

  // Resolve active navigation groups
  let visibleNavGroups: NavGroup[] = [];

  if (isSuperAdmin) {
    visibleNavGroups = superAdminNavGroups;
  } else {
    visibleNavGroups = clientNavGroups
      .map(group => ({
        ...group,
        items: group.items.filter(item => {
          if (enabledModules && enabledModules[item.id] === false) {
            return false;
          }
          return item.checkPermission ? item.checkPermission(role, dept) : true;
        })
      }))
      .filter(group => group.items.length > 0);
  }

  const getRoleBadge = () => {
    if (isSuperAdmin) return { label: "Platform Super Admin", icon: ShieldCheck, color: "text-amber-300 bg-amber-950/40 border-amber-800/50" };
    if (isOwner) return { label: "Organization Owner", icon: ShieldCheck, color: "text-[#00C978] bg-[#00C978]/10 border-[#00C978]/30" };
    if (isTechSupport) return { label: "Technical Support", icon: Wrench, color: "text-cyan-300 bg-cyan-950/40 border-cyan-800/50" };
    if (isCustomerSupport) return { label: "Customer Support", icon: Headphones, color: "text-emerald-300 bg-emerald-950/40 border-emerald-800/50" };
    if (isSales) return { label: "Sales Representative", icon: TrendingUp, color: "text-teal-300 bg-teal-950/40 border-teal-800/50" };
    if (isViewer) return { label: "Analytics Viewer", icon: Eye, color: "text-slate-300 bg-slate-800/60 border-slate-700/60" };
    return { label: "Team Member", icon: ShieldCheck, color: "text-slate-300 bg-slate-800/60 border-slate-700/60" };
  };

  const roleInfo = getRoleBadge();
  const RoleIcon = roleInfo.icon;

  const brandTitle = isSuperAdmin 
    ? `${currentTheme.platform_name || "SaaS"} Control` 
    : (user?.tenant_name || currentTheme.platform_name || "Workspace");
  const brandSub = isSuperAdmin 
    ? "Master Platform" 
    : (currentTheme.platform_tagline || "AI Customer Support");

  return (
    <aside
      className="w-64 flex flex-col justify-between shrink-0 select-none border-r transition-colors"
      style={{
        backgroundColor: currentTheme.dark_surface,
        borderColor: currentTheme.dark_border,
        color: "#9EADA5"
      }}
    >
      
      {/* Brand Header */}
      <div>
        <div
          className="h-16 px-4 flex items-center gap-3 border-b transition-colors"
          style={{
            backgroundColor: currentTheme.dark_surface,
            borderColor: currentTheme.dark_border
          }}
        >
          {currentTheme.logo_url ? (
            <img src={currentTheme.logo_url} alt="Logo" className="h-9 w-auto max-w-[60px] object-contain rounded-xl shrink-0" />
          ) : (
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0 transition-colors"
              style={{ backgroundColor: currentTheme.primary_color }}
            >
              <Layers className="w-4 h-4 text-white" />
            </div>
          )}
          <div className="min-w-0">
            <div className="font-bold text-sm text-white tracking-tight truncate">{brandTitle}</div>
            <div className="text-[11px] text-slate-400 font-medium truncate">{brandSub}</div>
          </div>
        </div>

        {/* User Role Card */}
        <div className="px-3 pt-3 pb-1">
          <div className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-2 ${roleInfo.color}`}>
            <RoleIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{roleInfo.label}</span>
          </div>
        </div>

        {/* Dynamic Navigation Groups */}
        <div className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-210px)] custom-scrollbar-dark">
          {visibleNavGroups.map((group, idx) => (
            <div key={idx}>
              <div className="px-2 mb-1.5 text-[10px] font-semibold text-slate-500 tracking-wider uppercase">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeNav 
                    ? activeNav === item.id 
                    : (pathname === item.route || (item.route !== "/dashboard" && item.route !== "/superadmin" && pathname.startsWith(item.route)));

                  return (
                    <Link
                      key={item.id}
                      href={item.route}
                      onClick={() => onSelectNav && onSelectNav(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "text-white font-bold shadow-xs"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                      style={isActive ? { backgroundColor: currentTheme.primary_color } : {}}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                            item.badge === "Master"
                              ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                              : isActive
                              ? "bg-black/20 text-white"
                              : "bg-white/10 text-slate-300"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Footer Profile */}
      <div
        className="p-3 border-t transition-colors"
        style={{
          backgroundColor: currentTheme.dark_surface,
          borderColor: currentTheme.dark_border
        }}
      >
        <div
          className="flex items-center justify-between p-2 rounded-xl border transition-colors"
          style={{
            backgroundColor: currentTheme.dark_card,
            borderColor: currentTheme.dark_border
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 transition-colors"
              style={{ backgroundColor: currentTheme.primary_color }}
            >
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{user?.full_name || "User"}</div>
              <div className="text-[10px] text-slate-400 font-mono truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </aside>
  );
}
