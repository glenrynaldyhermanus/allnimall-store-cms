"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import { Store } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface StoreData {
	name: string;
	description: string;
	address: string;
	city: string;
	state: string;
	postalCode: string;
	country: string;
}

export default function SetupStorePage() {
	const [storeData, setStoreData] = useState<StoreData>({
		name: "",
		description: "",
		address: "",
		city: "",
		state: "",
		postalCode: "",
		country: "Indonesia",
	});
	const [merchantName, setMerchantName] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	useEffect(() => {
		// Check if user is authenticated and get merchant info
		const checkAuth = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				router.push("/login");
				return;
			}

			// Get merchant name
			const { data: merchant } = await supabase
				.from("merchants")
				.select("name")
				.eq("owner_id", user.id)
				.single();

			if (merchant) {
				setMerchantName(merchant.name);
			}
		};
		checkAuth();
	}, [router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				toast.error("Please log in first");
				router.push("/login");
				return;
			}

			// Get existing merchant record (should be created during signup)
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const { data: merchant, error: merchantError } = await (supabase as any)
				.from("merchants")
				.select("id")
				.eq("owner_id", user.id)
				.single();

			if (merchantError || !merchant) {
				toast.error("Merchant record not found. Please try signing up again.");
				router.push("/signup");
				return;
			}

			// Merchant already exists from signup - no need to update

			// Create store with proper schema
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const { data: store, error: storeError } = await (supabase as any)
				.from("stores")
				.insert({
					merchant_id: merchant.id,
					name: storeData.name,
					business_description: storeData.description,
					address: storeData.address,
					email: user.email, // Use user's email
					business_field: "pet_shop",
					is_active: true,
				})
				.select()
				.single();

			if (storeError) {
				toast.error(storeError.message);
				return;
			}

			// Create role assignment for the user
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const { error: roleError } = await (supabase as any)
				.from("role_assignments")
				.insert({
					user_id: user.id,
					merchant_id: merchant.id,
					role_id: "c3d4e5f6-f7a8-9012-cdef-345678901234", // Owner role
					store_id: store.id,
					is_active: true,
				});

			if (roleError) {
				console.error("Error creating role assignment:", roleError);
				// Continue anyway as store is already created
			}

			toast.success("Store created successfully! Welcome to Allnimall!");
			router.push("/admin/dashboard");
		} catch (error) {
			console.error("Setup store error:", error);
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
			<div className="max-w-2xl mx-auto pt-8">
				<div className="text-center mb-8">
					<div className="flex justify-center mb-4">
						<div className="p-3 bg-purple-100 rounded-full">
							<Store className="h-8 w-8 text-purple-600" />
						</div>
					</div>
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						Setup Your Pet Shop
					</h1>
					<p className="text-gray-600">
						Let&apos;s get your pet shop up and running!
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Store Information</CardTitle>
						<CardDescription>
							Tell us about your pet shop business
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Business Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-medium text-gray-900">
									Business Information
								</h3>
								<div className="space-y-2">
									<Label>Business Name</Label>
									<Input
										value={merchantName}
										disabled
										className="bg-gray-50 text-gray-600"
									/>
									<p className="text-sm text-gray-500">
										This is your business name from registration
									</p>
								</div>
								<div className="space-y-2">
									<Label htmlFor="name">Store Name (Branch) *</Label>
									<Input
										id="name"
										placeholder="e.g., Allnimall Pet Shop - Jakarta Branch"
										value={storeData.name}
										onChange={(e) =>
											setStoreData({ ...storeData, name: e.target.value })
										}
										required
									/>
									<p className="text-sm text-gray-500">
										This is your store/branch name. You can have multiple stores
										under one business.
									</p>
								</div>
								<div className="space-y-2">
									<Label htmlFor="description">Description</Label>
									<Textarea
										id="description"
										placeholder="Tell us about your pet shop..."
										value={storeData.description}
										onChange={(e) =>
											setStoreData({
												...storeData,
												description: e.target.value,
											})
										}
										rows={3}
									/>
								</div>
							</div>

							{/* Address Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-medium text-gray-900">
									Address Information
								</h3>
								<div className="space-y-2">
									<Label htmlFor="address">Address *</Label>
									<Input
										id="address"
										placeholder="Street address"
										value={storeData.address}
										onChange={(e) =>
											setStoreData({ ...storeData, address: e.target.value })
										}
										required
									/>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="space-y-2">
										<Label htmlFor="city">City *</Label>
										<Input
											id="city"
											placeholder="Jakarta"
											value={storeData.city}
											onChange={(e) =>
												setStoreData({ ...storeData, city: e.target.value })
											}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="state">State/Province *</Label>
										<Input
											id="state"
											placeholder="DKI Jakarta"
											value={storeData.state}
											onChange={(e) =>
												setStoreData({ ...storeData, state: e.target.value })
											}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="postalCode">Postal Code *</Label>
										<Input
											id="postalCode"
											placeholder="12345"
											value={storeData.postalCode}
											onChange={(e) =>
												setStoreData({
													...storeData,
													postalCode: e.target.value,
												})
											}
											required
										/>
									</div>
								</div>
							</div>

							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? "Creating Store..." : "Create Store & Continue"}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
