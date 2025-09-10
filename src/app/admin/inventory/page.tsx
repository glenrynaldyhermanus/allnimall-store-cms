"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Plus,
	Search,
	Edit,
	Trash2,
	Warehouse,
	TrendingUp,
	TrendingDown,
	AlertTriangle,
	Package,
	ArrowUpDown,
} from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { getStoreId } from "@/lib/user-store";

interface InventoryItem {
	id: string;
	name: string;
	category: string;
	sku: string;
	currentStock: number;
	minStock: number;
	maxStock: number;
	unitCost: number;
	totalValue: number;
	lastRestocked: string;
	status: "in_stock" | "low_stock" | "out_of_stock";
}

export default function InventoryPage() {
	const [inventory, setInventory] = useState<InventoryItem[]>([]);
	const [loading, setLoading] = useState(true);

	// No mock data - will fetch real data from database

	// Fetch inventory data from Supabase
	const fetchInventory = async () => {
		try {
			setLoading(true);

			// Get store_id from localStorage
			const store_id = getStoreId();
			if (!store_id) {
				toast.error("Store not found. Please log in again.");
				return;
			}

			// Fetch products with categories
			const { data: products, error } = await supabase
				.from("products")
				.select(
					`
					id,
					name,
					stock,
					price,
					sku,
					created_at,
					products_categories (
						name,
						type
					)
				`
				)
				.eq("store_id", store_id)
				.is("deleted_at", null)
				.order("name");

			if (error) {
				toast.error("Failed to fetch inventory");
				return;
			}

			// Transform data to inventory format
			const inventoryData: InventoryItem[] = products.map((product: any) => {
				const stock = product.stock || 0;
				const price = product.price || 0;
				let status: "in_stock" | "low_stock" | "out_of_stock" = "in_stock";

				if (stock === 0) {
					status = "out_of_stock";
				} else if (stock < 10) {
					status = "low_stock";
				}

				return {
					id: product.id,
					name: product.name,
					category: product.products_categories?.name || "Uncategorized",
					sku: product.sku || "N/A",
					currentStock: stock,
					minStock: 10, // Default minimum stock
					maxStock: 100, // Default maximum stock
					unitCost: price,
					totalValue: stock * price,
					lastRestocked: new Date(product.created_at)
						.toISOString()
						.split("T")[0],
					status,
				};
			});

			setInventory(inventoryData);
		} catch (error) {
			toast.error("Failed to load inventory data");
			// Set empty inventory on error
			setInventory([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchInventory();
	}, []);

	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

	const filteredInventory = inventory.filter((item) => {
		const matchesSearch =
			item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.sku.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory =
			categoryFilter === "all" || item.category === categoryFilter;
		const matchesStatus =
			statusFilter === "all" || item.status === statusFilter;
		return matchesSearch && matchesCategory && matchesStatus;
	});

	const categories = [
		"all",
		"Food",
		"Accessories",
		"Treats",
		"Grooming",
		"Toys",
	];
	const statuses = ["all", "in_stock", "low_stock", "out_of_stock"];

	const totalInventoryValue = inventory.reduce(
		(sum, item) => sum + item.totalValue,
		0
	);
	const lowStockItems = inventory.filter(
		(item) => item.status === "low_stock"
	).length;
	const outOfStockItems = inventory.filter(
		(item) => item.status === "out_of_stock"
	).length;

	const handleDeleteItem = async (id: string) => {
		try {
			const { error } = await supabase
				.from("products")
				.update({
					deleted_at: new Date().toISOString(),
					deleted_by: (await supabase.auth.getUser()).data.user?.id,
				})
				.eq("id", id);

			if (error) {
				toast.error("Failed to delete item");
				return;
			}

			toast.success("Item deleted successfully");
			fetchInventory();
		} catch (error) {
			toast.error("Something went wrong");
		}
	};

	const handleEditItem = (id: string) => {
		// Redirect to products page for editing
		window.location.href = `/admin/products?edit=${id}`;
	};

	const handleAdjustStock = (item: InventoryItem) => {
		setSelectedItem(item);
		setIsAdjustDialogOpen(true);
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "in_stock":
				return <Badge variant="default">In Stock</Badge>;
			case "low_stock":
				return <Badge variant="destructive">Low Stock</Badge>;
			case "out_of_stock":
				return <Badge variant="secondary">Out of Stock</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	return (
		<MainLayout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">
							Inventory Management
						</h1>
						<p className="text-gray-600">
							Track and manage your inventory levels
						</p>
					</div>
					<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
						<DialogTrigger asChild>
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								Add Item
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Add Inventory Item</DialogTitle>
								<DialogDescription>
									Add a new item to your inventory
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="name">Item Name</Label>
									<Input id="name" placeholder="Enter item name" />
								</div>
								<div className="space-y-2">
									<Label htmlFor="category">Category</Label>
									<Select>
										<SelectTrigger>
											<SelectValue placeholder="Select category" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="food">Food</SelectItem>
											<SelectItem value="accessories">Accessories</SelectItem>
											<SelectItem value="treats">Treats</SelectItem>
											<SelectItem value="grooming">Grooming</SelectItem>
											<SelectItem value="toys">Toys</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="sku">SKU</Label>
										<Input id="sku" placeholder="Enter SKU" />
									</div>
									<div className="space-y-2">
										<Label htmlFor="unitCost">Unit Cost</Label>
										<Input id="unitCost" type="number" placeholder="0.00" />
									</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="space-y-2">
										<Label htmlFor="currentStock">Current Stock</Label>
										<Input id="currentStock" type="number" placeholder="0" />
									</div>
									<div className="space-y-2">
										<Label htmlFor="minStock">Min Stock</Label>
										<Input id="minStock" type="number" placeholder="0" />
									</div>
									<div className="space-y-2">
										<Label htmlFor="maxStock">Max Stock</Label>
										<Input id="maxStock" type="number" placeholder="0" />
									</div>
								</div>
								<div className="flex justify-end space-x-2">
									<Button
										variant="outline"
										onClick={() => setIsAddDialogOpen(false)}>
										Cancel
									</Button>
									<Button
										onClick={() => {
											toast.success("Inventory item added successfully");
											setIsAddDialogOpen(false);
										}}>
										Add Item
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</div>

				{/* Inventory Overview */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-gray-600">
								Total Value
							</CardTitle>
							<TrendingUp className="h-4 w-4 text-green-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-gray-900">
								${totalInventoryValue.toFixed(2)}
							</div>
							<p className="text-xs text-gray-500">Total inventory value</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-gray-600">
								Total Items
							</CardTitle>
							<Package className="h-4 w-4 text-blue-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-gray-900">
								{inventory.length}
							</div>
							<p className="text-xs text-gray-500">Items in inventory</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-gray-600">
								Low Stock
							</CardTitle>
							<AlertTriangle className="h-4 w-4 text-yellow-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-gray-900">
								{lowStockItems}
							</div>
							<p className="text-xs text-gray-500">Items need restocking</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-gray-600">
								Out of Stock
							</CardTitle>
							<TrendingDown className="h-4 w-4 text-red-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-gray-900">
								{outOfStockItems}
							</div>
							<p className="text-xs text-gray-500">Items out of stock</p>
						</CardContent>
					</Card>
				</div>

				{/* Filters */}
				<Card>
					<CardHeader>
						<CardTitle>Filters</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col sm:flex-row gap-4">
							<div className="flex-1">
								<Label htmlFor="search">Search Inventory</Label>
								<div className="relative">
									<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
									<Input
										id="search"
										placeholder="Search by name or SKU..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-10"
									/>
								</div>
							</div>
							<div className="sm:w-48">
								<Label htmlFor="category">Category</Label>
								<Select
									value={categoryFilter}
									onValueChange={setCategoryFilter}>
									<SelectTrigger>
										<SelectValue placeholder="All Categories" />
									</SelectTrigger>
									<SelectContent>
										{categories.map((category) => (
											<SelectItem key={category} value={category}>
												{category === "all" ? "All Categories" : category}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="sm:w-48">
								<Label htmlFor="status">Status</Label>
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger>
										<SelectValue placeholder="All Status" />
									</SelectTrigger>
									<SelectContent>
										{statuses.map((status) => (
											<SelectItem key={status} value={status}>
												{status === "all"
													? "All Status"
													: status === "in_stock"
													? "In Stock"
													: status === "low_stock"
													? "Low Stock"
													: "Out of Stock"}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Inventory Table */}
				<Card>
					<CardHeader>
						<CardTitle>Inventory ({filteredInventory.length})</CardTitle>
						<CardDescription>
							Current inventory levels and stock status
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Item</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>SKU</TableHead>
									<TableHead>Current Stock</TableHead>
									<TableHead>Min/Max</TableHead>
									<TableHead>Unit Cost</TableHead>
									<TableHead>Total Value</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredInventory.map((item) => (
									<TableRow key={item.id}>
										<TableCell>
											<div className="flex items-center space-x-3">
												<div className="p-2 bg-blue-100 rounded-lg">
													<Warehouse className="h-4 w-4 text-blue-600" />
												</div>
												<div>
													<div className="font-medium text-gray-900">
														{item.name}
													</div>
													<div className="text-sm text-gray-500">
														Last restocked: {item.lastRestocked}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell>{item.category}</TableCell>
										<TableCell className="font-mono text-sm">
											{item.sku}
										</TableCell>
										<TableCell>
											<div className="font-medium">{item.currentStock}</div>
										</TableCell>
										<TableCell>
											<div className="text-sm text-gray-500">
												{item.minStock}/{item.maxStock}
											</div>
										</TableCell>
										<TableCell>${item.unitCost.toFixed(2)}</TableCell>
										<TableCell>${item.totalValue.toFixed(2)}</TableCell>
										<TableCell>{getStatusBadge(item.status)}</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end space-x-2">
												<Button
													variant="outline"
													size="icon"
													onClick={() => handleAdjustStock(item)}>
													<ArrowUpDown className="h-4 w-4" />
												</Button>
												<Button
													variant="outline"
													size="icon"
													onClick={() => handleEditItem(item.id)}>
													<Edit className="h-4 w-4" />
												</Button>
												<Button
													variant="outline"
													size="icon"
													onClick={() => handleDeleteItem(item.id)}>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>

				{/* Adjust Stock Dialog */}
				<Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Adjust Stock</DialogTitle>
							<DialogDescription>
								Update stock levels for {selectedItem?.name}
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="adjustment">Stock Adjustment</Label>
								<Input
									id="adjustment"
									type="number"
									placeholder="Enter positive or negative number"
								/>
								<p className="text-sm text-gray-500">
									Current stock: {selectedItem?.currentStock} units
								</p>
							</div>
							<div className="space-y-2">
								<Label htmlFor="reason">Reason</Label>
								<Select>
									<SelectTrigger>
										<SelectValue placeholder="Select reason" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="restock">Restock</SelectItem>
										<SelectItem value="sale">Sale</SelectItem>
										<SelectItem value="damage">Damage</SelectItem>
										<SelectItem value="return">Return</SelectItem>
										<SelectItem value="other">Other</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="flex justify-end space-x-2">
								<Button
									variant="outline"
									onClick={() => setIsAdjustDialogOpen(false)}>
									Cancel
								</Button>
								<Button
									onClick={() => {
										toast.success("Stock adjusted successfully");
										setIsAdjustDialogOpen(false);
									}}>
									Adjust Stock
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</MainLayout>
	);
}
