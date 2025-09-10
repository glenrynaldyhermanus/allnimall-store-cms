import { NextRequest, NextResponse } from "next/server";
import { MidtransService } from "@/lib/midtrans-service";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const orderId = searchParams.get("order_id");

		if (!orderId) {
			return NextResponse.json(
				{ error: "Order ID is required" },
				{ status: 400 }
			);
		}

		// Get transaction status from Midtrans
		const transactionStatus = await MidtransService.getTransactionStatus(
			orderId
		);

		// Get local invoice status
		const { data: invoice, error: invoiceError } = await supabase
			.from("billing_invoices")
			.select(
				`
        id,
        status,
        amount,
        paid_at,
        subscription_id,
        user_subscriptions (
          id,
          status,
          plan_id
        )
      `
			)
			.eq("stripe_invoice_id", transactionStatus.transaction_id)
			.single();

		if (invoiceError) {
			console.error("Error fetching invoice:", invoiceError);
		}

		return NextResponse.json({
			success: true,
			transaction: {
				order_id: transactionStatus.order_id,
				transaction_status: transactionStatus.transaction_status,
				gross_amount: transactionStatus.gross_amount,
				payment_type: transactionStatus.payment_type,
				transaction_time: transactionStatus.transaction_time,
				fraud_status: transactionStatus.fraud_status,
				bank: transactionStatus.bank,
				va_number: transactionStatus.va_number,
				bill_key: transactionStatus.bill_key,
				biller_code: transactionStatus.biller_code,
				masked_card: transactionStatus.masked_card,
				card_type: transactionStatus.card_type,
			},
			invoice: invoice
				? {
						id: invoice.id,
						status: invoice.status,
						amount: invoice.amount,
						paid_at: invoice.paid_at,
						subscription: invoice.user_subscriptions,
				  }
				: null,
		});
	} catch (error) {
		console.error("Status check error:", error);
		return NextResponse.json(
			{ error: "Failed to check payment status" },
			{ status: 500 }
		);
	}
}
