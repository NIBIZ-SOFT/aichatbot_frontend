"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../types";
import { api } from "../lib/api";

export interface DemoAccount {
  email: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  department: string;
  description: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "admin@gmail.com",
    name: "Platform Super Admin",
    role: "super_admin",
    roleLabel: "Super Admin",
    department: "Platform Operations",
    description: "Master control over all multi-tenant stores, token metering & global MRR"
  },
  {
    email: "ecommerceclient1@gmail.com",
    name: "E-Commerce Client 1 (Padma Mart)",
    role: "tenant_owner",
    roleLabel: "E-Commerce Owner",
    department: "Padma Mart Store",
    description: "15 diverse fashion, electronics, footwear & home products with bKash COD"
  },
  {
    email: "erpclient1@gmail.com",
    name: "ERP Client 1 (Apex Cloud)",
    role: "tenant_owner",
    roleLabel: "ERP Organization Owner",
    department: "Apex Enterprise Cloud",
    description: "Pure B2B & ERP management with workflow knowledge base and team controls"
  },
  {
    email: "ecommerceclient2@gmail.com",
    name: "E-Commerce Client 2 (Horizon Store)",
    role: "tenant_owner",
    roleLabel: "Horizon Store Owner",
    department: "Horizon Retail Ltd.",
    description: "Independent 4-product office tech & ergonomics store for isolation testing"
  },
  {
    email: "nusrat.support@padmadigital.example",
    name: "Nusrat Jahan",
    role: "support_agent",
    roleLabel: "Customer Support Agent",
    department: "Customer Support & Orders",
    description: "Order tracking, Steadfast/RedX courier & ticket resolution"
  },
  {
    email: "ariful.sales@padmadigital.example",
    name: "Ariful Islam",
    role: "sales_agent",
    roleLabel: "Sales Representative",
    department: "Sales & Styling Advisor",
    description: "Size exchanges, outfit styling, discounts & lead capture"
  },
  {
    email: "mahmud.tech@padmadigital.example",
    name: "Mahmudul Hasan",
    role: "support_agent",
    roleLabel: "Technical Support Engineer",
    department: "Payment & Gateway Support",
    description: "bKash/Nagad TrxID verification, webhooks & store APIs"
  },
  {
    email: "sumaiya.analytics@padmadigital.example",
    name: "Sumaiya Akter",
    role: "viewer",
    roleLabel: "Analytics Viewer",
    department: "E-Commerce Business Analytics",
    description: "Read-only analytics for sales conversion & token meter"
  }
];

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithToken: (jwtToken: string) => Promise<boolean>;
  register: (name: string, email: string, tenantName: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchDemoAccount: (account: DemoAccount) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session cleanly from localStorage and always sync live profile with backend
  useEffect(() => {
    async function initSession() {
      try {
        const savedToken = localStorage.getItem("aiaas_token");
        if (savedToken) {
          setToken(savedToken);
          try {
            const profile = await api.getMe();
            setUser(profile);
            localStorage.setItem("aiaas_user", JSON.stringify(profile));
          } catch (err) {
            // Token expired or invalid -> purge cleanly
            localStorage.removeItem("aiaas_user");
            localStorage.removeItem("aiaas_token");
            setUser(null);
            setToken(null);
          }
        } else {
          setUser(null);
          setToken(null);
        }
      } catch (e) {
        console.error("Auth session init error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    initSession();
  }, []);

  // Global listener to re-sync user profile when feature flags or permissions change
  useEffect(() => {
    const handleRefresh = async () => {
      try {
        const currentToken = localStorage.getItem("aiaas_token");
        if (currentToken) {
          const profile = await api.getMe();
          setUser(profile);
          localStorage.setItem("aiaas_user", JSON.stringify(profile));
        }
      } catch (e) {
        console.warn("Could not sync user profile:", e);
      }
    };

    window.addEventListener("aiaas:refresh_user", handleRefresh);
    window.addEventListener("focus", handleRefresh);
    return () => {
      window.removeEventListener("aiaas:refresh_user", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
    };
  }, []);

  const refreshUser = async () => {
    try {
      const currentToken = localStorage.getItem("aiaas_token");
      if (currentToken) {
        const profile = await api.getMe();
        setUser(profile);
        localStorage.setItem("aiaas_user", JSON.stringify(profile));
      }
    } catch (e) {
      console.error("refreshUser error:", e);
    }
  };

  const login = async (email: string, password: string = "12345678"): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      localStorage.setItem("aiaas_token", res.access_token);
      setToken(res.access_token);

      try {
        const profile = await api.getMe();
        setUser(profile);
        localStorage.setItem("aiaas_user", JSON.stringify(profile));
      } catch {
        const matched = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase());
        const loggedUser: User = {
          id: res.user_id,
          tenant_id: res.tenant_id,
          email: email,
          full_name: res.full_name || (matched ? matched.name : email.split("@")[0]),
          role: res.role || (matched ? matched.role : "tenant_owner"),
          department: matched ? matched.department : "Operations",
          is_active: true,
          is_online: true,
          created_at: new Date().toISOString()
        };
        setUser(loggedUser);
        localStorage.setItem("aiaas_user", JSON.stringify(loggedUser));
      }

      return { success: true };
    } catch (err: any) {
      console.error("Login API error:", err);
      const msg = err.message || (typeof err === "string" ? err : "Incorrect email or password.");
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, tenantName: string, password: string = "12345678"): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.register(name, email, tenantName, password);
      localStorage.setItem("aiaas_token", res.access_token);
      setToken(res.access_token);

      try {
        const profile = await api.getMe();
        setUser(profile);
        localStorage.setItem("aiaas_user", JSON.stringify(profile));
      } catch {
        const newUser: User = {
          id: res.user_id,
          tenant_id: res.tenant_id,
          email: email,
          full_name: res.full_name || name,
          role: res.role || "tenant_owner",
          department: "Executive",
          is_active: true,
          is_online: true,
          created_at: new Date().toISOString()
        };
        setUser(newUser);
        localStorage.setItem("aiaas_user", JSON.stringify(newUser));
      }

      return true;
    } catch (err) {
      console.error("Register API error:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithToken = async (jwtToken: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      localStorage.setItem("aiaas_token", jwtToken);
      setToken(jwtToken);
      const profile = await api.getMe();
      setUser(profile);
      localStorage.setItem("aiaas_user", JSON.stringify(profile));
      return true;
    } catch (e) {
      console.error("loginWithToken error:", e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("aiaas_user");
        localStorage.removeItem("aiaas_token");
        sessionStorage.clear();
        document.cookie = "aiaas_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      } catch (e) {
        console.error("Storage clear error on logout:", e);
      }
      // Hard redirect to /login to flush all in-memory React state and router cache
      window.location.href = "/login";
    }
  };

  const switchDemoAccount = async (account: DemoAccount) => {
    setIsLoading(true);
    try {
      const res = await api.login(account.email, "12345678");
      localStorage.setItem("aiaas_token", res.access_token);
      setToken(res.access_token);

      try {
        const profile = await api.getMe();
        setUser(profile);
        localStorage.setItem("aiaas_user", JSON.stringify(profile));
      } catch {
        const switchedUser: User = {
          id: res.user_id,
          tenant_id: res.tenant_id,
          email: account.email,
          full_name: account.name,
          role: res.role || account.role,
          department: account.department,
          is_active: true,
          is_online: true,
          created_at: new Date().toISOString()
        };
        setUser(switchedUser);
        localStorage.setItem("aiaas_user", JSON.stringify(switchedUser));
      }
    } catch (e) {
      console.error("Failed demo account switch:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithToken,
        register,
        logout,
        switchDemoAccount,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
