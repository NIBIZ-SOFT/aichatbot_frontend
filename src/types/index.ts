export type UserRole =
  | "super_admin"
  | "tenant_owner"
  | "tenant_admin"
  | "support_agent"
  | "sales_agent"
  | "member"
  | "viewer";

export type SubscriptionTier = "free" | "starter" | "growth" | "enterprise";
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled";

export type ConversationStatus = "ai_active" | "human_active" | "pending_agent" | "resolved" | "closed";
export type ConversationPriority = "low" | "medium" | "high" | "urgent";
export type SenderType = "visitor" | "ai" | "agent" | "system";

export interface User {
  id: string;
  tenant_id: string | null;
  email: string;
  full_name: string;
  role: UserRole;
  department?: string | null;
  is_active: boolean;
  is_online: boolean;
  avatar_url?: string | null;
  enabled_modules?: Record<string, boolean>;
  tenant_name?: string | null;
  created_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  custom_domain?: string | null;
  whitelabel_enabled: boolean;
  branding_config: {
    brand_name?: string;
    primary_color?: string;
    logo_url?: string;
  };
  enabled_modules?: Record<string, boolean>;
  created_at: string;
}

export interface AIAssistant {
  id: string;
  tenant_id: string;
  name: string;
  description?: string | null;
  personality_type: string;
  model_name: string;
  temperature: number;
  top_p: number;
  max_output_tokens: number;
  system_instruction: string;
  fallback_message: string;
  auto_handover_keywords: string[];
  safety_settings?: {
    guardrails?: {
      enabled: boolean;
      industry_type?: string;
      allowed_topics?: string[];
      restricted_topics?: string[];
      warning_message?: string;
      max_off_topic_strikes?: number;
      auto_pause_on_breach?: boolean;
      handover_message?: string;
    };
    [key: string]: any;
  };
  is_active: boolean;
  created_at: string;
}

export interface KnowledgeBase {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  source_type: string;
  source_url?: string | null;
  status: string;
  chunk_count: number;
  created_at: string;
}

