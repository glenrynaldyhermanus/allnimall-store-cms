// Subscription Types for Allnimall Store CMS
// Generated from database schema

export interface SubscriptionPlan {
	id: string;
	created_at: string;
	created_by: string;
	updated_at?: string;
	updated_by?: string;
	deleted_at?: string;
	name: string;
	description?: string;
	price: number;
	billing_cycle: "monthly" | "yearly";
	features: string[];
	limits: {
		products: number;
		transactions_per_month: number;
		stores: number;
		employees: number;
		customers: number;
	};
	restrictions: {
		pos_access: boolean;
		advanced_reports: boolean;
		online_store: boolean;
		api_access: boolean;
		priority_support: boolean;
	};
	is_active: boolean;
	stripe_price_id?: string;
	sort_order: number;
}

export interface UserSubscription {
	id: string;
	created_at: string;
	created_by: string;
	updated_at?: string;
	updated_by?: string;
	deleted_at?: string;
	user_id: string;
	plan_id: string;
	status: "active" | "trial" | "cancelled" | "expired" | "past_due";
	stripe_subscription_id?: string;
	stripe_customer_id?: string;
	start_date: string;
	end_date?: string;
	next_billing_date?: string;
	trial_end_date?: string;
	cancelled_at?: string;
	cancellation_reason?: string;
	auto_renew: boolean;
}

export interface FeatureUsage {
	id: string;
	created_at: string;
	created_by: string;
	updated_at?: string;
	updated_by?: string;
	deleted_at?: string;
	user_id: string;
	feature_name: string;
	usage_count: number;
	usage_limit: number;
	reset_date: string;
	last_reset_date?: string;
	usage_period: "daily" | "weekly" | "monthly" | "yearly";
}

export interface BillingInvoice {
	id: string;
	created_at: string;
	created_by: string;
	updated_at?: string;
	updated_by?: string;
	deleted_at?: string;
	user_id: string;
	subscription_id?: string;
	stripe_invoice_id?: string;
	invoice_number: string;
	amount: number;
	currency: string;
	status: "pending" | "paid" | "failed" | "cancelled" | "refunded";
	due_date: string;
	paid_at?: string;
	invoice_url?: string;
	pdf_url?: string;
}

export interface BillingPayment {
	id: string;
	created_at: string;
	created_by: string;
	updated_at?: string;
	updated_by?: string;
	deleted_at?: string;
	invoice_id: string;
	stripe_payment_intent_id?: string;
	amount: number;
	currency: string;
	payment_method: string;
	status: "succeeded" | "failed" | "pending" | "cancelled";
	failure_reason?: string;
	failure_code?: string;
	receipt_url?: string;
}

export interface BillingTransaction {
	id: string;
	created_at: string;
	created_by: string;
	updated_at?: string;
	updated_by?: string;
	deleted_at?: string;
	user_id: string;
	transaction_type:
		| "subscription"
		| "upgrade"
		| "downgrade"
		| "refund"
		| "credit";
	amount: number;
	currency: string;
	description?: string;
	reference_id?: string;
	reference_type?: string;
	stripe_transaction_id?: string;
}

export interface FeatureFlag {
	id: string;
	created_at: string;
	created_by: string;
	updated_at?: string;
	updated_by?: string;
	deleted_at?: string;
	feature_name: string;
	plan_id?: string;
	enabled: boolean;
	usage_limit?: number;
	reset_period?: "daily" | "weekly" | "monthly" | "yearly";
	description?: string;
	category?: string;
	is_core_feature: boolean;
}

// API Response Types
export interface SubscriptionStatusResponse {
	subscription_id: string;
	plan_id: string;
	plan_name: string;
	status: string;
	is_active: boolean;
	trial_end_date?: string;
	next_billing_date?: string;
}

export interface FeatureUsageResponse {
	usage_count: number;
	usage_limit: number;
	remaining: number;
	reset_date: string;
	is_within_limit: boolean;
}

// Request Types
export interface CreateSubscriptionRequest {
	plan_id: string;
	payment_method_id: string;
	billing_cycle: "monthly" | "yearly";
}

export interface UpdateSubscriptionRequest {
	plan_id: string;
	billing_cycle?: "monthly" | "yearly";
}

export interface CancelSubscriptionRequest {
	reason?: string;
	immediate?: boolean;
}

export interface TrackUsageRequest {
	feature_name: string;
	increment?: number;
}

// Plan Features Interface
export interface PlanFeatures {
	free: {
		products: { limit: number };
		transactions: { limit: number; period: string };
		stores: { limit: number };
		employees: { limit: number };
		pos: { enabled: boolean };
		reports: { level: string };
		onlineStore: { enabled: boolean };
	};
	pro: {
		products: { limit: number };
		transactions: { limit: number };
		stores: { limit: number };
		employees: { limit: number };
		pos: { enabled: boolean };
		reports: { level: string };
		onlineStore: { enabled: boolean };
	};
	enterprise: {
		products: { limit: number };
		transactions: { limit: number };
		stores: { limit: number };
		employees: { limit: number };
		pos: { enabled: boolean };
		reports: { level: string };
		onlineStore: { enabled: boolean };
	};
}

// Default Plan Features
export const DEFAULT_PLAN_FEATURES: PlanFeatures = {
	free: {
		products: { limit: 50 },
		transactions: { limit: 100, period: "month" },
		stores: { limit: 1 },
		employees: { limit: 0 },
		pos: { enabled: false },
		reports: { level: "basic" },
		onlineStore: { enabled: false },
	},
	pro: {
		products: { limit: -1 }, // unlimited
		transactions: { limit: -1 },
		stores: { limit: -1 },
		employees: { limit: -1 },
		pos: { enabled: true },
		reports: { level: "advanced" },
		onlineStore: { enabled: false },
	},
	enterprise: {
		products: { limit: -1 },
		transactions: { limit: -1 },
		stores: { limit: -1 },
		employees: { limit: -1 },
		pos: { enabled: true },
		reports: { level: "advanced" },
		onlineStore: { enabled: true },
	},
};

// Feature Categories
export const FEATURE_CATEGORIES = {
	CORE: "core",
	REPORTS: "reports",
	POS: "pos",
	ECOMMERCE: "ecommerce",
	INTEGRATION: "integration",
	SUPPORT: "support",
	MANAGEMENT: "management",
} as const;

// Usage Periods
export const USAGE_PERIODS = {
	DAILY: "daily",
	WEEKLY: "weekly",
	MONTHLY: "monthly",
	YEARLY: "yearly",
} as const;

// Subscription Statuses
export const SUBSCRIPTION_STATUSES = {
	ACTIVE: "active",
	TRIAL: "trial",
	CANCELLED: "cancelled",
	EXPIRED: "expired",
	PAST_DUE: "past_due",
} as const;

// Billing Statuses
export const BILLING_STATUSES = {
	PENDING: "pending",
	PAID: "paid",
	FAILED: "failed",
	CANCELLED: "cancelled",
	REFUNDED: "refunded",
} as const;

// Payment Statuses
export const PAYMENT_STATUSES = {
	SUCCEEDED: "succeeded",
	FAILED: "failed",
	PENDING: "pending",
	CANCELLED: "cancelled",
} as const;
