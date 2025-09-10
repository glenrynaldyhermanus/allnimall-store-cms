import { supabase } from "./supabase";
import { featureFlagService } from "./feature-flag-service";
import { usageTrackingService } from "./usage-tracking-service";

export interface PlanValidationResult {
	isValid: boolean;
	reason?: string;
	currentPlan?: {
		id: string;
		name: string;
		limits: Record<string, number>;
	};
	requiredPlan?: {
		id: string;
		name: string;
		upgradeRequired: boolean;
	};
	usageInfo?: {
		current: number;
		limit: number;
		remaining: number;
	};
}

export interface PlanRestriction {
	feature: string;
	action: string;
	limit: number;
	current: number;
	canPerform: boolean;
	reason?: string;
}

class PlanValidationService {
	/**
	 * Validate if user can perform an action based on their plan
	 */
	async validateAction(
		userId: string,
		featureName: string,
		actionType: string,
		actionCount: number = 1
	): Promise<PlanValidationResult> {
		try {
			// Get user's current subscription
			const { data: subscription, error: subError } = await supabase
				.from("user_subscriptions")
				.select(
					`
          id,
          plan_id,
          status,
          subscription_plans (
            id,
            name,
            limits,
            restrictions
          )
        `
				)
				.eq("user_id", userId)
				.eq("status", "active")
				.eq("deleted_at", null)
				.single();

			if (subError || !subscription) {
				return {
					isValid: false,
					reason: "No active subscription found",
				};
			}

			const plan = subscription.subscription_plans;
			if (!plan) {
				return {
					isValid: false,
					reason: "Plan information not found",
				};
			}

			// Check feature access
			const featureAccess = await featureFlagService.checkFeatureAccess(
				userId,
				featureName
			);

			if (!featureAccess.hasAccess) {
				return {
					isValid: false,
					reason:
						featureAccess.reason || "Feature not available in current plan",
					currentPlan: {
						id: plan.id,
						name: plan.name,
						limits: plan.limits || {},
					},
				};
			}

			// Check usage limits
			if (featureAccess.usageLimit && featureAccess.usageLimit > 0) {
				const canPerform = await usageTrackingService.canPerformAction(
					userId,
					featureName,
					actionCount
				);

				if (!canPerform.canPerform) {
					return {
						isValid: false,
						reason: canPerform.reason || "Usage limit exceeded",
						currentPlan: {
							id: plan.id,
							name: plan.name,
							limits: plan.limits || {},
						},
						usageInfo: canPerform.usageLimit
							? {
									current: canPerform.usageLimit.currentUsage,
									limit: canPerform.usageLimit.limit,
									remaining: canPerform.usageLimit.remaining,
							  }
							: undefined,
					};
				}
			}

			return {
				isValid: true,
				currentPlan: {
					id: plan.id,
					name: plan.name,
					limits: plan.limits || {},
				},
			};
		} catch (error) {
			console.error("Error validating action:", error);
			return {
				isValid: false,
				reason: "Error validating action",
			};
		}
	}

	/**
	 * Validate multiple actions at once
	 */
	async validateMultipleActions(
		userId: string,
		actions: Array<{
			featureName: string;
			actionType: string;
			actionCount?: number;
		}>
	): Promise<Record<string, PlanValidationResult>> {
		const results: Record<string, PlanValidationResult> = {};

		for (const action of actions) {
			const key = `${action.featureName}:${action.actionType}`;
			results[key] = await this.validateAction(
				userId,
				action.featureName,
				action.actionType,
				action.actionCount || 1
			);
		}

		return results;
	}

	/**
	 * Get plan restrictions for a user
	 */
	async getPlanRestrictions(userId: string): Promise<PlanRestriction[]> {
		try {
			// Get user's subscription and plan
			const { data: subscription, error: subError } = await supabase
				.from("user_subscriptions")
				.select(
					`
          id,
          plan_id,
          subscription_plans (
            id,
            name,
            limits,
            restrictions
          )
        `
				)
				.eq("user_id", userId)
				.eq("status", "active")
				.eq("deleted_at", null)
				.single();

			if (subError || !subscription) {
				return [];
			}

			const plan = subscription.subscription_plans;
			if (!plan) {
				return [];
			}

			// Get feature flags for the plan
			const featureFlags = await featureFlagService.getFeatureFlags(plan.id);
			const restrictions: PlanRestriction[] = [];

			for (const flag of featureFlags) {
				if (flag.usage_limit && flag.usage_limit > 0) {
					const usage = await featureFlagService.getFeatureUsage(
						userId,
						flag.feature_name
					);

					restrictions.push({
						feature: flag.feature_name,
						action: "usage",
						limit: flag.usage_limit,
						current: usage.usage_count,
						canPerform: usage.usage_count < flag.usage_limit,
						reason:
							usage.usage_count >= flag.usage_limit
								? "Usage limit reached"
								: undefined,
					});
				}
			}

			return restrictions;
		} catch (error) {
			console.error("Error getting plan restrictions:", error);
			return [];
		}
	}

