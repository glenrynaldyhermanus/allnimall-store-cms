import { NextRequest, NextResponse } from "next/server";
import { planValidationService } from "@/lib/plan-validation-service";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { userId, targetPlanId } = body;

		if (!userId || !targetPlanId) {
			return NextResponse.json(
				{ error: "Missing required fields: userId, targetPlanId" },
				{ status: 400 }
			);
		}

		const upgradeCheck = await planValidationService.canUpgradeToPlan(
			userId,
			targetPlanId
		);

		return NextResponse.json(upgradeCheck);
	} catch (error) {
		console.error("Error checking upgrade eligibility:", error);
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

		const recommendation = await planValidationService.getRecommendedPlan(
			userId
		);

		return NextResponse.json(recommendation);
	} catch (error) {
		console.error("Error getting recommended plan:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
