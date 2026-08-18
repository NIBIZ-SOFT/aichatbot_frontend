"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, DEMO_ACCOUNTS, DemoAccount } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { 
  Building2, Shield, User, Key, ArrowRight, 
  CheckCircle2, Bot, Users, Globe, Lock, ShieldCheck,
  Eye, EyeOff, Terminal, ChevronDown, ChevronUp, AlertCircle, Layers
} from "lucide-react";
import PricingModal from "./PricingModal";

export default function LoginScreen() {
  const router = useRouter();
  const { login, switchDemoAccount } = useAuth();
  const { currentTheme } = useTheme();
  const { showToast } = useToast();

  const [email, setEmail] = useState<string>("owner@padmadigital.example");
  const [password, setPassword] = useState<string>("DemoPass123!");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPricingModal, setShowPricingModal] = useState<boolean>(false);

  // Debug Testing Panel State (Only visible in development mode)
  const isDevMode = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENABLE_DEBUG_DEMO === "true";
  const [showDebugDrawer, setShowDebugDrawer] = useState<boolean>(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const ok = await login(email, password);
    if (ok) {
      showToast("Authentication Successful", `Signed in as ${email}`, "success");
      if (email.toLowerCase().includes("superadmin")) {
        router.replace("/superadmin");
      } else {
        router.replace("/dashboard");
      }
    } else {
      setErrorMessage("Invalid email or password. Please check your credentials.");
      showToast("Authentication Failed", "Incorrect email or password.", "error");
    }
    setIsLoading(false);
  };

  const handleQuickLogin = async (account: DemoAccount) => {
    setErrorMessage(null);
    await switchDemoAccount(account);
    showToast(`Logged in as ${account.name}`, `Assigned Role: ${account.roleLabel}`, "success");
    if (account.role === "super_admin") {
      router.replace("/superadmin");
    } else {
      router.replace("/dashboard");
    }
  };

  return (
    <div
      className="min-h-screen w-full text-slate-100 flex flex-col justify-between font-sans antialiased transition-colors"
      style={{ backgroundColor: currentTheme.dark_surface }}
    >
      
      {/* Top Header */}
      <header
        className="px-6 sm:px-10 py-4 flex items-center justify-between border-b backdrop-blur-md sticky top-0 z-30 transition-colors"
        style={{
          backgroundColor: `${currentTheme.dark_surface}E6`,
          borderColor: currentTheme.dark_border
        }}
      >
        <div className="flex items-center gap-3">
          {currentTheme.logo_url ? (
            <img src={currentTheme.logo_url} alt="Logo" className="h-9 w-auto max-w-[120px] object-contain rounded-xl shadow-sm" />
          ) : (
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center font-bold text-white shadow-sm transition-colors shrink-0"
              style={{ backgroundColor: currentTheme.primary_color }}
            >
              <Layers className="w-4 h-4 text-white" />
            </div>
          )}
          <div>
            <div className="font-bold text-white text-sm sm:text-base tracking-tight">
              {currentTheme.platform_name || "AIaaS Enterprise Platform"}
            </div>
            <div className="text-[11px] text-slate-400 font-normal">
              {currentTheme.platform_tagline || "Customer Communication & Autonomous AI Support"}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPricingModal(true)}
            className="px-4 py-2 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            style={{ backgroundColor: currentTheme.primary_color }}
          >
            <span>Buy Plan / Sign Up</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <span
            className="text-[11px] px-3 py-1.5 rounded-full font-medium hidden md:flex items-center gap-1.5"
            style={{
              backgroundColor: `${currentTheme.primary_color}18`,
              borderColor: `${currentTheme.primary_color}40`,
              color: currentTheme.primary_color,
              borderWidth: "1px"
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: currentTheme.primary_color }}></span>
            TLS 1.3 / AES-256
          </span>
        </div>
      </header>

      {/* Self-Serve Pricing & Package Modal */}
      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />

      {/* Main Authentication Centerpiece */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 max-w-5xl mx-auto w-full my-auto">
        
        {/* Core Login Card */}
        <div
          className="w-full max-w-md border rounded-2xl p-7 sm:p-8 shadow-2xl relative overflow-hidden transition-colors"
          style={{
            backgroundColor: currentTheme.dark_card,
            borderColor: currentTheme.dark_border
          }}
        >
          
          {/* Form Title & Subtitle */}
          <div className="text-center mb-6 space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">Sign In to Workspace</h2>
            <p className="text-xs text-slate-400">Enter your credentials to access your organization portal</p>
          </div>

          {/* Error Alert Box if any */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-950/40 border border-rose-800/40 rounded-xl text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Work Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl text-white outline-none transition-colors placeholder:text-slate-500 font-medium border"
                style={{
                  backgroundColor: currentTheme.dark_surface,
                  borderColor: currentTheme.dark_border
                }}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password *</label>
                <span
                  className="text-[11px] hover:underline cursor-pointer font-medium"
                  style={{ color: currentTheme.primary_color }}
                >
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 text-xs rounded-xl text-white outline-none transition-colors placeholder:text-slate-500 font-mono border"
                  style={{
                    backgroundColor: currentTheme.dark_surface,
                    borderColor: currentTheme.dark_border
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition-colors p-0.5 cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 cursor-pointer"
                />
                <span>Remember this device for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim()}
              className="w-full mt-2 py-2.5 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              style={{ backgroundColor: currentTheme.primary_color }}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>Sign In to Workspace <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* New Tenant Signup & Buy Package CTA */}
          <div
            className="mt-5 pt-4 border-t text-center space-y-2.5"
            style={{ borderColor: currentTheme.dark_border }}
          >
            <p className="text-xs text-slate-400">
              Don't have an organization workspace yet?
            </p>
            <button
              type="button"
              onClick={() => setShowPricingModal(true)}
              className="w-full py-2.5 px-4 hover:opacity-90 text-slate-200 hover:text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border"
              style={{
                backgroundColor: currentTheme.dark_surface,
                borderColor: currentTheme.dark_border
              }}
            >
              <Building2 className="w-3.5 h-3.5" style={{ color: currentTheme.primary_color }} />
              View Pricing & Self-Serve Setup
            </button>
            
            <div className="pt-1 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>Encrypted Session • Multi-Tenant Isolation</span>
            </div>
          </div>

        </div>

        {/* 🛠️ DEBUG / DEVELOPMENT ONLY: Role Testing Switcher */}
        {isDevMode && (
          <div
            className="w-full max-w-4xl mt-6 border rounded-2xl p-4 transition-colors"
            style={{
              backgroundColor: currentTheme.dark_card,
              borderColor: currentTheme.dark_border
            }}
          >
            
            <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => setShowDebugDrawer(!showDebugDrawer)}>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40 flex items-center gap-1">
                  <Terminal className="w-3 h-3" /> DEBUG ONLY
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  Developer Testing Account Switcher (Hidden in Production)
                </span>
              </div>
              <button className="text-slate-400 hover:text-white p-1 cursor-pointer">
                {showDebugDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showDebugDrawer && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                {DEMO_ACCOUNTS.map((acc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickLogin(acc)}
                    className="p-3 border rounded-xl text-left transition-colors group flex flex-col justify-between cursor-pointer"
                    style={{
                      backgroundColor: currentTheme.dark_surface,
                      borderColor: currentTheme.dark_border
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-semibold text-white group-hover:underline transition-colors"
                        >
                          {acc.name}
                        </span>
                        <span className={`text-[9.5px] px-2 py-0.2 rounded-full font-medium ${
                          acc.role === 'super_admin' 
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                            : acc.role === 'tenant_owner'
                            ? 'bg-blue-950/60 text-blue-300 border border-blue-800/40'
                            : acc.role === 'support_agent' && acc.department.includes('Tech')
                            ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/40'
                            : acc.role === 'support_agent'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                            : acc.role === 'sales_agent'
                            ? 'bg-teal-950/60 text-teal-300 border border-teal-800/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {acc.department}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{acc.email}</div>
                    </div>

                    <div
                      className="mt-2 pt-1.5 border-t flex items-center justify-between text-[10px] font-medium"
                      style={{
                        borderColor: currentTheme.dark_border,
                        color: currentTheme.primary_color
                      }}
                    >
                      <span>Login as {acc.roleLabel.split(' ')[0]}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div
              className="mt-2.5 pt-2 border-t text-[10.5px] text-slate-500 flex items-center justify-between"
              style={{ borderColor: currentTheme.dark_border }}
            >
              <span>All test accounts pre-configured with password: <code className="font-mono" style={{ color: currentTheme.primary_color }}>DemoPass123!</code></span>
              <span className="text-[10px] text-slate-500 font-mono">NODE_ENV: {process.env.NODE_ENV}</span>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer
        className="px-6 py-3.5 text-center text-xs text-slate-500 border-t transition-colors"
        style={{
          backgroundColor: currentTheme.dark_surface,
          borderColor: currentTheme.dark_border
        }}
      >
        {currentTheme.footer_text || "Enterprise AIaaS Platform • Multi-Tenant PostgreSQL 18 & Google Gemini AI • ISO/IEC 27001 Security Standard"}
      </footer>
    </div>
  );
}
