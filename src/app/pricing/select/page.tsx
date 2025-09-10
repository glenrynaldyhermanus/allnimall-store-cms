"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, CreditCard, Shield, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface SubscriptionPlan {
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
}

export default function PlanSelectionPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
	const [loading, setLoading] = useState(true);
	const [processing, setProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const planId = searchParams.get("plan");
	const billingCycle = searchParams.get("billing") || "monthly";
	const showYearly = billingCycle === "yearly";

	useEffect(() => {
		if (planId) {
			fetchPlan(planId);
		} else {
			router.push("/pricing");
		}
	}, [planId, router]);

	const fetchPlan = async (id: string) => {
		try {
			const { data, error } = await supabase
				.from("subscription_plans")
				.select("*")
				.eq("id", id)
				.eq("is_active", true)
				.eq("deleted_at", null)
				.single();

			if (error) throw error;

			const formattedPlan = {
				...data,
				features: Array.isArray(data.features) ? data.features : [],
				limits: data.limits || {},
			};

			setPlan(formattedPlan);
		} catch (error) {
			console.error("Error fetching plan:", error);
			setError("Plan not found");
		} finally {
			setLoading(false);
		}
	};

	const handleSubscribe = async () => {
		if (!plan) return;

		setProcessing(true);
		setError(null);

		try {
			// For free plan, redirect to signup
			if (plan.price === 0) {
				router.push("/signup");
				return;
			}

			// For paid plans, redirect to payment
			const paymentUrl = `/payment/midtrans/create?plan=${plan.id}&billing=${billingCycle}`;
			router.push(paymentUrl);
		} catch (error) {
			console.error("Error processing subscription:", error);
			setError("Failed to process subscription. Please try again.");
		} finally {
			setProcessing(false);
		}
	};

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

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p>Loading plan details...</p>
				</div>
			</div>
		);
	}

	if (error || !plan) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<CardTitle className="text-red-600">Error</CardTitle>
					</CardHeader>
					<CardContent className="text-center">
						<p className="text-muted-foreground mb-4">
							{error || "Plan not found"}
						</p>
						<Button asChild>
							<Link href="/pricing">Back to Pricing</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const yearlyPrice = showYearly
		? Math.round(plan.price * 12 * 0.8)
		: plan.price * 12;
	const displayPrice = showYearly ? yearlyPrice : plan.price;
	const billingPeriod = showYearly ? "year" : "month";

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
			<div className="container mx-auto px-4 py-16">
				{/* Back Button */}
				<div className="mb-8">
					<Button variant="ghost" asChild>
						<Link href="/pricing" className="flex items-center space-x-2">
							<ArrowLeft className="h-4 w-4" />
							<span>Back to Pricing</span>
						</Link>
					</Button>
				</div>

				<div className="max-w-4xl mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Plan Details */}
						<div className="space-y-6">
							<Card className="relative">
								{plan.popular && (
									<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
										<Badge
											className={`${getBadgeColor(
												plan.badge_color || "blue"
											)} px-3 py-1`}>
											{plan.badge_text || "Most Popular"}
										</Badge>
									</div>
								)}

								<CardHeader className="text-center pb-4">
									<CardTitle className="text-3xl font-bold">
										{plan.display_name || plan.name}
									</CardTitle>
									<p className="text-lg text-muted-foreground">
										{plan.short_description || plan.description}
									</p>

									<div className="mt-6">
										<div className="flex items-baseline justify-center">
											<span className="text-4xl font-bold">Rp</span>
											<span className="text-6xl font-bold ml-1">
												{displayPrice.toLocaleString("id-ID")}
											</span>
											<span className="text-xl text-muted-foreground ml-2">
												/{billingPeriod}
											</span>
										</div>
										{showYearly && (
											<p className="text-sm text-green-600 mt-2">
												Save 20% with yearly billing
											</p>
										)}
										{plan.trial_days && plan.trial_days > 0 && (
											<p className="text-sm text-muted-foreground mt-2">
												{plan.trial_days}-day free trial included
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
												<span>
													{formatLimit(plan.limits.products)} Products
												</span>
											</div>
											<div className="flex items-center space-x-2">
												<Check className="h-4 w-4 text-green-500" />
												<span>
													{formatLimit(plan.limits.customers)} Customers
												</span>
											</div>
											<div className="flex items-center space-x-2">
												<Check className="h-4 w-4 text-green-500" />
												<span>
													{formatLimit(plan.limits.storage_gb)} GB Storage
												</span>
											</div>
											<div className="flex items-center space-x-2">
												<Check className="h-4 w-4 text-green-500" />
												<span>
													{formatLimit(plan.limits.api_calls_per_month)} API
													Calls
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
												<li
													key={index}
													className="flex items-start space-x-2 text-sm">
													<Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
													<span>{feature}</span>
												</li>
											))}
										</ul>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Subscription Form */}
						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Complete Your Subscription</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6">
									{/* Plan Summary */}
									<div className="bg-muted/50 rounded-lg p-4 space-y-2">
										<div className="flex justify-between items-center">
											<span className="font-medium">
												{plan.display_name || plan.name}
											</span>
											<span className="font-bold">
												Rp {displayPrice.toLocaleString("id-ID")}/
												{billingPeriod}
											</span>
										</div>
										<div className="text-sm text-muted-foreground">
											Billing: {showYearly ? "Yearly" : "Monthly"}
										</div>
										{showYearly && (
											<div className="text-sm text-green-600">
												You save Rp{" "}
												{(plan.price * 12 - yearlyPrice).toLocaleString(
													"id-ID"
												)}{" "}
												per year
											</div>
										)}
									</div>

									{/* Security Features */}
									<div className="space-y-3">
										<h4 className="font-semibold text-sm">What you get:</h4>
										<div className="space-y-2 text-sm">
											<div className="flex items-center space-x-2">
												<Shield className="h-4 w-4 text-green-500" />
												<span>Secure payment processing with Midtrans</span>
											</div>
											<div className="flex items-center space-x-2">
												<Clock className="h-4 w-4 text-green-500" />
												<span>Instant access after payment</span>
											</div>
											<div className="flex items-center space-x-2">
												<CreditCard className="h-4 w-4 text-green-500" />
												<span>Cancel anytime, no long-term contracts</span>
											</div>
										</div>
									</div>

									{/* Error Display */}
									{error && (
										<div className="p-3 bg-red-50 border border-red-200 rounded-md">
											<p className="text-red-600 text-sm">{error}</p>
										</div>
									)}

									{/* Subscribe Button */}
									<Button
										className="w-full"
										size="lg"
										onClick={handleSubscribe}
										disabled={processing}>
										{processing ? (
											<div className="flex items-center space-x-2">
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
												<span>Processing...</span>
											</div>
										) : plan.price === 0 ? (
											"Start Free Trial"
										) : (
											`Subscribe for Rp ${displayPrice.toLocaleString(
												"id-ID"
											)}/${billingPeriod}`
										)}
									</Button>

									{/* Terms */}
									<p className="text-xs text-muted-foreground text-center">
										By subscribing, you agree to our{" "}
										<Link href="/terms" className="underline">
											Terms of Service
										</Link>{" "}
										and{" "}
										<Link href="/privacy" className="underline">
											Privacy Policy
										</Link>
										.
									</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
