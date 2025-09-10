"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { PawPrint, ArrowLeft, Mail, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignUpPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [fullName, setFullName] = useState("");
	const [businessName, setBusinessName] = useState("");
	const [phone, setPhone] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		// Validate password strength
		if (password.length < 6) {
			toast.error("Password must be at least 6 characters");
			setIsLoading(false);
			return;
		}

		try {
			// Sign up with email and password
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						full_name: fullName,
						business_name: businessName,
					},
				},
			});

			if (error) {
				// Handle specific error cases
				if (
					error.message.includes("already registered") ||
					error.message.includes("User already registered")
				) {
					toast.error(
						"This email is already registered. Please try logging in instead."
					);
					router.push("/login");
				} else {
					toast.error(error.message);
				}
			} else if (data.user) {
				// Create merchant record immediately after successful signup
				const { error: merchantError } = await supabase
					.from("merchants")
					.insert({
						name: businessName,
						business_type: "pet_shop",
						email: email,
						phone: `+62${phone}`, // Add phone number from form
						owner_id: data.user.id,
						is_active: true,
					});

				if (merchantError) {
					console.error("Error creating merchant:", merchantError);
					// Continue anyway, merchant can be created later
				}

				// Create user profile
				const { error: userError } = await supabase.from("users").insert({
					id: data.user.id,
					email: email,
					name: fullName,
					phone: `+62${phone}`, // Add +62 prefix
					is_active: true,
					staff_type: "owner",
					auth_id: data.user.id,
				});

				if (userError) {
					console.error("Error creating user profile:", userError);
					// Continue anyway, user profile can be created later
				}

				// Redirect to success page with email
				router.push(`/signup/success?email=${encodeURIComponent(email)}`);
			}
		} catch (error) {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="flex justify-center mb-4">
						<div className="p-3 bg-purple-100 rounded-full">
							<PawPrint className="h-8 w-8 text-purple-600" />
						</div>
					</div>
					<CardTitle className="text-2xl font-bold text-gray-900">
						Create Account
					</CardTitle>
					<CardDescription>
						Sign up for Allnimall Pet Shop management
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="fullName">Full Name</Label>
							<Input
								id="fullName"
								type="text"
								placeholder="Enter your full name"
								value={fullName}
								onChange={(e) => setFullName(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="businessName">Business Name</Label>
							<Input
								id="businessName"
								type="text"
								placeholder="Enter your business name"
								value={businessName}
								onChange={(e) => setBusinessName(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="phone">Phone Number</Label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
									+62
								</span>
								<Input
									id="phone"
									placeholder="812 3456 7890"
									value={phone}
									onChange={(e) => {
										// Remove any non-digit characters and limit to 12 digits
										const cleaned = e.target.value
											.replace(/\D/g, "")
											.slice(0, 12);
										setPhone(cleaned);
									}}
									className="pl-12"
									required
								/>
							</div>
						</div>
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
									size="sm"
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
							{isLoading ? (
								"Creating account..."
							) : (
								<>
									<Mail className="h-4 w-4 mr-2" />
									Create Account
								</>
							)}
						</Button>
					</form>
					<div className="mt-6 space-y-4">
						<div className="text-center">
							<p className="text-sm text-gray-600 mb-2">
								Already have an account?
							</p>
							<Link href="/login">
								<Button variant="outline" className="w-full">
									<ArrowLeft className="h-4 w-4 mr-2" />
									Back to Login
								</Button>
							</Link>
						</div>
						<div className="text-center text-xs text-gray-500">
							<p>
								We&apos;ll send you an email confirmation link to verify your
								account
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
