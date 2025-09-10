import { NextRequest, NextResponse } from "next/server";
import { MidtransService } from "@/lib/midtrans-service";
import { SubscriptionService } from "@/lib/subscription-service";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
	try {
		const notification = await request.json();

		console.log("Midtrans webhook received:", notification);

		// Handle the payment notification
		const result = await MidtransService.handlePaymentNotification(
			notification
		);

		if (!result.success) {
			return NextResponse.json({ error: result.message }, { status: 400 });
		}

		// Update database based on payment status
		await updatePaymentStatus(notification);

		return NextResponse.json({ status: "OK" });
	} catch (error) {
		console.error("Webhook processing error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

async function updatePaymentStatus(notification: any) {
	try {
		const {
			order_id,
			transaction_status,
			gross_amount,
			transaction_time,
			transaction_id,
		} = notification;

		// Extract subscription ID from order_id (format: SUB-{subscriptionId}-{timestamp})
		const orderIdParts = order_id.split("-");
		if (orderIdParts[0] === "SUB" && orderIdParts.length >= 3) {
			const subscriptionId = orderIdParts[1];

			// Handle payment based on status using subscription service
			switch (transaction_status) {
				case "settlement":
				case "capture":
					await SubscriptionService.handleSuccessfulPayment(
						subscriptionId,
						transaction_id
					);
					break;
				case "deny":
				case "cancel":
				case "expire":
				case "failure":
					await SubscriptionService.handlePaymentFailure(
						subscriptionId,
						`Payment ${transaction_status}`
					);
					break;
				case "pending":
					// Keep subscription in trial/pending state
					await supabase
						.from("user_subscriptions")
						.update({
							status: "trial",
							updated_at: new Date().toISOString(),
						})
						.eq("id", subscriptionId);
					break;
			}

			// Create billing transaction record
			const { data: subscription } = await supabase
				.from("user_subscriptions")
				.select("user_id")
				.eq("id", subscriptionId)
				.single();

			if (subscription) {
				const { error: transactionError } = await supabase
					.from("billing_transactions")
					.insert({
						user_id: subscription.user_id,
						transaction_type: "subscription",
						amount: parseFloat(gross_amount),
						currency: "IDR",
						description: `Subscription payment for ${order_id} - ${transaction_status}`,
						reference_id: subscriptionId,
						reference_type: "subscription",
						stripe_transaction_id: transaction_id,
					});

				if (transactionError) {
					console.error("Error creating transaction:", transactionError);
				}
			}
		}
	} catch (error) {
		console.error("Error updating payment status:", error);
	}
}
