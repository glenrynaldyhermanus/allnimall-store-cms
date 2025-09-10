"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export const ResetPassword: React.FC = () => {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const { updatePassword, user } = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		// Check if user is authenticated
		if (!user) {
			toast.error("Please log in to reset your password");
			router.push("/login");
			return;
		}
	}, [user, router]);

	const validatePassword = (password: string) => {
		if (password.length < 6) {
			return "Password must be at least 6 characters long";
		}
		return null;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		const passwordError = validatePassword(password);
		if (passwordError) {
			toast.error(passwordError);
			return;
		}

		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		setIsLoading(true);

		try {
			const result = await updatePassword(password);

			if (result.success) {
				setIsSuccess(true);
				toast.success("Password updated successfully!");

				// Redirect to dashboard after 2 seconds
				setTimeout(() => {
					router.push("/admin/dashboard");
				}, 2000);
			} else {
				toast.error(result.error || "Failed to update password");
			}
		} catch (error) {
			toast.error("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	if (isSuccess) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
							<CheckCircle className="h-6 w-6 text-green-600" />
						</div>
						<CardTitle className="mt-4 text-2xl font-bold text-gray-900">
							Password updated!
						</CardTitle>
						<CardDescription className="mt-2 text-sm text-gray-600">
							Your password has been successfully updated. Redirecting to
							dashboard...
						</CardDescription>
					</CardHeader>
					<CardContent className="text-center">
						<Button asChild className="w-full">
							<Link href="/admin/dashboard">Go to Dashboard</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl font-bold text-gray-900">
						Reset your password
					</CardTitle>
					<CardDescription className="mt-2 text-sm text-gray-600">
						Enter your new password below.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<Label htmlFor="password">New password</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Enter new password"
									required
									disabled={isLoading}
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
									onClick={() => setShowPassword(!showPassword)}
									disabled={isLoading}>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</Button>
							</div>
							{password && validatePassword(password) && (
								<p className="text-sm text-red-600 mt-1">
									{validatePassword(password)}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="confirmPassword">Confirm new password</Label>
							<div className="relative">
								<Input
									id="confirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									placeholder="Confirm new password"
									required
									disabled={isLoading}
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									disabled={isLoading}>
									{showConfirmPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</Button>
							</div>
							{confirmPassword && password !== confirmPassword && (
								<p className="text-sm text-red-600 mt-1">
									Passwords do not match
								</p>
							)}
						</div>

						<Button
							type="submit"
							className="w-full"
							disabled={
								isLoading ||
								!password ||
								!confirmPassword ||
								password !== confirmPassword
							}>
							{isLoading ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Updating...
								</>
							) : (
								"Update password"
							)}
						</Button>

						<Button asChild variant="ghost" className="w-full">
							<Link href="/login">Back to login</Link>
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};
