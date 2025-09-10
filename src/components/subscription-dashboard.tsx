"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	CreditCard,
	Calendar,
	TrendingUp,
	AlertTriangle,
	CheckCircle,
	Clock,
	XCircle,
	Settings,
	Download,
	Eye,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface SubscriptionData {
	subscription: {
		id: string;
		status: string;
		start_date: string;
		end_date?: string;
		next_billing_date?: string;
		trial_end_date?: string;
		current_period_start?: string;
		current_period_end?: string;
		cancel_at_period_end: boolean;
		auto_renew: boolean;
	};
	plan: {
		id: string;
		name: string;
		display_name?: string;
		price: number;
		billing_cycle: string;
		features: string[];
		limits: {
			stores?: number;
			users?: number;
			products?: number;
			customers?: number;
			storage_gb?: number;
			api_calls_per_month?: number;
		};
	};
	usage: {
		stores_used: number;
		users_used: number;
		products_used: number;
		customers_used: number;
		storage_used_gb: number;
		api_calls_used: number;
	};
	nextInvoice?: {
		id: string;
		amount: number;
		due_date: string;
		status: string;
	};
}

export function SubscriptionDashboard() {
	const [data, setData] = useState<SubscriptionData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchSubscriptionData();
	}, []);

	const fetchSubscriptionData = async () => {
		try {
			// This would typically get the current user's data
			// For now, we'll simulate with mock data
			const mockData: SubscriptionData = {
				subscription: {
					id: "sub_123",
					status: "active",
					start_date: "2024-01-01T00:00:00Z",
					end_date: "2024-12-31T23:59:59Z",
					next_billing_date: "2024-02-01T00:00:00Z",
					current_period_start: "2024-01-01T00:00:00Z",
					current_period_end: "2024-02-01T00:00:00Z",
					cancel_at_period_end: false,
					auto_renew: true,
				},
				plan: {
					id: "plan_123",
					name: "Professional Plan",
					display_name: "Professional",
					price: 299000,
					billing_cycle: "monthly",
					features: [
						"Advanced Analytics",
						"Custom Reports",
						"API Access",
						"Priority Support",
						"Webhooks",
						"Custom Integrations",
					],
					limits: {
						stores: 10,
						users: 25,
						products: 5000,
						customers: 10000,
						storage_gb: 100,
						api_calls_per_month: 100000,
					},
				},
				usage: {
					stores_used: 3,
					users_used: 8,
					products_used: 1250,
					customers_used: 2500,
					storage_used_gb: 25,
					api_calls_used: 15000,
				},
				nextInvoice: {
					id: "inv_123",
					amount: 299000,
					due_date: "2024-02-01T00:00:00Z",
					status: "pending",
				},
			};

			setData(mockData);
		} catch (error) {
			console.error("Error fetching subscription data:", error);
			setError("Failed to load subscription data");
		} finally {
			setLoading(false);
		}
	};

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

	const formatLimit = (limit: number | undefined) => {
		if (limit === undefined) return "Unlimited";
		if (limit === -1) return "Unlimited";
		return limit.toLocaleString();
	};

	const calculateUsagePercentage = (
		used: number,
		limit: number | undefined
	) => {
		if (limit === undefined || limit === -1) return 0;
		return Math.min((used / limit) * 100, 100);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("id-ID", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[1, 2, 3].map((i) => (
							<div key={i} className="h-32 bg-gray-200 rounded"></div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<Card>
				<CardContent className="p-6 text-center">
					<XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
					<h3 className="text-lg font-semibold mb-2">
						Error Loading Subscription
					</h3>
					<p className="text-muted-foreground mb-4">
						{error || "No subscription found"}
					</p>
					<Button asChild>
						<Link href="/pricing">View Plans</Link>
					</Button>
				</CardContent>
			</Card>
		);
	}

	const { subscription, plan, usage, nextInvoice } = data;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Subscription Dashboard</h1>
					<p className="text-muted-foreground">
						Manage your subscription and monitor usage
					</p>
				</div>
				<div className="flex items-center space-x-2">
					{getStatusIcon(subscription.status)}
					<Badge className={getStatusColor(subscription.status)}>
						{subscription.status.charAt(0).toUpperCase() +
							subscription.status.slice(1)}
					</Badge>
				</div>
			</div>

			{/* Overview Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Current Plan</CardTitle>
						<CreditCard className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{plan.display_name || plan.name}
						</div>
						<p className="text-xs text-muted-foreground">
							Rp {plan.price.toLocaleString("id-ID")}/{plan.billing_cycle}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Next Billing</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{subscription.next_billing_date
								? formatDate(subscription.next_billing_date)
								: "N/A"}
						</div>
						<p className="text-xs text-muted-foreground">
							{nextInvoice
								? `Rp ${nextInvoice.amount.toLocaleString("id-ID")}`
								: "No upcoming charges"}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Usage This Month
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{usage.api_calls_used.toLocaleString()}
						</div>
						<p className="text-xs text-muted-foreground">
							API calls of {formatLimit(plan.limits.api_calls_per_month)}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Auto Renewal</CardTitle>
						<Settings className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{subscription.auto_renew ? "On" : "Off"}
						</div>
						<p className="text-xs text-muted-foreground">
							{subscription.cancel_at_period_end
								? "Cancels at period end"
								: "Continues automatically"}
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Usage Overview */}
			<Card>
				<CardHeader>
					<CardTitle>Usage Overview</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{/* Stores */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Stores</span>
								<span className="text-sm text-muted-foreground">
									{usage.stores_used} / {formatLimit(plan.limits.stores)}
								</span>
							</div>
							<Progress
								value={calculateUsagePercentage(
									usage.stores_used,
									plan.limits.stores
								)}
								className="h-2"
							/>
						</div>

						{/* Users */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Users</span>
								<span className="text-sm text-muted-foreground">
									{usage.users_used} / {formatLimit(plan.limits.users)}
								</span>
							</div>
							<Progress
								value={calculateUsagePercentage(
									usage.users_used,
									plan.limits.users
								)}
								className="h-2"
							/>
						</div>

						{/* Products */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Products</span>
								<span className="text-sm text-muted-foreground">
									{usage.products_used.toLocaleString()} /{" "}
									{formatLimit(plan.limits.products)}
								</span>
							</div>
							<Progress
								value={calculateUsagePercentage(
									usage.products_used,
									plan.limits.products
								)}
								className="h-2"
							/>
						</div>

						{/* Customers */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Customers</span>
								<span className="text-sm text-muted-foreground">
									{usage.customers_used.toLocaleString()} /{" "}
									{formatLimit(plan.limits.customers)}
								</span>
							</div>
							<Progress
								value={calculateUsagePercentage(
									usage.customers_used,
									plan.limits.customers
								)}
								className="h-2"
							/>
						</div>

						{/* Storage */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Storage</span>
								<span className="text-sm text-muted-foreground">
									{usage.storage_used_gb.toFixed(1)} GB /{" "}
									{formatLimit(plan.limits.storage_gb)} GB
								</span>
							</div>
							<Progress
								value={calculateUsagePercentage(
									usage.storage_used_gb,
									plan.limits.storage_gb
								)}
								className="h-2"
							/>
						</div>

						{/* API Calls */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">API Calls</span>
								<span className="text-sm text-muted-foreground">
									{usage.api_calls_used.toLocaleString()} /{" "}
									{formatLimit(plan.limits.api_calls_per_month)}
								</span>
							</div>
							<Progress
								value={calculateUsagePercentage(
									usage.api_calls_used,
									plan.limits.api_calls_per_month
								)}
								className="h-2"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Actions */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Button variant="outline" asChild className="h-20 flex-col">
					<Link href="/pricing">
						<TrendingUp className="h-6 w-6 mb-2" />
						<span>Upgrade Plan</span>
					</Link>
				</Button>

				<Button variant="outline" asChild className="h-20 flex-col">
					<Link href="/admin/settings/billing">
						<CreditCard className="h-6 w-6 mb-2" />
						<span>Billing History</span>
					</Link>
				</Button>

				<Button variant="outline" asChild className="h-20 flex-col">
					<Link href="/admin/settings/subscription">
						<Settings className="h-6 w-6 mb-2" />
						<span>Manage Subscription</span>
					</Link>
				</Button>

				<Button variant="outline" asChild className="h-20 flex-col">
					<Link href="/admin/settings/invoices">
						<Download className="h-6 w-6 mb-2" />
						<span>Download Invoices</span>
					</Link>
				</Button>
			</div>
		</div>
	);
}
