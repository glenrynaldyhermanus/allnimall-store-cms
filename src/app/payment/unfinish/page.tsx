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
import { Clock } from "lucide-react";
import Link from "next/link";

export default function PaymentUnfinishPage() {
	const searchParams = useSearchParams();
	const orderId = searchParams.get("order_id");

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4">
						<Clock className="h-16 w-16 text-yellow-500" />
					</div>
					<CardTitle className="text-2xl text-yellow-600">
						Payment Unfinished
					</CardTitle>
					<CardDescription>
						Your payment process was not completed. You can continue or try
						again.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
						<p className="text-yellow-700 text-sm">
							The payment process was interrupted. Your payment may still be
							pending or you can start a new payment.
						</p>
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
							<Link href="/admin/settings">Continue Payment</Link>
						</Button>
						<Button variant="outline" asChild className="w-full">
							<Link href="/admin/dashboard">Go to Dashboard</Link>
						</Button>
					</div>

					<div className="text-center text-sm text-gray-500">
						<p>If you have any questions, please contact our support team.</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
