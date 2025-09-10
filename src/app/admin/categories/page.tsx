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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Edit, Trash2, Tag, Image, Package } from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { getStoreId } from "@/lib/user-store";

interface Category {
	id: string;
	name: string;
	picture_url: string | null;
	store_id: string;
	pet_category_id: string | null;
	description: string | null;
	type: string;
	created_at: string;
}

interface PetCategory {
	id: string;
	name_en: string;
	name_id: string;
	picture_url: string | null;
	icon_url: string | null;
	description: string | null;
}

export default function CategoriesPage() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [petCategories, setPetCategories] = useState<PetCategory[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [typeFilter, setTypeFilter] = useState("all");
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<Category | null>(
		null
	);
	const [loading, setLoading] = useState(true);

	// Form states
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		type: "item",
		pet_category_id: "",
		picture_url: "",
	});

	const categoryTypes = ["item", "service"];

	// Fetch categories
	const fetchCategories = async () => {
		try {
			setLoading(true);

			const store_id = getStoreId();
			if (!store_id) {
				toast.error("Store not found. Please log in again.");
				return;
			}

			const { data, error } = await supabase
				.from("products_categories")
				.select(
					`
					*,
					pet_categories (
						name_en,
						name_id
					)
				`
				)
				.eq("store_id", store_id)
				.is("deleted_at", null)
				.order("created_at", { ascending: false });

			if (error) throw error;
			setCategories(data || []);
		} catch (error) {
			console.error("Error fetching categories:", error);
			toast.error("Failed to fetch categories");
		} finally {
			setLoading(false);
		}
	};

	// Fetch pet categories
	const fetchPetCategories = async () => {
		try {
			const { data, error } = await supabase
				.from("pet_categories")
				.select("*")
				.is("deleted_at", null)
				.order("name_en");

			if (error) throw error;
			setPetCategories(data || []);
		} catch (error) {
			console.error("Error fetching pet categories:", error);
		}
	};

	useEffect(() => {
		fetchCategories();
		fetchPetCategories();
	}, []);

	const filteredCategories = categories.filter((category) => {
		const matchesSearch =
			category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(category.description &&
				category.description.toLowerCase().includes(searchTerm.toLowerCase()));
		const matchesType = typeFilter === "all" || category.type === typeFilter;

		return matchesSearch && matchesType;
	});

	const handleAddCategory = async () => {
		try {
			const store_id = getStoreId();
			if (!store_id) {
				toast.error("Store not found. Please log in again.");
				return;
			}

			const { error } = await supabase.from("products_categories").insert([
				{
					...formData,
					store_id: store_id,
					pet_category_id: formData.pet_category_id || null,
				},
			]);

			if (error) throw error;

			toast.success("Category added successfully");
			setIsAddDialogOpen(false);
			resetForm();
			fetchCategories();
		} catch (error) {
			console.error("Error adding category:", error);
			toast.error("Failed to add category");
		}
	};

	const handleEditCategory = async () => {
		if (!selectedCategory) return;

		try {
			const { error } = await supabase
				.from("products_categories")
				.update({
					name: formData.name,
					description: formData.description,
					type: formData.type,
					pet_category_id: formData.pet_category_id || null,
					picture_url: formData.picture_url || null,
				})
				.eq("id", selectedCategory.id);

			if (error) throw error;

			toast.success("Category updated successfully");
			setIsEditDialogOpen(false);
			setSelectedCategory(null);
			resetForm();
			fetchCategories();
		} catch (error) {
			console.error("Error updating category:", error);
			toast.error("Failed to update category");
		}
	};

	const handleDeleteCategory = async (id: string) => {
		try {
			const { error } = await supabase
				.from("products_categories")
				.update({ deleted_at: new Date().toISOString() })
				.eq("id", id);

			if (error) throw error;

			toast.success("Category deleted successfully");
			fetchCategories();
		} catch (error) {
			console.error("Error deleting category:", error);
			toast.error("Failed to delete category");
		}
	};

	const resetForm = () => {
		setFormData({
			name: "",
			description: "",
			type: "item",
			pet_category_id: "",
			picture_url: "",
		});
	};

	const openEditDialog = (category: Category) => {
		setSelectedCategory(category);
		setFormData({
			name: category.name,
			description: category.description || "",
			type: category.type,
			pet_category_id: category.pet_category_id || "",
			picture_url: category.picture_url || "",
		});
		setIsEditDialogOpen(true);
	};

	const getTypeBadge = (type: string) => {
		const colors = {
			item: "bg-blue-100 text-blue-800",
			service: "bg-green-100 text-green-800",
		};
		return (
			<Badge
				className={
					colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
				}>
				{type.toUpperCase()}
			</Badge>
		);
	};

	return (
		<MainLayout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Categories</h1>
						<p className="text-gray-600">
							Manage product and service categories
						</p>
					</div>
					<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
						<DialogTrigger asChild>
							<Button onClick={resetForm}>
								<Plus className="h-4 w-4 mr-2" />
								Add Category
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Add New Category</DialogTitle>
								<DialogDescription>
									Add a new category for products or services
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="name">Category Name</Label>
									<Input
										id="name"
										placeholder="Enter category name"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="type">Category Type</Label>
									<Select
										value={formData.type}
										onValueChange={(value) =>
											setFormData({ ...formData, type: value })
										}>
										<SelectTrigger>
											<SelectValue placeholder="Select type" />
										</SelectTrigger>
										<SelectContent>
											{categoryTypes.map((type) => (
												<SelectItem key={type} value={type}>
													{type.toUpperCase()}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="pet_category">Pet Category (Optional)</Label>
									<Select
										value={formData.pet_category_id}
										onValueChange={(value) =>
											setFormData({ ...formData, pet_category_id: value })
										}>
										<SelectTrigger>
											<SelectValue placeholder="Select pet category" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="">None</SelectItem>
											{petCategories.map((petCategory) => (
												<SelectItem key={petCategory.id} value={petCategory.id}>
													{petCategory.name_en}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="description">Description</Label>
									<Textarea
										id="description"
										placeholder="Enter category description..."
										value={formData.description}
										onChange={(e) =>
											setFormData({ ...formData, description: e.target.value })
										}
										rows={3}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="picture_url">Image URL (Optional)</Label>
									<Input
										id="picture_url"
										placeholder="Enter image URL"
										value={formData.picture_url}
										onChange={(e) =>
											setFormData({ ...formData, picture_url: e.target.value })
										}
									/>
								</div>
								<div className="flex justify-end space-x-2">
									<Button
										variant="outline"
										onClick={() => setIsAddDialogOpen(false)}>
										Cancel
									</Button>
									<Button onClick={handleAddCategory}>Add Category</Button>
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
								<Label htmlFor="search">Search Categories</Label>
								<div className="relative">
									<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
									<Input
										id="search"
										placeholder="Search by name or description..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-10"
									/>
								</div>
							</div>
							<div className="sm:w-48">
								<Label htmlFor="type">Type</Label>
								<Select value={typeFilter} onValueChange={setTypeFilter}>
									<SelectTrigger>
										<SelectValue placeholder="All Types" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Types</SelectItem>
										{categoryTypes.map((type) => (
											<SelectItem key={type} value={type}>
												{type.toUpperCase()}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Categories Table */}
				<Card>
					<CardHeader>
						<CardTitle>Categories ({filteredCategories.length})</CardTitle>
						<CardDescription>
							All product and service categories
						</CardDescription>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="flex items-center justify-center py-8">
								<div className="text-gray-500">Loading categories...</div>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Category</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Pet Category</TableHead>
										<TableHead>Description</TableHead>
										<TableHead>Created</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredCategories.map((category) => (
										<TableRow key={category.id}>
											<TableCell>
												<div className="flex items-center space-x-3">
													<div className="p-2 bg-blue-100 rounded-lg">
														{category.picture_url ? (
															<Image className="h-4 w-4 text-blue-600" />
														) : (
															<Tag className="h-4 w-4 text-blue-600" />
														)}
													</div>
													<div>
														<div className="font-medium text-gray-900">
															{category.name}
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell>{getTypeBadge(category.type)}</TableCell>
											<TableCell>
												{category.pet_category_id ? (
													<Badge variant="outline">
														{petCategories.find(
															(pc) => pc.id === category.pet_category_id
														)?.name_en || "Unknown"}
													</Badge>
												) : (
													<span className="text-gray-400">-</span>
												)}
											</TableCell>
											<TableCell>
												<div className="max-w-xs truncate">
													{category.description || "-"}
												</div>
											</TableCell>
											<TableCell>
												{new Date(category.created_at).toLocaleDateString()}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end space-x-2">
													<Button
														variant="outline"
														size="icon"
														onClick={() => openEditDialog(category)}>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														variant="outline"
														size="icon"
														onClick={() => handleDeleteCategory(category.id)}>
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

				{/* Edit Category Dialog */}
				<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Edit Category</DialogTitle>
							<DialogDescription>Update category information</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="edit-name">Category Name</Label>
								<Input
									id="edit-name"
									placeholder="Enter category name"
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="edit-type">Category Type</Label>
								<Select
									value={formData.type}
									onValueChange={(value) =>
										setFormData({ ...formData, type: value })
									}>
									<SelectTrigger>
										<SelectValue placeholder="Select type" />
									</SelectTrigger>
									<SelectContent>
										{categoryTypes.map((type) => (
											<SelectItem key={type} value={type}>
												{type.toUpperCase()}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="edit-pet_category">
									Pet Category (Optional)
								</Label>
								<Select
									value={formData.pet_category_id}
									onValueChange={(value) =>
										setFormData({ ...formData, pet_category_id: value })
									}>
									<SelectTrigger>
										<SelectValue placeholder="Select pet category" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="">None</SelectItem>
										{petCategories.map((petCategory) => (
											<SelectItem key={petCategory.id} value={petCategory.id}>
												{petCategory.name_en}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="edit-description">Description</Label>
								<Textarea
									id="edit-description"
									placeholder="Enter category description..."
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									rows={3}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="edit-picture_url">Image URL (Optional)</Label>
								<Input
									id="edit-picture_url"
									placeholder="Enter image URL"
									value={formData.picture_url}
									onChange={(e) =>
										setFormData({ ...formData, picture_url: e.target.value })
									}
								/>
							</div>
							<div className="flex justify-end space-x-2">
								<Button
									variant="outline"
									onClick={() => setIsEditDialogOpen(false)}>
									Cancel
								</Button>
								<Button onClick={handleEditCategory}>Update Category</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</MainLayout>
	);
}
