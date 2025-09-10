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
	Store,
	Phone,
	Mail,
	Building,
} from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { getStoreId, getMerchantId } from "@/lib/user-store";
// @ts-ignore

interface Store {
	id: string;
	merchant_id: string;
	name: string;
	address: string | null;
	city_id: string | null;
	province_id: string | null;
	country_id: string | null;
	phone: string | null;
	email: string | null;
	is_active: boolean;
	business_field: string;
	business_description: string | null;
	phone_number: string | null;
	phone_country_code: string | null;
	created_at: string;
}

interface Merchant {
	id: string;
	name: string;
	business_type: string;
	phone: string | null;
	email: string | null;
	address: string | null;
	is_active: boolean;
}

export default function StoresPage() {
	const [stores, setStores] = useState<Store[]>([]);
	const [merchants, setMerchants] = useState<Merchant[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [selectedStore, setSelectedStore] = useState<Store | null>(null);
	const [loading, setLoading] = useState(true);

	// Form states
	const [formData, setFormData] = useState({
		merchant_id: "",
		name: "",
		address: "",
		phone: "",
		email: "",
		business_field: "pet_shop",
		business_description: "",
		phone_number: "",
		phone_country_code: "+62",
		is_active: true,
	});

	const businessFields = [
		"pet_shop",
		"veterinary",
		"grooming",
		"boarding",
		"training",
		"pet_supplies",
	];

	const countryCodes = [
		"+62", // Indonesia
		"+1", // US/Canada
		"+44", // UK
		"+60", // Malaysia
		"+65", // Singapore
	];

	// Fetch stores
	const fetchStores = async () => {
		try {
			setLoading(true);

			const merchant_id = getMerchantId();
			if (!merchant_id) {
				toast.error("Merchant not found. Please log in again.");
				return;
			}

			const { data, error } = await supabase
				.from("stores")
				.select(
					`
					*,
					merchants (
						name,
						business_type
					)
				`
				)
				.eq("merchant_id", merchant_id)
				.is("deleted_at", null)
				.order("created_at", { ascending: false });

			if (error) throw error;
			setStores(data || []);
		} catch (error) {
			console.error("Error fetching stores:", error);
			toast.error("Failed to fetch stores");
		} finally {
			setLoading(false);
		}
	};

	// Fetch merchants
	const fetchMerchants = async () => {
		try {
			const { data, error } = await supabase
				.from("merchants")
				.select("*")
				.is("deleted_at", null)
				.eq("is_active", true)
				.order("name");

			if (error) throw error;
			setMerchants(data || []);
		} catch (error) {
			console.error("Error fetching merchants:", error);
		}
	};

	useEffect(() => {
		fetchStores();
		fetchMerchants();
	}, []);

	const filteredStores = stores.filter((store) => {
		const matchesSearch =
			store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(store.address &&
				store.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(store.phone && store.phone.includes(searchTerm));
		const matchesStatus =
			statusFilter === "all" ||
			(statusFilter === "active" && store.is_active) ||
			(statusFilter === "inactive" && !store.is_active);

		return matchesSearch && matchesStatus;
	});

	const handleAddStore = async () => {
		try {
			const merchant_id = getMerchantId();
			if (!merchant_id) {
				toast.error("Merchant not found. Please log in again.");
				return;
			}

			const { error } = await supabase.from("stores").insert([
				{
					...formData,
					merchant_id: merchant_id,
					address: formData.address || null,
					phone: formData.phone || null,
					email: formData.email || null,
					business_description: formData.business_description || null,
					phone_number: formData.phone_number || null,
					phone_country_code: formData.phone_country_code || null,
				},
			]);

			if (error) throw error;

			toast.success("Store added successfully");
			setIsAddDialogOpen(false);
			resetForm();
			fetchStores();
		} catch (error) {
			console.error("Error adding store:", error);
			toast.error("Failed to add store");
		}
	};

	const handleEditStore = async () => {
		if (!selectedStore) return;

		try {
			const { error } = await supabase
				.from("stores")
				.update({
					merchant_id: formData.merchant_id,
					name: formData.name,
					address: formData.address || null,
					phone: formData.phone || null,
					email: formData.email || null,
					business_field: formData.business_field,
					business_description: formData.business_description || null,
					phone_number: formData.phone_number || null,
					phone_country_code: formData.phone_country_code || null,
					is_active: formData.is_active,
				})
				.eq("id", selectedStore.id);

			if (error) throw error;

			toast.success("Store updated successfully");
			setIsEditDialogOpen(false);
			setSelectedStore(null);
			resetForm();
			fetchStores();
		} catch (error) {
			console.error("Error updating store:", error);
			toast.error("Failed to update store");
		}
	};

	const handleDeleteStore = async (id: string) => {
		try {
			const { error } = await supabase
				.from("stores")
				.update({ deleted_at: new Date().toISOString() })
				.eq("id", id);

			if (error) throw error;

			toast.success("Store deleted successfully");
			fetchStores();
		} catch (error) {
			console.error("Error deleting store:", error);
			toast.error("Failed to delete store");
		}
	};

	const handleToggleStatus = async (id: string, currentStatus: boolean) => {
		try {
			const { error } = await supabase
				.from("stores")
				.update({ is_active: !currentStatus })
				.eq("id", id);

			if (error) throw error;

			toast.success(`Store ${!currentStatus ? "activated" : "deactivated"}`);
			fetchStores();
		} catch (error) {
			console.error("Error updating store status:", error);
			toast.error("Failed to update store status");
		}
	};

	const resetForm = () => {
		setFormData({
			merchant_id: "",
			name: "",
			address: "",
			phone: "",
			email: "",
			business_field: "pet_shop",
			business_description: "",
			phone_number: "",
			phone_country_code: "+62",
			is_active: true,
		});
	};

	const openEditDialog = (store: Store) => {
		setSelectedStore(store);
		setFormData({
			merchant_id: store.merchant_id,
			name: store.name,
			address: store.address || "",
			phone: store.phone || "",
			email: store.email || "",
			business_field: store.business_field,
			business_description: store.business_description || "",
			phone_number: store.phone_number || "",
			phone_country_code: store.phone_country_code || "+62",
			is_active: store.is_active,
		});
		setIsEditDialogOpen(true);
	};

	const getBusinessFieldBadge = (field: string) => {
		const colors = {
			pet_shop: "bg-blue-100 text-blue-800",
			veterinary: "bg-green-100 text-green-800",
			grooming: "bg-purple-100 text-purple-800",
			boarding: "bg-orange-100 text-orange-800",
			training: "bg-pink-100 text-pink-800",
			pet_supplies: "bg-gray-100 text-gray-800",
		};
		return (
			<Badge
				className={
					colors[field as keyof typeof colors] || "bg-gray-100 text-gray-800"
				}>
				{field.replace("_", " ").toUpperCase()}
			</Badge>
		);
	};

	return (
		<MainLayout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Stores</h1>
						<p className="text-gray-600">
							Manage your pet shop stores and locations
						</p>
					</div>
					<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
						<DialogTrigger asChild>
							<Button onClick={resetForm}>
								<Plus className="h-4 w-4 mr-2" />
								Add Store
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl">
							<DialogHeader>
								<DialogTitle>Add New Store</DialogTitle>
								<DialogDescription>
									Add a new store location to your business
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="merchant_id">Merchant</Label>
									<Select
										value={formData.merchant_id}
										onValueChange={(value) =>
											setFormData({ ...formData, merchant_id: value })
										}>
										<SelectTrigger>
											<SelectValue placeholder="Select merchant" />
										</SelectTrigger>
										<SelectContent>
											{merchants.map((merchant) => (
												<SelectItem key={merchant.id} value={merchant.id}>
													{merchant.name} ({merchant.business_type})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="name">Store Name</Label>
									<Input
										id="name"
										placeholder="Enter store name"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="address">Address</Label>
									<Textarea
										id="address"
										placeholder="Enter store address..."
										value={formData.address}
										onChange={(e) =>
											setFormData({ ...formData, address: e.target.value })
										}
										rows={3}
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="phone">Phone</Label>
										<Input
											id="phone"
											placeholder="Enter phone number"
											value={formData.phone}
											onChange={(e) =>
												setFormData({ ...formData, phone: e.target.value })
											}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="email">Email</Label>
										<Input
											id="email"
											type="email"
											placeholder="Enter email"
											value={formData.email}
											onChange={(e) =>
												setFormData({ ...formData, email: e.target.value })
											}
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="business_field">Business Field</Label>
									<Select
										value={formData.business_field}
										onValueChange={(value) =>
											setFormData({ ...formData, business_field: value })
										}>
										<SelectTrigger>
											<SelectValue placeholder="Select business field" />
										</SelectTrigger>
										<SelectContent>
											{businessFields.map((field) => (
												<SelectItem key={field} value={field}>
													{field.replace("_", " ").toUpperCase()}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="business_description">
										Business Description
									</Label>
									<Textarea
										id="business_description"
										placeholder="Describe your business..."
										value={formData.business_description}
										onChange={(e) =>
											setFormData({
												...formData,
												business_description: e.target.value,
											})
										}
										rows={3}
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="phone_number">Phone Number</Label>
										<Input
											id="phone_number"
											placeholder="Enter phone number"
											value={formData.phone_number}
											onChange={(e) =>
												setFormData({
													...formData,
													phone_number: e.target.value,
												})
											}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="phone_country_code">Country Code</Label>
										<Select
											value={formData.phone_country_code}
											onValueChange={(value) =>
												setFormData({ ...formData, phone_country_code: value })
											}>
											<SelectTrigger>
												<SelectValue placeholder="Select country code" />
											</SelectTrigger>
											<SelectContent>
												{countryCodes.map((code) => (
													<SelectItem key={code} value={code}>
														{code}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>
								<div className="flex items-center space-x-2">
									<Switch
										id="is_active"
										checked={formData.is_active}
										onCheckedChange={(checked) =>
											setFormData({ ...formData, is_active: checked })
										}
									/>
									<Label htmlFor="is_active">Active Store</Label>
								</div>
								<div className="flex justify-end space-x-2">
									<Button
										variant="outline"
										onClick={() => setIsAddDialogOpen(false)}>
										Cancel
									</Button>
									<Button onClick={handleAddStore}>Add Store</Button>
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
								<Label htmlFor="search">Search Stores</Label>
								<div className="relative">
									<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
									<Input
										id="search"
										placeholder="Search by name, address, or phone..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-10"
									/>
								</div>
							</div>
							<div className="sm:w-48">
								<Label htmlFor="status">Status</Label>
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger>
										<SelectValue placeholder="All Status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Status</SelectItem>
										<SelectItem value="active">Active</SelectItem>
										<SelectItem value="inactive">Inactive</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Stores Table */}
				<Card>
					<CardHeader>
						<CardTitle>Stores ({filteredStores.length})</CardTitle>
						<CardDescription>All stores in your business</CardDescription>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="flex items-center justify-center py-8">
								<div className="text-gray-500">Loading stores...</div>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Store</TableHead>
										<TableHead>Merchant</TableHead>
										<TableHead>Business Field</TableHead>
										<TableHead>Contact</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Created</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredStores.map((store) => (
										<TableRow key={store.id}>
											<TableCell>
												<div className="flex items-center space-x-3">
													<div className="p-2 bg-blue-100 rounded-lg">
														<Store className="h-4 w-4 text-blue-600" />
													</div>
													<div>
														<div className="font-medium text-gray-900">
															{store.name}
														</div>
														{store.address && (
															<div className="text-sm text-gray-500 max-w-xs truncate">
																{store.address}
															</div>
														)}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="text-sm">
													<div className="font-medium">
														{(
															store as Store & {
																merchants?: {
																	name: string;
																	business_type: string;
																};
															}
														).merchants?.name || "Unknown"}
													</div>
													<div className="text-gray-500">
														{(
															store as Store & {
																merchants?: {
																	name: string;
																	business_type: string;
																};
															}
														).merchants?.business_type || ""}
													</div>
												</div>
											</TableCell>
											<TableCell>
												{getBusinessFieldBadge(store.business_field)}
											</TableCell>
											<TableCell>
												<div className="space-y-1">
													{store.phone && (
														<div className="flex items-center space-x-2 text-sm">
															<Phone className="h-4 w-4 text-gray-400" />
															<span>{store.phone}</span>
														</div>
													)}
													{store.email && (
														<div className="flex items-center space-x-2 text-sm">
															<Mail className="h-4 w-4 text-gray-400" />
															<span>{store.email}</span>
														</div>
													)}
												</div>
											</TableCell>
											<TableCell>
												<Badge
													variant={store.is_active ? "default" : "secondary"}>
													{store.is_active ? "Active" : "Inactive"}
												</Badge>
											</TableCell>
											<TableCell>
												{new Date(store.created_at).toLocaleDateString()}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end space-x-2">
													<Button
														variant="outline"
														size="icon"
														onClick={() =>
															handleToggleStatus(store.id, store.is_active)
														}>
														{store.is_active ? (
															<Building className="h-4 w-4" />
														) : (
															<Store className="h-4 w-4" />
														)}
													</Button>
													<Button
														variant="outline"
														size="icon"
														onClick={() => openEditDialog(store)}>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														variant="outline"
														size="icon"
														onClick={() => handleDeleteStore(store.id)}>
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

				{/* Edit Store Dialog */}
				<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Edit Store</DialogTitle>
							<DialogDescription>Update store information</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="edit-merchant_id">Merchant</Label>
								<Select
									value={formData.merchant_id}
									onValueChange={(value) =>
										setFormData({ ...formData, merchant_id: value })
									}>
									<SelectTrigger>
										<SelectValue placeholder="Select merchant" />
									</SelectTrigger>
									<SelectContent>
										{merchants.map((merchant) => (
											<SelectItem key={merchant.id} value={merchant.id}>
												{merchant.name} ({merchant.business_type})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="edit-name">Store Name</Label>
								<Input
									id="edit-name"
									placeholder="Enter store name"
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="edit-address">Address</Label>
								<Textarea
									id="edit-address"
									placeholder="Enter store address..."
									value={formData.address}
									onChange={(e) =>
										setFormData({ ...formData, address: e.target.value })
									}
									rows={3}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="edit-phone">Phone</Label>
									<Input
										id="edit-phone"
										placeholder="Enter phone number"
										value={formData.phone}
										onChange={(e) =>
											setFormData({ ...formData, phone: e.target.value })
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-email">Email</Label>
									<Input
										id="edit-email"
										type="email"
										placeholder="Enter email"
										value={formData.email}
										onChange={(e) =>
											setFormData({ ...formData, email: e.target.value })
										}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="edit-business_field">Business Field</Label>
								<Select
									value={formData.business_field}
									onValueChange={(value) =>
										setFormData({ ...formData, business_field: value })
									}>
									<SelectTrigger>
										<SelectValue placeholder="Select business field" />
									</SelectTrigger>
									<SelectContent>
										{businessFields.map((field) => (
											<SelectItem key={field} value={field}>
												{field.replace("_", " ").toUpperCase()}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="edit-business_description">
									Business Description
								</Label>
								<Textarea
									id="edit-business_description"
									placeholder="Describe your business..."
									value={formData.business_description}
									onChange={(e) =>
										setFormData({
											...formData,
											business_description: e.target.value,
										})
									}
									rows={3}
								/>
							</div>
							<div className="flex items-center space-x-2">
								<Switch
									id="edit-is_active"
									checked={formData.is_active}
									onCheckedChange={(checked) =>
										setFormData({ ...formData, is_active: checked })
									}
								/>
								<Label htmlFor="edit-is_active">Active Store</Label>
							</div>
							<div className="flex justify-end space-x-2">
								<Button
									variant="outline"
									onClick={() => setIsEditDialogOpen(false)}>
									Cancel
								</Button>
								<Button onClick={handleEditStore}>Update Store</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</MainLayout>
	);
}
