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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Plus,
	Search,
	Edit,
	Trash2,
	Users,
	Mail,
	Phone,
	UserCheck,
	UserX,
} from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { getStoreId } from "@/lib/user-store";

interface Employee {
	id: string;
	name: string;
	phone: string;
	email: string;
	picture_url: string | null;
	is_active: boolean;
	staff_type: string;
	username: string | null;
	created_at: string;
}

export default function EmployeesPage() {
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [staffTypeFilter, setStaffTypeFilter] = useState("all");
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
		null
	);
	const [loading, setLoading] = useState(true);

	// Form states
	const [formData, setFormData] = useState({
		name: "",
		phone: "",
		email: "",
		staff_type: "cashier",
		username: "",
		is_active: true,
	});

	const staffTypes = [
		"cashier",
		"manager",
		"admin",
		"groomer",
		"veterinarian",
		"service_staff",
	];

	// Fetch employees
	const fetchEmployees = async () => {
		try {
			setLoading(true);

			const store_id = getStoreId();
			if (!store_id) {
				toast.error("Store not found. Please log in again.");
				return;
			}

			// Get employees through role_assignments
			const { data, error } = await supabase
				.from("role_assignments")
				.select(
					`
					users!inner(
						id,
						name,
						phone,
						email,
						staff_type,
						username,
						is_active,
						created_at
					)
				`
				)
				.eq("store_id", store_id)
				.eq("is_active", true)
				.is("users.deleted_at", null);

			if (error) throw error;

			// Extract users from the nested structure
			const employees = data?.map((item) => item.users).filter(Boolean) || [];
			setEmployees(employees);
		} catch (error) {
			console.error("Error fetching employees:", error);
			toast.error("Failed to fetch employees");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchEmployees();
	}, []);

	const filteredEmployees = employees.filter((employee) => {
		const matchesSearch =
			employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			employee.phone.includes(searchTerm);
		const matchesStatus =
			statusFilter === "all" ||
			(statusFilter === "active" && employee.is_active) ||
			(statusFilter === "inactive" && !employee.is_active);
		const matchesStaffType =
			staffTypeFilter === "all" || employee.staff_type === staffTypeFilter;

		return matchesSearch && matchesStatus && matchesStaffType;
	});

	const handleAddEmployee = async () => {
		try {
			const { error } = await supabase.from("users").insert([formData]);

			if (error) throw error;

			toast.success("Employee added successfully");
			setIsAddDialogOpen(false);
			resetForm();
			fetchEmployees();
		} catch (error) {
			console.error("Error adding employee:", error);
			toast.error("Failed to add employee");
		}
	};

	const handleEditEmployee = async () => {
		if (!selectedEmployee) return;

		try {
			const { error } = await supabase
				.from("users")
				.update(formData)
				.eq("id", selectedEmployee.id);

			if (error) throw error;

			toast.success("Employee updated successfully");
			setIsEditDialogOpen(false);
			setSelectedEmployee(null);
			resetForm();
			fetchEmployees();
		} catch (error) {
			console.error("Error updating employee:", error);
			toast.error("Failed to update employee");
		}
	};

	const handleDeleteEmployee = async (id: string) => {
		try {
			const { error } = await supabase
				.from("users")
				.update({ deleted_at: new Date().toISOString() })
				.eq("id", id);

			if (error) throw error;

			toast.success("Employee deleted successfully");
			fetchEmployees();
		} catch (error) {
			console.error("Error deleting employee:", error);
			toast.error("Failed to delete employee");
		}
	};

	const handleToggleStatus = async (id: string, currentStatus: boolean) => {
		try {
			const { error } = await supabase
				.from("users")
				.update({ is_active: !currentStatus })
				.eq("id", id);

			if (error) throw error;

			toast.success(`Employee ${!currentStatus ? "activated" : "deactivated"}`);
			fetchEmployees();
		} catch (error) {
			console.error("Error updating employee status:", error);
			toast.error("Failed to update employee status");
		}
	};

	const resetForm = () => {
		setFormData({
			name: "",
			phone: "",
			email: "",
			staff_type: "cashier",
			username: "",
			is_active: true,
		});
	};

	const openEditDialog = (employee: Employee) => {
		setSelectedEmployee(employee);
		setFormData({
			name: employee.name,
			phone: employee.phone,
			email: employee.email,
			staff_type: employee.staff_type,
			username: employee.username || "",
			is_active: employee.is_active,
		});
		setIsEditDialogOpen(true);
	};

	const getStaffTypeBadge = (staffType: string) => {
		const colors = {
			admin: "bg-red-100 text-red-800",
			manager: "bg-blue-100 text-blue-800",
			cashier: "bg-green-100 text-green-800",
			groomer: "bg-purple-100 text-purple-800",
			veterinarian: "bg-orange-100 text-orange-800",
			service_staff: "bg-gray-100 text-gray-800",
		};
		return (
			<Badge
				className={
					colors[staffType as keyof typeof colors] ||
					"bg-gray-100 text-gray-800"
				}>
				{staffType.replace("_", " ").toUpperCase()}
			</Badge>
		);
	};

	return (
		<MainLayout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Employees</h1>
						<p className="text-gray-600">
							Manage your pet shop staff and employees
						</p>
					</div>
					<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
						<DialogTrigger asChild>
							<Button onClick={resetForm}>
								<Plus className="h-4 w-4 mr-2" />
								Add Employee
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Add New Employee</DialogTitle>
								<DialogDescription>
									Add a new employee to your pet shop
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="name">Full Name</Label>
									<Input
										id="name"
										placeholder="Enter full name"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
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
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="staff_type">Staff Type</Label>
										<Select
											value={formData.staff_type}
											onValueChange={(value) =>
												setFormData({ ...formData, staff_type: value })
											}>
											<SelectTrigger>
												<SelectValue placeholder="Select staff type" />
											</SelectTrigger>
											<SelectContent>
												{staffTypes.map((type) => (
													<SelectItem key={type} value={type}>
														{type.replace("_", " ").toUpperCase()}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label htmlFor="username">Username</Label>
										<Input
											id="username"
											placeholder="Enter username"
											value={formData.username}
											onChange={(e) =>
												setFormData({ ...formData, username: e.target.value })
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
									<Button onClick={handleAddEmployee}>Add Employee</Button>
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
								<Label htmlFor="search">Search Employees</Label>
								<div className="relative">
									<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
									<Input
										id="search"
										placeholder="Search by name, email, or phone..."
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
							<div className="sm:w-48">
								<Label htmlFor="staff_type">Staff Type</Label>
								<Select
									value={staffTypeFilter}
									onValueChange={setStaffTypeFilter}>
									<SelectTrigger>
										<SelectValue placeholder="All Types" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Types</SelectItem>
										{staffTypes.map((type) => (
											<SelectItem key={type} value={type}>
												{type.replace("_", " ").toUpperCase()}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Employees Table */}
				<Card>
					<CardHeader>
						<CardTitle>Employees ({filteredEmployees.length})</CardTitle>
						<CardDescription>All employees in your pet shop</CardDescription>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="flex items-center justify-center py-8">
								<div className="text-gray-500">Loading employees...</div>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Employee</TableHead>
										<TableHead>Contact</TableHead>
										<TableHead>Staff Type</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Joined</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredEmployees.map((employee) => (
										<TableRow key={employee.id}>
											<TableCell>
												<div className="flex items-center space-x-3">
													<Avatar className="h-10 w-10">
														<AvatarImage src={employee.picture_url || ""} />
														<AvatarFallback>
															{employee.name
																.split(" ")
																.map((n) => n[0])
																.join("")}
														</AvatarFallback>
													</Avatar>
													<div>
														<div className="font-medium text-gray-900">
															{employee.name}
														</div>
														<div className="text-sm text-gray-500">
															@{employee.username || "no username"}
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="space-y-1">
													<div className="flex items-center space-x-2 text-sm">
														<Mail className="h-4 w-4 text-gray-400" />
														<span>{employee.email}</span>
													</div>
													<div className="flex items-center space-x-2 text-sm">
														<Phone className="h-4 w-4 text-gray-400" />
														<span>{employee.phone}</span>
													</div>
												</div>
											</TableCell>
											<TableCell>
												{getStaffTypeBadge(employee.staff_type)}
											</TableCell>
											<TableCell>
												<Badge
													variant={
														employee.is_active ? "default" : "secondary"
													}>
													{employee.is_active ? "Active" : "Inactive"}
												</Badge>
											</TableCell>
											<TableCell>
												{new Date(employee.created_at).toLocaleDateString()}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end space-x-2">
													<Button
														variant="outline"
														size="icon"
														onClick={() =>
															handleToggleStatus(
																employee.id,
																employee.is_active
															)
														}>
														{employee.is_active ? (
															<UserX className="h-4 w-4" />
														) : (
															<UserCheck className="h-4 w-4" />
														)}
													</Button>
													<Button
														variant="outline"
														size="icon"
														onClick={() => openEditDialog(employee)}>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														variant="outline"
														size="icon"
														onClick={() => handleDeleteEmployee(employee.id)}>
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

				{/* Edit Employee Dialog */}
				<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Edit Employee</DialogTitle>
							<DialogDescription>Update employee information</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="edit-name">Full Name</Label>
								<Input
									id="edit-name"
									placeholder="Enter full name"
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
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
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="edit-staff_type">Staff Type</Label>
									<Select
										value={formData.staff_type}
										onValueChange={(value) =>
											setFormData({ ...formData, staff_type: value })
										}>
										<SelectTrigger>
											<SelectValue placeholder="Select staff type" />
										</SelectTrigger>
										<SelectContent>
											{staffTypes.map((type) => (
												<SelectItem key={type} value={type}>
													{type.replace("_", " ").toUpperCase()}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-username">Username</Label>
									<Input
										id="edit-username"
										placeholder="Enter username"
										value={formData.username}
										onChange={(e) =>
											setFormData({ ...formData, username: e.target.value })
										}
									/>
								</div>
							</div>
							<div className="flex justify-end space-x-2">
								<Button
									variant="outline"
									onClick={() => setIsEditDialogOpen(false)}>
									Cancel
								</Button>
								<Button onClick={handleEditEmployee}>Update Employee</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</MainLayout>
	);
}
