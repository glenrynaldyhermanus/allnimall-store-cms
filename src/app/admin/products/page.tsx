"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { getStoreId } from "@/lib/user-store";

interface Product {
	id: string;
	name: string;
	category_id: string;
	price: number;
	stock: number;
	sku: string | null;
	is_active: boolean;
	description: string | null;
	picture_url: string | null;
	created_at: string;
	products_categories?: {
		name: string;
		type: string;
	};
}

interface Category {
	id: string;
	name: string;
	type: string;
}

export default function ProductsPage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);

	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

	// Form states
	const [formData, setFormData] = useState({
		name: "",
		category_id: "",
		price: "",
		cost_price: "",
		stock: "",
		stock_quantity: "",
		min_stock_level: "",
		max_stock_level: "",
		barcode: "",
		sku: "",
		description: "",
		picture_url: "",
		purchase_price: "",
		min_stock: "",
		unit: "pcs",
		weight_grams: "",
		code: "",
		product_type: "item",
		duration_minutes: "",
		service_category: "",
		discount_type: "1",
		discount_value: "",
	});

	// Fetch products
	const fetchProducts = async () => {
		try {
			setLoading(true);

			const store_id = getStoreId();
			if (!store_id) {
				toast.error("Store not found. Please log in again.");
				return;
			}

			const { data, error } = await supabase
				.from("products")
				.select(
					`
					*,
					products_categories (
						name,
						type
					)
				`
				)
				.eq("store_id", store_id)
				.is("deleted_at", null)
				.order("created_at", { ascending: false });

			if (error) throw error;
			setProducts(data || []);
		} catch (error) {
			console.error("Error fetching products:", error);
			toast.error("Failed to fetch products");
		} finally {
			setLoading(false);
		}
	};

	// Fetch categories
	const fetchCategories = async () => {
		try {
			const store_id = getStoreId();
			if (!store_id) return;

			const { data, error } = await supabase
				.from("products_categories")
				.select("*")
				.eq("store_id", store_id)
				.is("deleted_at", null)
				.order("name");

			if (error) throw error;
			// Filter out categories with invalid IDs
			const validCategories = (data || []).filter(
				(category: Category) => category.id && category.id.trim() !== ""
			);
			setCategories(validCategories);
		} catch (error) {
			console.error("Error fetching categories:", error);
		}
	};

	useEffect(() => {
		fetchProducts();
		fetchCategories();
	}, []);

	const filteredProducts = products.filter((product) => {
		const matchesSearch =
			product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(product.sku &&
				product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
		const matchesCategory =
			categoryFilter === "all" || product.category_id === categoryFilter;
		return matchesSearch && matchesCategory;
	});

	const handleAddProduct = async () => {
		try {
			const store_id = getStoreId();
			if (!store_id) {
				toast.error("Store not found. Please log in again.");
				return;
			}

			const { error } = await supabase.from("products").insert([
				{
					...formData,
					store_id: store_id,
					price: parseFloat(formData.price),
					cost_price: formData.cost_price
						? parseFloat(formData.cost_price)
						: null,
					stock: parseInt(formData.stock),
					stock_quantity: formData.stock_quantity
						? parseInt(formData.stock_quantity)
						: 0,
					min_stock_level: formData.min_stock_level
						? parseInt(formData.min_stock_level)
						: 0,
					max_stock_level: formData.max_stock_level
						? parseInt(formData.max_stock_level)
						: null,
					barcode: formData.barcode || null,
					sku: formData.sku || null,
					description: formData.description || null,
					picture_url: formData.picture_url || null,
					purchase_price: formData.purchase_price
						? parseFloat(formData.purchase_price)
						: 0,
					min_stock: formData.min_stock ? parseInt(formData.min_stock) : 0,
					unit: formData.unit || "pcs",
					weight_grams: formData.weight_grams
						? parseInt(formData.weight_grams)
						: 0,
					code: formData.code || null,
					product_type: formData.product_type || "item",
					duration_minutes: formData.duration_minutes
						? parseInt(formData.duration_minutes)
						: null,
					service_category: formData.service_category || null,
					discount_type: parseInt(formData.discount_type),
					discount_value: formData.discount_value
						? parseFloat(formData.discount_value)
						: 0,
				},
			]);

			if (error) throw error;

			toast.success("Product added successfully");
			setIsAddDialogOpen(false);
			resetForm();
			fetchProducts();
		} catch (error) {
			console.error("Error adding product:", error);
			toast.error("Failed to add product");
		}
	};

	const handleDeleteProduct = async (id: string) => {
		try {
			const { error } = await supabase
				.from("products")
				.update({ deleted_at: new Date().toISOString() })
				.eq("id", id);

			if (error) throw error;

			toast.success("Product deleted successfully");
			fetchProducts();
		} catch (error) {
			console.error("Error deleting product:", error);
			toast.error("Failed to delete product");
		}
	};

	const handleEditProduct = () => {
		toast.info("Edit product functionality coming soon");
	};

	const resetForm = () => {
		setFormData({
			name: "",
			category_id: "",
			price: "",
			cost_price: "",
			stock: "",
			stock_quantity: "",
			min_stock_level: "",
			max_stock_level: "",
			barcode: "",
			sku: "",
			description: "",
			picture_url: "",
			purchase_price: "",
			min_stock: "",
			unit: "pcs",
			weight_grams: "",
			code: "",
			product_type: "item",
			duration_minutes: "",
			service_category: "",
			discount_type: "1",
			discount_value: "",
		});
	};

	return (
		<MainLayout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Products</h1>
						<p className="text-gray-600">
							Manage your pet shop products and inventory
						</p>
					</div>
					<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
						<DialogTrigger asChild>
							<Button onClick={resetForm}>
								<Plus className="h-4 w-4 mr-2" />
								Add Product
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-4xl max-h-[90vh] p-6">
							<DialogHeader>
								<DialogTitle>Add New Product</DialogTitle>
								<DialogDescription>
									Add a new product to your inventory
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 max-h-[70vh] overflow-y-auto px-2 py-4">
								{/* Basic Information */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Basic Information</h3>
									<div className="space-y-2">
										<Label htmlFor="name">Product Name *</Label>
										<Input
											id="name"
											placeholder="Enter product name"
											value={formData.name}
											onChange={(e) =>
												setFormData({ ...formData, name: e.target.value })
											}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="category">Category *</Label>
										<Select
											value={formData.category_id}
											onValueChange={(value) =>
												setFormData({ ...formData, category_id: value })
											}>
											<SelectTrigger>
												<SelectValue placeholder="Select category" />
											</SelectTrigger>
											<SelectContent>
												{categories.length === 0 ? (
													<div className="px-2 py-1.5 text-sm text-muted-foreground">
														No categories available
													</div>
												) : (
													categories
														.filter(
															(category) =>
																category.id && category.id.trim() !== ""
														)
														.map((category) => (
															<SelectItem key={category.id} value={category.id}>
																{category.name}
															</SelectItem>
														))
												)}
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label htmlFor="product_type">Product Type</Label>
										<Select
											value={formData.product_type}
											onValueChange={(value) =>
												setFormData({ ...formData, product_type: value })
											}>
											<SelectTrigger>
												<SelectValue placeholder="Select product type" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="item">Item</SelectItem>
												<SelectItem value="service">Service</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label htmlFor="description">Description</Label>
										<Textarea
											id="description"
											placeholder="Enter product description"
											value={formData.description}
											onChange={(e) =>
												setFormData({
													...formData,
													description: e.target.value,
												})
											}
											rows={3}
										/>
									</div>
								</div>

								{/* Pricing Information */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Pricing Information</h3>
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="price">Selling Price *</Label>
											<Input
												id="price"
												type="number"
												placeholder="0.00"
												value={formData.price}
												onChange={(e) =>
													setFormData({ ...formData, price: e.target.value })
												}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="cost_price">Cost Price</Label>
											<Input
												id="cost_price"
												type="number"
												placeholder="0.00"
												value={formData.cost_price}
												onChange={(e) =>
													setFormData({
														...formData,
														cost_price: e.target.value,
													})
												}
											/>
										</div>
									</div>
									<div className="space-y-2">
										<Label htmlFor="purchase_price">Purchase Price</Label>
										<Input
											id="purchase_price"
											type="number"
											placeholder="0.00"
											value={formData.purchase_price}
											onChange={(e) =>
												setFormData({
													...formData,
													purchase_price: e.target.value,
												})
											}
										/>
									</div>
								</div>

								{/* Stock Information */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Stock Information</h3>
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="stock">Current Stock *</Label>
											<Input
												id="stock"
												type="number"
												placeholder="0"
												value={formData.stock}
												onChange={(e) =>
													setFormData({ ...formData, stock: e.target.value })
												}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="stock_quantity">Stock Quantity</Label>
											<Input
												id="stock_quantity"
												type="number"
												placeholder="0"
												value={formData.stock_quantity}
												onChange={(e) =>
													setFormData({
														...formData,
														stock_quantity: e.target.value,
													})
												}
											/>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="min_stock_level">Min Stock Level</Label>
											<Input
												id="min_stock_level"
												type="number"
												placeholder="0"
												value={formData.min_stock_level}
												onChange={(e) =>
													setFormData({
														...formData,
														min_stock_level: e.target.value,
													})
												}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="max_stock_level">Max Stock Level</Label>
											<Input
												id="max_stock_level"
												type="number"
												placeholder="0"
												value={formData.max_stock_level}
												onChange={(e) =>
													setFormData({
														...formData,
														max_stock_level: e.target.value,
													})
												}
											/>
										</div>
									</div>
									<div className="space-y-2">
										<Label htmlFor="min_stock">Min Stock for Reorder</Label>
										<Input
											id="min_stock"
											type="number"
											placeholder="0"
											value={formData.min_stock}
											onChange={(e) =>
												setFormData({ ...formData, min_stock: e.target.value })
											}
										/>
									</div>
								</div>

								{/* Product Details */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Product Details</h3>
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="sku">SKU</Label>
											<Input
												id="sku"
												placeholder="Enter SKU"
												value={formData.sku}
												onChange={(e) =>
													setFormData({ ...formData, sku: e.target.value })
												}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="code">Product Code</Label>
											<Input
												id="code"
												placeholder="Enter product code"
												value={formData.code}
												onChange={(e) =>
													setFormData({ ...formData, code: e.target.value })
												}
											/>
										</div>
									</div>
									<div className="space-y-2">
										<Label htmlFor="barcode">Barcode</Label>
										<Input
											id="barcode"
											placeholder="Enter barcode"
											value={formData.barcode}
											onChange={(e) =>
												setFormData({ ...formData, barcode: e.target.value })
											}
										/>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="unit">Unit</Label>
											<Select
												value={formData.unit}
												onValueChange={(value) =>
													setFormData({ ...formData, unit: value })
												}>
												<SelectTrigger>
													<SelectValue placeholder="Select unit" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="pcs">Pieces</SelectItem>
													<SelectItem value="kg">Kilogram</SelectItem>
													<SelectItem value="g">Gram</SelectItem>
													<SelectItem value="l">Liter</SelectItem>
													<SelectItem value="ml">Milliliter</SelectItem>
													<SelectItem value="box">Box</SelectItem>
													<SelectItem value="pack">Pack</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label htmlFor="weight_grams">Weight (grams)</Label>
											<Input
												id="weight_grams"
												type="number"
												placeholder="0"
												value={formData.weight_grams}
												onChange={(e) =>
													setFormData({
														...formData,
														weight_grams: e.target.value,
													})
												}
											/>
										</div>
									</div>
								</div>

								{/* Service Information (conditional) */}
								{formData.product_type === "service" && (
									<div className="space-y-4">
										<h3 className="text-lg font-semibold">
											Service Information
										</h3>
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="duration_minutes">
													Duration (minutes)
												</Label>
												<Input
													id="duration_minutes"
													type="number"
													placeholder="60"
													value={formData.duration_minutes}
													onChange={(e) =>
														setFormData({
															...formData,
															duration_minutes: e.target.value,
														})
													}
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="service_category">
													Service Category
												</Label>
												<Input
													id="service_category"
													placeholder="e.g., Grooming, Veterinary"
													value={formData.service_category}
													onChange={(e) =>
														setFormData({
															...formData,
															service_category: e.target.value,
														})
													}
												/>
											</div>
										</div>
									</div>
								)}

								{/* Discount Information */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">
										Discount Information
									</h3>
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="discount_type">Discount Type</Label>
											<Select
												value={formData.discount_type}
												onValueChange={(value) =>
													setFormData({ ...formData, discount_type: value })
												}>
												<SelectTrigger>
													<SelectValue placeholder="Select discount type" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="1">No Discount</SelectItem>
													<SelectItem value="2">Percentage</SelectItem>
													<SelectItem value="3">Fixed Amount</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label htmlFor="discount_value">Discount Value</Label>
											<Input
												id="discount_value"
												type="number"
												placeholder="0"
												value={formData.discount_value}
												onChange={(e) =>
													setFormData({
														...formData,
														discount_value: e.target.value,
													})
												}
											/>
										</div>
									</div>
								</div>

								{/* Media */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Media</h3>
									<div className="space-y-2">
										<Label htmlFor="picture_url">Image URL</Label>
										<Input
											id="picture_url"
											placeholder="Enter image URL"
											value={formData.picture_url}
											onChange={(e) =>
												setFormData({
													...formData,
													picture_url: e.target.value,
												})
											}
										/>
									</div>
								</div>
								<div className="flex justify-end space-x-2">
									<Button
										variant="outline"
										onClick={() => setIsAddDialogOpen(false)}>
										Cancel
									</Button>
									<Button onClick={handleAddProduct}>Add Product</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</div>

				{/* Filters */}
				<Card>
					<CardHeader>
						<CardTitle>Filters</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col sm:flex-row gap-4">
							<div className="flex-1">
								<Label htmlFor="search">Search Products</Label>
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
										<SelectItem value="all">All Categories</SelectItem>
										{categories.length === 0 ? (
											<div className="px-2 py-1.5 text-sm text-muted-foreground">
												No categories available
											</div>
										) : (
											categories
												.filter(
													(category) => category.id && category.id.trim() !== ""
												)
												.map((category) => (
													<SelectItem key={category.id} value={category.id}>
														{category.name}
													</SelectItem>
												))
										)}
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Products Table */}
				<Card>
					<CardHeader>
						<CardTitle>Products ({filteredProducts.length})</CardTitle>
						<CardDescription>All products in your inventory</CardDescription>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="flex items-center justify-center py-8">
								<div className="text-gray-500">Loading products...</div>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Product</TableHead>
										<TableHead>Category</TableHead>
										<TableHead>SKU</TableHead>
										<TableHead>Price</TableHead>
										<TableHead>Stock</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredProducts.map((product) => (
										<TableRow key={product.id}>
											<TableCell>
												<div className="flex items-center space-x-3">
													<div className="p-2 bg-blue-100 rounded-lg">
														<Package className="h-4 w-4 text-blue-600" />
													</div>
													<div>
														<div className="font-medium text-gray-900">
															{product.name}
														</div>
														{product.description && (
															<div className="text-sm text-gray-500 max-w-xs truncate">
																{product.description}
															</div>
														)}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<Badge variant="outline">
													{product.products_categories?.name || "Unknown"}
												</Badge>
											</TableCell>
											<TableCell className="font-mono text-sm">
												{product.sku || "-"}
											</TableCell>
											<TableCell>${product.price.toFixed(2)}</TableCell>
											<TableCell>
												<div className="flex items-center space-x-2">
													<span
														className={
															product.stock < 10
																? "text-red-600 font-medium"
																: ""
														}>
														{product.stock}
													</span>
													{product.stock < 10 && (
														<Badge variant="destructive" className="text-xs">
															Low Stock
														</Badge>
													)}
												</div>
											</TableCell>
											<TableCell>
												<Badge
													variant={product.is_active ? "default" : "secondary"}>
													{product.is_active ? "Active" : "Inactive"}
												</Badge>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end space-x-2">
													<Button
														variant="outline"
														size="icon"
														onClick={handleEditProduct}>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														variant="outline"
														size="icon"
														onClick={() => handleDeleteProduct(product.id)}>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			</div>
		</MainLayout>
	);
}
