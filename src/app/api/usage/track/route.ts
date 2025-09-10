import { NextRequest, NextResponse } from "next/server";
import { usageTrackingService } from "@/lib/usage-tracking-service";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { userId, featureName, incrementBy = 1 } = body;

		if (!userId || !featureName) {
			return NextResponse.json(
				{ error: "Missing required fields: userId, featureName" },
				{ status: 400 }
			);
		}

		const result = await usageTrackingService.trackUsage(
			userId,
			featureName,
			incrementBy
		);

		return NextResponse.json(result);
	} catch (error) {
		console.error("Error tracking usage:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");
		const featureName = searchParams.get("featureName");

		if (!userId) {
			return NextResponse.json(
				{ error: "Missing userId parameter" },
				{ status: 400 }
			);
		}

		if (featureName) {
			// Get specific feature usage
			const usageLimit = await usageTrackingService.getUsageLimit(
				userId,
				featureName
			);
			return NextResponse.json({ usageLimit });
		} else {
			// Get all usage limits
			const usageLimits = await usageTrackingService.getAllUsageLimits(userId);
			return NextResponse.json({ usageLimits });
		}
	} catch (error) {
		console.error("Error getting usage data:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
