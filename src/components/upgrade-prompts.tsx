import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Crown,
	Zap,
	Shield,
	BarChart3,
	Users,
	Store,
	Package,
	ArrowRight,
	CheckCircle,
	XCircle,
} from "lucide-react";

export interface UpgradePromptProps {
	featureName: string;
	currentPlan: string;
	recommendedPlan?: {
		id: string;
		name: string;
		price: number;
		features: string[];
	};
	onUpgrade: (planId: string) => void;
	onDismiss?: () => void;
	variant?: "banner" | "modal" | "inline" | "toast";
	severity?: "low" | "medium" | "high";
}

export function UpgradePrompt({
	featureName,
	currentPlan,
	recommendedPlan,
	onUpgrade,
	onDismiss,
	variant = "banner",
	severity = "medium",
}: UpgradePromptProps) {
	const getFeatureIcon = (feature: string) => {
		switch (feature.toLowerCase()) {
			case "product_management":
				return <Package className="h-5 w-5" />;
			case "store_management":
				return <Store className="h-5 w-5" />;
			case "user_management":
				return <Users className="h-5 w-5" />;
			case "reporting":
				return <BarChart3 className="h-5 w-5" />;
			case "advanced_features":
				return <Zap className="h-5 w-5" />;
			case "priority_support":
				return <Shield className="h-5 w-5" />;
			default:
				return <Crown className="h-5 w-5" />;
		}
	};

	const getSeverityStyles = () => {
		switch (severity) {
			case "high":
				return {
					container: "border-red-200 bg-red-50",
					text: "text-red-800",
					button: "bg-red-600 hover:bg-red-700 text-white",
					icon: "text-red-600",
				};
			case "medium":
				return {
					container: "border-yellow-200 bg-yellow-50",
					text: "text-yellow-800",
					button: "bg-yellow-600 hover:bg-yellow-700 text-white",
					icon: "text-yellow-600",
				};
			default:
				return {
					container: "border-blue-200 bg-blue-50",
					text: "text-blue-800",
					button: "bg-blue-600 hover:bg-blue-700 text-white",
					icon: "text-blue-600",
				};
		}
	};

	const styles = getSeverityStyles();

	if (variant === "banner") {
		return (
			<Alert className={`${styles.container} border-l-4 border-l-current`}>
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						<div className={styles.icon}>{getFeatureIcon(featureName)}</div>
						<div>
							<h4 className={`font-semibold ${styles.text}`}>
								Upgrade Required
							</h4>
							<p className={`text-sm ${styles.text} opacity-90`}>
								{featureName} is not available in your {currentPlan} plan.
								{recommendedPlan &&
									` Upgrade to ${recommendedPlan.name} to unlock this feature.`}
							</p>
						</div>
					</div>
					<div className="flex items-center space-x-2">
						{recommendedPlan && (
							<Button
								size="sm"
								className={styles.button}
								onClick={() => onUpgrade(recommendedPlan.id)}>
								Upgrade Now
								<ArrowRight className="ml-1 h-4 w-4" />
							</Button>
						)}
						{onDismiss && (
							<Button
								variant="ghost"
								size="sm"
								onClick={onDismiss}
								className={styles.text}>
								Dismiss
							</Button>
						)}
					</div>
				</div>
			</Alert>
		);
	}

	if (variant === "modal") {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
				<Card className="w-full max-w-md mx-4">
					<CardHeader>
						<div className="flex items-center space-x-3">
							<div className={styles.icon}>{getFeatureIcon(featureName)}</div>
							<CardTitle className={styles.text}>Upgrade Required</CardTitle>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className={`text-sm ${styles.text} opacity-90`}>
							{featureName} is not available in your {currentPlan} plan.
						</p>

						{recommendedPlan && (
							<div className="space-y-3">
								<div className="p-3 bg-white rounded-lg border">
									<h4 className="font-semibold text-gray-900 mb-2">
										{recommendedPlan.name}
									</h4>
									<div className="text-2xl font-bold text-gray-900 mb-2">
										${recommendedPlan.price}/month
									</div>
									<div className="space-y-1">
										{recommendedPlan.features.map((feature, index) => (
											<div
												key={index}
												className="flex items-center space-x-2 text-sm text-gray-600">
												<CheckCircle className="h-4 w-4 text-green-500" />
												<span>{feature}</span>
											</div>
										))}
									</div>
								</div>

								<div className="flex space-x-2">
									<Button
										className={`flex-1 ${styles.button}`}
										onClick={() => onUpgrade(recommendedPlan.id)}>
										Upgrade to {recommendedPlan.name}
									</Button>
									{onDismiss && (
										<Button variant="outline" onClick={onDismiss}>
											Maybe Later
										</Button>
									)}
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		);
	}

	if (variant === "inline") {
		return (
			<Card className={`${styles.container} border-l-4 border-l-current`}>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<div className={styles.icon}>{getFeatureIcon(featureName)}</div>
							<div>
								<h4 className={`font-semibold ${styles.text}`}>
									Feature Locked
								</h4>
								<p className={`text-sm ${styles.text} opacity-90`}>
									{featureName} requires a higher plan
								</p>
							</div>
						</div>
						{recommendedPlan && (
							<Button
								size="sm"
								className={styles.button}
								onClick={() => onUpgrade(recommendedPlan.id)}>
								Upgrade
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (variant === "toast") {
		return (
			<div
				className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${styles.container} z-50`}>
				<div className="flex items-center space-x-3">
					<div className={styles.icon}>{getFeatureIcon(featureName)}</div>
					<div className="flex-1">
						<p className={`text-sm font-medium ${styles.text}`}>
							{featureName} requires upgrade
						</p>
					</div>
					{recommendedPlan && (
						<Button
							size="sm"
							className={styles.button}
							onClick={() => onUpgrade(recommendedPlan.id)}>
							Upgrade
						</Button>
					)}
					{onDismiss && (
						<Button
							variant="ghost"
							size="sm"
							onClick={onDismiss}
							className={styles.text}>
							×
						</Button>
					)}
				</div>
			</div>
		);
	}

	return null;
}

export interface FeatureTeaserProps {
	featureName: string;
	description: string;
	benefits: string[];
	currentPlan: string;
	requiredPlan: string;
	onUpgrade: (planId: string) => void;
	onLearnMore?: () => void;
}

export function FeatureTeaser({
	featureName,
	description,
	benefits,
	currentPlan,
	requiredPlan,
	onUpgrade,
	onLearnMore,
}: FeatureTeaserProps) {
	return (
		<Card className="border-2 border-dashed border-gray-300 bg-gray-50">
			<CardContent className="p-6 text-center">
				<div className="mb-4">
					<div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
						<Crown className="h-6 w-6 text-gray-500" />
					</div>
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						{featureName}
					</h3>
					<p className="text-gray-600 text-sm mb-4">{description}</p>
				</div>

				<div className="space-y-2 mb-6">
					{benefits.map((benefit, index) => (
						<div
							key={index}
							className="flex items-center space-x-2 text-sm text-gray-700">
							<CheckCircle className="h-4 w-4 text-green-500" />
							<span>{benefit}</span>
						</div>
					))}
				</div>

				<div className="space-y-2">
					<Badge variant="outline" className="text-xs">
						Available in {requiredPlan}
					</Badge>
					<div className="flex space-x-2">
						<Button
							size="sm"
							className="flex-1"
							onClick={() => onUpgrade("premium")} // You'll need to pass the actual plan ID
						>
							Upgrade to {requiredPlan}
						</Button>
						{onLearnMore && (
							<Button variant="outline" size="sm" onClick={onLearnMore}>
								Learn More
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export interface UsageIndicatorProps {
	featureName: string;
	currentUsage: number;
	limit: number;
	resetDate: string;
	onUpgrade?: () => void;
}

export function UsageIndicator({
	featureName,
	currentUsage,
	limit,
	resetDate,
	onUpgrade,
}: UsageIndicatorProps) {
	const usagePercentage = (currentUsage / limit) * 100;
	const isNearLimit = usagePercentage >= 80;
	const isAtLimit = usagePercentage >= 100;

	const getColor = () => {
		if (isAtLimit) return "bg-red-500";
		if (isNearLimit) return "bg-yellow-500";
		return "bg-green-500";
	};

	const getTextColor = () => {
		if (isAtLimit) return "text-red-700";
		if (isNearLimit) return "text-yellow-700";
		return "text-green-700";
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between text-sm">
				<span className="font-medium text-gray-700">{featureName}</span>
				<span className={`font-medium ${getTextColor()}`}>
					{currentUsage}/{limit}
				</span>
			</div>

			<div className="w-full bg-gray-200 rounded-full h-2">
				<div
					className={`h-2 rounded-full ${getColor()}`}
					style={{ width: `${Math.min(usagePercentage, 100)}%` }}
				/>
			</div>

			<div className="flex items-center justify-between text-xs text-gray-500">
				<span>
					{isAtLimit ? "Limit reached" : `${limit - currentUsage} remaining`}
				</span>
				<span>Resets {new Date(resetDate).toLocaleDateString()}</span>
			</div>

			{isNearLimit && onUpgrade && (
				<Button
					size="sm"
					variant="outline"
					className="w-full"
					onClick={onUpgrade}>
					Upgrade Plan
				</Button>
			)}
		</div>
	);
}

export interface LimitDisplayProps {
	limits: Array<{
		name: string;
		current: number;
		limit: number;
		unit: string;
	}>;
	onUpgrade?: () => void;
}

export function LimitDisplay({ limits, onUpgrade }: LimitDisplayProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Usage Limits</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{limits.map((limit, index) => {
					const usagePercentage = (limit.current / limit.limit) * 100;
					const isNearLimit = usagePercentage >= 80;
					const isAtLimit = usagePercentage >= 100;

					return (
						<div key={index} className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span className="font-medium text-gray-700">{limit.name}</span>
								<span
									className={`font-medium ${
										isAtLimit
											? "text-red-700"
											: isNearLimit
											? "text-yellow-700"
											: "text-green-700"
									}`}>
									{limit.current}/{limit.limit} {limit.unit}
								</span>
							</div>

							<div className="w-full bg-gray-200 rounded-full h-2">
								<div
									className={`h-2 rounded-full ${
										isAtLimit
											? "bg-red-500"
											: isNearLimit
											? "bg-yellow-500"
											: "bg-green-500"
									}`}
									style={{ width: `${Math.min(usagePercentage, 100)}%` }}
								/>
							</div>
						</div>
					);
				})}

				{onUpgrade && (
					<Button className="w-full mt-4" onClick={onUpgrade}>
						Upgrade Plan
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
