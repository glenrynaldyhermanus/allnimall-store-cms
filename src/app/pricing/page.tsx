"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PricingCard } from "@/components/pricing-card";
import { PricingComparison } from "@/components/pricing-comparison";
import { PricingFAQ } from "@/components/pricing-faq";
import { supabase } from "@/lib/supabase";

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

interface FAQItem {
	id: string;
	question: string;
	answer: string;
	category: string;
}

export default function PricingPage() {
	const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
	const [faqs, setFaqs] = useState<FAQItem[]>([]);
	const [showYearly, setShowYearly] = useState(false);
	const [loading, setLoading] = useState(true);
	const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

	useEffect(() => {
		fetchPlans();
		fetchFAQs();
		fetchCurrentPlan();
	}, []);

	const fetchPlans = async () => {
		try {
			const { data, error } = await supabase
				.from("subscription_plans")
				.select("*")
				.eq("is_active", true)
				.eq("deleted_at", null)
				.order("sort_order");

			if (error) throw error;

			const formattedPlans = data.map((plan) => ({
				...plan,
				features: Array.isArray(plan.features) ? plan.features : [],
				limits: plan.limits || {},
			}));

			setPlans(formattedPlans);
		} catch (error) {
			console.error("Error fetching plans:", error);
		}
	};

	const fetchFAQs = async () => {
		try {
			const { data, error } = await supabase
				.from("pricing_faq")
				.select("*")
				.eq("is_active", true)
				.eq("deleted_at", null)
				.order("sort_order");

			if (error) throw error;
			setFaqs(data || []);
		} catch (error) {
			console.error("Error fetching FAQs:", error);
		}
	};

	const fetchCurrentPlan = async () => {
		try {
			// This would typically get the current user's subscription
			// For now, we'll leave it as null
			setCurrentPlanId(null);
		} catch (error) {
			console.error("Error fetching current plan:", error);
		}
	};

	const handleSelectPlan = (planId: string) => {
		// Redirect to plan selection page
		window.location.href = `/pricing/select?plan=${planId}&billing=${
			showYearly ? "yearly" : "monthly"
		}`;
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p>Loading pricing plans...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
			{/* Hero Section */}
			<div className="container mx-auto px-4 py-16">
				<div className="text-center max-w-4xl mx-auto mb-16">
					<h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
						Choose Your Perfect Plan
					</h1>
					<p className="text-xl text-gray-600 mb-8">
						Start free, scale as you grow. All plans include our core features
						with no hidden fees.
					</p>

					{/* Billing Toggle */}
					<div className="flex items-center justify-center space-x-4 mb-8">
						<span
							className={`text-sm font-medium ${
								!showYearly ? "text-gray-900" : "text-gray-500"
							}`}>
							Monthly
						</span>
						<Switch
							checked={showYearly}
							onCheckedChange={setShowYearly}
							className="data-[state=checked]:bg-primary"
						/>
						<span
							className={`text-sm font-medium ${
								showYearly ? "text-gray-900" : "text-gray-500"
							}`}>
							Yearly
						</span>
						{showYearly && (
							<span className="text-sm text-green-600 font-medium ml-2">
								Save 20%
							</span>
						)}
					</div>
				</div>

				{/* Pricing Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
					{plans.map((plan) => (
						<PricingCard
							key={plan.id}
							plan={plan}
							currentPlanId={currentPlanId}
							onSelectPlan={handleSelectPlan}
							showYearly={showYearly}
						/>
					))}
				</div>

				{/* Comparison Table */}
				<div className="mb-16">
					<PricingComparison plans={plans} showYearly={showYearly} />
				</div>

				{/* FAQ Section */}
				<div className="mb-16">
					<PricingFAQ faqs={faqs} />
				</div>

				{/* CTA Section */}
				<div className="text-center bg-white rounded-2xl p-8 shadow-lg">
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						Ready to Get Started?
					</h2>
					<p className="text-lg text-gray-600 mb-8">
						Join thousands of businesses already using Allnimall to grow their
						online presence.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button size="lg" asChild>
							<a href="/signup">Start Free Trial</a>
						</Button>
						<Button variant="outline" size="lg" asChild>
							<a href="/contact">Contact Sales</a>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
