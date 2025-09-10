"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
	CreditCard,
	Shield,
	Lock,
	CheckCircle,
	AlertCircle,
	Loader2,
	ArrowLeft,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface PaymentFormProps {
	planId: string;
	billingCycle: "monthly" | "yearly";
	customerDetails?: {
		first_name: string;
		last_name?: string;
		email: string;
		phone: string;
	};
}

export function MidtransPaymentForm({
	planId,
	billingCycle,
	customerDetails,
}: PaymentFormProps) {
	const [plan, setPlan] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [processing, setProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [paymentData, setPaymentData] = useState<any>(null);
	const [formData, setFormData] = useState({
		first_name: customerDetails?.first_name || "",
		last_name: customerDetails?.last_name || "",
		email: customerDetails?.email || "",
		phone: customerDetails?.phone || "",
	});

	useEffect(() => {
		fetchPlanDetails();
	}, [planId]);

	const fetchPlanDetails = async () => {
		try {
			const { data, error } = await supabase
				.from("subscription_plans")
				.select("*")
				.eq("id", planId)
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

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const validateForm = () => {
		if (!formData.first_name.trim()) {
			setError("First name is required");
			return false;
		}
		if (!formData.email.trim()) {
			setError("Email is required");
			return false;
		}
		if (!formData.phone.trim()) {
			setError("Phone number is required");
			return false;
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			setError("Please enter a valid email address");
			return false;
		}
		return true;
	};

	const handlePayment = async () => {
		if (!plan || !validateForm()) return;

		setProcessing(true);
		setError(null);

		try {
			// Calculate amount
			const amount =
				billingCycle === "yearly"
					? Math.round(plan.price * 12 * 0.8)
					: plan.price;

			// Create subscription first
			const { data: subscription, error: subError } = await supabase
				.from("user_subscriptions")
				.insert({
					user_id: "00000000-0000-0000-0000-000000000000", // This would be the actual user ID
					plan_id: plan.id,
					status: "trial",
					start_date: new Date().toISOString(),
					trial_end_date: new Date(
						Date.now() + (plan.trial_days || 14) * 24 * 60 * 60 * 1000
					).toISOString(),
					auto_renew: true,
				})
				.select()
				.single();

			if (subError) throw subError;

			// Create payment with Midtrans
			const response = await fetch("/api/payments/midtrans/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					subscriptionId: subscription.id,
					amount: amount,
					customerDetails: formData,
					billingCycle: billingCycle,
				}),
			});

			const result = await response.json();

			if (!result.success) {
				throw new Error(result.error || "Failed to create payment");
			}

			setPaymentData(result.payment);

			// Redirect to Midtrans payment page
			window.location.href = result.payment.redirect_url;
		} catch (error) {
			console.error("Payment error:", error);
			setError(error instanceof Error ? error.message : "Payment failed");
		} finally {
			setProcessing(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p>Loading payment form...</p>
				</div>
			</div>
		);
	}

	if (error && !plan) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<CardTitle className="text-red-600">Error</CardTitle>
					</CardHeader>
					<CardContent className="text-center">
						<p className="text-muted-foreground mb-4">{error}</p>
						<Button asChild>
							<Link href="/pricing">Back to Pricing</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!plan) return null;

	const yearlyPrice =
		billingCycle === "yearly"
			? Math.round(plan.price * 12 * 0.8)
			: plan.price * 12;
	const displayPrice = billingCycle === "yearly" ? yearlyPrice : plan.price;
	const billingPeriod = billingCycle === "yearly" ? "year" : "month";

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
						{/* Payment Form */}
						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center space-x-2">
										<CreditCard className="h-5 w-5" />
										<span>Payment Information</span>
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6">
									{/* Customer Information */}
									<div className="space-y-4">
										<h4 className="font-semibold">Customer Information</h4>

										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="first_name">First Name *</Label>
												<Input
													id="first_name"
													value={formData.first_name}
													onChange={(e) =>
														handleInputChange("first_name", e.target.value)
													}
													placeholder="Enter your first name"
													required
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="last_name">Last Name</Label>
												<Input
													id="last_name"
													value={formData.last_name}
													onChange={(e) =>
														handleInputChange("last_name", e.target.value)
													}
													placeholder="Enter your last name"
												/>
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="email">Email Address *</Label>
											<Input
												id="email"
												type="email"
												value={formData.email}
												onChange={(e) =>
													handleInputChange("email", e.target.value)
												}
												placeholder="Enter your email address"
												required
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="phone">Phone Number *</Label>
											<Input
												id="phone"
												value={formData.phone}
												onChange={(e) =>
													handleInputChange("phone", e.target.value)
												}
												placeholder="Enter your phone number"
												required
											/>
										</div>
									</div>

									{/* Security Features */}
									<div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
										<h4 className="font-semibold text-green-800 flex items-center space-x-2">
											<Shield className="h-4 w-4" />
											<span>Secure Payment</span>
										</h4>
										<div className="space-y-2 text-sm text-green-700">
											<div className="flex items-center space-x-2">
												<Lock className="h-3 w-3" />
												<span>256-bit SSL encryption</span>
											</div>
											<div className="flex items-center space-x-2">
												<CheckCircle className="h-3 w-3" />
												<span>PCI DSS compliant</span>
											</div>
											<div className="flex items-center space-x-2">
												<Shield className="h-3 w-3" />
												<span>Protected by Midtrans</span>
											</div>
										</div>
									</div>

									{/* Error Display */}
									{error && (
										<div className="p-3 bg-red-50 border border-red-200 rounded-md">
											<div className="flex items-center space-x-2">
												<AlertCircle className="h-4 w-4 text-red-500" />
												<p className="text-red-600 text-sm">{error}</p>
											</div>
										</div>
									)}

									{/* Payment Button */}
									<Button
										className="w-full"
										size="lg"
										onClick={handlePayment}
										disabled={processing}>
										{processing ? (
											<div className="flex items-center space-x-2">
												<Loader2 className="h-4 w-4 animate-spin" />
												<span>Processing Payment...</span>
											</div>
										) : (
											`Pay Rp ${displayPrice.toLocaleString(
												"id-ID"
											)}/${billingPeriod}`
										)}
									</Button>

									{/* Terms */}
									<p className="text-xs text-muted-foreground text-center">
										By proceeding, you agree to our{" "}
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

						{/* Order Summary */}
						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Order Summary</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6">
									{/* Plan Details */}
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<div>
												<h4 className="font-semibold">
													{plan.display_name || plan.name}
												</h4>
												<p className="text-sm text-muted-foreground">
													{plan.short_description || plan.description}
												</p>
											</div>
											<Badge variant="outline">
												{billingCycle === "yearly" ? "Yearly" : "Monthly"}
											</Badge>
										</div>

										<div className="space-y-2">
											<div className="flex justify-between">
												<span>Plan Price</span>
												<span>
													Rp {plan.price.toLocaleString("id-ID")}/
													{plan.billing_cycle}
												</span>
											</div>
											{billingCycle === "yearly" && (
												<div className="flex justify-between text-green-600">
													<span>Yearly Discount (20%)</span>
													<span>
														-Rp{" "}
														{(plan.price * 12 - yearlyPrice).toLocaleString(
															"id-ID"
														)}
													</span>
												</div>
											)}
											<div className="flex justify-between">
												<span>Billing Period</span>
												<span>
													{billingCycle === "yearly" ? "12 months" : "1 month"}
												</span>
											</div>
											<div className="border-t pt-2">
												<div className="flex justify-between font-semibold text-lg">
													<span>Total</span>
													<span>Rp {displayPrice.toLocaleString("id-ID")}</span>
												</div>
											</div>
										</div>
									</div>

									{/* Features Preview */}
									<div className="space-y-3">
										<h4 className="font-semibold text-sm">What's Included</h4>
										<div className="space-y-2">
											{plan.features
												.slice(0, 5)
												.map((feature: string, index: number) => (
													<div
														key={index}
														className="flex items-center space-x-2 text-sm">
														<CheckCircle className="h-4 w-4 text-green-500" />
														<span>{feature}</span>
													</div>
												))}
											{plan.features.length > 5 && (
												<p className="text-sm text-muted-foreground">
													+{plan.features.length - 5} more features
												</p>
											)}
										</div>
									</div>

									{/* Trial Information */}
									{plan.trial_days && plan.trial_days > 0 && (
										<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
											<h4 className="font-semibold text-blue-800 mb-2">
												Free Trial Included
											</h4>
											<p className="text-sm text-blue-700">
												Start with a {plan.trial_days}-day free trial. You won't
												be charged until the trial period ends.
											</p>
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