	/**
	 * Check if user can upgrade to a specific plan
	 */
	async canUpgradeToPlan(
		userId: string,
		targetPlanId: string
	): Promise<{
		canUpgrade: boolean;
		reason?: string;
		currentUsage?: any;
		targetLimits?: Record<string, number>;
	}> {
		try {
			// Get current subscription
			const { data: currentSub, error: subError } = await supabase
				.from("user_subscriptions")
				.select(
					`
          id,
          plan_id,
          subscription_plans (
            id,
            name,
            limits
          )
        `
				)
				.eq("user_id", userId)
				.eq("status", "active")
				.eq("deleted_at", null)
				.single();

			if (subError || !currentSub) {
				return {
					canUpgrade: false,
					reason: "No active subscription found",
				};
			}

			// Get target plan
			const { data: targetPlan, error: planError } = await supabase
				.from("subscription_plans")
				.select("*")
				.eq("id", targetPlanId)
				.eq("is_active", true)
				.eq("deleted_at", null)
				.single();

			if (planError || !targetPlan) {
				return {
					canUpgrade: false,
					reason: "Target plan not found",
				};
			}

			// Get current usage
			const { data: usageData } = await supabase.rpc("get_user_current_usage", {
				user_uuid: userId,
			});

			const currentUsage = usageData?.[0] || {};

			// Check if current usage fits within target plan limits
			const targetLimits = targetPlan.limits || {};

			if (
				targetLimits.max_stores &&
				currentUsage.stores_used > targetLimits.max_stores
			) {
				return {
					canUpgrade: false,
					reason: "Current usage exceeds target plan limits",
					currentUsage,
					targetLimits,
				};
			}

			if (
				targetLimits.max_users &&
				currentUsage.users_used > targetLimits.max_users
			) {
				return {
					canUpgrade: false,
					reason: "Current usage exceeds target plan limits",
					currentUsage,
					targetLimits,
				};
			}

			if (
				targetLimits.max_products &&
				currentUsage.products_used > targetLimits.max_products
			) {
				return {
					canUpgrade: false,
					reason: "Current usage exceeds target plan limits",
					currentUsage,
					targetLimits,
				};
			}

			return {
				canUpgrade: true,
				currentUsage,
				targetLimits,
			};
		} catch (error) {
			console.error("Error checking upgrade eligibility:", error);
			return {
				canUpgrade: false,
				reason: "Error checking upgrade eligibility",
			};
		}
	}

	/**
	 * Get recommended plan based on current usage
	 */
	async getRecommendedPlan(userId: string): Promise<{
		recommendedPlan?: {
			id: string;
			name: string;
			price: number;
			reason: string;
		};
		currentPlan?: {
			id: string;
			name: string;
		};
		usageAnalysis: any;
	}> {
		try {
			// Get current subscription
			const { data: subscription, error: subError } = await supabase
				.from("user_subscriptions")
				.select(
					`
          id,
          plan_id,
          subscription_plans (
            id,
            name,
            price
          )
        `
				)
				.eq("user_id", userId)
				.eq("status", "active")
				.eq("deleted_at", null)
				.single();

			if (subError || !subscription) {
				return {
					usageAnalysis: {},
				};
			}

			const currentPlan = subscription.subscription_plans;

			// Get current usage
			const { data: usageData } = await supabase.rpc("get_user_current_usage", {
				user_uuid: userId,
			});

			const usageAnalysis = usageData?.[0] || {};

			// Get all available plans
			const { data: plans, error: plansError } = await supabase
				.from("subscription_plans")
				.select("*")
				.eq("is_active", true)
				.eq("deleted_at", null)
				.order("price", { ascending: true });

			if (plansError || !plans) {
				return {
					currentPlan,
					usageAnalysis,
				};
			}

			// Find the most suitable plan based on usage
			for (const plan of plans) {
				const limits = plan.limits || {};

				// Check if this plan can accommodate current usage
				const canAccommodate =
					(!limits.max_stores ||
						usageAnalysis.stores_used <= limits.max_stores) &&
					(!limits.max_users || usageAnalysis.users_used <= limits.max_users) &&
					(!limits.max_products ||
						usageAnalysis.products_used <= limits.max_products) &&
					(!limits.max_customers ||
						usageAnalysis.customers_used <= limits.max_customers);

				if (canAccommodate && plan.id !== currentPlan?.id) {
					return {
						recommendedPlan: {
							id: plan.id,
							name: plan.name,
							price: plan.price,
							reason: "Plan can accommodate your current usage",
						},
						currentPlan,
						usageAnalysis,
					};
				}
			}

			return {
				currentPlan,
				usageAnalysis,
			};
		} catch (error) {
			console.error("Error getting recommended plan:", error);
			return {
				usageAnalysis: {},
			};
		}
	}

	/**
	 * Validate API request based on plan restrictions
	 */
	async validateApiRequest(
		userId: string,
		endpoint: string,
		method: string,
		data?: any
	): Promise<PlanValidationResult> {
		try {
			// Map endpoints to features
			const endpointFeatureMap: Record<string, string> = {
				"/api/products": "product_management",
				"/api/stores": "store_management",
				"/api/users": "user_management",
				"/api/customers": "customer_management",
				"/api/sales": "sales_management",
				"/api/reports": "reporting",
				"/api/inventory": "inventory_management",
			};

			const featureName = endpointFeatureMap[endpoint] || "general_access";

			// Determine action type based on HTTP method
			let actionType = "read";
			if (method === "POST") actionType = "create";
			else if (method === "PUT" || method === "PATCH") actionType = "update";
			else if (method === "DELETE") actionType = "delete";

			return await this.validateAction(userId, featureName, actionType);
		} catch (error) {
			console.error("Error validating API request:", error);
			return {
				isValid: false,
				reason: "Error validating request",
			};
		}
	}
}

export const planValidationService = new PlanValidationService();
