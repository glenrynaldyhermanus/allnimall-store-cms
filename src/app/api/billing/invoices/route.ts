// API Routes for Billing Invoices
// GET /api/billing/invoices - Get user's billing invoices

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

		// Get user's invoices
		const invoices = await SubscriptionService.getUserInvoices(
			user.id,
			limit,
			offset
		);

		return NextResponse.json({
			invoices,
			pagination: {
				limit,
				offset,
				total: invoices.length,
			},
		});
	} catch (error) {
		console.error("Error fetching invoices:", error);
		return NextResponse.json(
			{ error: "Failed to fetch invoices" },
			{ status: 500 }
		);
	}
}