export interface Website {
  id: string;
  assistant_id?: string | null;
  name: string;
  domain: string;
  widget_key: string;
  primary_color: string;
  header_title: string;
  welcome_message: string;
  position: string;
  business_category?: string;
  ecommerce_config?: {
    enabled?: boolean;
    show_products_carousel?: boolean;
    allow_instant_checkout?: boolean;
    cod_enabled?: boolean;
    bkash_enabled?: boolean;
    eps_enabled?: boolean;
    delivery_charge_inside_dhaka?: number;
    delivery_charge_outside_dhaka?: number;
  };
  branding_config?: {
    bot_avatar_url?: string;
    launcher_icon?: string;
    auto_open_delay_sec?: number;
    notification_sound_enabled?: boolean;
  };
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  tenant_id: string;
  title: string;
  slug: string;
  category: string;
  sku?: string | null;
  unit_price: number;
  selling_price: number;
  stock_quantity: number;
  stock_status: 'in_stock' | 'out_of_stock' | 'pre_order' | string;
  images: string[];
  features?: string[];
  description?: string | null;
  specifications: Record<string, any>;
  tags: string[];
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface ProductCreateInput {
  title: string;
  category?: string;
  sku?: string;
  unit_price: number;
  selling_price: number;
  stock_quantity?: number;
  stock_status?: string;
  images?: string[];
  description?: string;
  specifications?: Record<string, any>;
  tags?: string[];
  is_active?: boolean;
  priority?: number;
}

export interface OrderItem {
  product_id: string;
  title: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  selected_size?: string;
  selected_color?: string;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: string;
  tenant_id: string;
  website_id: string;
  conversation_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  delivery_address: string;
  delivery_city: string;
  delivery_charge: number;
  items_json: Array<{
    product_id: string;
    title: string;
    unit_price: number;
    quantity: number;
    line_total: number;
    selected_size?: string | null;
    selected_color?: string | null;
    image_url?: string | null;
  }>;
  subtotal_amount: number;
  total_amount: number;
  payment_method: 'cash_on_delivery' | 'bkash' | 'eps' | string;
  payment_status: 'unpaid' | 'paid' | 'refunded' | string;
  bkash_trx_id?: string | null;
  order_status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | string;
  sms_sent: boolean;
  tracking_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EcommerceSettings {
  business_category: string;
  cod_enabled: boolean;
  bkash_enabled: boolean;
  bkash_is_sandbox?: boolean;
  bkash_base_url?: string;
  bkash_app_key_masked?: string | null;
  bkash_username_masked?: string | null;
  eps_enabled?: boolean;
  eps_is_sandbox?: boolean;
  eps_base_url?: string;
  eps_username_masked?: string | null;
  eps_merchant_id_masked?: string | null;
  eps_store_id_masked?: string | null;
  eps_merchant_number?: string | null;
  delivery_charge_inside_dhaka: number;
  delivery_charge_outside_dhaka: number;
  sms_notifications_enabled: boolean;
  sms_provider: string;
  sms_sender_id_masked?: string | null;
  sms_order_template?: string | null;
}

export interface Contact {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  tags: string[];
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: SenderType;
  sender_id?: string | null;
  sender_name?: string | null;
  content: string;
  is_internal_note: boolean;
  prompt_tokens?: number;
  completion_tokens?: number;
  latency_ms?: number | null;
  sources_cited?: any[];
  metadata_json?: Record<string, any>;
  ui_component?: Record<string, any>;
  created_at: string;
}

export interface Conversation {
  id: string;
  tenant_id: string;
  website_id?: string | null;
  contact_id?: string | null;
  assigned_agent_id?: string | null;
  visitor_session_id: string;
  visitor_name?: string | null;
  visitor_email?: string | null;
  visitor_company?: string | null;
  status: ConversationStatus;
  priority: ConversationPriority;
  department: string;
  ai_paused: boolean;
  last_sentiment_score?: number | null;
  is_lead_detected: boolean;
  lead_data?: any;
  ai_summary?: string | null;
  tags: string[];
  unread_count: number;
  last_message_at: string;
  created_at: string;
  messages?: Message[];
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  is_active: boolean;
  last_used_at?: string | null;
  created_at: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  last_delivery_status?: string | null;
  last_delivery_at?: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "alert" | "success";
  is_read: boolean;
  link?: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  ip_address?: string | null;
  metadata_json: Record<string, any>;
  created_at: string;
}

export interface DashboardStats {
  total_conversations: number;
  ai_resolved_count: number;
  human_resolved_count: number;
  pending_count: number;
  active_visitors: number;
  total_tokens_used: number;
  token_limit: number;
  usage_percentage: number;
  total_contacts: number;
  total_websites: number;
}

export interface TokenBreakdown {
  system_prompt_tokens: number;
  rag_context_tokens: number;
  chat_history_tokens: number;
  user_query_tokens: number;
  tools_schema_tokens?: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
  cost_bdt: number;
}

export interface TokenInteractionItem {
  message_id: string;
  conversation_id: string;
  visitor_session_id: string;
  visitor_name: string;
  customer_query: string;
  ai_response: string;
  created_at: string;
  latency_ms: number;
  sources_cited: Array<{ source?: string; title?: string; similarity?: number; content?: string }>;
  token_breakdown: TokenBreakdown;
  rag_percentage: number;
  optimization_tip: string;
  ui_component?: { type: string; data: any };
}

export interface TokenTelemetryResponse {
  total_interactions_logged: number;
  kpi: {
    avg_total_tokens: number;
    avg_prompt_tokens: number;
    avg_rag_tokens: number;
    avg_output_tokens: number;
    contracted_token_rate_bdt_per_10k?: number;
    is_custom_contract_rate?: boolean;
    avg_cost_bdt_per_chat: number;
    estimated_cost_bdt_1k_chats: number;
  };
  distribution: {
    system_prompt_pct: number;
    rag_context_pct: number;
    chat_history_pct: number;
    user_query_pct: number;
    output_tokens_pct: number;
  };
  interactions: TokenInteractionItem[];
}

