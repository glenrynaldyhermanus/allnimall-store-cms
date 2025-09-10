"use client";

import { useSearchParams } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentErrorPage() {
	const searchParams = useSearchParams();
	const errorMessage = searchParams.get("error_message") || "Payment failed";
	const orderId = searchParams.get("order_id");

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4">
						<XCircle className="h-16 w-16 text-red-500" />
					</div>
					<CardTitle className="text-2xl text-red-600">
						Payment Failed
					</CardTitle>
					<CardDescription>
						There was an issue processing your payment. Please try again.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="p-3 bg-red-50 border border-red-200 rounded-md">
						<p className="text-red-600 text-sm">{errorMessage}</p>
					</div>

					{orderId && (
						<div className="text-sm text-gray-600">
							<p>
								Order ID: <span className="font-mono">{orderId}</span>
							</p>
						</div>
					)}

					<div className="space-y-2">
						<Button asChild className="w-full">
							<Link href="/admin/settings">Try Again</Link>
						</Button>
						<Button variant="outline" asChild className="w-full">
							<Link href="/admin/dashboard">Go to Dashboard</Link>
						</Button>
					</div>

					<div className="text-center text-sm text-gray-500">
						<p>Need help? Contact our support team.</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
