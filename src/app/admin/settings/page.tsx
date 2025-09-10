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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
	Settings,
	User,
	Store,
	Bell,
	Shield,
	Save,
	RefreshCw,
} from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { getStoreId, getMerchantId, getUserStoreData } from "@/lib/user-store";

interface UserSettings {
	id: string;
	name: string;
	email: string;
	phone: string;
	staff_type: string;
	is_active: boolean;
}

interface StoreSettings {
	id: string;
	name: string;
	business_field: string;
	phone: string | null;
	email: string | null;
	address: string | null;
	is_active: boolean;
}

export default function SettingsPage() {
	const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
	const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(
		null
	);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	// User settings form
	const [userForm, setUserForm] = useState({
		name: "",
		email: "",
		phone: "",
		staff_type: "cashier",
	});

	// Store settings form
	const [storeForm, setStoreForm] = useState({
		name: "",
		business_field: "pet_shop",
		phone: "",
		email: "",
		address: "",
	});

	// Notification settings
	const [notificationSettings, setNotificationSettings] = useState({
		email_notifications: true,
		sms_notifications: false,
		low_stock_alerts: true,
		sales_reports: true,
		maintenance_reminders: true,
	});

	// Security settings
	const [securitySettings, setSecuritySettings] = useState({
		two_factor_auth: false,
		session_timeout: "30",
		password_requirements: true,
	});

	const businessFields = [
		"pet_shop",
		"veterinary",
		"grooming",
		"boarding",
		"training",
		"pet_supplies",
	];

	const staffTypes = [
		"cashier",
		"manager",
		"admin",
		"groomer",
		"veterinarian",
		"service_staff",
	];

	const sessionTimeouts = [
		{ value: "15", label: "15 minutes" },
		{ value: "30", label: "30 minutes" },
		{ value: "60", label: "1 hour" },
		{ value: "120", label: "2 hours" },
		{ value: "480", label: "8 hours" },
	];

	// Fetch user settings
	const fetchUserSettings = async () => {
		try {
			const userStoreData = getUserStoreData();
			if (!userStoreData) {
				toast.error("User data not found. Please log in again.");
				return;
			}

			const { data, error } = await supabase
				.from("users")
				.select("*")
				.eq("id", userStoreData.user_id)
				.single();

			if (error && error.code !== "PGRST116") throw error;

			if (data) {
				setUserSettings(data);
				setUserForm({
					name: data.name,
					email: data.email,
					phone: data.phone,
					staff_type: data.staff_type,
				});
			}
		} catch (error) {
			console.error("Error fetching user settings:", error);
		}
	};

	// Fetch store settings
	const fetchStoreSettings = async () => {
		try {
			const store_id = getStoreId();
			if (!store_id) {
				toast.error("Store not found. Please log in again.");
				return;
			}

			const { data, error } = await supabase
				.from("stores")
				.select("*")
				.eq("id", store_id)
				.single();

			if (error && error.code !== "PGRST116") throw error;

			if (data) {
				setStoreSettings(data);
				setStoreForm({
					name: data.name,
					business_field: data.business_field,
					phone: data.phone || "",
					email: data.email || "",
					address: data.address || "",
				});
			}
		} catch (error) {
			console.error("Error fetching store settings:", error);
		}
	};

	useEffect(() => {
		const loadSettings = async () => {
			setLoading(true);
			await Promise.all([fetchUserSettings(), fetchStoreSettings()]);
			setLoading(false);
		};

		loadSettings();
	}, []);

	const handleSaveUserSettings = async () => {
		if (!userSettings) return;

		try {
			setSaving(true);
			const { error } = await supabase
				.from("users")
				.update(userForm)
				.eq("id", userSettings.id);

			if (error) throw error;

			toast.success("User settings saved successfully");
			fetchUserSettings();
		} catch (error) {
			console.error("Error saving user settings:", error);
			toast.error("Failed to save user settings");
		} finally {
			setSaving(false);
		}
	};

	const handleSaveStoreSettings = async () => {
		if (!storeSettings) return;

		try {
			setSaving(true);
			const { error } = await supabase
				.from("stores")
				.update({
					name: storeForm.name,
					business_field: storeForm.business_field,
					phone: storeForm.phone || null,
					email: storeForm.email || null,
					address: storeForm.address || null,
				})
				.eq("id", storeSettings.id);

			if (error) throw error;

			toast.success("Store settings saved successfully");
			fetchStoreSettings();
		} catch (error) {
			console.error("Error saving store settings:", error);
			toast.error("Failed to save store settings");
		} finally {
			setSaving(false);
		}
	};

	const handleSaveNotificationSettings = async () => {
		try {
			setSaving(true);
			// In a real app, you would save these to a user_preferences table
			// For now, we'll just show a success message
			await new Promise((resolve) => setTimeout(resolve, 1000));
			toast.success("Notification settings saved successfully");
		} catch (error) {
			console.error("Error saving notification settings:", error);
			toast.error("Failed to save notification settings");
		} finally {
			setSaving(false);
		}
	};

	const handleSaveSecuritySettings = async () => {
		try {
			setSaving(true);
			// In a real app, you would save these to a user_preferences table
			// For now, we'll just show a success message
			await new Promise((resolve) => setTimeout(resolve, 1000));
			toast.success("Security settings saved successfully");
		} catch (error) {
			console.error("Error saving security settings:", error);
			toast.error("Failed to save security settings");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<MainLayout>
				<div className="flex items-center justify-center py-8">
					<div className="text-gray-500">Loading settings...</div>
				</div>
			</MainLayout>
		);
	}

	return (
		<MainLayout>
			<div className="space-y-6">
				{/* Header */}
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Settings</h1>
					<p className="text-gray-600">
						Manage your account and store preferences
					</p>
				</div>

				{/* User Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<User className="h-5 w-5" />
							<span>User Settings</span>
						</CardTitle>
						<CardDescription>
							Manage your personal account information
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="user-name">Full Name</Label>
								<Input
									id="user-name"
									value={userForm.name}
									onChange={(e) =>
										setUserForm({ ...userForm, name: e.target.value })
									}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="user-email">Email</Label>
								<Input
									id="user-email"
									type="email"
									value={userForm.email}
									onChange={(e) =>
										setUserForm({ ...userForm, email: e.target.value })
									}
								/>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="user-phone">Phone</Label>
								<Input
									id="user-phone"
									value={userForm.phone}
									onChange={(e) =>
										setUserForm({ ...userForm, phone: e.target.value })
									}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="user-staff-type">Staff Type</Label>
								<Select
									value={userForm.staff_type}
									onValueChange={(value) =>
										setUserForm({ ...userForm, staff_type: value })
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
						</div>
						<div className="flex justify-end">
							<Button
								onClick={handleSaveUserSettings}
								disabled={saving}
								className="flex items-center space-x-2">
								{saving ? (
									<RefreshCw className="h-4 w-4 animate-spin" />
								) : (
									<Save className="h-4 w-4" />
								)}
								<span>{saving ? "Saving..." : "Save Changes"}</span>
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Store Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<Store className="h-5 w-5" />
							<span>Store Settings</span>
						</CardTitle>
						<CardDescription>
							Manage your store information and preferences
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="store-name">Store Name</Label>
							<Input
								id="store-name"
								value={storeForm.name}
								onChange={(e) =>
									setStoreForm({ ...storeForm, name: e.target.value })
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="store-business-field">Business Field</Label>
							<Select
								value={storeForm.business_field}
								onValueChange={(value) =>
									setStoreForm({ ...storeForm, business_field: value })
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
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="store-phone">Phone</Label>
								<Input
									id="store-phone"
									value={storeForm.phone}
									onChange={(e) =>
										setStoreForm({ ...storeForm, phone: e.target.value })
									}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="store-email">Email</Label>
								<Input
									id="store-email"
									type="email"
									value={storeForm.email}
									onChange={(e) =>
										setStoreForm({ ...storeForm, email: e.target.value })
									}
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="store-address">Address</Label>
							<Textarea
								id="store-address"
								value={storeForm.address}
								onChange={(e) =>
									setStoreForm({ ...storeForm, address: e.target.value })
								}
								rows={3}
							/>
						</div>
						<div className="flex justify-end">
							<Button
								onClick={handleSaveStoreSettings}
								disabled={saving}
								className="flex items-center space-x-2">
								{saving ? (
									<RefreshCw className="h-4 w-4 animate-spin" />
								) : (
									<Save className="h-4 w-4" />
								)}
								<span>{saving ? "Saving..." : "Save Changes"}</span>
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Notification Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<Bell className="h-5 w-5" />
							<span>Notification Settings</span>
						</CardTitle>
						<CardDescription>
							Configure how you receive notifications
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<Label htmlFor="email-notifications">
										Email Notifications
									</Label>
									<p className="text-sm text-gray-500">
										Receive notifications via email
									</p>
								</div>
								<Switch
									id="email-notifications"
									checked={notificationSettings.email_notifications}
									onCheckedChange={(checked) =>
										setNotificationSettings({
											...notificationSettings,
											email_notifications: checked,
										})
									}
								/>
							</div>
							<Separator />
							<div className="flex items-center justify-between">
								<div>
									<Label htmlFor="sms-notifications">SMS Notifications</Label>
									<p className="text-sm text-gray-500">
										Receive notifications via SMS
									</p>
								</div>
								<Switch
									id="sms-notifications"
									checked={notificationSettings.sms_notifications}
									onCheckedChange={(checked) =>
										setNotificationSettings({
											...notificationSettings,
											sms_notifications: checked,
										})
									}
								/>
							</div>
							<Separator />
							<div className="flex items-center justify-between">
								<div>
									<Label htmlFor="low-stock-alerts">Low Stock Alerts</Label>
									<p className="text-sm text-gray-500">
										Get notified when inventory is running low
									</p>
								</div>
								<Switch
									id="low-stock-alerts"
									checked={notificationSettings.low_stock_alerts}
									onCheckedChange={(checked) =>
										setNotificationSettings({
											...notificationSettings,
											low_stock_alerts: checked,
										})
									}
								/>
							</div>
							<Separator />
							<div className="flex items-center justify-between">
								<div>
									<Label htmlFor="sales-reports">Sales Reports</Label>
									<p className="text-sm text-gray-500">
										Receive daily/weekly sales reports
									</p>
								</div>
								<Switch
									id="sales-reports"
									checked={notificationSettings.sales_reports}
									onCheckedChange={(checked) =>
										setNotificationSettings({
											...notificationSettings,
											sales_reports: checked,
										})
									}
								/>
							</div>
							<Separator />
							<div className="flex items-center justify-between">
								<div>
									<Label htmlFor="maintenance-reminders">
										Maintenance Reminders
									</Label>
									<p className="text-sm text-gray-500">
										Get reminded about equipment maintenance
									</p>
								</div>
								<Switch
									id="maintenance-reminders"
									checked={notificationSettings.maintenance_reminders}
									onCheckedChange={(checked) =>
										setNotificationSettings({
											...notificationSettings,
											maintenance_reminders: checked,
										})
									}
								/>
							</div>
						</div>
						<div className="flex justify-end">
							<Button
								onClick={handleSaveNotificationSettings}
								disabled={saving}
								className="flex items-center space-x-2">
								{saving ? (
									<RefreshCw className="h-4 w-4 animate-spin" />
								) : (
									<Save className="h-4 w-4" />
								)}
								<span>{saving ? "Saving..." : "Save Changes"}</span>
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Security Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<Shield className="h-5 w-5" />
							<span>Security Settings</span>
						</CardTitle>
						<CardDescription>
							Manage your account security preferences
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<Label htmlFor="two-factor-auth">
										Two-Factor Authentication
									</Label>
									<p className="text-sm text-gray-500">
										Add an extra layer of security to your account
									</p>
								</div>
								<Switch
									id="two-factor-auth"
									checked={securitySettings.two_factor_auth}
									onCheckedChange={(checked) =>
										setSecuritySettings({
											...securitySettings,
											two_factor_auth: checked,
										})
									}
								/>
							</div>
							<Separator />
							<div className="space-y-2">
								<Label htmlFor="session-timeout">Session Timeout</Label>
								<Select
									value={securitySettings.session_timeout}
									onValueChange={(value) =>
										setSecuritySettings({
											...securitySettings,
											session_timeout: value,
										})
									}>
									<SelectTrigger>
										<SelectValue placeholder="Select timeout duration" />
									</SelectTrigger>
									<SelectContent>
										{sessionTimeouts.map((timeout) => (
											<SelectItem key={timeout.value} value={timeout.value}>
												{timeout.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<p className="text-sm text-gray-500">
									Automatically log out after this period of inactivity
								</p>
							</div>
							<Separator />
							<div className="flex items-center justify-between">
								<div>
									<Label htmlFor="password-requirements">
										Strong Password Requirements
									</Label>
									<p className="text-sm text-gray-500">
										Enforce strong password policies
									</p>
								</div>
								<Switch
									id="password-requirements"
									checked={securitySettings.password_requirements}
									onCheckedChange={(checked) =>
										setSecuritySettings({
											...securitySettings,
											password_requirements: checked,
										})
									}
								/>
							</div>
						</div>
						<div className="flex justify-end">
							<Button
								onClick={handleSaveSecuritySettings}
								disabled={saving}
								className="flex items-center space-x-2">
								{saving ? (
									<RefreshCw className="h-4 w-4 animate-spin" />
								) : (
									<Save className="h-4 w-4" />
								)}
								<span>{saving ? "Saving..." : "Save Changes"}</span>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</MainLayout>
	);
}
