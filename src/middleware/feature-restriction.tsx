import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { featureFlagService, FeatureAccess } from "@/lib/feature-flag-service";

export interface FeatureRestrictionConfig {
	featureName: string;
	redirectTo?: string;
	showUpgradePrompt?: boolean;
	allowPartialAccess?: boolean;
	customMessage?: string;
}

export interface MiddlewareContext {
	userId: string;
	planId?: string;
	featureAccess: FeatureAccess;
}

/**
 * Feature restriction middleware for API routes
 */
export function withFeatureRestriction(
	config: FeatureRestrictionConfig,
	handler: (
		req: NextRequest,
		context: MiddlewareContext
	) => Promise<NextResponse>
) {
	return async (req: NextRequest): Promise<NextResponse> => {
		try {
			// Extract user ID from request (adjust based on your auth implementation)
			const userId =
				req.headers.get("x-user-id") || req.nextUrl.searchParams.get("userId");

			if (!userId) {
				return NextResponse.json(
					{ error: "User ID required" },
					{ status: 401 }
				);
			}

			// Check feature access
			const featureAccess = await featureFlagService.checkFeatureAccess(
				userId,
				config.featureName
			);

			// Create middleware context
			const context: MiddlewareContext = {
				userId,
				featureAccess,
			};

			// Check if user has access
			if (!featureAccess.hasAccess) {
				// Handle different restriction scenarios
				if (config.showUpgradePrompt) {
					return NextResponse.json(
						{
							error:
								config.customMessage ||
								"Feature not available in your current plan",
							reason: featureAccess.reason,
							upgradeRequired: true,
							usageInfo:
								featureAccess.usageCount !== undefined
									? {
											usageCount: featureAccess.usageCount,
											usageLimit: featureAccess.usageLimit,
											remaining: featureAccess.remaining,
											resetDate: featureAccess.resetDate,
									  }
									: undefined,
						},
						{ status: 403 }
					);
				}

				if (config.redirectTo) {
					return NextResponse.redirect(new URL(config.redirectTo, req.url));
				}

				return NextResponse.json(
					{
						error: config.customMessage || "Access denied",
						reason: featureAccess.reason,
					},
					{ status: 403 }
				);
			}

			// User has access, proceed with handler
			return await handler(req, context);
		} catch (error) {
			console.error("Feature restriction middleware error:", error);
			return NextResponse.json(
				{ error: "Internal server error" },
				{ status: 500 }
			);
		}
	};
}

/**
 * Feature restriction middleware for frontend components
 */
export function withFeatureRestrictionClient(
	featureName: string,
	fallbackComponent?: React.ComponentType<any>
) {
	return function FeatureRestrictedComponent(
		WrappedComponent: React.ComponentType<any>
	) {
		return function RestrictedComponent(props: any) {
			const [hasAccess, setHasAccess] = React.useState<boolean | null>(null);
			const [loading, setLoading] = React.useState(true);
			const [featureAccess, setFeatureAccess] =
				React.useState<FeatureAccess | null>(null);

			React.useEffect(() => {
				async function checkAccess() {
					try {
						// Get user ID from your auth context
						const userId = props.userId || "current-user-id"; // Adjust based on your auth

						const access = await featureFlagService.checkFeatureAccess(
							userId,
							featureName
						);
						setHasAccess(access.hasAccess);
						setFeatureAccess(access);
					} catch (error) {
						console.error("Error checking feature access:", error);
						setHasAccess(false);
					} finally {
						setLoading(false);
					}
				}

				checkAccess();
			}, [featureName]);

			if (loading) {
				return <div>Loading...</div>;
			}

			if (!hasAccess) {
				if (fallbackComponent) {
					return React.createElement(fallbackComponent, {
						...props,
						featureAccess,
						featureName,
					});
				}

				return (
					<div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
						<h3 className="text-lg font-semibold text-yellow-800">
							Feature Not Available
						</h3>
						<p className="text-yellow-700 mt-2">
							{featureAccess?.reason ||
								"This feature is not available in your current plan."}
						</p>
						{featureAccess?.usageCount !== undefined && (
							<div className="mt-3 text-sm text-yellow-600">
								<p>
									Usage: {featureAccess.usageCount}/{featureAccess.usageLimit}
								</p>
								<p>Remaining: {featureAccess.remaining}</p>
								{featureAccess.resetDate && (
									<p>
										Resets:{" "}
										{new Date(featureAccess.resetDate).toLocaleDateString()}
									</p>
								)}
							</div>
						)}
					</div>
				);
			}

			return React.createElement(WrappedComponent, props);
		};
	};
}

/**
 * Hook for checking feature access in React components
 */
