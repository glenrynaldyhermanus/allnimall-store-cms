// API Routes for Billing Payments
// GET /api/billing/payments - Get user's billing payments

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import SubscriptionService from "@/lib/subscription-service";

const supabase = createClient();

export async function GET(request: NextRequest) {
	try {
		// Get user from session
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get query parameters
		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get("limit") || "10");
		const offset = parseInt(searchParams.get("offset") || "0");

		// Get user's payments
		const payments = await SubscriptionService.getUserPayments(
			user.id,
			limit,
			offset
		);

		return NextResponse.json({
			payments,
			pagination: {
				limit,
				offset,
				total: payments.length,
			},
		});
	} catch (error) {
		console.error("Error fetching payments:", error);
		return NextResponse.json(
			{ error: "Failed to fetch payments" },
			{ status: 500 }
		);
	}
}
