"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
	LayoutDashboard,
	Package,
	Wrench,
	Warehouse,
	Users,
	Tag,
	Store,
	Settings,
	LogOut,
	PanelLeft,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { clearUserStoreData } from "@/lib/user-store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
	{
		name: "Dashboard",
		href: "/admin/dashboard",
		icon: LayoutDashboard,
	},
	{
		name: "Products",
		href: "/admin/products",
		icon: Package,
	},
	{
		name: "Services",
		href: "/admin/services",
		icon: Wrench,
	},
	{
		name: "Inventory",
		href: "/admin/inventory",
		icon: Warehouse,
	},
	{
		name: "Employees",
		href: "/admin/employees",
		icon: Users,
	},
	{
		name: "Categories",
		href: "/admin/categories",
		icon: Tag,
	},
	{
		name: "Stores",
		href: "/admin/stores",
		icon: Store,
	},
	{
		name: "Settings",
		href: "/admin/settings",
		icon: Settings,
	},
];

export function SidebarNav() {
	const pathname = usePathname();
	const router = useRouter();

	const handleLogout = async () => {
		try {
			// Clear localStorage
			clearUserStoreData();

			// Sign out from Supabase
			await supabase.auth.signOut();

			toast.success("Logged out successfully");
			router.push("/login");
		} catch (error) {
			console.error("Error logging out:", error);
			toast.error("Failed to log out");
		}
	};

	return (
		<div className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground border-r">
			{/* Header */}
			<div className="flex items-center justify-center px-4 py-4 border-b">
				<h1 className="text-xl font-bold">Allnimall Pet Shop</h1>
			</div>

			{/* Navigation */}
			<nav className="flex-1 px-2 py-4">
				<ul className="space-y-1">
					{navigation.map((item) => {
						const Icon = item.icon;
						const isActive = pathname === item.href;

						return (
							<li key={item.name}>
								<Link
									href={item.href}
									className={cn(
										"flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
										isActive
											? "bg-sidebar-accent text-sidebar-accent-foreground"
											: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
									)}>
									<Icon className="h-4 w-4" />
									<span>{item.name}</span>
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>

			{/* Footer */}
			<div className="border-t p-2">
				<Button
					variant="ghost"
					onClick={handleLogout}
					className="w-full justify-start gap-3">
					<LogOut className="h-4 w-4" />
					<span>Logout</span>
				</Button>
			</div>
		</div>
	);
}
