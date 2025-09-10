import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { Alert } from "@/components/ui/alert";
import {
	Lock,
	Crown,
	AlertTriangle,
	Info,
	XCircle,
	ArrowRight,
	Zap,
	Shield,
	BarChart3,
	Users,
	Store,
	Package,
} from "lucide-react";

export interface RestrictionMessageProps {
	featureName: string;
	reason: string;
	currentPlan: string;
	requiredPlan?: string;
	onUpgrade?: (planId: string) => void;
	onDismiss?: () => void;
	variant?: "error" | "warning" | "info";
	showUpgradeButton?: boolean;
}

export function RestrictionMessage({
	reason,
	requiredPlan,
	onUpgrade,
	onDismiss,
	variant = "warning",
	showUpgradeButton = true,
}: RestrictionMessageProps) {
	const getVariantStyles = () => {
		switch (variant) {
			case "error":
				return {
					container: "border-red-200 bg-red-50",
					text: "text-red-800",
					button: "bg-red-600 hover:bg-red-700 text-white",
					icon: "text-red-600",
				};
			case "warning":
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

	const styles = getVariantStyles();

	const getIcon = () => {
		switch (variant) {
			case "error":
				return <XCircle className="h-5 w-5" />;
			case "warning":
				return <AlertTriangle className="h-5 w-5" />;
			default:
				return <Info className="h-5 w-5" />;
		}
	};

	return (
		<div
			className={`${styles.container} border-l-4 border-l-current p-4 rounded-lg`}>
			<div className="flex items-start space-x-3">
				<div className={`${styles.icon} mt-0.5`}>{getIcon()}</div>
				<div className="flex-1">
					<h4 className={`font-semibold ${styles.text} mb-1`}>
						Access Restricted
					</h4>
					<p className={`text-sm ${styles.text} opacity-90 mb-3`}>{reason}</p>
					<div className="flex items-center space-x-2">
						{showUpgradeButton && requiredPlan && onUpgrade && (
							<Button
								size="sm"
								className={styles.button}
								onClick={() => onUpgrade(requiredPlan)}>
								Upgrade to {requiredPlan}
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
			</div>
		</div>
	);
}

export interface UpgradeButtonProps {
	featureName: string;
	currentPlan: string;
	targetPlan: string;
	onUpgrade: (planId: string) => void;
	variant?: "primary" | "secondary" | "outline";
	size?: "sm" | "md" | "lg";
	showIcon?: boolean;
}

export function UpgradeButton({
	targetPlan,
	onUpgrade,
	variant = "primary",
	size = "md",
	showIcon = true,
}: UpgradeButtonProps) {
	const getVariantStyles = () => {
		switch (variant) {
			case "primary":
				return "bg-blue-600 hover:bg-blue-700 text-white";
			case "secondary":
				return "bg-gray-600 hover:bg-gray-700 text-white";
			default:
				return "border border-blue-600 text-blue-600 hover:bg-blue-50";
		}
	};

	const getSizeStyles = () => {
		switch (size) {
			case "sm":
				return "px-3 py-1 text-sm";
			case "lg":
				return "px-6 py-3 text-lg";
			default:
				return "px-4 py-2 text-base";
		}
	};

	return (
		<Button
			className={`${getVariantStyles()} ${getSizeStyles()} inline-flex items-center`}
			onClick={() => onUpgrade(targetPlan)}>
			{showIcon && <Crown className="mr-2 h-4 w-4" />}
			Upgrade to {targetPlan}
		</Button>
	);
}

export interface UsageIndicatorProps {
	featureName: string;
	currentUsage: number;
	limit: number;
	resetDate: string;
	onUpgrade?: () => void;
	showUpgradeButton?: boolean;
}

export function UsageIndicator({
	featureName,
	currentUsage,
	limit,
	resetDate,
	onUpgrade,
	showUpgradeButton = true,
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

	const getBorderColor = () => {
		if (isAtLimit) return "border-red-200 bg-red-50";
		if (isNearLimit) return "border-yellow-200 bg-yellow-50";
		return "border-green-200 bg-green-50";
	};

	return (
		<Card className={`${getBorderColor()} border-l-4 border-l-current`}>
			<CardContent className="p-4">
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<h4 className="font-medium text-gray-900">{featureName}</h4>
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
							{isAtLimit
								? "Limit reached"
								: `${limit - currentUsage} remaining`}
						</span>
						<span>Resets {new Date(resetDate).toLocaleDateString()}</span>
					</div>

					{isNearLimit && showUpgradeButton && onUpgrade && (
						<Button
							size="sm"
							variant="outline"
							className="w-full"
							onClick={onUpgrade}>
							<Crown className="mr-2 h-4 w-4" />
							Upgrade Plan
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

export interface LimitDisplayProps {
	limits: Array<{
		name: string;
		current: number;
		limit: number;
		unit: string;
		feature?: string;
	}>;
	onUpgrade?: () => void;
	showUpgradeButton?: boolean;
}

export function LimitDisplay({
	limits,
	onUpgrade,
	showUpgradeButton = true,
}: LimitDisplayProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg flex items-center">
					<Shield className="mr-2 h-5 w-5" />
					Usage Limits
				</CardTitle>
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

							{isNearLimit && (
								<div className="text-xs text-yellow-600">
									{isAtLimit
										? "Limit reached - upgrade required"
										: "Approaching limit - consider upgrading"}
								</div>
							)}
						</div>
					);
				})}

				{showUpgradeButton && onUpgrade && (
					<Button className="w-full mt-4" onClick={onUpgrade}>
						<Crown className="mr-2 h-4 w-4" />
						Upgrade Plan
					</Button>
				)}
			</CardContent>
		</Card>
	);
}

export interface FeatureLockedCardProps {
	featureName: string;
	description: string;
	currentPlan: string;
	requiredPlan: string;
	onUpgrade: (planId: string) => void;
	onLearnMore?: () => void;
}

export function FeatureLockedCard({
	featureName,
	description,
	// currentPlan,
	requiredPlan,
	onUpgrade,
	onLearnMore,
}: FeatureLockedCardProps) {
	const getFeatureIcon = (feature: string) => {
		switch (feature.toLowerCase()) {
			case "product_management":
				return <Package className="h-6 w-6" />;
			case "store_management":
				return <Store className="h-6 w-6" />;
			case "user_management":
				return <Users className="h-6 w-6" />;
			case "reporting":
				return <BarChart3 className="h-6 w-6" />;
			case "advanced_features":
				return <Zap className="h-6 w-6" />;
			case "priority_support":
				return <Shield className="h-6 w-6" />;
			default:
				return <Crown className="h-6 w-6" />;
		}
	};

	return (
		<Card className="border-2 border-dashed border-gray-300 bg-gray-50">
			<CardContent className="p-6 text-center">
				<div className="mb-4">
					<div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3">
						<div className="text-gray-500">{getFeatureIcon(featureName)}</div>
					</div>
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						{featureName}
					</h3>
					<p className="text-gray-600 text-sm mb-4">{description}</p>
				</div>

				<div className="space-y-3">
					<Badge variant="outline" className="text-xs">
						<Lock className="mr-1 h-3 w-3" />
						Available in {requiredPlan}
					</Badge>
					<div className="flex space-x-2">
						<Button
							size="sm"
							className="flex-1"
							onClick={() => onUpgrade(requiredPlan)}>
							<Crown className="mr-2 h-4 w-4" />
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

export interface PlanComparisonRestrictionProps {
	currentPlan: string;
	requiredPlan: string;
	missingFeatures: string[];
	onUpgrade: (planId: string) => void;
}

export function PlanComparisonRestriction({
	requiredPlan,
	missingFeatures,
	onUpgrade,
}: PlanComparisonRestrictionProps) {
	return (
		<Card className="border-yellow-200 bg-yellow-50">
			<CardHeader>
				<CardTitle className="text-lg text-yellow-800 flex items-center">
					<AlertTriangle className="mr-2 h-5 w-5" />
					Plan Upgrade Required
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<p className="text-yellow-700 text-sm">
					This feature requires {requiredPlan} plan.
				</p>

				<div className="space-y-2">
					<h4 className="font-medium text-yellow-800">Missing Features:</h4>
					<ul className="space-y-1">
						{missingFeatures.map((feature, index) => (
							<li
								key={index}
								className="flex items-center space-x-2 text-sm text-yellow-700">
								<XCircle className="h-4 w-4 text-yellow-600" />
								<span>{feature}</span>
							</li>
						))}
					</ul>
				</div>

				<Button
					className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
					onClick={() => onUpgrade(requiredPlan)}>
					<Crown className="mr-2 h-4 w-4" />
					Upgrade to {requiredPlan}
				</Button>
			</CardContent>
		</Card>
	);
}

export interface UsageWarningBannerProps {
	warnings: Array<{
		featureName: string;
		usagePercentage: number;
		resetDate: string;
	}>;
	onUpgrade?: () => void;
	onDismiss?: () => void;
}

export function UsageWarningBanner({
	warnings,
	onUpgrade,
	onDismiss,
}: UsageWarningBannerProps) {
	const hasCriticalWarnings = warnings.some((w) => w.usagePercentage >= 100);
	const hasWarnings = warnings.some((w) => w.usagePercentage >= 80);

	if (!hasWarnings) return null;

	const getSeverity = () => {
		if (hasCriticalWarnings) return "error";
		return "warning";
	};

	const severity = getSeverity();
	const styles = {
		error: "border-red-200 bg-red-50 text-red-800",
		warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
	};

	return (
		<div
			className={`${styles[severity]} border-l-4 border-l-current p-4 rounded-lg`}>
			<div className="flex items-start space-x-3">
				<AlertTriangle className="h-5 w-5 mt-0.5" />
				<div className="flex-1">
					<h4 className="font-semibold mb-2">
						{hasCriticalWarnings ? "Usage Limits Reached" : "Usage Warning"}
					</h4>
					<div className="space-y-1 text-sm">
						{warnings
							.filter((w) => w.usagePercentage >= 80)
							.map((warning, index) => (
								<div key={index} className="flex items-center space-x-2">
									<span>
										{warning.featureName}: {Math.round(warning.usagePercentage)}
										% used
									</span>
									{warning.usagePercentage >= 100 && (
										<XCircle className="h-4 w-4 text-red-600" />
									)}
								</div>
							))}
					</div>
					<div className="flex items-center space-x-2 mt-3">
						{onUpgrade && (
							<Button
								size="sm"
								className={
									hasCriticalWarnings
										? "bg-red-600 hover:bg-red-700 text-white"
										: "bg-yellow-600 hover:bg-yellow-700 text-white"
								}
								onClick={onUpgrade}>
								<Crown className="mr-1 h-4 w-4" />
								Upgrade Plan
							</Button>
						)}
						{onDismiss && (
							<Button variant="ghost" size="sm" onClick={onDismiss}>
								Dismiss
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
