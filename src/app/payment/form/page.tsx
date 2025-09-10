"use client";

import { useSearchParams } from "next/navigation";
import { MidtransPaymentForm } from "@/components/midtrans-payment-form";

export default function PaymentFormPage() {
	const searchParams = useSearchParams();
	const planId = searchParams.get("plan");
	const billingCycle =
		(searchParams.get("billing") as "monthly" | "yearly") || "monthly";

	if (!planId) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Plan</h1>
					<p className="text-muted-foreground">
						Please select a valid plan to continue.
					</p>
				</div>
			</div>
		);
	}

	return <MidtransPaymentForm planId={planId} billingCycle={billingCycle} />;
}
