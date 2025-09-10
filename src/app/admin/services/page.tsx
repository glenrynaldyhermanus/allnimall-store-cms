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
import {
	Plus,
	Search,
	Edit,
	Trash2,
	Wrench,
	Clock,
	DollarSign,
} from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { getStoreId } from "@/lib/user-store";

interface Service {
	id: string;
	name: string;
	category_id: string;
	price: number;
	duration_minutes: number | null;
	description: string | null;
	is_active: boolean;
	service_category: string | null;
	created_at: string;
}

interface Category {
	id: string;
	name: string;
	type: string;
}

export default function ServicesPage() {
	const [services, setServices] = useState<Service[]>([]);
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
		duration_minutes: "",
		description: "",
		service_category: "",
	});

	// Fetch services
	const fetchServices = async () => {
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
				.eq("product_type", "service")
				.is("deleted_at", null)
				.order("created_at", { ascending: false });

			if (error) throw error;
			setServices(data || []);
		} catch (error) {
			console.error("Error fetching services:", error);
			toast.error("Failed to fetch services");
		} finally {
			setLoading(false);
		}
	};

	// Fetch categories
	const fetchCategories = async () => {
		try {
			const { data, error } = await supabase
				.from("products_categories")
				.select("*")
				.eq("type", "service")
				.is("deleted_at", null)
				.order("name");

			if (error) throw error;
			setCategories(data || []);
		} catch (error) {
			console.error("Error fetching categories:", error);
		}
	};

	useEffect(() => {
		fetchServices();
		fetchCategories();
	}, []);

	const filteredServices = services.filter((service) => {
		const matchesSearch =
			service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(service.description &&
				service.description.toLowerCase().includes(searchTerm.toLowerCase()));
		const matchesCategory =
			categoryFilter === "all" || service.category_id === categoryFilter;
		return matchesSearch && matchesCategory;
	});

	const handleAddService = async () => {
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
					product_type: "service",
					price: parseFloat(formData.price),
					duration_minutes: parseInt(formData.duration_minutes),
					description: formData.description || null,
					service_category: formData.service_category || null,
				},
			]);

			if (error) throw error;

			toast.success("Service added successfully");
			setIsAddDialogOpen(false);
			resetForm();
			fetchServices();
		} catch (error) {
			console.error("Error adding service:", error);
			toast.error("Failed to add service");
		}
	};

	const handleDeleteService = async (id: string) => {
		try {
			const { error } = await supabase
				.from("products")
				.update({ deleted_at: new Date().toISOString() })
				.eq("id", id);

			if (error) throw error;

			toast.success("Service deleted successfully");
			fetchServices();
		} catch (error) {
			console.error("Error deleting service:", error);
			toast.error("Failed to delete service");
		}
	};

	const handleEditService = (id: string) => {
		toast.info("Edit service functionality coming soon");
	};

	const resetForm = () => {
		setFormData({
			name: "",
			category_id: "",
			price: "",
			duration_minutes: "",
			description: "",
			service_category: "",
		});
	};

	const formatDuration = (minutes: number | null) => {
		if (!minutes) return "-";
		if (minutes < 60) {
			return `${minutes} min`;
		} else if (minutes < 1440) {
			const hours = Math.floor(minutes / 60);
			const remainingMinutes = minutes % 60;
			return remainingMinutes > 0
				? `${hours}h ${remainingMinutes}m`
				: `${hours}h`;
		} else {
			const days = Math.floor(minutes / 1440);
			return `${days} day${days > 1 ? "s" : ""}`;
		}
	};

	return (
		<MainLayout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Services</h1>
						<p className="text-gray-600">
							Manage your pet shop services and pricing
						</p>
					</div>
					<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
						<DialogTrigger asChild>
							<Button onClick={resetForm}>
								<Plus className="h-4 w-4 mr-2" />
								Add Service
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl">
							<DialogHeader>
								<DialogTitle>Add New Service</DialogTitle>
								<DialogDescription>
									Add a new service to your pet shop offerings
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="name">Service Name</Label>
									<Input
										id="name"
										placeholder="Enter service name"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="category">Category</Label>
									<Select
										value={formData.category_id}
										onValueChange={(value) =>
											setFormData({ ...formData, category_id: value })
										}>
										<SelectTrigger>
											<SelectValue placeholder="Select category" />
										</SelectTrigger>
										<SelectContent>
											{categories.map((category) => (
												<SelectItem key={category.id} value={category.id}>
													{category.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="price">Price ($)</Label>
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
										<Label htmlFor="duration">Duration (minutes)</Label>
										<Input
											id="duration"
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
								</div>
								<div className="space-y-2">
									<Label htmlFor="description">Description</Label>
									<Textarea
										id="description"
										placeholder="Describe the service details..."
										rows={3}
										value={formData.description}
										onChange={(e) =>
											setFormData({ ...formData, description: e.target.value })
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="service_category">Service Category</Label>
									<Input
										id="service_category"
										placeholder="Enter service category"
										value={formData.service_category}
										onChange={(e) =>
											setFormData({
												...formData,
												service_category: e.target.value,
											})
										}
									/>
								</div>
								<div className="flex justify-end space-x-2">
									<Button
										variant="outline"
										onClick={() => setIsAddDialogOpen(false)}>
										Cancel
									</Button>
									<Button onClick={handleAddService}>Add Service</Button>
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
								<Label htmlFor="search">Search Services</Label>
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
								<Label htmlFor="category">Category</Label>
								<Select
									value={categoryFilter}
									onValueChange={setCategoryFilter}>
									<SelectTrigger>
										<SelectValue placeholder="All Categories" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Categories</SelectItem>
										{categories.map((category) => (
											<SelectItem key={category.id} value={category.id}>
												{category.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Services Table */}
				<Card>
					<CardHeader>
						<CardTitle>Services ({filteredServices.length})</CardTitle>
						<CardDescription>
							All services offered by your pet shop
						</CardDescription>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="flex items-center justify-center py-8">
								<div className="text-gray-500">Loading services...</div>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Service</TableHead>
										<TableHead>Category</TableHead>
										<TableHead>Price</TableHead>
										<TableHead>Duration</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredServices.map((service) => (
										<TableRow key={service.id}>
											<TableCell>
												<div className="flex items-center space-x-3">
													<div className="p-2 bg-green-100 rounded-lg">
														<Wrench className="h-4 w-4 text-green-600" />
													</div>
													<div>
														<div className="font-medium text-gray-900">
															{service.name}
														</div>
														{service.description && (
															<div className="text-sm text-gray-500 max-w-xs truncate">
																{service.description}
															</div>
														)}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<Badge variant="outline">
													{(service as any).products_categories?.name ||
														"Unknown"}
												</Badge>
											</TableCell>
											<TableCell>
												<div className="flex items-center space-x-1">
													<DollarSign className="h-4 w-4 text-gray-400" />
													<span className="font-medium">
														${service.price.toFixed(2)}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center space-x-1">
													<Clock className="h-4 w-4 text-gray-400" />
													<span>
														{formatDuration(service.duration_minutes)}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<Badge
													variant={service.is_active ? "default" : "secondary"}>
													{service.is_active ? "Active" : "Inactive"}
												</Badge>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end space-x-2">
													<Button
														variant="outline"
														size="icon"
														onClick={() => handleEditService(service.id)}>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														variant="outline"
														size="icon"
														onClick={() => handleDeleteService(service.id)}>
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
