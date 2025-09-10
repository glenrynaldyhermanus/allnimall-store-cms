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
import { Eye, EyeOff, PawPrint, UserPlus, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const { signIn } = useAuth();

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

		console.log("Login attempt:", { email, password: "***" });

		try {
			const result = await signIn(email, password);
			console.log("SignIn result:", result);

			if (result.success) {
				// Get current user from auth context
				const {
					data: { user },
				} = await supabase.auth.getUser();

				if (user) {
					toast.success("Login successful!");
					console.log("User logged in:", user.id, user.email);

					// Get user's store and merchant info from role_assignments
					const { data: roleAssignments, error: roleError } = await supabase
						.from("role_assignments")
						.select(
							`
							store_id,
							merchant_id,
							role_id,
							stores!inner(name),
							merchants!inner(name),
							roles!inner(name)
						`
						)
						.eq("user_id", user.id)
						.eq("is_active", true)
						.maybeSingle();

					if (roleAssignments) {
						// User has store access - store data and redirect to dashboard
						localStorage.setItem("user_id", user.id);
						localStorage.setItem("store_id", roleAssignments.store_id);
						localStorage.setItem("merchant_id", roleAssignments.merchant_id);
						localStorage.setItem("role_id", roleAssignments.role_id);
						localStorage.setItem("store_name", roleAssignments.stores.name);
						localStorage.setItem(
							"merchant_name",
							roleAssignments.merchants.name
						);
						localStorage.setItem("role_name", roleAssignments.roles.name);

						console.log("User data stored:", {
							user_id: user.id,
							store_id: roleAssignments.store_id,
							merchant_id: roleAssignments.merchant_id,
							role_id: roleAssignments.role_id,
							store_name: roleAssignments.stores.name,
							merchant_name: roleAssignments.merchants.name,
							role_name: roleAssignments.roles.name,
						});

						// Redirect to dashboard
						router.push("/admin/dashboard");
					} else if (roleError) {
						// Database error
						console.error("Role assignment error:", roleError);
						toast.error("Database error. Please try again.");
					} else {
						// No role assignments found - new user needs to setup store
						console.log("No store access found - redirecting to setup store");
						toast.info("Welcome! Let's set up your first store.");
						router.push("/setup-store");
					}
				} else {
					toast.error(result.error || "Login failed");
				}
			} else {
				console.log("Login failed:", result.error);
				toast.error(result.error || "Login failed");
			}
		} catch (error) {
			console.log("Login error:", error);
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
					<div className="mt-6 space-y-3">
						{/* Forgot Password Button */}
						<Link href="/forgot-password" className="block">
							<Button variant="link" className="w-full text-sm">
								<Lock className="h-4 w-4 mr-2" />
								Forgot your password?
							</Button>
						</Link>

						{/* Divider */}
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-white px-2 text-gray-500">Or</span>
							</div>
						</div>

						{/* Sign Up Link */}
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
