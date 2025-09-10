"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import Link from "next/link";

interface PricingCardProps {
	plan: {
		id: string;
		name: string;
		display_name?: string;
		description?: string;
		short_description?: string;
		price: number;
		billing_cycle: "monthly" | "yearly";
		features: string[];
		limits: {
			stores?: number;
			users?: number;
			products?: number;
			customers?: number;
			storage_gb?: number;
			api_calls_per_month?: number;
		};
		popular?: boolean;
		badge_text?: string;
		badge_color?: string;
		color_scheme?: string;
		trial_days?: number;
	};
	currentPlanId?: string;
	onSelectPlan?: (planId: string) => void;
	showYearly?: boolean;
}

export function PricingCard({
	plan,
	currentPlanId,
	onSelectPlan,
	showYearly = false,
}: PricingCardProps) {
	const isCurrentPlan = currentPlanId === plan.id;
	const isPopular = plan.popular;
	const badgeColor = plan.badge_color || "blue";

	// Calculate yearly price with discount
	const yearlyPrice = showYearly
		? Math.round(plan.price * 12 * 0.8)
		: plan.price * 12;
	const displayPrice = showYearly ? yearlyPrice : plan.price;
	const billingPeriod = showYearly ? "year" : "month";

	const formatLimit = (limit: number | undefined) => {
		if (limit === undefined) return "Unlimited";
		if (limit === -1) return "Unlimited";
		return limit.toLocaleString();
	};

	const getColorClasses = (colorScheme: string) => {
		const schemes = {
			gray: "border-gray-200 bg-gray-50",
			blue: "border-blue-200 bg-blue-50",
			green: "border-green-200 bg-green-50",
			purple: "border-purple-200 bg-purple-50",
		};
		return schemes[colorScheme as keyof typeof schemes] || schemes.blue;
	};

	const getBadgeColor = (color: string) => {
		const colors = {
			blue: "bg-blue-100 text-blue-800",
			green: "bg-green-100 text-green-800",
			purple: "bg-purple-100 text-purple-800",
			red: "bg-red-100 text-red-800",
		};
		return colors[color as keyof typeof colors] || colors.blue;
	};

	return (
		<Card
			className={`relative transition-all duration-200 hover:shadow-lg ${
				isPopular ? "border-2 border-primary shadow-lg scale-105" : "border"
			} ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}>
			{isPopular && (
				<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
					<Badge className={`${getBadgeColor(badgeColor)} px-3 py-1`}>
						{plan.badge_text || "Most Popular"}
					</Badge>
				</div>
			)}

			<CardHeader className="text-center pb-4">
				<CardTitle className="text-2xl font-bold">
					{plan.display_name || plan.name}
				</CardTitle>
				<CardDescription className="text-base">
					{plan.short_description || plan.description}
				</CardDescription>

				<div className="mt-4">
					<div className="flex items-baseline justify-center">
						<span className="text-4xl font-bold">Rp</span>
						<span className="text-5xl font-bold ml-1">
							{displayPrice.toLocaleString("id-ID")}
						</span>
						<span className="text-lg text-muted-foreground ml-2">
							/{billingPeriod}
						</span>
					</div>
					{showYearly && (
						<p className="text-sm text-green-600 mt-1">
							Save 20% with yearly billing
						</p>
					)}
					{plan.trial_days && plan.trial_days > 0 && (
						<p className="text-sm text-muted-foreground mt-1">
							{plan.trial_days}-day free trial
						</p>
					)}
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* Limits Overview */}
				<div className="space-y-3">
					<h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
						What's Included
					</h4>
					<div className="grid grid-cols-2 gap-3 text-sm">
						<div className="flex items-center space-x-2">
							<Check className="h-4 w-4 text-green-500" />
							<span>{formatLimit(plan.limits.stores)} Stores</span>
						</div>
						<div className="flex items-center space-x-2">
							<Check className="h-4 w-4 text-green-500" />
							<span>{formatLimit(plan.limits.users)} Users</span>
						</div>
						<div className="flex items-center space-x-2">
							<Check className="h-4 w-4 text-green-500" />
							<span>{formatLimit(plan.limits.products)} Products</span>
						</div>
						<div className="flex items-center space-x-2">
							<Check className="h-4 w-4 text-green-500" />
							<span>{formatLimit(plan.limits.customers)} Customers</span>
						</div>
						<div className="flex items-center space-x-2">
							<Check className="h-4 w-4 text-green-500" />
							<span>{formatLimit(plan.limits.storage_gb)} GB Storage</span>
						</div>
						<div className="flex items-center space-x-2">
							<Check className="h-4 w-4 text-green-500" />
							<span>
								{formatLimit(plan.limits.api_calls_per_month)} API Calls
							</span>
						</div>
					</div>
				</div>

				{/* Features List */}
				<div className="space-y-3">
					<h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
						Features
					</h4>
					<ul className="space-y-2">
						{plan.features.map((feature, index) => (
							<li key={index} className="flex items-start space-x-2 text-sm">
								<Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
								<span>{feature}</span>
							</li>
						))}
					</ul>
				</div>

				{/* Action Button */}
				<div className="pt-4">
					{isCurrentPlan ? (
						<Button variant="outline" className="w-full" disabled>
							Current Plan
						</Button>
					) : (
						<Button
							className={`w-full ${
								isPopular ? "bg-primary hover:bg-primary/90" : ""
							}`}
							onClick={() => onSelectPlan?.(plan.id)}
							asChild>
							<Link
								href={`/pricing/select?plan=${plan.id}&billing=${
									showYearly ? "yearly" : "monthly"
								}`}>
								{plan.price === 0 ? "Get Started Free" : "Choose Plan"}
							</Link>
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
