"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, DEMO_ACCOUNTS, DemoAccount } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  Building2, Shield, User, Key, ArrowRight,
  CheckCircle2, Bot, Users, Globe, Lock, ShieldCheck,
  Eye, EyeOff, Terminal, ChevronDown, ChevronUp, AlertCircle, Sparkles
} from "lucide-react";
import PricingModal from "./PricingModal";

export default function LoginScreen() {
  const router = useRouter();
  const { login, switchDemoAccount } = useAuth();
  const { showToast } = useToast();

  const isDevMode = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENABLE_DEBUG_DEMO === "true";

  const [email, setEmail] = useState<string>(isDevMode ? "admin@gmail.com" : "");
  const [password, setPassword] = useState<string>(isDevMode ? "12345678" : "");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPricingModal, setShowPricingModal] = useState<boolean>(false);
  const [showDebugDrawer, setShowDebugDrawer] = useState<boolean>(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const res = await login(email, password);
    if (res.success) {
      showToast("Authentication Successful", `Signed in as ${email}`, "success");
      if (email.toLowerCase().includes("admin")) {
        router.replace("/superadmin");
      } else {
        router.replace("/dashboard");
      }
    } else {
      const err = res.error || "Incorrect email or password. Please check your credentials.";
      setErrorMessage(err);
      showToast("Authentication Failed", err, "error");
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
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col justify-between font-sans antialiased selection:bg-indigo-500 selection:text-white">

      {/* Top Header */}
      <header className="px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-base tracking-tight leading-tight">
              Jobab<span className="text-indigo-600">.chat</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide">
              Universal AI Support & Operations
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPricingModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Buy Plan / Sign Up</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] px-3 py-1.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hidden md:flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            TLS 1.3 • AES-256
          </span>
        </div>
      </header>

      {/* Pricing Modal */}
      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />

      {/* Main Authentication Centerpiece */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-5xl mx-auto w-full my-auto">

        {/* Core Login Card */}
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl relative space-y-5">
          
          {/* Header Info */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold mb-1">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Workspace Portal Access</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Sign In to Account</h2>
            <p className="text-xs text-slate-500">Enter your credentials to access your business desk</p>
          </div>

          {/* Quick Demo Fill Pills for Dev Mode */}
          {isDevMode && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[10.5px] font-bold text-slate-600 mb-2 px-1 uppercase tracking-wider flex items-center justify-between">
                <span>⚡ Quick Demo Selector</span>
                <span className="text-[9.5px] text-amber-700 bg-amber-50 px-2 py-0.2 rounded border border-amber-200 font-bold font-mono">Dev Mode</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => { setEmail("admin@gmail.com"); setPassword("12345678"); }}
                  className={`p-2 rounded-xl border text-left font-bold transition-all flex items-center justify-between cursor-pointer ${
                    email === "admin@gmail.com" 
                      ? "bg-amber-50 border-amber-300 text-amber-900 shadow-2xs" 
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span className="truncate">🛡️ Super Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail("ecommerceclient1@gmail.com"); setPassword("12345678"); }}
                  className={`p-2 rounded-xl border text-left font-bold transition-all flex items-center justify-between cursor-pointer ${
                    email === "ecommerceclient1@gmail.com" 
                      ? "bg-indigo-50 border-indigo-300 text-indigo-900 shadow-2xs" 
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span className="truncate">🛍️ E-Comm (Padma)</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail("erpclient1@gmail.com"); setPassword("12345678"); }}
                  className={`p-2 rounded-xl border text-left font-bold transition-all flex items-center justify-between cursor-pointer ${
                    email === "erpclient1@gmail.com" 
                      ? "bg-blue-50 border-blue-300 text-blue-900 shadow-2xs" 
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span className="truncate">🏢 ERP (Apex)</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail("ecommerceclient2@gmail.com"); setPassword("12345678"); }}
                  className={`p-2 rounded-xl border text-left font-bold transition-all flex items-center justify-between cursor-pointer ${
                    email === "ecommerceclient2@gmail.com" 
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs" 
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span className="truncate">🖥️ Retail (Horizon)</span>
                </button>
              </div>
            </div>
          )}

          {/* Error Alert Box */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50/90 border-2 border-rose-400/80 rounded-2xl text-rose-900 text-xs flex items-start gap-3 shadow-md shadow-rose-900/5 animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong className="block font-bold text-rose-950 mb-0.5">Authentication Failed</strong>
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Work Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => { setEmail(e.target.value); setErrorMessage(null); }}
                placeholder="name@company.com"
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 hover:bg-white focus:bg-white text-slate-900 border outline-none focus:ring-2 transition-all font-medium ${
                  errorMessage ? "border-rose-400 focus:border-rose-600 focus:ring-rose-100" : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-100"
                }`}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Password *</label>
                <span
                  onClick={() => showToast("Password Reset", "Contact support@jobab.chat or use Super Admin panel to reset credentials.", "info")}
                  className="text-[11px] text-indigo-600 hover:underline cursor-pointer font-medium"
                >
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrorMessage(null); }}
                  placeholder="••••••••••••"
                  className={`w-full px-3.5 py-2.5 pr-10 text-xs rounded-xl bg-slate-50 hover:bg-white focus:bg-white text-slate-900 border outline-none focus:ring-2 transition-all font-mono ${
                    errorMessage ? "border-rose-400 focus:border-rose-600 focus:ring-rose-100" : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-100"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 accent-indigo-600 cursor-pointer"
                />
                <span>Remember this device for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim()}
              className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
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

          {/* New Tenant Signup CTA */}
          <div className="pt-4 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-500">
              Don't have an organization workspace yet?
            </p>
            <button
              type="button"
              onClick={() => setShowPricingModal(true)}
              className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              View Pricing & Self-Serve Setup
            </button>

            <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Encrypted Session • Multi-Tenant Isolation</span>
            </div>
          </div>

        </div>

        {/* Developer Testing Account Switcher (Dev Mode) */}
        {isDevMode && (
          <div className="w-full max-w-4xl mt-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div 
              className="flex items-center justify-between cursor-pointer select-none" 
              onClick={() => setShowDebugDrawer(!showDebugDrawer)}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-amber-600" /> DEV ONLY
                </span>
                <span className="text-xs font-bold text-slate-700">
                  Role-Based Account Switcher (Dev Mode)
                </span>
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                {showDebugDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showDebugDrawer && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-3">
                {DEMO_ACCOUNTS.map((acc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickLogin(acc)}
                    className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-left transition-colors group flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {acc.name}
                        </span>
                        <span className={`text-[9.5px] px-2 py-0.2 rounded-full font-bold border ${
                          acc.role === 'super_admin'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : acc.role === 'tenant_owner'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {acc.department}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{acc.email}</div>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-bold text-indigo-600">
                      <span>Login as {acc.roleLabel.split(' ')[0]}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-3 pt-2 border-t border-slate-100 text-[10.5px] text-slate-400 flex items-center justify-between">
              <span>Test password: <code className="font-mono font-bold text-indigo-600">12345678</code></span>
              <span className="text-[10px] text-slate-400 font-mono">NODE_ENV: {process.env.NODE_ENV}</span>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="px-6 py-3.5 text-center text-xs text-slate-500 border-t border-slate-200/80 bg-white">
        Jobab Chat Platform • Autonomous AI Customer Support • ISO/IEC 27001 Security Standard
      </footer>
    </div>
  );
}
