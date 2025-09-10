import { NextRequest, NextResponse } from "next/server";
import { planValidationService } from "@/lib/plan-validation-service";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { userId, featureName, actionType, actionCount = 1 } = body;

		if (!userId || !featureName || !actionType) {
			return NextResponse.json(
				{ error: "Missing required fields: userId, featureName, actionType" },
				{ status: 400 }
			);
		}

		const validation = await planValidationService.validateAction(
			userId,
			featureName,
			actionType,
			actionCount
		);

		return NextResponse.json(validation);
	} catch (error) {
		console.error("Error validating plan action:", error);
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

		if (!userId) {
			return NextResponse.json(
				{ error: "Missing userId parameter" },
				{ status: 400 }
			);
		}

		const restrictions = await planValidationService.getPlanRestrictions(
			userId
		);

		return NextResponse.json({ restrictions });
	} catch (error) {
		console.error("Error getting plan restrictions:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
