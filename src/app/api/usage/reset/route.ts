import { NextRequest, NextResponse } from "next/server";
import { SubscriptionService } from "@/lib/subscription-service";

export async function POST(request: NextRequest) {
	try {
		// This endpoint should be called by a cron job or scheduled task
		// For security, you might want to add authentication/authorization

		const resetCount = await SubscriptionService.resetUsageCounters();

		return NextResponse.json({
			success: true,
			message: "Usage counters reset successfully",
			reset_count: resetCount,
		});
	} catch (error) {
		console.error("Usage reset error:", error);
		return NextResponse.json(
			{ error: "Failed to reset usage counters" },
			{ status: 500 }
		);
	}
}
