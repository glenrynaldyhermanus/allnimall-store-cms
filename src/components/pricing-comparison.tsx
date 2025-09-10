"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface PricingComparisonProps {
	plans: Array<{
		id: string;
		name: string;
		display_name?: string;
		price: number;
		popular?: boolean;
		badge_text?: string;
		badge_color?: string;
		features: string[];
		limits: {
			stores?: number;
			users?: number;
			products?: number;
			customers?: number;
			storage_gb?: number;
			api_calls_per_month?: number;
		};
	}>;
	showYearly?: boolean;
}

export function PricingComparison({
	plans,
	showYearly = false,
}: PricingComparisonProps) {
	const yearlyPrice = (price: number) =>
		showYearly ? Math.round(price * 12 * 0.8) : price * 12;
	const displayPrice = (price: number) =>
		showYearly ? yearlyPrice(price) : price;
	const billingPeriod = showYearly ? "year" : "month";

	const formatLimit = (limit: number | undefined) => {
		if (limit === undefined) return "Unlimited";
		if (limit === -1) return "Unlimited";
		return limit.toLocaleString();
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

	// Define comparison features
	const comparisonFeatures = [
		{
			category: "Core Features",
			features: [
				{
					name: "Online Store",
					free: true,
					basic: true,
					pro: true,
					enterprise: true,
				},
				{
					name: "Product Management",
					free: true,
					basic: true,
					pro: true,
					enterprise: true,
				},
				{
					name: "Order Management",
					free: true,
					basic: true,
					pro: true,
					enterprise: true,
				},
				{
					name: "Customer Management",
					free: true,
					basic: true,
					pro: true,
					enterprise: true,
				},
				{
					name: "Inventory Tracking",
					free: true,
					basic: true,
					pro: true,
					enterprise: true,
				},
				{
					name: "Basic Analytics",
					free: true,
					basic: true,
					pro: true,
					enterprise: true,
				},
			],
		},
		{
			category: "Advanced Features",
			features: [
				{
					name: "Advanced Analytics",
					free: false,
					basic: true,
					pro: true,
					enterprise: true,
				},
				{
					name: "Custom Reports",
					free: false,
					basic: false,
					pro: true,
					enterprise: true,
				},
				{
					name: "API Access",
					free: false,
					basic: false,
					pro: true,
					enterprise: true,
				},
				{
					name: "Webhooks",
					free: false,
					basic: false,
					pro: true,
					enterprise: true,
				},
				{
					name: "Custom Integrations",
					free: false,
					basic: false,
					pro: false,
					enterprise: true,
				},
				{
					name: "White-label Solution",
					free: false,
					basic: false,
					pro: false,
					enterprise: true,
				},
			],
		},
		{
			category: "Support",
			features: [
				{
					name: "Community Support",
					free: true,
					basic: true,
					pro: true,
					enterprise: true,
				},
				{
					name: "Email Support",
					free: false,
					basic: true,
					pro: true,
					enterprise: true,
				},
				{
					name: "Priority Support",
					free: false,
					basic: false,
					pro: true,
					enterprise: true,
				},
				{
					name: "Phone Support",
					free: false,
					basic: false,
					pro: true,
					enterprise: true,
				},
				{
					name: "Dedicated Account Manager",
					free: false,
					basic: false,
					pro: false,
					enterprise: true,
				},
				{
					name: "24/7 Support",
					free: false,
					basic: false,
					pro: false,
					enterprise: true,
				},
			],
		},
	];

	const planOrder = ["free", "basic", "pro", "enterprise"];
	const planMap = {
		free: plans.find((p) => p.name.toLowerCase().includes("free")) || plans[0],
		basic:
			plans.find((p) => p.name.toLowerCase().includes("basic")) || plans[1],
		pro:
			plans.find((p) => p.name.toLowerCase().includes("professional")) ||
			plans[2],
		enterprise:
			plans.find((p) => p.name.toLowerCase().includes("enterprise")) ||
			plans[3],
	};

	return (
		<Card className="overflow-hidden">
			<CardHeader>
				<CardTitle className="text-center text-2xl">Compare Plans</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-b">
								<th className="text-left p-4 font-semibold">Features</th>
								{planOrder.map((planKey) => {
									const plan = planMap[planKey as keyof typeof planMap];
									if (!plan) return null;

									return (
										<th key={plan.id} className="text-center p-4 min-w-[200px]">
											<div className="space-y-2">
												<div className="flex items-center justify-center space-x-2">
													<span className="font-semibold">
														{plan.display_name || plan.name}
													</span>
													{plan.popular && (
														<Badge
															className={`${getBadgeColor(
																plan.badge_color || "blue"
															)} text-xs`}>
															{plan.badge_text || "Popular"}
														</Badge>
													)}
												</div>
												<div className="text-2xl font-bold">
													Rp {displayPrice(plan.price).toLocaleString("id-ID")}
												</div>
												<div className="text-sm text-muted-foreground">
													/{billingPeriod}
												</div>
											</div>
										</th>
									);
								})}
							</tr>
						</thead>
						<tbody>
							{comparisonFeatures.map((category, categoryIndex) => (
								<React.Fragment key={categoryIndex}>
									<tr className="bg-muted/50">
										<td
											colSpan={5}
											className="p-3 font-semibold text-sm uppercase tracking-wide">
											{category.category}
										</td>
									</tr>
									{category.features.map((feature, featureIndex) => (
										<tr key={featureIndex} className="border-b last:border-b-0">
											<td className="p-4 font-medium">{feature.name}</td>
											{planOrder.map((planKey) => {
												const hasFeature =
													feature[planKey as keyof typeof feature];
												return (
													<td key={planKey} className="p-4 text-center">
														{hasFeature ? (
															<Check className="h-5 w-5 text-green-500 mx-auto" />
														) : (
															<X className="h-5 w-5 text-gray-400 mx-auto" />
														)}
													</td>
												);
											})}
										</tr>
									))}
								</React.Fragment>
							))}

							{/* Limits Row */}
							<tr className="bg-muted/50">
								<td
									colSpan={5}
									className="p-3 font-semibold text-sm uppercase tracking-wide">
									Limits
								</td>
							</tr>
							<tr className="border-b">
								<td className="p-4 font-medium">Stores</td>
								{planOrder.map((planKey) => {
									const plan = planMap[planKey as keyof typeof planMap];
									return (
										<td key={planKey} className="p-4 text-center text-sm">
											{formatLimit(plan?.limits.stores)}
										</td>
									);
								})}
							</tr>
							<tr className="border-b">
								<td className="p-4 font-medium">Users</td>
								{planOrder.map((planKey) => {
									const plan = planMap[planKey as keyof typeof planMap];
									return (
										<td key={planKey} className="p-4 text-center text-sm">
											{formatLimit(plan?.limits.users)}
										</td>
									);
								})}
							</tr>
							<tr className="border-b">
								<td className="p-4 font-medium">Products</td>
								{planOrder.map((planKey) => {
									const plan = planMap[planKey as keyof typeof planMap];
									return (
										<td key={planKey} className="p-4 text-center text-sm">
											{formatLimit(plan?.limits.products)}
										</td>
									);
								})}
							</tr>
							<tr className="border-b">
								<td className="p-4 font-medium">Customers</td>
								{planOrder.map((planKey) => {
									const plan = planMap[planKey as keyof typeof planMap];
									return (
										<td key={planKey} className="p-4 text-center text-sm">
											{formatLimit(plan?.limits.customers)}
										</td>
									);
								})}
							</tr>
							<tr className="border-b">
								<td className="p-4 font-medium">Storage</td>
								{planOrder.map((planKey) => {
									const plan = planMap[planKey as keyof typeof planMap];
									return (
										<td key={planKey} className="p-4 text-center text-sm">
											{formatLimit(plan?.limits.storage_gb)} GB
										</td>
									);
								})}
							</tr>
							<tr className="border-b last:border-b-0">
								<td className="p-4 font-medium">API Calls/Month</td>
								{planOrder.map((planKey) => {
									const plan = planMap[planKey as keyof typeof planMap];
									return (
										<td key={planKey} className="p-4 text-center text-sm">
											{formatLimit(plan?.limits.api_calls_per_month)}
										</td>
									);
								})}
							</tr>
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>
	);
}
