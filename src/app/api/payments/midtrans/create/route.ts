import { NextRequest, NextResponse } from "next/server";
import { MidtransService } from "@/lib/midtrans-service";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
	try {
		const { subscriptionId, amount, customerDetails, billingCycle } =
			await request.json();

		// Validate required fields
		if (!subscriptionId || !amount || !customerDetails) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Get subscription details
		const { data: subscription, error: subscriptionError } = await supabase
			.from("user_subscriptions")
			.select(
				`
        id,
        user_id,
        plan_id,
        status,
        subscription_plans (
          name,
          billing_cycle
        )
      `
			)
			.eq("id", subscriptionId)
			.single();

		if (subscriptionError || !subscription) {
			return NextResponse.json(
				{ error: "Subscription not found" },
				{ status: 404 }
			);
		}

		// Create payment with Midtrans
		const paymentResponse = await MidtransService.createSubscriptionPayment(
			subscriptionId,
			amount,
			customerDetails,
			billingCycle || "monthly"
		);

		// Create billing invoice
		const { data: invoice, error: invoiceError } = await supabase
			.from("billing_invoices")
			.insert({
				user_id: subscription.user_id,
				subscription_id: subscriptionId,
				invoice_number: `INV-${subscriptionId}-${Date.now()}`,
				amount: amount,
				currency: "IDR",
				status: "pending",
				due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
				invoice_url: paymentResponse.redirect_url,
			})
			.select()
			.single();

		if (invoiceError) {
			console.error("Error creating invoice:", invoiceError);
			return NextResponse.json(
				{ error: "Failed to create invoice" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			payment: {
				token: paymentResponse.token,
				redirect_url: paymentResponse.redirect_url,
				invoice_id: invoice.id,
			},
		});
	} catch (error) {
		console.error("Payment creation error:", error);
		return NextResponse.json(
			{ error: "Failed to create payment" },
			{ status: 500 }
		);
	}
}
