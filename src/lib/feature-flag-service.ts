import { supabase } from "./supabase";

export interface FeatureFlag {
	id: string;
	feature_name: string;
	plan_id?: string;
	enabled: boolean;
	usage_limit?: number;
	reset_period?: "daily" | "weekly" | "monthly" | "yearly";
	description?: string;
	category?: string;
	is_core_feature: boolean;
}

export interface FeatureAccess {
	hasAccess: boolean;
	reason?: string;
	usageCount?: number;
	usageLimit?: number;
	remaining?: number;
	resetDate?: string;
}

export interface PlanFeatureMapping {
	planId: string;
	planName: string;
	features: FeatureFlag[];
	limits: Record<string, number>;
	restrictions: Record<string, unknown>;
}

class FeatureFlagService {
	private cache: Map<string, FeatureFlag[]> = new Map();
	private cacheExpiry: Map<string, number> = new Map();
	private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

	/**
	 * Get all feature flags for a specific plan
	 */
	async getFeatureFlags(planId?: string): Promise<FeatureFlag[]> {
		const cacheKey = planId || "all";

		// Check cache first
		if (this.isCacheValid(cacheKey)) {
			return this.cache.get(cacheKey) || [];
		}

		try {
			let query = supabase
				.from("feature_flags")
				.select("*")
				.eq("deleted_at", null);

			if (planId) {
				query = query.or(`plan_id.eq.${planId},plan_id.is.null`);
			}

			const { data, error } = (await query) as any;

			if (error) {
				console.error("Error fetching feature flags:", error);
				return [];
			}

			// Update cache
			this.cache.set(cacheKey, data || []);
			this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);

			return data || [];
		} catch (error) {
			console.error("Error in getFeatureFlags:", error);
			return [];
		}
	}

	/**
	 * Check if a user has access to a specific feature
	 */
	async checkFeatureAccess(
		userId: string,
		featureName: string,
		planId?: string
	): Promise<FeatureAccess> {
		try {
			// Get user's subscription if planId not provided
			if (!planId) {
				const { data: subscription } = (await supabase
					.from("user_subscriptions")
					.select("plan_id, status")
					.eq("user_id", userId)
					.eq("status", "active")
					.eq("deleted_at", null)
					.single()) as any;

				if (!subscription) {
					return {
						hasAccess: false,
						reason: "No active subscription found",
					};
				}

				planId = subscription.plan_id as string;
			}

			// Get feature flags for the plan
			const featureFlags = await this.getFeatureFlags(planId);
			const featureFlag = featureFlags.find(
				(ff) => ff.feature_name === featureName
			);

			if (!featureFlag) {
				return {
					hasAccess: false,
					reason: "Feature not found",
				};
			}

			if (!featureFlag.enabled) {
				return {
					hasAccess: false,
					reason: "Feature is disabled for this plan",
				};
			}

			// Check usage limits if applicable
			if (featureFlag.usage_limit && featureFlag.usage_limit > 0) {
				const usage = await this.getFeatureUsage(userId, featureName);

				if (usage.usage_count >= featureFlag.usage_limit) {
					return {
						hasAccess: false,
						reason: "Usage limit exceeded",
						usageCount: usage.usage_count,
						usageLimit: featureFlag.usage_limit,
						remaining: 0,
						resetDate: usage.reset_date,
					};
				}

				return {
					hasAccess: true,
					usageCount: usage.usage_count,
					usageLimit: featureFlag.usage_limit,
					remaining: featureFlag.usage_limit - usage.usage_count,
					resetDate: usage.reset_date,
				};
			}

			return {
				hasAccess: true,
			};
		} catch (error) {
			console.error("Error checking feature access:", error);
			return {
				hasAccess: false,
				reason: "Error checking feature access",
			};
		}
	}

	/**
	 * Get current usage for a feature
	 */
	async getFeatureUsage(userId: string, featureName: string) {
		try {
			const { data, error } = (await supabase
				.from("feature_usage")
				.select("usage_count, usage_limit, reset_date")
				.eq("user_id", userId)
				.eq("feature_name", featureName)
				.eq("deleted_at", null)
				.single()) as any;

			if (error && error.code !== "PGRST116") {
				// Not found error
				console.error("Error fetching feature usage:", error);
				return {
					usage_count: 0,
					usage_limit: 0,
					reset_date: new Date().toISOString(),
				};
			}

			return (
				data || {
					usage_count: 0,
					usage_limit: 0,
					reset_date: new Date().toISOString(),
				}
			);
		} catch (error) {
			console.error("Error in getFeatureUsage:", error);
			return {
				usage_count: 0,
				usage_limit: 0,
				reset_date: new Date().toISOString(),
			};
		}
	}

	/**
	 * Increment feature usage
	 */
	async incrementFeatureUsage(
		userId: string,
		featureName: string,
		incrementBy: number = 1
	): Promise<boolean> {
		try {
			const { data, error } = await supabase.rpc("increment_feature_usage", {
				user_uuid: userId,
				feature_name_param: featureName,
				increment_by: incrementBy,
			} as any);

			if (error) {
				console.error("Error incrementing feature usage:", error);
				return false;
			}

			return data === true;
		} catch (error) {
			console.error("Error in incrementFeatureUsage:", error);
			return false;
		}
	}

	/**
	 * Get plan-based feature mapping
	 */
	async getPlanFeatureMapping(
		planId: string
	): Promise<PlanFeatureMapping | null> {
		try {
			// Get plan details
			const { data: plan, error: planError } = await supabase
				.from("subscription_plans")
				.select("*")
				.eq("id", planId)
				.eq("deleted_at", null)
				.single();

			if (planError || !plan) {
				console.error("Error fetching plan:", planError);
				return null;
			}

			// Get feature flags for this plan
			const features = await this.getFeatureFlags(planId);

			return {
				planId: plan.id as string,
				planName: plan.name as string,
				features,
				limits: (plan.limits as Record<string, number>) || {},
				restrictions: (plan.restrictions as Record<string, unknown>) || {},
			};
		} catch (error) {
			console.error("Error in getPlanFeatureMapping:", error);
			return null;
		}
	}

	/**
	 * Get all plan feature mappings
	 */
	async getAllPlanFeatureMappings(): Promise<PlanFeatureMapping[]> {
		try {
			const { data: plans, error } = await supabase
				.from("subscription_plans")
				.select("*")
				.eq("is_active", true)
				.eq("deleted_at", null);

			if (error) {
				console.error("Error fetching plans:", error);
				return [];
			}

			const mappings: PlanFeatureMapping[] = [];

			for (const plan of plans || []) {
				const mapping = await this.getPlanFeatureMapping(plan.id as string);
				if (mapping) {
					mappings.push(mapping);
				}
			}

			return mappings;
		} catch (error) {
			console.error("Error in getAllPlanFeatureMappings:", error);
			return [];
		}
	}

	/**
	 * Check if cache is valid
	 */
	private isCacheValid(cacheKey: string): boolean {
		const expiry = this.cacheExpiry.get(cacheKey);
		return expiry ? Date.now() < expiry : false;
	}

	/**
	 * Clear cache
	 */
	clearCache(): void {
		this.cache.clear();
		this.cacheExpiry.clear();
	}

	/**
	 * Clear cache for specific plan
	 */
	clearCacheForPlan(planId: string): void {
		this.cache.delete(planId);
		this.cache.delete("all");
		this.cacheExpiry.delete(planId);
		this.cacheExpiry.delete("all");
	}

	/**
	 * Get feature categories
	 */
	async getFeatureCategories(): Promise<string[]> {
		try {
			const { data, error } = await supabase
				.from("feature_flags")
				.select("category")
				.not("category", "is", null)
				.eq("deleted_at", null);

			if (error) {
				console.error("Error fetching feature categories:", error);
				return [];
			}

			const categories = [
				...new Set(data?.map((item) => (item as any).category).filter(Boolean)),
			];
			return categories;
		} catch (error) {
			console.error("Error in getFeatureCategories:", error);
			return [];
		}
	}

	/**
	 * Get features by category
	 */
	async getFeaturesByCategory(
		category: string,
		planId?: string
	): Promise<FeatureFlag[]> {
		const allFeatures = await this.getFeatureFlags(planId);
		return allFeatures.filter((feature) => feature.category === category);
	}

	/**
	 * Check multiple features at once
	 */
	async checkMultipleFeatures(
		userId: string,
		featureNames: string[],
		planId?: string
	): Promise<Record<string, FeatureAccess>> {
		const results: Record<string, FeatureAccess> = {};

		for (const featureName of featureNames) {
			results[featureName] = await this.checkFeatureAccess(
				userId,
				featureName,
				planId
			);
		}

		return results;
	}
}

export const featureFlagService = new FeatureFlagService();
