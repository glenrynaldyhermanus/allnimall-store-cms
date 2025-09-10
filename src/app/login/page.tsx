"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { toast } from "sonner";
import { Eye, EyeOff, PawPrint, UserPlus } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const message = searchParams.get("message");
		const error = searchParams.get("error");

		if (message === "confirm-email") {
			toast.success(
				"Please check your email and click the confirmation link to activate your account."
			);
		} else if (message === "check-email") {
			toast.info("Please check your email for the confirmation link.");
		} else if (error === "auth-error") {
			toast.error("Authentication error. Please try signing up again.");
		}
	}, [searchParams]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			// Supabase login
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				toast.error(error.message);
			} else if (data.user) {
				toast.success("Login successful!");
				console.log("User logged in:", data.user.id, data.user.email);

				// Get user's store and merchant info from role_assignments
				const { data: roleAssignments } = await supabase
					.from("role_assignments")
					.select(
						`
						store_id,
						merchant_id,
						stores!inner(name),
						merchants!inner(name)
					`
					)
					.eq("user_id", data.user.id)
					.eq("is_active", true)
					.single();

				if (roleAssignments) {
					// Store user data in localStorage for easy access
					localStorage.setItem("user_id", data.user.id);
					localStorage.setItem("store_id", roleAssignments.store_id);
					localStorage.setItem("merchant_id", roleAssignments.merchant_id);
					localStorage.setItem("store_name", roleAssignments.stores.name);
					localStorage.setItem("merchant_name", roleAssignments.merchants.name);

					console.log("User data stored:", {
						user_id: data.user.id,
						store_id: roleAssignments.store_id,
						merchant_id: roleAssignments.merchant_id,
						store_name: roleAssignments.stores.name,
						merchant_name: roleAssignments.merchants.name,
					});
				}

				// Let middleware handle the redirect based on role assignments
				// Just reload the page to trigger middleware
				window.location.reload();
			}
		} catch {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="flex justify-center mb-4">
						<div className="p-3 bg-blue-100 rounded-full">
							<PawPrint className="h-8 w-8 text-blue-600" />
						</div>
					</div>
					<CardTitle className="text-2xl font-bold text-gray-900">
						Allnimall Pet Shop
					</CardTitle>
					<CardDescription>
						Sign in to your account to manage your pet shop
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="Enter your password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
									onClick={() => setShowPassword(!showPassword)}>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Signing in..." : "Sign In"}
						</Button>
					</form>
					<div className="mt-6">
						<div className="text-center">
							<p className="text-sm text-gray-600 mb-2">
								Don&apos;t have an account?
							</p>
							<Link href="/signup">
								<Button variant="outline" className="w-full">
									<UserPlus className="h-4 w-4 mr-2" />
									Create Account
								</Button>
							</Link>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
