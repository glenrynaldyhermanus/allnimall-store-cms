import { NextRequest, NextResponse } from "next/server";
import { usageTrackingService } from "@/lib/usage-tracking-service";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		if (!userId) {
			return NextResponse.json(
				{ error: "Missing userId parameter" },
				{ status: 400 }
			);
		}

		const warnings = await usageTrackingService.getUsageWarnings(userId);

		return NextResponse.json({ warnings });
	} catch (error) {
		console.error("Error getting usage warnings:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { warningId } = body;

		if (!warningId) {
			return NextResponse.json({ error: "Missing warningId" }, { status: 400 });
		}

		await usageTrackingService.markWarningAsRead(warningId);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error marking warning as read:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
