"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
	const searchParams = useSearchParams();
	const [paymentStatus, setPaymentStatus] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const orderId = searchParams.get("order_id");
	const transactionStatus = searchParams.get("transaction_status");

	useEffect(() => {
		if (orderId) {
			checkPaymentStatus();
		} else {
			setLoading(false);
		}
	}, [orderId]);

	const checkPaymentStatus = async () => {
		try {
			const response = await fetch(
				`/api/payments/midtrans/status?order_id=${orderId}`
			);
			const data = await response.json();

			if (data.success) {
				setPaymentStatus(data.transaction);
			} else {
				setError("Failed to verify payment status");
			}
		} catch (err) {
			setError("Error checking payment status");
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="flex items-center space-x-2">
					<Loader2 className="h-6 w-6 animate-spin" />
					<span>Verifying payment...</span>
				</div>
			</div>
		);
	}

	const isSuccess =
		transactionStatus === "settlement" || transactionStatus === "capture";
	const isPending = transactionStatus === "pending";

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4">
						{isSuccess ? (
							<CheckCircle className="h-16 w-16 text-green-500" />
						) : isPending ? (
							<Loader2 className="h-16 w-16 text-yellow-500 animate-spin" />
						) : (
							<div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
								<span className="text-red-500 text-2xl">✕</span>
							</div>
						)}
					</div>
					<CardTitle className="text-2xl">
						{isSuccess
							? "Payment Successful!"
							: isPending
							? "Payment Pending"
							: "Payment Failed"}
					</CardTitle>
					<CardDescription>
						{isSuccess
							? "Your payment has been processed successfully."
							: isPending
							? "Your payment is being processed. Please wait for confirmation."
							: "There was an issue processing your payment."}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{paymentStatus && (
						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-gray-600">Order ID:</span>
								<span className="font-mono">{paymentStatus.order_id}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Amount:</span>
								<span>
									Rp{" "}
									{parseInt(paymentStatus.gross_amount).toLocaleString("id-ID")}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Status:</span>
								<span
									className={`font-medium ${
										isSuccess
											? "text-green-600"
											: isPending
											? "text-yellow-600"
											: "text-red-600"
									}`}>
									{paymentStatus.transaction_status}
								</span>
							</div>
							{paymentStatus.payment_type && (
								<div className="flex justify-between">
									<span className="text-gray-600">Payment Method:</span>
									<span>{paymentStatus.payment_type}</span>
								</div>
							)}
						</div>
					)}

					{error && (
						<div className="p-3 bg-red-50 border border-red-200 rounded-md">
							<p className="text-red-600 text-sm">{error}</p>
						</div>
					)}

					<div className="space-y-2">
						<Button asChild className="w-full">
							<Link href="/admin/dashboard">Go to Dashboard</Link>
						</Button>
						<Button variant="outline" asChild className="w-full">
							<Link href="/admin/settings">View Subscription</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
