import { NextRequest, NextResponse } from "next/server";
import { MidtransService } from "@/lib/midtrans-service";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
	try {
		const { orderId } = await request.json();

		if (!orderId) {
			return NextResponse.json(
				{ error: "Order ID is required" },
				{ status: 400 }
			);
		}

		// Cancel transaction with Midtrans
		const cancelResponse = await MidtransService.cancelTransaction(orderId);

		// Update local invoice status
		const { error: invoiceError } = await supabase
			.from("billing_invoices")
			.update({
				status: "cancelled",
				updated_at: new Date().toISOString(),
			})
			.eq("stripe_invoice_id", cancelResponse.transaction_id);

		if (invoiceError) {
			console.error("Error updating invoice:", invoiceError);
		}

		// Extract subscription ID from order_id
		const orderIdParts = orderId.split("-");
		if (orderIdParts[0] === "SUB" && orderIdParts.length >= 3) {
			const subscriptionId = orderIdParts[1];

			// Update subscription status
			const { error: subscriptionError } = await supabase
				.from("user_subscriptions")
				.update({
					status: "cancelled",
					cancelled_at: new Date().toISOString(),
					cancellation_reason: "Payment cancelled by user",
					updated_at: new Date().toISOString(),
				})
				.eq("id", subscriptionId);

			if (subscriptionError) {
				console.error("Error updating subscription:", subscriptionError);
			}
		}

		return NextResponse.json({
			success: true,
			message: "Transaction cancelled successfully",
			response: cancelResponse,
		});
	} catch (error) {
		console.error("Cancel transaction error:", error);
		return NextResponse.json(
			{ error: "Failed to cancel transaction" },
			{ status: 500 }
		);
	}
}
