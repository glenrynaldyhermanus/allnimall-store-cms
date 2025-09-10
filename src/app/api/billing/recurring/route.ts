import { NextRequest, NextResponse } from "next/server";
import { SubscriptionService } from "@/lib/subscription-service";

export async function POST(request: NextRequest) {
	try {
		// This endpoint should be called by a cron job or scheduled task
		// For security, you might want to add authentication/authorization

		await SubscriptionService.processRecurringBilling();

		return NextResponse.json({
			success: true,
			message: "Recurring billing processed successfully",
		});
	} catch (error) {
		console.error("Recurring billing error:", error);
		return NextResponse.json(
			{ error: "Failed to process recurring billing" },
			{ status: 500 }
		);
	}
}
