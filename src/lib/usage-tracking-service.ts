import { supabase } from "./supabase";
import { featureFlagService } from "./feature-flag-service";

export interface UsageLimit {
	featureName: string;
	currentUsage: number;
	limit: number;
	remaining: number;
	resetDate: string;
	usagePercentage: number;
	isNearLimit: boolean;
	isAtLimit: boolean;
}

export interface UsageWarning {
	id: string;
	userId: string;
	featureName: string;
	warningType: "threshold" | "limit_reached" | "overage";
	message: string;
	severity: "low" | "medium" | "high";
	createdAt: string;
	isRead: boolean;
}

export interface UsageNotification {
	type: "warning" | "limit_reached" | "overage";
	featureName: string;
	message: string;
	actionRequired: boolean;
	upgradeRequired: boolean;
}

class UsageTrackingService {
	private readonly WARNING_THRESHOLDS = {
		low: 0.7, // 70% usage
		medium: 0.85, // 85% usage
		high: 0.95, // 95% usage
	};

	/**
	 * Track usage for a specific feature
	 */
	async trackUsage(
		userId: string,
		featureName: string,
		incrementBy: number = 1
	): Promise<{
		success: boolean;
		usageLimit?: UsageLimit;
		notification?: UsageNotification;
	}> {
		try {
			// Check if user has access to the feature
			const featureAccess = await featureFlagService.checkFeatureAccess(
				userId,
				featureName
			);

			if (!featureAccess.hasAccess) {
				return {
					success: false,
					notification: {
						type: "limit_reached",
						featureName,
						message: featureAccess.reason || "Feature not available",
						actionRequired: true,
						upgradeRequired: true,
					},
				};
			}

			// Increment usage
			const success = await featureFlagService.incrementFeatureUsage(
				userId,
				featureName,
				incrementBy
			);

			if (!success) {
				return {
					success: false,
					notification: {
						type: "limit_reached",
						featureName,
						message: "Usage limit exceeded",
						actionRequired: true,
						upgradeRequired: true,
					},
				};
			}

			// Get updated usage information
			const usageLimit = await this.getUsageLimit(userId, featureName);

			// Check for warnings or notifications
			const notification = await this.checkUsageNotifications(
				userId,
				featureName,
				usageLimit
			);

			return {
				success: true,
				usageLimit,
				notification,
			};
		} catch (error) {
			console.error("Error tracking usage:", error);
			return {
				success: false,
			};
		}
	}

	/**
	 * Get usage limit information for a feature
	 */
	async getUsageLimit(
		userId: string,
		featureName: string
	): Promise<UsageLimit | null> {
		try {
			const featureAccess = await featureFlagService.checkFeatureAccess(
				userId,
				featureName
			);

			if (!featureAccess.hasAccess || !featureAccess.usageLimit) {
				return null;
			}

			const usagePercentage =
				featureAccess.usageCount! / featureAccess.usageLimit;
			const isNearLimit = usagePercentage >= this.WARNING_THRESHOLDS.medium;
			const isAtLimit = usagePercentage >= 1;

			return {
				featureName,
				currentUsage: featureAccess.usageCount!,
				limit: featureAccess.usageLimit,
				remaining: featureAccess.remaining!,
				resetDate: featureAccess.resetDate!,
				usagePercentage,
				isNearLimit,
				isAtLimit,
			};
		} catch (error) {
			console.error("Error getting usage limit:", error);
			return null;
		}
	}

	/**
	 * Get all usage limits for a user
	 */
	async getAllUsageLimits(userId: string): Promise<UsageLimit[]> {
		try {
			// Get user's subscription
			const { data: subscription } = await supabase
				.from("user_subscriptions")
				.select("plan_id")
				.eq("user_id", userId)
				.eq("status", "active")
				.eq("deleted_at", null)
				.single();

			if (!subscription) {
				return [];
			}

			// Get feature flags for the plan
			const featureFlags = await featureFlagService.getFeatureFlags(
				subscription.plan_id
			);
			const usageLimits: UsageLimit[] = [];

			for (const flag of featureFlags) {
				if (flag.usage_limit && flag.usage_limit > 0) {
					const usageLimit = await this.getUsageLimit(
						userId,
						flag.feature_name
					);
					if (usageLimit) {
						usageLimits.push(usageLimit);
					}
				}
			}

			return usageLimits;
		} catch (error) {
			console.error("Error getting all usage limits:", error);
			return [];
		}
	}

	/**
	 * Check for usage notifications and warnings
	 */
	async checkUsageNotifications(
		userId: string,
		featureName: string,
		usageLimit: UsageLimit
	): Promise<UsageNotification | null> {
		try {
			const { usagePercentage, isAtLimit, isNearLimit } = usageLimit;

			// Check if we should create a notification
			if (isAtLimit) {
				return {
					type: "limit_reached",
					featureName,
					message: `You've reached the limit for ${featureName}. Upgrade your plan to continue using this feature.`,
					actionRequired: true,
					upgradeRequired: true,
				};
			}

			if (isNearLimit) {
				return {
					type: "warning",
					featureName,
					message: `You're approaching the limit for ${featureName}. Consider upgrading your plan.`,
					actionRequired: false,
					upgradeRequired: false,
				};
			}

			return null;
		} catch (error) {
			console.error("Error checking usage notifications:", error);
			return null;
		}
	}

