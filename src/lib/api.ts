export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

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

export const api = {
  // Auth
  async login(email: string, password: string = "DemoPass123!") {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Login failed");
    return res.json();
  },

  async register(fullName: string, email: string, tenantName: string, password: string = "DemoPass123!") {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        email,
        tenant_name: tenantName,
        password,
      }),
    });
    if (!res.ok) throw new Error("Registration failed");
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch user profile");
    return res.json();
  },

  // Dashboard Stats
  async getDashboardStats() {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch dashboard stats");
    return res.json();
  },

  // Conversations & Inbox
  async getConversations(scope?: string) {
    const url = scope && scope !== "all" 
      ? `${API_BASE_URL}/inbox/conversations?scope=${scope}`
      : `${API_BASE_URL}/inbox/conversations`;
    const res = await fetch(url, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch conversations");
    return res.json();
  },

  async getMessages(conversationId: string) {
    const res = await fetch(`${API_BASE_URL}/inbox/conversations/${conversationId}/messages`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch messages");
    return res.json();
  },

  async sendReply(conversationId: string, content: string, isInternalNote: boolean = false) {
    const res = await fetch(`${API_BASE_URL}/inbox/conversations/${conversationId}/reply`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ content, is_internal_note: isInternalNote }),
    });
    if (!res.ok) throw new Error("Failed to send reply");
    return res.json();
  },

  async assignAgent(conversationId: string, agentId?: string) {
    const url = agentId 
      ? `${API_BASE_URL}/inbox/conversations/${conversationId}/assign?agent_id=${agentId}`
      : `${API_BASE_URL}/inbox/conversations/${conversationId}/assign`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to assign agent");
    return res.json();
  },

  async updateDepartment(conversationId: string, department: string) {
    const res = await fetch(`${API_BASE_URL}/inbox/conversations/${conversationId}/department?department=${encodeURIComponent(department)}`, {
      method: "PATCH",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to update department");
    return res.json();
  },

  async toggleAI(conversationId: string) {
    const res = await fetch(`${API_BASE_URL}/inbox/conversations/${conversationId}/toggle-ai`, {
      method: "PATCH",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to toggle AI");
    return res.json();
  },

  async updateConversationStatus(conversationId: string, status: string) {
    const res = await fetch(`${API_BASE_URL}/inbox/conversations/${conversationId}/status?new_status=${status}`, {
      method: "PATCH",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to update status");
    return res.json();
  },

  async updateConversationPriority(conversationId: string, priority: string) {
    const res = await fetch(`${API_BASE_URL}/inbox/conversations/${conversationId}/priority?new_priority=${priority}`, {
      method: "PATCH",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to update priority");
    return res.json();
  },

  async addConversationTag(conversationId: string, tag: string) {
    const res = await fetch(`${API_BASE_URL}/inbox/conversations/${conversationId}/tags?tag=${encodeURIComponent(tag)}`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to add tag");
    return res.json();
  },

  // AI Assistants
  async getAssistants() {
    const res = await fetch(`${API_BASE_URL}/assistants`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch assistants");
    return res.json();
  },

  async createAssistant(data: any) {
    const res = await fetch(`${API_BASE_URL}/assistants`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create assistant");
    return res.json();
  },

  async updateAssistant(assistantId: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/assistants/${assistantId}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update assistant prompt/settings");
    return res.json();
  },

  async toggleAssistant(assistantId: string) {
    const res = await fetch(`${API_BASE_URL}/assistants/${assistantId}/toggle`, {
      method: "PATCH",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to toggle assistant status");
    return res.json();
  },

  // Knowledge Bases & RAG
  async getKnowledgeBases() {
    const res = await fetch(`${API_BASE_URL}/knowledge`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch knowledge bases");
    return res.json();
  },

  async createKnowledgeBase(data: any) {
    const res = await fetch(`${API_BASE_URL}/knowledge/ingest-text`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to ingest document");
    return res.json();
  },

  async ingestKnowledgeFAQ(data: { title: string; category: string; faq_items: Array<{ question: string; answer: string }> }) {
    const res = await fetch(`${API_BASE_URL}/knowledge/ingest-faq`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to ingest FAQ collection");
    return res.json();
  },

  async searchKnowledgeSandbox(query: string, limit: number = 4) {
    const res = await fetch(`${API_BASE_URL}/knowledge/search-sandbox`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ query, limit }),
    });
    if (!res.ok) throw new Error("Failed to run vector search sandbox");
    return res.json();
  },

  async testAIChatSimulator(message: string, assistantId?: string) {
    const res = await fetch(`${API_BASE_URL}/knowledge/test-chat`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ message, assistant_id: assistantId }),
    });
    if (!res.ok) throw new Error("Failed to simulate AI response");
    return res.json();
  },

  async deleteKnowledgeBase(knowledgeId: string) {
    const res = await fetch(`${API_BASE_URL}/knowledge/${knowledgeId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete knowledge document");
    return res.json();
  },

  // Websites & Widgets
  async getWebsites() {
    const res = await fetch(`${API_BASE_URL}/websites`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch websites");
    return res.json();
  },

  async createWebsite(data: any) {
    const res = await fetch(`${API_BASE_URL}/websites`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add website");
    return res.json();
  },

  // Contacts
  async getContacts() {
    const res = await fetch(`${API_BASE_URL}/contacts`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch contacts");
    return res.json();
  },

  async createContact(data: any) {
    const res = await fetch(`${API_BASE_URL}/contacts`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create contact");
    return res.json();
  },

  // API Keys & Webhooks
  async getApiKeys() {
    const res = await fetch(`${API_BASE_URL}/api-keys`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch API keys");
    return res.json();
  },

  async createApiKey(name: string, scopes: string[] = ["chat:read", "chat:write"]) {
    const res = await fetch(`${API_BASE_URL}/api-keys`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ name, scopes }),
    });
    if (!res.ok) throw new Error("Failed to create API key");
    return res.json();
  },

  async getWebhooks() {
    const res = await fetch(`${API_BASE_URL}/webhooks`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch webhooks");
    return res.json();
  },

  async createWebhook(url: string, events: string[] = ["conversation.created", "message.received"]) {
    const res = await fetch(`${API_BASE_URL}/webhooks`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ url, events }),
    });
    if (!res.ok) throw new Error("Failed to create webhook");
    return res.json();
  },

  // Analytics & CSAT (Strict Multi-Tenant Isolated)
  async getAnalyticsOverview(timeRange: string = "7d") {
    const res = await fetch(`${API_BASE_URL}/analytics/overview?time_range=${timeRange}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch analytics overview");
    return res.json();
  },

  async submitCSATRating(conversationId: string, rating: number, feedback?: string) {
    const res = await fetch(`${API_BASE_URL}/analytics/conversations/${conversationId}/csat`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ rating, feedback }),
    });
    if (!res.ok) throw new Error("Failed to submit CSAT rating");
    return res.json();
  },

  // Client Subscription & Billing Engine
  async getSubscriptionCurrent() {
    const res = await fetch(`${API_BASE_URL}/subscription/current`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch subscription details");
    return res.json();
  },

  async changeSubscriptionPlan(tier: string, billingCycle: string = "monthly", paymentMethod: string = "bKash Direct Merchant") {
    const res = await fetch(`${API_BASE_URL}/subscription/change-plan`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ tier, billing_cycle: billingCycle, payment_method: paymentMethod }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to update subscription plan");
    }
    return res.json();
  },

  async getSubscriptionInvoices() {
    const res = await fetch(`${API_BASE_URL}/subscription/invoices`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch subscription invoices");
    return res.json();
  },

  // bKash Tokenized Checkout (Sandbox & Production)
  async createBkashPayment(tier: string, billingCycle: string = "monthly", phoneNumber: string = "01770618575", couponCode?: string) {
    const res = await fetch(`${API_BASE_URL}/payment/bkash/create`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ tier, billing_cycle: billingCycle, phone_number: phoneNumber, coupon_code: couponCode || undefined }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to initiate bKash payment session");
    }
    return res.json();
  },

  async executeBkashPayment(paymentId: string, tier: string, billingCycle: string = "monthly", couponCode?: string, payerEmail?: string) {
    const res = await fetch(`${API_BASE_URL}/payment/bkash/execute`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ payment_id: paymentId, tier, billing_cycle: billingCycle, coupon_code: couponCode || undefined, payer_email: payerEmail || undefined }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to execute bKash payment");
    }
    return res.json();
  },

  async queryBkashPayment(paymentId: string) {
    const res = await fetch(`${API_BASE_URL}/payment/bkash/query/${paymentId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to query bKash payment status");
    return res.json();
  },

  // Team (Strict Multi-Tenant Isolated with Seat Limits)
  async getTeamMembers() {
    const res = await fetch(`${API_BASE_URL}/team/members`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch team members");
    return res.json();
  },

  async getTeamSeatsSummary() {
    const res = await fetch(`${API_BASE_URL}/team/seats-summary`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch team seats summary");
    return res.json();
  },

  async createTeamMember(data: {
    full_name: string;
    email: string;
    password?: string;
    role: string;
    department?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/team/members`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to add team member");
    }
    return res.json();
  },

  async updateTeamMember(memberId: string, data: {
    full_name?: string;
    role?: string;
    department?: string;
    is_active?: boolean;
  }) {
    const res = await fetch(`${API_BASE_URL}/team/members/${memberId}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to update team member");
    }
    return res.json();
  },

  async deleteTeamMember(memberId: string) {
    const res = await fetch(`${API_BASE_URL}/team/members/${memberId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to delete team member");
    }
    return res.json();
  },

  // Settings
  async getTenantSettings() {
    const res = await fetch(`${API_BASE_URL}/tenant/current`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch tenant settings");
    return res.json();
  },

  async updateTenantSettings(data: any) {
    const res = await fetch(`${API_BASE_URL}/tenant/settings`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update tenant settings");
    return res.json();
  },

  // Usage & Quotas (Live PostgreSQL calculated)
  async getUsageSummary() {
    const res = await fetch(`${API_BASE_URL}/usage/summary`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch live usage summary");
    return res.json();
  },

  // Platform Super Admin Control Plane APIs
  async getSuperAdminMetrics() {
    const res = await fetch(`${API_BASE_URL}/superadmin/metrics`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch Super Admin metrics");
    return res.json();
  },

  async getSuperAdminTenants(search?: string, status?: string) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${API_BASE_URL}/superadmin/tenants${query}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch tenant list");
    return res.json();
  },

  async updateTenantStatus(tenantId: string, isActive: boolean, reason?: string, category?: string) {
    const res = await fetch(`${API_BASE_URL}/superadmin/tenants/${tenantId}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ is_active: isActive, reason, category }),
    });
    if (!res.ok) throw new Error("Failed to update tenant status");
    return res.json();
  },

  async updateTenantPlan(tenantId: string, tier: string, tokenLimitOverride?: number, status?: string) {
    const res = await fetch(`${API_BASE_URL}/superadmin/tenants/${tenantId}/plan`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ tier, token_limit_override: tokenLimitOverride, status }),
    });
    if (!res.ok) throw new Error("Failed to update tenant plan");
    return res.json();
  },

  async getTenantModules(tenantId: string) {
    const res = await fetch(`${API_BASE_URL}/superadmin/tenants/${tenantId}/modules`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch tenant modules");
    return res.json();
  },

  async updateTenantModules(tenantId: string, modules: Record<string, boolean>) {
    const res = await fetch(`${API_BASE_URL}/superadmin/tenants/${tenantId}/modules`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ modules }),
    });
    if (!res.ok) throw new Error("Failed to update tenant module permissions");
    return res.json();
  },

  async getSuperAdminAuditLogs() {
    const res = await fetch(`${API_BASE_URL}/superadmin/audit-logs`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch audit logs");
    return res.json();
  },

  async getSuperAdminRevenue() {
    const res = await fetch(`${API_BASE_URL}/superadmin/revenue`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch revenue analytics");
    return res.json();
  },

  async getSuperAdminInfrastructure() {
    const res = await fetch(`${API_BASE_URL}/superadmin/infrastructure`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch infrastructure status");
    return res.json();
  },

  async getSuperAdminAISettings() {
    const res = await fetch(`${API_BASE_URL}/superadmin/infrastructure/settings`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch AI settings");
    return res.json();
  },

  async updateSuperAdminAISettings(payload: any) {
    const res = await fetch(`${API_BASE_URL}/superadmin/infrastructure/settings`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to update AI settings");
    }
    return res.json();
  },

  async testSuperAdminAIPing() {
    const res = await fetch(`${API_BASE_URL}/superadmin/infrastructure/test-ai`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to test AI connectivity");
    return res.json();
  },

  async deleteTenant(tenantId: string) {
    const res = await fetch(`${API_BASE_URL}/superadmin/tenants/${tenantId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete tenant");
    return res.json();
  },

  // Platform Super Admin bKash PGW Management
  async getSuperAdminBkashSettings() {
    const res = await fetch(`${API_BASE_URL}/superadmin/bkash/settings`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch bKash PGW settings");
    return res.json();
  },

  async updateSuperAdminBkashSettings(payload: any) {
    const res = await fetch(`${API_BASE_URL}/superadmin/bkash/settings`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to update bKash PGW settings");
    }
    return res.json();
  },

  async testSuperAdminBkashConnection() {
    const res = await fetch(`${API_BASE_URL}/superadmin/bkash/test-connection`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to test bKash PGW connection");
    return res.json();
  },

  // Public Plans & Coupon Validation
  async getPublicPlans() {
    const res = await fetch(`${API_BASE_URL}/plans/public`);
    if (!res.ok) throw new Error("Failed to fetch pricing plans");
    return res.json();
  },

  async validateCoupon(code: string, planCode: string, amountBdt: number) {
    const res = await fetch(`${API_BASE_URL}/plans/validate-coupon`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, plan_code: planCode, amount_bdt: amountBdt }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to validate coupon");
    }
    return res.json();
  },

  // Platform Super Admin Plans Management
  async getSuperAdminPlans() {
    const res = await fetch(`${API_BASE_URL}/superadmin/plans`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch superadmin plans");
    return res.json();
  },

  async createSuperAdminPlan(data: any) {
    const res = await fetch(`${API_BASE_URL}/superadmin/plans`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to create pricing plan");
    }
    return res.json();
  },

  async updateSuperAdminPlan(planId: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/superadmin/plans/${planId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to update pricing plan");
    }
    return res.json();
  },

  async deleteSuperAdminPlan(planId: string) {
    const res = await fetch(`${API_BASE_URL}/superadmin/plans/${planId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete pricing plan");
    return res.json();
  },

  // Platform Super Admin Coupons Management
  async getSuperAdminCoupons() {
    const res = await fetch(`${API_BASE_URL}/superadmin/coupons`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch coupons");
    return res.json();
  },

  async createSuperAdminCoupon(data: any) {
    const res = await fetch(`${API_BASE_URL}/superadmin/coupons`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to create coupon");
    }
    return res.json();
  },

  async updateSuperAdminCoupon(couponId: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/superadmin/coupons/${couponId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to update coupon");
    }
    return res.json();
  },

  async deleteSuperAdminCoupon(couponId: string) {
    const res = await fetch(`${API_BASE_URL}/superadmin/coupons/${couponId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete coupon");
    return res.json();
  },

  // Public Self-Serve Package Provisioning
  async provisionTenant(data: {
    organization_name: string;
    admin_name: string;
    admin_email: string;
    password: string;
    subscription_tier: string;
    billing_cycle?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/auth/provision-tenant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to provision tenant");
    }
    return res.json();
  },

  // Platform Branding & Theme Management
  async getPublicTheme() {
    const res = await fetch(`${API_BASE_URL}/superadmin/theme/public`);
    if (!res.ok) throw new Error("Failed to fetch public theme");
    return res.json();
  },

  async getSuperAdminTheme() {
    const res = await fetch(`${API_BASE_URL}/superadmin/theme`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch superadmin theme");
    return res.json();
  },

  async updateSuperAdminTheme(data: any) {
    const res = await fetch(`${API_BASE_URL}/superadmin/theme`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to update platform theme");
    }
    return res.json();
  },

  async sendPublicDemoChat(message: string, chatHistory: any[] = []) {
    const res = await fetch(`${API_BASE_URL}/public/demo-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, chat_history: chatHistory }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to get AI response");
    }
    return res.json();
  },

  async getTokenTelemetry(limit: number = 50) {
    const res = await fetch(`${API_BASE_URL}/usage/token-telemetry?limit=${limit}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch granular token telemetry");
    return res.json();
  },
};