export function useFeatureAccess(featureName: string, userId?: string) {
	const [hasAccess, setHasAccess] = React.useState<boolean | null>(null);
	const [loading, setLoading] = React.useState(true);
	const [featureAccess, setFeatureAccess] =
		React.useState<FeatureAccess | null>(null);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		async function checkAccess() {
			try {
				if (!userId) {
					setError("User ID required");
					setLoading(false);
					return;
				}

				const access = await featureFlagService.checkFeatureAccess(
					userId,
					featureName
				);
				setHasAccess(access.hasAccess);
				setFeatureAccess(access);
				setError(null);
			} catch (err) {
				console.error("Error checking feature access:", err);
				setError("Failed to check feature access");
				setHasAccess(false);
			} finally {
				setLoading(false);
			}
		}

		checkAccess();
	}, [featureName, userId]);

	return {
		hasAccess,
		loading,
		featureAccess,
		error,
	};
}

/**
 * Hook for incrementing feature usage
 */
export function useFeatureUsage(featureName: string, userId?: string) {
	const [incrementing, setIncrementing] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const incrementUsage = React.useCallback(
		async (amount: number = 1) => {
			if (!userId) {
				setError("User ID required");
				return false;
			}

			setIncrementing(true);
			setError(null);

			try {
				const success = await featureFlagService.incrementFeatureUsage(
					userId,
					featureName,
					amount
				);

				if (!success) {
					setError("Failed to increment usage");
				}

				return success;
			} catch (err) {
				console.error("Error incrementing feature usage:", err);
				setError("Failed to increment usage");
				return false;
			} finally {
				setIncrementing(false);
			}
		},
		[featureName, userId]
	);

	return {
		incrementUsage,
		incrementing,
		error,
	};
}

/**
 * Route protection utility
 */
export function protectRoute(
	featureName: string,
	redirectTo: string = "/pricing"
) {
	return function RouteProtection(Component: React.ComponentType<any>) {
		return function ProtectedRoute(props: any) {
			const { hasAccess, loading } = useFeatureAccess(
				featureName,
				props.userId
			);

			React.useEffect(() => {
				if (!loading && !hasAccess) {
					// Redirect to pricing page or show upgrade prompt
					window.location.href = redirectTo;
				}
			}, [hasAccess, loading, redirectTo]);

			if (loading) {
				return <div>Loading...</div>;
			}

			if (!hasAccess) {
				return (
					<div className="flex items-center justify-center min-h-screen">
						<div className="text-center">
							<h1 className="text-2xl font-bold text-gray-900 mb-4">
								Access Restricted
							</h1>
							<p className="text-gray-600 mb-6">
								This feature requires a higher plan.
							</p>
							<a
								href={redirectTo}
								className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
								View Plans
							</a>
						</div>
					</div>
				);
			}

			return React.createElement(Component, props);
		};
	};
}

/**
 * Usage warning component
 */
export function UsageWarning({
	featureName,
	userId,
	warningThreshold = 0.8,
	onUpgrade,
}: {
	featureName: string;
	userId?: string;
	warningThreshold?: number;
	onUpgrade?: () => void;
}) {
	const { featureAccess, loading } = useFeatureAccess(featureName, userId);

	if (
		loading ||
		!featureAccess ||
		!featureAccess.usageCount ||
		!featureAccess.usageLimit
	) {
		return null;
	}

	const usagePercentage = featureAccess.usageCount / featureAccess.usageLimit;
	const isNearLimit = usagePercentage >= warningThreshold;
	const isAtLimit = usagePercentage >= 1;

	if (!isNearLimit) {
		return null;
	}

	return (
		<div
			className={`p-3 rounded-lg border ${
				isAtLimit
					? "border-red-200 bg-red-50"
					: "border-yellow-200 bg-yellow-50"
			}`}>
			<div className="flex items-center justify-between">
				<div>
					<h4
						className={`font-medium ${
							isAtLimit ? "text-red-800" : "text-yellow-800"
						}`}>
						{isAtLimit ? "Usage Limit Reached" : "Usage Warning"}
					</h4>
					<p
						className={`text-sm mt-1 ${
							isAtLimit ? "text-red-700" : "text-yellow-700"
						}`}>
						{featureAccess.usageCount}/{featureAccess.usageLimit} used
						{featureAccess.resetDate && (
							<span>
								{" "}
								• Resets{" "}
								{new Date(featureAccess.resetDate).toLocaleDateString()}
							</span>
						)}
					</p>
				</div>
				{onUpgrade && (
					<button
						onClick={onUpgrade}
						className={`px-3 py-1 text-sm font-medium rounded ${
							isAtLimit
								? "bg-red-600 text-white hover:bg-red-700"
								: "bg-yellow-600 text-white hover:bg-yellow-700"
						}`}>
						Upgrade
					</button>
				)}
			</div>
		</div>
	);
}
