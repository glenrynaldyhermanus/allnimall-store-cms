"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
	Settings,
	CreditCard,
	Calendar,
	AlertTriangle,
	CheckCircle,
	Clock,
	XCircle,
	Trash2,
} from "lucide-react";
import {
	PlanChangeRequestForm,
	PlanChangeRequestsList,
} from "@/components/plan-change-request";
import Link from "next/link";

export default function SubscriptionManagementPage() {
	const [autoRenew, setAutoRenew] = useState(true);
	const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);

	// No subscription data yet - will fetch from database
	const subscription = null;

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "active":
				return <CheckCircle className="h-5 w-5 text-green-500" />;
			case "trial":
				return <Clock className="h-5 w-5 text-blue-500" />;
			case "past_due":
				return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
			case "cancelled":
			case "expired":
				return <XCircle className="h-5 w-5 text-red-500" />;
			default:
				return <Clock className="h-5 w-5 text-gray-500" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-800";
			case "trial":
				return "bg-blue-100 text-blue-800";
			case "past_due":
				return "bg-yellow-100 text-yellow-800";
			case "cancelled":
			case "expired":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("id-ID", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const handleCancelSubscription = () => {
		// This would typically show a confirmation dialog
		setCancelAtPeriodEnd(true);
	};

	const handleReactivateSubscription = () => {
		setCancelAtPeriodEnd(false);
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">Subscription Management</h1>
						<p className="text-muted-foreground">
							Manage your subscription settings and billing preferences
						</p>
					</div>
					{subscription ? (
						<div className="flex items-center space-x-2">
							{getStatusIcon(subscription.status)}
							<Badge className={getStatusColor(subscription.status)}>
								{subscription.status.charAt(0).toUpperCase() +
									subscription.status.slice(1)}
							</Badge>
						</div>
					) : (
						<Badge variant="outline">No Subscription</Badge>
					)}
				</div>

				{/* Current Subscription */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<CreditCard className="h-5 w-5" />
							<span>Current Subscription</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						{subscription ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							<div className="space-y-2">
								<h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
									Plan
								</h4>
								<div className="text-lg font-semibold">
									{subscription.plan.display_name || subscription.plan.name}
								</div>
								<div className="text-sm text-muted-foreground">
									Rp {subscription.plan.price.toLocaleString("id-ID")}/
									{subscription.plan.billing_cycle}
								</div>
							</div>

							<div className="space-y-2">
								<h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
									Current Period
								</h4>
								<div className="text-sm">
									{formatDate(subscription.current_period_start)} -{" "}
									{formatDate(subscription.current_period_end)}
								</div>
							</div>

							<div className="space-y-2">
								<h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
									Next Billing
								</h4>
								<div className="text-sm">
									{formatDate(subscription.next_billing_date)}
								</div>
							</div>

							<div className="space-y-2">
								<h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
									Auto Renewal
								</h4>
								<div className="flex items-center space-x-2">
									<Switch
										checked={autoRenew}
										onCheckedChange={setAutoRenew}
										disabled={cancelAtPeriodEnd}
									/>
									<span className="text-sm">
										{autoRenew ? "Enabled" : "Disabled"}
									</span>
								</div>
							</div>
						</div>

						{/* Actions */}
						<div className="flex flex-wrap gap-3 pt-4 border-t">
							<Button variant="outline" asChild>
								<Link href="/pricing">Change Plan</Link>
							</Button>
							<Button variant="outline" asChild>
								<Link href="/admin/billing">View Billing History</Link>
							</Button>
							<Button variant="outline" asChild>
								<Link href="/admin/settings/payment-methods">
									Payment Methods
								</Link>
							</Button>
							{!cancelAtPeriodEnd ? (
								<Button
									variant="destructive"
									onClick={handleCancelSubscription}>
									<Trash2 className="h-4 w-4 mr-2" />
									Cancel Subscription
								</Button>
							) : (
								<Button
									variant="default"
									onClick={handleReactivateSubscription}>
									<CheckCircle className="h-4 w-4 mr-2" />
									Reactivate Subscription
								</Button>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Plan Change Requests */}
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<h2 className="text-2xl font-bold">Plan Changes</h2>
						<PlanChangeRequestForm
							currentPlanId={subscription.plan.name}
							onRequestSubmitted={() => {
								// Refresh the requests list
								window.location.reload();
							}}
						/>
					</div>

					<PlanChangeRequestsList />
				</div>
						) : (
							<div className="text-center py-8">
								<CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
								<p className="text-gray-500">No active subscription</p>
								<p className="text-sm text-gray-400 mt-2">
									You don't have an active subscription yet
								</p>
							</div>
						)}

				{/* Billing Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<Settings className="h-5 w-5" />
							<span>Billing Settings</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<h4 className="font-semibold">Auto Renewal</h4>
									<p className="text-sm text-muted-foreground">
										Automatically renew your subscription at the end of each
										billing period
									</p>
								</div>
								<Switch
									checked={autoRenew}
									onCheckedChange={setAutoRenew}
									disabled={cancelAtPeriodEnd}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div>
									<h4 className="font-semibold">Cancel at Period End</h4>
									<p className="text-sm text-muted-foreground">
										Cancel subscription at the end of the current billing period
									</p>
								</div>
								<Switch
									checked={cancelAtPeriodEnd}
									onCheckedChange={setCancelAtPeriodEnd}
								/>
							</div>
						</div>

						{cancelAtPeriodEnd && (
							<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
								<div className="flex items-center space-x-2">
									<AlertTriangle className="h-5 w-5 text-yellow-600" />
									<div>
										<h4 className="font-semibold text-yellow-800">
											Subscription Will Cancel
										</h4>
										<p className="text-sm text-yellow-700">
											Your subscription will be cancelled on{" "}
											{formatDate(subscription.current_period_end)}. You can
											reactivate it anytime before then.
										</p>
									</div>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Important Information */}
				<Card>
					<CardHeader>
						<CardTitle>Important Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3 text-sm">
							<div className="flex items-start space-x-2">
								<Calendar className="h-4 w-4 text-blue-500 mt-0.5" />
								<div>
									<p className="font-semibold">Billing Cycle</p>
									<p className="text-muted-foreground">
										Your subscription renews automatically on the same date each
										month/year.
									</p>
								</div>
							</div>

							<div className="flex items-start space-x-2">
								<CreditCard className="h-4 w-4 text-green-500 mt-0.5" />
								<div>
									<p className="font-semibold">Payment Methods</p>
									<p className="text-muted-foreground">
										We accept all major credit cards, bank transfers, and
										e-wallets through Midtrans.
									</p>
								</div>
							</div>

							<div className="flex items-start space-x-2">
								<Settings className="h-4 w-4 text-purple-500 mt-0.5" />
								<div>
									<p className="font-semibold">Plan Changes</p>
									<p className="text-muted-foreground">
										Plan changes take effect at your next billing cycle. You may
										be charged or credited for prorated amounts.
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
