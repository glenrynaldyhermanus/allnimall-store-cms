"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Package,
	Wrench,
	Warehouse,
	TrendingUp,
	Users,
	DollarSign,
	ShoppingCart,
	AlertTriangle,
} from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import { supabase } from "@/lib/supabase";
import { getStoreId } from "@/lib/user-store";
import { toast } from "sonner";

interface DashboardStats {
	totalProducts: number;
	activeServices: number;
	lowStockItems: number;
	monthlyRevenue: number;
}

interface RecentActivity {
	id: string;
	type: string;
	description: string;
	amount: string;
	time: string;
}

interface TopProduct {
	name: string;
	sales: number;
	revenue: string;
}

export default function DashboardPage() {
	const [stats, setStats] = useState<DashboardStats>({
		totalProducts: 0,
		activeServices: 0,
		lowStockItems: 0,
		monthlyRevenue: 0,
	});
	const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
		[]
	);
	const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
	const [loading, setLoading] = useState(true);

	// Fetch dashboard data
	const fetchDashboardData = async () => {
		try {
			setLoading(true);

			// Get store_id from localStorage
			const store_id = getStoreId();
			if (!store_id) {
				toast.error("Store not found. Please log in again.");
				return;
			}

			// Fetch products count
			const { count: totalProducts } = await supabase
				.from("products")
				.select("*", { count: "exact", head: true })
				.eq("store_id", store_id)
				.is("deleted_at", null);

			// Fetch services count
			const { count: activeServices } = await supabase
				.from("services")
				.select("*", { count: "exact", head: true })
				.eq("store_id", store_id)
				.eq("is_active", true)
				.is("deleted_at", null);

			// Fetch low stock items (stock < 10)
			const { count: lowStockItems } = await supabase
				.from("products")
				.select("*", { count: "exact", head: true })
				.eq("store_id", store_id)
				.lt("stock", 10)
				.is("deleted_at", null);

			// Set real data from database
			setStats({
				totalProducts: totalProducts || 0,
				activeServices: activeServices || 0,
				lowStockItems: lowStockItems || 0,
				monthlyRevenue: 0, // Will be calculated from actual transactions
			});

			// No recent activities yet - will be populated when transactions exist
			setRecentActivities([]);

			// No top products yet - will be populated when sales data exists
			setTopProducts([]);
		} catch (error) {
			toast.error("Failed to load dashboard data");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const statsData = [
		{
			title: "Total Products",
			value: stats.totalProducts.toString(),
			change: "+12%",
			changeType: "positive" as const,
			icon: Package,
			description: "Products in inventory",
		},
		{
			title: "Active Services",
			value: stats.activeServices.toString(),
			change: "+2",
			changeType: "positive" as const,
			icon: Wrench,
			description: "Services available",
		},
		{
			title: "Low Stock Items",
			value: stats.lowStockItems.toString(),
			change: "-3",
			changeType: "negative" as const,
			icon: AlertTriangle,
			description: "Items need restocking",
		},
		{
			title: "Monthly Revenue",
			value: `Rp ${stats.monthlyRevenue.toLocaleString("id-ID")}`,
			change: "+8.2%",
			changeType: "positive" as const,
			icon: DollarSign,
			description: "This month's sales",
		},
	];

	return (
		<MainLayout>
			<div className="space-y-6">
				{/* Header */}
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
					<p className="text-gray-600">
						Welcome back! Here&apos;s what&apos;s happening with your pet shop.
					</p>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{statsData.map((stat) => {
						const Icon = stat.icon;
						return (
							<Card key={stat.title}>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium text-gray-600">
										{stat.title}
									</CardTitle>
									<Icon className="h-4 w-4 text-gray-600" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-gray-900">
										{stat.value}
									</div>
									<div className="flex items-center space-x-2 text-xs text-gray-600">
										<Badge
											variant={
												stat.changeType === "positive"
													? "default"
													: "destructive"
											}
											className="text-xs">
											{stat.change}
										</Badge>
										<span>from last month</span>
									</div>
									<p className="text-xs text-gray-500 mt-1">
										{stat.description}
									</p>
								</CardContent>
							</Card>
						);
					})}
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Recent Activities */}
					<Card>
						<CardHeader>
							<CardTitle>Recent Activities</CardTitle>
							<CardDescription>Latest transactions and updates</CardDescription>
						</CardHeader>
						<CardContent>
							{recentActivities.length > 0 ? (
								<div className="space-y-4">
									{recentActivities.map((activity) => (
										<div
											key={activity.id}
											className="flex items-center justify-between">
											<div className="flex items-center space-x-3">
												<div
													className={`p-2 rounded-full ${
														activity.type === "sale"
															? "bg-green-100"
															: activity.type === "service"
															? "bg-blue-100"
															: activity.type === "restock"
															? "bg-yellow-100"
															: "bg-red-100"
													}`}>
													{activity.type === "sale" && (
														<ShoppingCart className="h-4 w-4 text-green-600" />
													)}
													{activity.type === "service" && (
														<Wrench className="h-4 w-4 text-blue-600" />
													)}
													{activity.type === "restock" && (
														<Package className="h-4 w-4 text-yellow-600" />
													)}
													{activity.type === "low_stock" && (
														<AlertTriangle className="h-4 w-4 text-red-600" />
													)}
												</div>
												<div>
													<p className="text-sm font-medium text-gray-900">
														{activity.description}
													</p>
													<p className="text-xs text-gray-500">
														{activity.time}
													</p>
												</div>
											</div>
											<div className="text-sm font-medium text-gray-900">
												{activity.amount}
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-8">
									<ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
									<p className="text-gray-500">No recent activities yet</p>
									<p className="text-sm text-gray-400 mt-2">
										Activities will appear here once you start making
										transactions
									</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Top Products */}
					<Card>
						<CardHeader>
							<CardTitle>Top Selling Products</CardTitle>
							<CardDescription>
								Best performing products this month
							</CardDescription>
						</CardHeader>
						<CardContent>
							{topProducts.length > 0 ? (
								<div className="space-y-4">
									{topProducts.map((product, index) => (
										<div
											key={product.name}
											className="flex items-center justify-between">
											<div className="flex items-center space-x-3">
												<div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
													{index + 1}
												</div>
												<div>
													<p className="text-sm font-medium text-gray-900">
														{product.name}
													</p>
													<p className="text-xs text-gray-500">
														{product.sales} sales
													</p>
												</div>
											</div>
											<div className="text-sm font-medium text-gray-900">
												{product.revenue}
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-8">
									<Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
									<p className="text-gray-500">No sales data yet</p>
									<p className="text-sm text-gray-400 mt-2">
										Top products will appear here once you start selling
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</MainLayout>
	);
}