	/**
	 * Create usage warning notification
	 */
	async createUsageWarning(
		userId: string,
		featureName: string,
		warningType: "threshold" | "limit_reached" | "overage",
		message: string,
		severity: "low" | "medium" | "high" = "medium"
	): Promise<void> {
		try {
			await supabase.from("subscription_notifications").insert({
				user_id: userId,
				notification_type: "usage_warning",
				title: "Usage Warning",
				message,
				metadata: {
					feature_name: featureName,
					warning_type: warningType,
					severity,
				},
			});
		} catch (error) {
			console.error("Error creating usage warning:", error);
		}
	}

	/**
	 * Get usage warnings for a user
	 */
	async getUsageWarnings(userId: string): Promise<UsageWarning[]> {
		try {
			const { data, error } = await supabase
				.from("subscription_notifications")
				.select("*")
				.eq("user_id", userId)
				.eq("notification_type", "usage_warning")
				.eq("is_read", false)
				.order("created_at", { ascending: false });

			if (error) {
				console.error("Error fetching usage warnings:", error);
				return [];
			}

			return (
				data?.map((notification) => ({
					id: notification.id,
					userId: notification.user_id,
					featureName: notification.metadata?.feature_name || "Unknown",
					warningType: notification.metadata?.warning_type || "threshold",
					message: notification.message,
					severity: notification.metadata?.severity || "medium",
					createdAt: notification.created_at,
					isRead: notification.is_read,
				})) || []
			);
		} catch (error) {
			console.error("Error getting usage warnings:", error);
			return [];
		}
	}

	/**
	 * Mark usage warning as read
	 */
	async markWarningAsRead(warningId: string): Promise<void> {
		try {
			await supabase
				.from("subscription_notifications")
				.update({ is_read: true, read_at: new Date().toISOString() })
				.eq("id", warningId);
		} catch (error) {
			console.error("Error marking warning as read:", error);
		}
	}

	/**
	 * Reset usage counters (called by cron job)
	 */
	async resetUsageCounters(): Promise<number> {
		try {
			const { data, error } = await supabase.rpc("reset_usage_counters");

			if (error) {
				console.error("Error resetting usage counters:", error);
				return 0;
			}

			return data || 0;
		} catch (error) {
			console.error("Error in resetUsageCounters:", error);
			return 0;
		}
	}

	/**
	 * Get usage analytics for a user
	 */
	async getUsageAnalytics(
		userId: string,
		period: "week" | "month" | "year" = "month"
	) {
		try {
			const { data, error } = await supabase
				.from("subscription_usage_analytics")
				.select("*")
				.eq("user_id", userId)
				.order("period_start", { ascending: false })
				.limit(12); // Last 12 periods

			if (error) {
				console.error("Error fetching usage analytics:", error);
				return [];
			}

			return data || [];
		} catch (error) {
			console.error("Error getting usage analytics:", error);
			return [];
		}
	}

	/**
	 * Check if user can perform an action based on usage limits
	 */
	async canPerformAction(
		userId: string,
		featureName: string,
		actionCount: number = 1
	): Promise<{
		canPerform: boolean;
		reason?: string;
		usageLimit?: UsageLimit;
	}> {
		try {
			const usageLimit = await this.getUsageLimit(userId, featureName);

			if (!usageLimit) {
				return {
					canPerform: true, // No limits defined
				};
			}

			if (usageLimit.currentUsage + actionCount > usageLimit.limit) {
				return {
					canPerform: false,
					reason: "Action would exceed usage limit",
					usageLimit,
				};
			}

			return {
				canPerform: true,
				usageLimit,
			};
		} catch (error) {
			console.error("Error checking if user can perform action:", error);
			return {
				canPerform: false,
				reason: "Error checking usage limits",
			};
		}
	}

	/**
	 * Get usage summary for dashboard
	 */
	async getUsageSummary(userId: string) {
		try {
			const usageLimits = await this.getAllUsageLimits(userId);
			const warnings = await this.getUsageWarnings(userId);

			const summary = {
				totalFeatures: usageLimits.length,
				featuresNearLimit: usageLimits.filter((ul) => ul.isNearLimit).length,
				featuresAtLimit: usageLimits.filter((ul) => ul.isAtLimit).length,
				activeWarnings: warnings.length,
				usageLimits,
				warnings,
			};

			return summary;
		} catch (error) {
			console.error("Error getting usage summary:", error);
			return {
				totalFeatures: 0,
				featuresNearLimit: 0,
				featuresAtLimit: 0,
				activeWarnings: 0,
				usageLimits: [],
				warnings: [],
			};
		}
	}
}

export const usageTrackingService = new UsageTrackingService();
