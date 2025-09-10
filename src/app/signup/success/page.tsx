"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
	PawPrint,
	Mail,
	CheckCircle,
	ArrowLeft,
	RefreshCw,
	Clock,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function SignUpSuccessPage() {
	const [isResending, setIsResending] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const email = searchParams.get("email");
	const { resendVerification } = useAuth();

	const handleResendEmail = async () => {
		if (!email) {
			toast.error("Email not found");
			return;
		}

		setIsResending(true);
		try {
			const result = await resendVerification(email);
			if (result.success) {
				toast.success("Verification email sent again!");
			} else {
				toast.error(
					result.error || "Failed to resend email. Please try again."
				);
			}
		} catch (error) {
			toast.error("Failed to resend email. Please try again.");
		} finally {
			setIsResending(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="flex justify-center mb-4">
						<div className="p-3 bg-green-100 rounded-full">
							<CheckCircle className="h-8 w-8 text-green-600" />
						</div>
					</div>
					<CardTitle className="text-2xl font-bold text-gray-900">
						Account Created Successfully!
					</CardTitle>
					<CardDescription>
						Your account has been created and verification email sent
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Email Info */}
					<div className="text-center space-y-2">
						<div className="flex items-center justify-center space-x-2 text-gray-600">
							<Mail className="h-4 w-4" />
							<span className="text-sm">Email sent to:</span>
						</div>
						<p className="font-medium text-gray-900">
							{email || "your email address"}
						</p>
					</div>

					{/* Instructions */}
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
						<div className="flex items-start space-x-3">
							<Clock className="h-5 w-5 text-blue-600 mt-0.5" />
							<div className="space-y-2">
								<h3 className="font-medium text-blue-900">Next Steps:</h3>
								<ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
									<li>Check your email inbox (and spam folder)</li>
									<li>Click the verification link in the email</li>
									<li>Complete your store setup</li>
									<li>Start managing your pet shop!</li>
								</ol>
							</div>
						</div>
					</div>

					{/* Important Note */}
					<div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
						<div className="flex items-start space-x-3">
							<PawPrint className="h-5 w-5 text-amber-600 mt-0.5" />
							<div>
								<h4 className="font-medium text-amber-900 mb-1">Important:</h4>
								<p className="text-sm text-amber-800">
									You must verify your email before you can log in and access
									your account.
								</p>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="space-y-3">
						{email && (
							<Button
								onClick={handleResendEmail}
								disabled={isResending}
								variant="outline"
								className="w-full">
								{isResending ? (
									<>
										<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
										Resending...
									</>
								) : (
									<>
										<Mail className="h-4 w-4 mr-2" />
										Resend Verification Email
									</>
								)}
							</Button>
						)}

						<Link href="/login">
							<Button className="w-full">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to Login
							</Button>
						</Link>
					</div>

					{/* Help Text */}
					<div className="text-center text-xs text-gray-500 space-y-1">
						<p>Didn&apos;t receive the email?</p>
						<p>Check your spam folder or contact support if you need help.</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
