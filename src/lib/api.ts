import { emitToast } from "../context/ToastContext";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
export const CDN_WIDGET_URL = process.env.NEXT_PUBLIC_CDN_WIDGET_URL || (API_BASE_URL.replace(/\/api\/v1\/?$/, "") + "/static/widget.js");

export interface ApiFetchOptions extends RequestInit {
  timeoutMs?: number;
  skipToast?: boolean;
  customToken?: string | null;
}

function getHeaders(customToken?: string | null): HeadersInit {
  let token = customToken;
  if (!token && typeof window !== "undefined") {
    token = localStorage.getItem("aiaas_token");
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token && token.startsWith("ey")) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Enterprise Unified API Request Engine.
 * Features:
 * - 15-second AbortController Timeout with human-readable error alerts.
 * - Connection Refusal / Offline Detection (e.g. backend server down on 127.0.0.1:8000).
 * - Automatic HTTP Status Code Classification (401 Session Expired, 403 Forbidden, 422 Validation, 429 Rate Limit, 500+ Server Error).
 * - FastAPI Pydantic Validation Error Flattener.
 * - Global Toast Dispatcher with smart deduplication.
 */
export async function apiFetch<T = any>(
  endpointOrUrl: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const {
    timeoutMs = 15000,
    skipToast = false,
    customToken = null,
    headers: customHeaders = {},
    ...fetchInit
  } = options;

  const url = endpointOrUrl.startsWith("http")
    ? endpointOrUrl
    : `${API_BASE_URL}${endpointOrUrl.startsWith("/") ? "" : "/"}${endpointOrUrl}`;

  const baseHeaders = getHeaders(customToken);
  const headers = { ...baseHeaders, ...(customHeaders as Record<string, string>) };

  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...fetchInit,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timerId);

    if (!res.ok) {
      let errorMessage = `Request failed with status ${res.status}`;
      let errorData: any = null;

      try {
        errorData = await res.json();
        if (errorData) {
          if (typeof errorData.detail === "string") {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail
              .map((err: any) => `${err.loc?.slice(-1)[0] || "Field"}: ${err.msg}`)
              .join("; ");
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        }
      } catch {
        // Non-JSON response
      }

      if (!skipToast) {
        if (res.status === 401) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("aiaas_token");
          }
          emitToast(
            "🔒 Session Expired",
            "Your login session has expired. Please sign in again.",
            "warning"
          );
        } else if (res.status === 403) {
          emitToast(
            "⛔ Access Restricted",
            errorMessage || "You do not have permission to perform this action.",
            "error"
          );
        } else if (res.status === 404) {
          emitToast(
            "🔍 Resource Not Found",
            errorMessage || "The requested item or endpoint was not found.",
            "warning"
          );
        } else if (res.status === 422) {
          emitToast(
            "⚠️ Validation Error",
            errorMessage || "Please check the submitted form fields.",
            "warning"
          );
        } else if (res.status === 429) {
          emitToast(
            "⏳ Rate Limit Exceeded",
            "Too many requests sent. Please wait a moment before trying again.",
            "warning"
          );
        } else if (res.status === 400) {
          emitToast(
            "Authentication / Request Failed",
            errorMessage || "Incorrect credentials or invalid request.",
            "error"
          );
        } else if (res.status === 503 || (errorMessage && errorMessage.toLowerCase().includes("database"))) {
          emitToast(
            "🗄️ Database Connection Error (503)",
            errorMessage || "PostgreSQL database is unreachable. Verify PostgreSQL service and DATABASE_URL in backend/.env.",
            "error"
          );
        } else if (res.status >= 500) {
          emitToast(
            `🔥 Backend Server Error (${res.status})`,
            errorMessage || "An internal server error occurred. Check backend terminal logs for details.",
            "error"
          );
        } else {
          emitToast(
            "Request Failed",
            errorMessage,
            "error"
          );
        }
      }

      const error = new Error(errorMessage);
      (error as any).status = res.status;
      (error as any).data = errorData;
      throw error;
    }

    if (res.status === 204) {
      return {} as T;
    }

    return await res.json();
  } catch (err: any) {
    clearTimeout(timerId);

    // Timeout detection
    if (err.name === "AbortError") {
      const msg = `Server took longer than ${Math.round(timeoutMs / 1000)}s to respond. Please check your internet connection or backend server.`;
      if (!skipToast) {
        emitToast("⏱️ Connection Timeout", msg, "error");
      }
      throw new Error(msg);
    }

    // Network connection refused / offline detection
    if (err instanceof TypeError && (err.message.toLowerCase().includes("fetch") || err.message.toLowerCase().includes("network"))) {
      const msg = `Unable to connect to the backend server (${API_BASE_URL}). Please ensure the FastAPI backend is running.`;
      if (!skipToast) {
        emitToast("🔌 Connection Error (Backend Offline)", msg, "error");
      }
      throw new Error(msg);
    }

    throw err;
  }
}

