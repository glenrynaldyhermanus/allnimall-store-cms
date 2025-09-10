// Subscription Service for Allnimall Store CMS
// Handles subscription management, usage tracking, and billing

import { createClient } from "@/lib/supabase";
import { MidtransService } from "@/lib/midtrans-service";
import type {
	SubscriptionPlan,
	UserSubscription,
	FeatureUsage,
	SubscriptionStatusResponse,
	FeatureUsageResponse,
	CreateSubscriptionRequest,
	UpdateSubscriptionRequest,
	CancelSubscriptionRequest,
	TrackUsageRequest,
} from "@/types/subscription";

const supabase = createClient();

export class SubscriptionService {
	// =============================================
	// SUBSCRIPTION PLAN MANAGEMENT
	// =============================================

	/**
	 * Get all active subscription plans
	 */
	static async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
		const { data, error } = await supabase
			.from("subscription_plans")
			.select("*")
			.eq("is_active", true)
			.eq("deleted_at", null)
			.order("sort_order");

		if (error) {
			throw new Error(`Failed to fetch subscription plans: ${error.message}`);
		}

		return data || [];
	}

	/**
	 * Get subscription plan by ID
	 */
	static async getSubscriptionPlan(
		planId: string
	): Promise<SubscriptionPlan | null> {
		const { data, error } = await supabase
			.from("subscription_plans")
			.select("*")
			.eq("id", planId)
			.eq("is_active", true)
			.eq("deleted_at", null)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return null; // Plan not found
			}
			throw new Error(`Failed to fetch subscription plan: ${error.message}`);
		}

		return data;
	}

	// =============================================
	// USER SUBSCRIPTION MANAGEMENT
	// =============================================

	/**
	 * Get user's current subscription status
	 */
	static async getUserSubscriptionStatus(
		userId: string
	): Promise<SubscriptionStatusResponse | null> {
		const { data, error } = await supabase.rpc(
			"check_user_subscription_status",
			{ user_uuid: userId }
		);

		if (error) {
			throw new Error(`Failed to check subscription status: ${error.message}`);
		}

		return data?.[0] || null;
	}

	/**
	 * Get user's subscription details
	 */
	static async getUserSubscription(
		userId: string
	): Promise<UserSubscription | null> {
		const { data, error } = await supabase
			.from("user_subscriptions")
			.select(
				`
        *,
        subscription_plans (
          name,
          description,
          price,
          billing_cycle,
          features,
          limits,
          restrictions
        )
      `
			)
			.eq("user_id", userId)
			.eq("deleted_at", null)
			.order("created_at", { ascending: false })
			.limit(1)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return null; // No subscription found
			}
			throw new Error(`Failed to fetch user subscription: ${error.message}`);
		}

		return data;
	}

	/**
	 * Create a new subscription
	 */
	static async createSubscription(
		userId: string,
		request: CreateSubscriptionRequest
	): Promise<UserSubscription> {
		// Get the plan details
		const plan = await this.getSubscriptionPlan(request.plan_id);
		if (!plan) {
			throw new Error("Subscription plan not found");
		}

		// Calculate dates
		const startDate = new Date();
		const endDate =
			request.billing_cycle === "yearly"
				? new Date(
						startDate.getFullYear() + 1,
						startDate.getMonth(),
						startDate.getDate()
				  )
				: new Date(
						startDate.getFullYear(),
						startDate.getMonth() + 1,
						startDate.getDate()
				  );

		const trialEndDate = new Date(
			startDate.getTime() + 14 * 24 * 60 * 60 * 1000
		); // 14 days trial

		// Create subscription record
		const { data, error } = await supabase
			.from("user_subscriptions")
			.insert({
				user_id: userId,
				plan_id: request.plan_id,
				status: "trial",
				start_date: startDate.toISOString(),
				end_date: endDate.toISOString(),
				next_billing_date: endDate.toISOString(),
				trial_end_date: trialEndDate.toISOString(),
				auto_renew: true,
			})
			.select()
			.single();

		if (error) {
			throw new Error(`Failed to create subscription: ${error.message}`);
		}

		// Initialize feature usage tracking
		await this.initializeFeatureUsage(userId, plan);

		return data;
	}

	/**
	 * Create subscription with payment
	 */
	static async createSubscriptionWithPayment(
		userId: string,
		request: CreateSubscriptionRequest,
		customerDetails: {
			first_name: string;
			last_name?: string;
			email: string;
			phone: string;
		}
	): Promise<{ subscription: UserSubscription; payment: any }> {
		// Create subscription first
		const subscription = await this.createSubscription(userId, request);

		// Get plan details for payment
		const plan = await this.getSubscriptionPlan(request.plan_id);
		if (!plan) {
			throw new Error("Subscription plan not found");
		}

		// Create payment with Midtrans
		const payment = await MidtransService.createSubscriptionPayment(
			subscription.id,
			plan.price,
			customerDetails,
			plan.billing_cycle
		);

		return { subscription, payment };
	}

	/**
	 * Update user subscription
	 */
	static async updateSubscription(
		subscriptionId: string,
		request: UpdateSubscriptionRequest
	): Promise<UserSubscription> {
		const { data, error } = await supabase
			.from("user_subscriptions")
			.update({
				plan_id: request.plan_id,
				updated_at: new Date().toISOString(),
			})
			.eq("id", subscriptionId)
			.select()
			.single();

		if (error) {
			throw new Error(`Failed to update subscription: ${error.message}`);
		}

		return data;
	}

	/**
	 * Cancel user subscription
	 */
	static async cancelSubscription(
		subscriptionId: string,
		request: CancelSubscriptionRequest
	): Promise<UserSubscription> {
		const { data, error } = await supabase
			.from("user_subscriptions")
			.update({
				status: "cancelled",
				cancelled_at: new Date().toISOString(),
				cancellation_reason: request.reason,
				auto_renew: false,
				updated_at: new Date().toISOString(),
			})
			.eq("id", subscriptionId)
			.select()
			.single();

		if (error) {
			throw new Error(`Failed to cancel subscription: ${error.message}`);
		}

		return data;
	}

	// =============================================
	// FEATURE USAGE TRACKING
	// =============================================

	/**
	 * Check feature usage limit
	 */
	static async checkFeatureUsageLimit(
		userId: string,
		featureName: string
	): Promise<FeatureUsageResponse | null> {
		const { data, error } = await supabase.rpc("check_feature_usage_limit", {
			user_uuid: userId,
			feature_name_param: featureName,
		});

		if (error) {
			throw new Error(`Failed to check feature usage limit: ${error.message}`);
		}

		return data?.[0] || null;
	}

	/**
	 * Track feature usage
	 */
	static async trackFeatureUsage(
		userId: string,
		request: TrackUsageRequest
	): Promise<boolean> {
		const { data, error } = await supabase.rpc("increment_feature_usage", {
			user_uuid: userId,
			feature_name_param: request.feature_name,
			increment_by: request.increment || 1,
		});

		if (error) {
			throw new Error(`Failed to track feature usage: ${error.message}`);
		}

		return data || false;
	}

	/**
	 * Get user's feature usage
	 */
	static async getUserFeatureUsage(userId: string): Promise<FeatureUsage[]> {
		const { data, error } = await supabase
			.from("feature_usage")
			.select("*")
			.eq("user_id", userId)
			.eq("deleted_at", null)
			.order("created_at", { ascending: false });

		if (error) {
			throw new Error(`Failed to fetch feature usage: ${error.message}`);
		}

		return data || [];
	}

	/**
	 * Initialize feature usage tracking for a user
	 */
	static async initializeFeatureUsage(
		userId: string,
		plan: SubscriptionPlan
	): Promise<void> {
		const features = plan.features || [];
		const limits = plan.limits || {};

		for (const feature of features) {
			const limit = limits[feature] || 0;

			await supabase.from("feature_usage").insert({
				user_id: userId,
				feature_name: feature,
				usage_count: 0,
				usage_limit: limit,
				reset_date: new Date(
					Date.now() + 30 * 24 * 60 * 60 * 1000
				).toISOString(), // 30 days
				usage_period: "monthly",
			});
		}
	}

	// =============================================
	// BILLING MANAGEMENT
	// =============================================

	/**
	 * Get user's billing invoices
	 */
	static async getUserInvoices(userId: string, limit = 10, offset = 0) {
		const { data, error } = await supabase
			.from("billing_invoices")
			.select("*")
			.eq("user_id", userId)
			.eq("deleted_at", null)
			.order("created_at", { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) {
			throw new Error(`Failed to fetch invoices: ${error.message}`);
		}

		return data || [];
	}

	/**
	 * Get user's billing payments
	 */
	static async getUserPayments(userId: string, limit = 10, offset = 0) {
		const { data, error } = await supabase
			.from("billing_payments")
			.select(
				`
        *,
        billing_invoices (
          invoice_number,
          amount,
          status
        )
      `
			)
			.eq("billing_invoices.user_id", userId)
			.eq("billing_invoices.deleted_at", null)
			.order("created_at", { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) {
			throw new Error(`Failed to fetch payments: ${error.message}`);
		}

		return data || [];
	}

	// =============================================
	// UTILITY FUNCTIONS
	// =============================================

	/**
	 * Check if user has access to a feature
	 */
	static async hasFeatureAccess(
		userId: string,
		featureName: string
	): Promise<boolean> {
		const subscription = await this.getUserSubscriptionStatus(userId);
		if (!subscription || !subscription.is_active) {
			return false;
		}

		const plan = await this.getSubscriptionPlan(subscription.plan_id);
		if (!plan) {
			return false;
		}

		return plan.features.includes(featureName);
	}

	/**
	 * Check if user is within usage limit for a feature
	 */
	static async isWithinUsageLimit(
		userId: string,
		featureName: string
	): Promise<boolean> {
		const usage = await this.checkFeatureUsageLimit(userId, featureName);
		return usage?.is_within_limit || false;
	}

	/**
	 * Get user's current plan features
	 */
	static async getUserPlanFeatures(userId: string) {
		const subscription = await this.getUserSubscriptionStatus(userId);
		if (!subscription) {
			return null;
		}

		const plan = await this.getSubscriptionPlan(subscription.plan_id);
		return plan;
	}

	/**
	 * Reset usage counters (to be run daily)
	 */
	static async resetUsageCounters(): Promise<number> {
		const { data, error } = await supabase.rpc("reset_usage_counters");

		if (error) {
			throw new Error(`Failed to reset usage counters: ${error.message}`);
		}

		return data || 0;
	}

	/**
	 * Process recurring billing
	 */
	static async processRecurringBilling(): Promise<void> {
		const today = new Date();

		// Get subscriptions that are due for billing
		const { data: subscriptions, error } = await supabase
			.from("user_subscriptions")
			.select(
				`
				id,
				user_id,
				plan_id,
				status,
				next_billing_date,
				auto_renew,
				subscription_plans (
					name,
					price,
					billing_cycle
				)
			`
			)
			.eq("status", "active")
			.eq("auto_renew", true)
			.lte("next_billing_date", today.toISOString())
			.eq("deleted_at", null);

		if (error) {
			throw new Error(
				`Failed to fetch subscriptions for billing: ${error.message}`
			);
		}

		for (const subscription of subscriptions || []) {
			try {
				// Create billing invoice
				const { data: invoice, error: invoiceError } = await supabase
					.from("billing_invoices")
					.insert({
						user_id: subscription.user_id,
						subscription_id: subscription.id,
						invoice_number: `INV-${subscription.id}-${Date.now()}`,
						amount: subscription.subscription_plans.price,
						currency: "IDR",
						status: "pending",
						due_date: new Date(
							Date.now() + 7 * 24 * 60 * 60 * 1000
						).toISOString(), // 7 days
					})
					.select()
					.single();

				if (invoiceError) {
					console.error(
						`Failed to create invoice for subscription ${subscription.id}:`,
						invoiceError
					);
					continue;
				}

				// Update next billing date
				const nextBillingDate = new Date();
				if (subscription.subscription_plans.billing_cycle === "yearly") {
					nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
				} else {
					nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
				}

				await supabase
					.from("user_subscriptions")
					.update({
						next_billing_date: nextBillingDate.toISOString(),
						updated_at: new Date().toISOString(),
					})
					.eq("id", subscription.id);

				console.log(
					`Created invoice ${invoice.id} for subscription ${subscription.id}`
				);
			} catch (error) {
				console.error(
					`Error processing billing for subscription ${subscription.id}:`,
					error
				);
			}
		}
	}

	/**
	 * Handle payment failure
	 */
	static async handlePaymentFailure(
		subscriptionId: string,
		reason: string
	): Promise<void> {
		// Update subscription status
		await supabase
			.from("user_subscriptions")
			.update({
				status: "past_due",
				cancellation_reason: reason,
				updated_at: new Date().toISOString(),
			})
			.eq("id", subscriptionId);

		// Update invoice status
		await supabase
			.from("billing_invoices")
			.update({
				status: "failed",
				updated_at: new Date().toISOString(),
			})
			.eq("subscription_id", subscriptionId)
			.eq("status", "pending");
	}

	/**
	 * Handle successful payment
	 */
	static async handleSuccessfulPayment(
		subscriptionId: string,
		transactionId: string
	): Promise<void> {
		// Update subscription status
		await supabase
			.from("user_subscriptions")
			.update({
				status: "active",
				updated_at: new Date().toISOString(),
			})
			.eq("id", subscriptionId);

		// Update invoice status
		await supabase
			.from("billing_invoices")
			.update({
				status: "paid",
				paid_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.eq("subscription_id", subscriptionId)
			.eq("status", "pending");

		// Create payment record
		const { data: invoice } = await supabase
			.from("billing_invoices")
			.select("id, amount, user_id")
			.eq("subscription_id", subscriptionId)
			.eq("status", "paid")
			.single();

		if (invoice) {
			await supabase.from("billing_payments").insert({
				invoice_id: invoice.id,
				stripe_payment_intent_id: transactionId,
				amount: invoice.amount,
				currency: "IDR",
				payment_method: "midtrans",
				status: "succeeded",
			});
		}
	}
}

// Export default instance
export default SubscriptionService;
