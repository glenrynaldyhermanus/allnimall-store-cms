"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Mail, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export const EmailVerification: React.FC = () => {
	const [isResending, setIsResending] = useState(false);
	const [resendCooldown, setResendCooldown] = useState(0);
	const { user, resendVerification } = useAuth();
	const router = useRouter();

	useEffect(() => {
		// Check if user is authenticated
		if (!user) {
			toast.error("Please log in first");
			router.push("/login");
			return;
		}

		// Check if email is already verified
		if (user.email_confirmed_at) {
			toast.success("Email already verified!");
			router.push("/admin/dashboard");
			return;
		}
	}, [user, router]);

	useEffect(() => {
		// Cooldown timer
		if (resendCooldown > 0) {
			const timer = setTimeout(() => {
				setResendCooldown(resendCooldown - 1);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [resendCooldown]);

	const handleResendVerification = async () => {
		if (!user?.email) {
			toast.error("No email address found");
			return;
		}

		setIsResending(true);

		try {
			const result = await resendVerification(user.email);

			if (result.success) {
				toast.success("Verification email sent!");
				setResendCooldown(60); // 60 seconds cooldown
			} else {
				toast.error(result.error || "Failed to send verification email");
			}
		} catch (error) {
			toast.error("An unexpected error occurred");
		} finally {
			setIsResending(false);
		}
	};

	const handleCheckVerification = () => {
		// Refresh the page to check if email is verified
		window.location.reload();
	};

	if (!user) {
		return null;
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
						<Mail className="h-6 w-6 text-blue-600" />
					</div>
					<CardTitle className="mt-4 text-2xl font-bold text-gray-900">
						Verify your email
					</CardTitle>
					<CardDescription className="mt-2 text-sm text-gray-600">
						We've sent a verification link to <strong>{user.email}</strong>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="text-center">
						<p className="text-sm text-gray-600">
							Please check your email and click the verification link to
							activate your account.
						</p>
						<p className="text-xs text-gray-500 mt-2">
							Didn't receive the email? Check your spam folder.
						</p>
					</div>

					<div className="space-y-2">
						<Button
							onClick={handleCheckVerification}
							variant="outline"
							className="w-full">
							<CheckCircle className="h-4 w-4 mr-2" />
							I've verified my email
						</Button>

						<Button
							onClick={handleResendVerification}
							disabled={isResending || resendCooldown > 0}
							variant="ghost"
							className="w-full">
							{isResending ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Sending...
								</>
							) : resendCooldown > 0 ? (
								<>
									<RefreshCw className="h-4 w-4 mr-2" />
									Resend in {resendCooldown}s
								</>
							) : (
								<>
									<RefreshCw className="h-4 w-4 mr-2" />
									Resend verification email
								</>
							)}
						</Button>

						<Button asChild variant="ghost" className="w-full">
							<Link href="/login">Back to login</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