export const api = {
  // System Health & Connection Diagnostics
  async getSystemDiagnostics() {
    return apiFetch("/health/diagnostics", { skipToast: true });
  },

  async pingDatabase() {
    return apiFetch("/health/ping-db", { method: "POST" });
  },

  async pingAI() {
    return apiFetch("/health/ping-ai", { method: "POST" });
  },

  async triggerDatabaseSeed() {
    return apiFetch("/health/seed-db", { method: "POST" });
  },

  // Auth
  async login(email: string, password: string = "12345678") {
    return apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipToast: true,
    });
  },

  async register(fullName: string, email: string, tenantName: string, password: string = "DemoPass123!", businessCategory: string = "ecommerce") {
    return apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        full_name: fullName,
        email,
        tenant_name: tenantName,
        password,
        business_category: businessCategory
      }),
    });
  },

  async provisionTenant(data: {
    organization_name: string;
    admin_name: string;
    admin_email: string;
    password: string;
    subscription_tier?: string;
    billing_cycle?: string;
    business_category?: string;
  }) {
    return apiFetch("/auth/provision-tenant", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getMe() {
    return apiFetch("/auth/me");
  },

  // Dashboard Stats
  async getDashboardStats() {
    return apiFetch("/dashboard/stats");
  },

  // Conversations & Inbox
  async getConversations(scope?: string) {
    const endpoint = scope && scope !== "all" 
      ? `/inbox/conversations?scope=${scope}`
      : "/inbox/conversations";
    return apiFetch(endpoint);
  },

  async getMessages(conversationId: string) {
    return apiFetch(`/inbox/conversations/${conversationId}/messages`);
  },

  async sendReply(conversationId: string, content: string, isInternalNote: boolean = false) {
    return apiFetch(`/inbox/conversations/${conversationId}/reply`, {
      method: "POST",
      body: JSON.stringify({ content, is_internal_note: isInternalNote }),
    });
  },

  async assignAgent(conversationId: string, agentId?: string) {
    const endpoint = agentId 
      ? `/inbox/conversations/${conversationId}/assign?agent_id=${agentId}`
      : `/inbox/conversations/${conversationId}/assign`;
    return apiFetch(endpoint, { method: "PATCH" });
  },

  async updateDepartment(conversationId: string, department: string) {
    return apiFetch(`/inbox/conversations/${conversationId}/department?department=${encodeURIComponent(department)}`, {
      method: "PATCH",
    });
  },

  async toggleAI(conversationId: string) {
    return apiFetch(`/inbox/conversations/${conversationId}/toggle-ai`, {
      method: "PATCH",
    });
  },

  async updateConversationStatus(conversationId: string, status: string) {
    return apiFetch(`/inbox/conversations/${conversationId}/status?new_status=${status}`, {
      method: "PATCH",
    });
  },

  async updateConversationPriority(conversationId: string, priority: string) {
    return apiFetch(`/inbox/conversations/${conversationId}/priority?new_priority=${priority}`, {
      method: "PATCH",
    });
  },

  async addConversationTag(conversationId: string, tag: string) {
    return apiFetch(`/inbox/conversations/${conversationId}/tags?tag=${encodeURIComponent(tag)}`, {
      method: "POST",
    });
  },

  // AI Assistants
  async getAssistants() {
    return apiFetch("/assistants");
  },

  async createAssistant(data: any) {
    return apiFetch("/assistants", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateAssistant(assistantId: string, data: any) {
    return apiFetch(`/assistants/${assistantId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async toggleAssistant(assistantId: string) {
    return apiFetch(`/assistants/${assistantId}/toggle`, {
      method: "PATCH",
    });
  },

  // Knowledge Bases & RAG
  async getKnowledgeBases() {
    return apiFetch("/knowledge");
  },

  async createKnowledgeBase(data: any) {
    return apiFetch("/knowledge/ingest-text", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async ingestKnowledgeFAQ(data: { title: string; category: string; faq_items: Array<{ question: string; answer: string }> }) {
    return apiFetch("/knowledge/ingest-faq", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async searchKnowledgeSandbox(query: string, limit: number = 4) {
    return apiFetch("/knowledge/search-sandbox", {
      method: "POST",
      body: JSON.stringify({ query, limit }),
    });
  },

  async testAIChatSimulator(message: string, assistantId?: string) {
    return apiFetch("/knowledge/test-chat", {
      method: "POST",
      body: JSON.stringify({ message, assistant_id: assistantId }),
    });
  },

  async deleteKnowledgeBase(knowledgeId: string) {
    return apiFetch(`/knowledge/${knowledgeId}`, {
      method: "DELETE",
    });
  },

  // Websites & Widgets
  async getWebsites() {
    return apiFetch("/websites");
  },

  async createWebsite(data: any) {
    return apiFetch("/websites", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Contacts
  async getContacts() {
    return apiFetch("/contacts");
  },

  async createContact(data: any) {
    return apiFetch("/contacts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // API Keys & Webhooks
  async getApiKeys() {
    return apiFetch("/api-keys");
  },

  async createApiKey(name: string, scopes: string[] = ["chat:read", "chat:write"]) {
    return apiFetch("/api-keys", {
      method: "POST",
      body: JSON.stringify({ name, scopes }),
    });
  },

  async getWebhooks() {
    return apiFetch("/webhooks");
  },

  async createWebhook(url: string, events: string[] = ["conversation.created", "message.received"]) {
    return apiFetch("/webhooks", {
      method: "POST",
      body: JSON.stringify({ url, events }),
    });
  },

  // Analytics & CSAT (Strict Multi-Tenant Isolated)
  async getAnalyticsOverview(timeRange: string = "7d") {
    return apiFetch(`/analytics/overview?time_range=${timeRange}`);
  },

  async submitCSATRating(conversationId: string, rating: number, feedback?: string) {
    return apiFetch(`/analytics/conversations/${conversationId}/csat`, {
      method: "POST",
      body: JSON.stringify({ rating, feedback }),
    });
  },

  // Client Subscription & Billing Engine
  async getSubscriptionCurrent() {
    return apiFetch("/subscription/current");
  },

  async changeSubscriptionPlan(tier: string, billingCycle: string = "monthly", paymentMethod: string = "bKash Direct Merchant") {
    return apiFetch("/subscription/change-plan", {
      method: "POST",
      body: JSON.stringify({ tier, billing_cycle: billingCycle, payment_method: paymentMethod }),
    });
  },

  async getSubscriptionInvoices() {
    return apiFetch("/subscription/invoices");
  },

  // bKash Tokenized Checkout (Sandbox & Production)
  async createBkashPayment(tier: string, billingCycle: string = "monthly", phoneNumber: string = "01770618575", couponCode?: string) {
    return apiFetch("/payment/bkash/create", {
      method: "POST",
      body: JSON.stringify({
        tier,
        billing_cycle: billingCycle,
        phone_number: phoneNumber,
        coupon_code: couponCode || undefined,
        frontend_url: typeof window !== "undefined" ? window.location.origin : undefined
      }),
    });
  },

  async executeBkashPayment(paymentId: string, tier: string, billingCycle: string = "monthly", couponCode?: string, payerEmail?: string) {
    return apiFetch("/payment/bkash/execute", {
      method: "POST",
      body: JSON.stringify({ payment_id: paymentId, tier, billing_cycle: billingCycle, coupon_code: couponCode || undefined, payer_email: payerEmail || undefined }),
    });
  },

  async queryBkashPayment(paymentId: string) {
    return apiFetch(`/payment/bkash/query/${paymentId}`);
  },

  async initWalletTopup(amountBdt: number) {
    return apiFetch("/payment/wallet/topup", {
      method: "POST",
      body: JSON.stringify({
        amount_bdt: amountBdt,
        frontend_url: typeof window !== "undefined" ? window.location.origin : undefined
      }),
    });
  },

  async executeWalletTopup(paymentId: string) {
    return apiFetch("/payment/wallet/execute", {
      method: "POST",
      body: JSON.stringify({ payment_id: paymentId }),
    });
  },

  // EPS (Easy Payment System) Checkout
  async createEpsPayment(
    tier: string,
    billingCycle: string = "monthly",
    customerDetails?: { name?: string; email?: string; phone?: string; address?: string },
    couponCode?: string
  ) {
    return apiFetch("/payment/eps/create", {
      method: "POST",
      body: JSON.stringify({
        tier,
        billing_cycle: billingCycle,
        customer_name: customerDetails?.name,
        customer_email: customerDetails?.email,
        customer_phone: customerDetails?.phone,
        customer_address: customerDetails?.address,
        coupon_code: couponCode || undefined,
        frontend_url: typeof window !== "undefined" ? window.location.origin : undefined
      }),
    });
  },

  async executeEpsPayment(
    merchantTransactionId: string,
    tier: string,
    billingCycle: string = "monthly",
    couponCode?: string,
    payerEmail?: string
  ) {
    return apiFetch("/payment/eps/execute", {
      method: "POST",
      body: JSON.stringify({
        merchant_transaction_id: merchantTransactionId,
        tier,
        billing_cycle: billingCycle,
        coupon_code: couponCode || undefined,
        payer_email: payerEmail || undefined,
      }),
    });
  },

  async queryEpsPayment(merchantTransactionId: string) {
    return apiFetch(`/payment/eps/query/${merchantTransactionId}`);
  },

  async initWalletTopupEps(amountBdt: number) {
    return apiFetch("/payment/wallet/topup-eps", {
      method: "POST",
      body: JSON.stringify({
        amount_bdt: amountBdt,
        frontend_url: typeof window !== "undefined" ? window.location.origin : undefined
      }),
    });
  },

  async executeWalletTopupEps(merchantTransactionId: string) {
    return apiFetch("/payment/wallet/execute-eps", {
      method: "POST",
      body: JSON.stringify({ merchant_transaction_id: merchantTransactionId }),
    });
  },

  // Team (Strict Multi-Tenant Isolated with Seat Limits)
  async getTeamMembers() {
    return apiFetch("/team/members");
  },

  async getTeamSeatsSummary() {
    return apiFetch("/team/seats-summary");
  },

  async createTeamMember(data: {
    full_name: string;
    email: string;
    password?: string;
    role: string;
    department?: string;
  }) {
    return apiFetch("/team/members", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateTeamMember(memberId: string, data: {
    full_name?: string;
    role?: string;
    department?: string;
    is_active?: boolean;
  }) {
    return apiFetch(`/team/members/${memberId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async deleteTeamMember(memberId: string) {
    return apiFetch(`/team/members/${memberId}`, {
      method: "DELETE",
    });
  },

  // Settings
  async getTenantSettings() {
    return apiFetch("/tenant/current");
  },

  async updateTenantSettings(data: any) {
    return apiFetch("/tenant/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // In-App Real-Time Notifications
  async getNotifications() {
    return apiFetch("/notifications", { skipToast: true });
  },

  async markNotificationRead(id: string) {
    return apiFetch(`/notifications/${id}/read`, { method: "PUT", skipToast: true });
  },

  async markAllNotificationsRead() {
    return apiFetch("/notifications/read-all", { method: "PUT", skipToast: true });
  },

  async deleteNotification(id: string) {
    return apiFetch(`/notifications/${id}`, { method: "DELETE", skipToast: true });
  },

  async clearAllNotifications() {
    return apiFetch("/notifications/clear-all", { method: "DELETE", skipToast: true });
  },

  // Usage & Quotas (Live PostgreSQL calculated)
  async getUsageSummary() {
    return apiFetch("/usage/summary");
  },

  // Platform Super Admin Control Plane APIs
  async getSuperAdminMetrics() {
    return apiFetch("/superadmin/metrics");
  },

  async getSuperAdminTenants(search?: string, status?: string) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    const query = params.toString() ? `?${params.toString()}` : "";
    return apiFetch(`/superadmin/tenants${query}`);
  },

  async updateTenantStatus(tenantId: string, isActive: boolean, reason?: string, category?: string) {
    return apiFetch(`/superadmin/tenants/${tenantId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: isActive, reason, category }),
    });
  },

  async updateTenantPlan(tenantId: string, tier: string, tokenLimitOverride?: number, status?: string) {
    return apiFetch(`/superadmin/tenants/${tenantId}/plan`, {
      method: "PATCH",
      body: JSON.stringify({ tier, token_limit_override: tokenLimitOverride, status }),
    });
  },

  async getTenantModules(tenantId: string) {
    return apiFetch(`/superadmin/tenants/${tenantId}/modules`);
  },

  async updateTenantModules(tenantId: string, modules: Record<string, boolean>) {
    return apiFetch(`/superadmin/tenants/${tenantId}/modules`, {
      method: "PATCH",
      body: JSON.stringify({ modules }),
    });
  },

  async getSuperAdminAuditLogs() {
    return apiFetch("/superadmin/audit-logs");
  },

  async getSuperAdminRevenue() {
    return apiFetch("/superadmin/revenue");
  },

  async getSuperAdminInfrastructure() {
    return apiFetch("/superadmin/infrastructure");
  },

  async getSuperAdminAISettings() {
    return apiFetch("/superadmin/infrastructure/settings");
  },

  async getOpenRouterModels(params?: { query?: string; provider?: string; tools_only?: boolean }) {
    const q = new URLSearchParams();
    if (params?.query) q.set("query", params.query);
    if (params?.provider) q.set("provider", params.provider);
    if (params?.tools_only) q.set("tools_only", "true");
    const qs = q.toString() ? `?${q.toString()}` : "";
    return apiFetch(`/superadmin/infrastructure/openrouter-models${qs}`);
  },

  async updateSuperAdminAISettings(payload: any) {
    return apiFetch("/superadmin/infrastructure/settings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async testSuperAdminAIPing(payload?: { model?: string; base_url?: string; api_key?: string }) {
    return apiFetch("/superadmin/infrastructure/test-ai", {
      method: "POST",
      body: payload ? JSON.stringify(payload) : undefined,
    });
  },

  async deleteTenant(tenantId: string) {
    return apiFetch(`/superadmin/tenants/${tenantId}`, {
      method: "DELETE",
    });
  },

  // Platform Super Admin bKash PGW Management
  async getSuperAdminBkashSettings() {
    return apiFetch("/superadmin/bkash/settings");
  },

  async updateSuperAdminBkashSettings(payload: any) {
    return apiFetch("/superadmin/bkash/settings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async testSuperAdminBkashConnection() {
    return apiFetch("/superadmin/bkash/test-connection", {
      method: "POST",
    });
  },

  // Platform Super Admin EPS PGW Management
  async getSuperAdminEpsSettings() {
    return apiFetch("/superadmin/eps/settings");
  },

  async updateSuperAdminEpsSettings(payload: any) {
    return apiFetch("/superadmin/eps/settings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async testSuperAdminEpsConnection() {
    return apiFetch("/superadmin/eps/test-connection", {
      method: "POST",
    });
  },

  // Public Plans & Dynamic Pricing Engine
  async getPublicPlans() {
    return apiFetch("/plans/public");
  },

  async getPublicPricingConfig() {
    return apiFetch("/plans/config");
  },

  async getSuperAdminPricingEngine() {
    return apiFetch("/superadmin/pricing-engine");
  },

  async updateSuperAdminPricingEngine(data: any) {
    return apiFetch("/superadmin/pricing-engine", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async getTenantPricingContract(tenantId: string) {
    return apiFetch(`/superadmin/tenants/${tenantId}/pricing-contract`);
  },

  async updateTenantPricingContract(tenantId: string, data: any) {
    return apiFetch(`/superadmin/tenants/${tenantId}/pricing-contract`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async getCustomPlanQuote(payload: {
    tokens: number;
    seats: number;
    websites: number;
    knowledge_docs?: number;
    is_annual?: boolean;
    modules?: Record<string, boolean>;
  }) {
    return apiFetch("/plans/custom-quote", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getTenantWallet() {
    return apiFetch("/payment/wallet");
  },

  async validateCoupon(code: string, planCode: string, amountBdt: number) {
    return apiFetch("/plans/validate-coupon", {
      method: "POST",
      body: JSON.stringify({ code, plan_code: planCode, amount_bdt: amountBdt }),
      skipToast: true,
    });
  },

  async validateCouponCode(code: string, planCode: string, amountBdt: number) {
    return this.validateCoupon(code, planCode, amountBdt);
  },

  // Platform Super Admin Plans Management
  async getSuperAdminPlans() {
    return apiFetch("/superadmin/plans");
  },

  async createSuperAdminPlan(data: any) {
    return apiFetch("/superadmin/plans", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateSuperAdminPlan(planId: string, data: any) {
    return apiFetch(`/superadmin/plans/${planId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteSuperAdminPlan(planId: string) {
    return apiFetch(`/superadmin/plans/${planId}`, {
      method: "DELETE",
    });
  },

  // Platform Super Admin Coupons Management
  async getSuperAdminCoupons() {
    return apiFetch("/superadmin/coupons");
  },

  async createSuperAdminCoupon(data: any) {
    return apiFetch("/superadmin/coupons", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateSuperAdminCoupon(couponId: string, data: any) {
    return apiFetch(`/superadmin/coupons/${couponId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteSuperAdminCoupon(couponId: string) {
    return apiFetch(`/superadmin/coupons/${couponId}`, {
      method: "DELETE",
    });
  },

  // Platform Branding & Theme Management
  async getPublicTheme() {
    return apiFetch("/superadmin/theme/public");
  },

  async getSuperAdminTheme() {
    return apiFetch("/superadmin/theme");
  },

  async updateSuperAdminTheme(data: any) {
    return apiFetch("/superadmin/theme", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async sendPublicDemoChat(message: string, chatHistory: any[] = []) {
    return apiFetch("/public/demo-chat", {
      method: "POST",
      body: JSON.stringify({ message, chat_history: chatHistory }),
    });
  },

  async getTokenTelemetry(limit: number = 50) {
    return apiFetch(`/usage/token-telemetry?limit=${limit}`);
  },

  // ---------------- E-COMMERCE & CONVERSATIONAL COMMERCE ----------------
  async getProducts(params?: { category?: string; search?: string; is_active?: boolean; sort_by?: string; sort_dir?: string }) {
    const q = new URLSearchParams();
    if (params?.category) q.set("category", params.category);
    if (params?.search) q.set("search", params.search);
    if (params?.is_active !== undefined) q.set("is_active", String(params.is_active));
    if (params?.sort_by) q.set("sort_by", params.sort_by);
    if (params?.sort_dir) q.set("sort_dir", params.sort_dir);

    return apiFetch(`/products?${q.toString()}`);
  },

  async createProduct(data: any) {
    return apiFetch("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async generateProductTags(data: { title: string; category?: string; description?: string; specifications?: any }) {
    return apiFetch("/products/generate-tags", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateProduct(id: string, data: any) {
    return apiFetch(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteProduct(id: string) {
    return apiFetch(`/products/${id}`, {
      method: "DELETE",
    });
  },

  async setProductPriority(id: string, priority: number) {
    return apiFetch(`/products/${id}/priority?priority=${priority}`, {
      method: "PATCH",
    });
  },

  async getOrders(params?: { status?: string; search?: string }) {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.search) q.set("search", params.search);

    return apiFetch(`/orders?${q.toString()}`);
  },

  async getOrder(id: string) {
    return apiFetch(`/orders/${id}`);
  },

  async updateOrderStatus(id: string, data: { order_status: string; payment_status?: string; tracking_notes?: string; send_sms_notification?: boolean }) {
    return apiFetch(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async resendOrderSms(orderId: string) {
    return apiFetch(`/orders/${orderId}/resend-sms`, {
      method: "POST",
    });
  },

  async getEcommerceSettings() {
    return apiFetch("/tenant/ecommerce-settings");
  },

  async updateEcommerceSettings(data: any) {
    return apiFetch("/tenant/ecommerce-settings", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async testSmsGateway(data: { phone_number: string; message?: string }) {
    return apiFetch("/tenant/ecommerce-settings/test-sms", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getPublicWidgetProducts(widgetKey: string, search?: string) {
    const q = new URLSearchParams({ widget_key: widgetKey });
    if (search) q.set("search", search);
    return apiFetch(`/public/widget/products?${q.toString()}`);
  },

  async submitPublicWidgetOrder(data: any) {
    return apiFetch("/public/widget/orders/checkout", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
