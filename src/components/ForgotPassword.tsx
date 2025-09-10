"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import { ArrowLeft, Mail, Loader2, Lock, PawPrint } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export const ForgotPassword: React.FC = () => {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const { resetPassword } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email) {
			toast.error("Please enter your email address");
			return;
		}

		setIsLoading(true);

		try {
			const result = await resetPassword(email);

			if (result.success) {
				setIsSubmitted(true);
				toast.success("Password reset link sent to your email!");
			} else {
				toast.error(result.error || "Failed to send reset email");
			}
		} catch (error) {
			toast.error("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	if (isSubmitted) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
							<Mail className="h-6 w-6 text-green-600" />
						</div>
						<CardTitle className="mt-4 text-2xl font-bold text-gray-900">
							Check your email
						</CardTitle>
						<CardDescription className="mt-2 text-sm text-gray-600">
							We've sent a password reset link to <strong>{email}</strong>
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-sm text-gray-600 text-center">
							Click the link in the email to reset your password. The link will
							expire in 1 hour.
						</p>
						<div className="space-y-2">
							<Button
								onClick={() => setIsSubmitted(false)}
								variant="outline"
								className="w-full">
								Try different email
							</Button>
							<Button asChild variant="ghost" className="w-full">
								<Link href="/login">
									<ArrowLeft className="h-4 w-4 mr-2" />
									Back to login
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="flex justify-center mb-4">
						<div className="p-3 bg-blue-100 rounded-full">
							<Lock className="h-8 w-8 text-blue-600" />
						</div>
					</div>
					<CardTitle className="text-2xl font-bold text-gray-900">
						Forgot your password?
					</CardTitle>
					<CardDescription>
						Enter your email address and we'll send you a link to reset your
						password.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email address</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Enter your email"
								required
								disabled={isLoading}
							/>
						</div>

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Sending...
								</>
							) : (
								"Send reset link"
							)}
						</Button>

						<Button asChild variant="ghost" className="w-full">
							<Link href="/login">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to login
							</Link>
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};
