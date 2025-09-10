"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	TrendingUp,
	TrendingDown,
	Clock,
	CheckCircle,
	XCircle,
	AlertTriangle,
	Calendar,
	DollarSign,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface PlanChangeRequest {
	id: string;
	from_plan_id: string;
	to_plan_id: string;
	change_type: "upgrade" | "downgrade";
	status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
	effective_date?: string;
	proration_amount: number;
	credit_amount: number;
	reason?: string;
	admin_notes?: string;
	created_at: string;
	processed_at?: string;
	from_plan: {
		name: string;
		display_name?: string;
		price: number;
	};
	to_plan: {
		name: string;
		display_name?: string;
		price: number;
	};
}

interface PlanChangeRequestFormProps {
	currentPlanId: string;
	onRequestSubmitted?: () => void;
}

export function PlanChangeRequestForm({
	currentPlanId,
	onRequestSubmitted,
}: PlanChangeRequestFormProps) {
	const [plans, setPlans] = useState<any[]>([]);
	const [selectedPlanId, setSelectedPlanId] = useState<string>("");
	const [reason, setReason] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [canChange, setCanChange] = useState<any>(null);
	const [checking, setChecking] = useState(false);

	useEffect(() => {
		fetchPlans();
	}, []);

	const fetchPlans = async () => {
		try {
			const { data, error } = await supabase
				.from("subscription_plans")
				.select("*")
				.eq("is_active", true)
				.eq("deleted_at", null)
				.order("sort_order");

			if (error) throw error;

			const formattedPlans = data.map((plan) => ({
				...plan,
				features: Array.isArray(plan.features) ? plan.features : [],
				limits: plan.limits || {},
			}));

			setPlans(formattedPlans);
		} catch (error) {
			console.error("Error fetching plans:", error);
		}
	};

	const checkPlanChange = async (targetPlanId: string) => {
		if (!targetPlanId || targetPlanId === currentPlanId) {
			setCanChange(null);
			return;
		}

		setChecking(true);
		try {
			const changeType = getChangeType(currentPlanId, targetPlanId);

			// Mock check - in real implementation, this would call the database function
			const mockResult = {
				can_change: true,
				reason: "Change allowed",
				proration_amount: calculateProration(currentPlanId, targetPlanId),
				effective_date: new Date(
					Date.now() + 24 * 60 * 60 * 1000
				).toISOString(),
			};

			setCanChange(mockResult);
		} catch (error) {
			console.error("Error checking plan change:", error);
			setCanChange({
				can_change: false,
				reason: "Unable to check plan change",
				proration_amount: 0,
				effective_date: null,
			});
		} finally {
			setChecking(false);
		}
	};

	const getChangeType = (fromPlanId: string, toPlanId: string) => {
		const fromPlan = plans.find((p) => p.id === fromPlanId);
		const toPlan = plans.find((p) => p.id === toPlanId);

		if (!fromPlan || !toPlan) return "upgrade";

		return toPlan.price > fromPlan.price ? "upgrade" : "downgrade";
	};

	const calculateProration = (fromPlanId: string, toPlanId: string) => {
		const fromPlan = plans.find((p) => p.id === fromPlanId);
		const toPlan = plans.find((p) => p.id === toPlanId);

		if (!fromPlan || !toPlan) return 0;

		// Simple proration calculation
		const dailyRateFrom = fromPlan.price / 30;
		const dailyRateTo = toPlan.price / 30;
		const daysRemaining = 15; // Mock remaining days

		return (dailyRateTo - dailyRateFrom) * daysRemaining;
	};

	const handlePlanSelect = (planId: string) => {
		setSelectedPlanId(planId);
		checkPlanChange(planId);
	};

	const handleSubmitRequest = async () => {
		if (!selectedPlanId || !canChange?.can_change) return;

		setLoading(true);
		setError(null);

		try {
			const changeType = getChangeType(currentPlanId, selectedPlanId);

			const { data, error } = await supabase
				.from("plan_change_requests")
				.insert({
					user_id: "00000000-0000-0000-0000-000000000000", // This would be the actual user ID
					subscription_id: "sub_123", // This would be the actual subscription ID
					from_plan_id: currentPlanId,
					to_plan_id: selectedPlanId,
					change_type: changeType,
					status: "pending",
					effective_date: canChange.effective_date,
					proration_amount: canChange.proration_amount,
					reason: reason,
				})
				.select()
				.single();

			if (error) throw error;

			// Reset form
			setSelectedPlanId("");
			setReason("");
			setCanChange(null);

			onRequestSubmitted?.();
		} catch (error) {
			console.error("Error submitting request:", error);
			setError("Failed to submit request. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const currentPlan = plans.find((p) => p.id === currentPlanId);
	const selectedPlan = plans.find((p) => p.id === selectedPlanId);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" className="w-full">
					Request Plan Change
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Request Plan Change</DialogTitle>
					<DialogDescription>
						Change your subscription plan. Changes take effect at your next
						billing cycle.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Current Plan */}
					<div className="space-y-2">
						<h4 className="font-semibold">Current Plan</h4>
						<div className="p-3 bg-muted rounded-lg">
							<div className="flex items-center justify-between">
								<span className="font-medium">
									{currentPlan?.display_name || currentPlan?.name}
								</span>
								<span className="text-sm text-muted-foreground">
									Rp {currentPlan?.price.toLocaleString("id-ID")}/
									{currentPlan?.billing_cycle}
								</span>
							</div>
						</div>
					</div>

					{/* Target Plan Selection */}
					<div className="space-y-3">
						<h4 className="font-semibold">Select New Plan</h4>
						<div className="grid grid-cols-1 gap-3">
							{plans
								.filter((plan) => plan.id !== currentPlanId)
								.map((plan) => (
									<div
										key={plan.id}
										className={`p-3 border rounded-lg cursor-pointer transition-colors ${
											selectedPlanId === plan.id
												? "border-primary bg-primary/5"
												: "border-border hover:border-primary/50"
										}`}
										onClick={() => handlePlanSelect(plan.id)}>
										<div className="flex items-center justify-between">
											<div>
												<div className="font-medium">
													{plan.display_name || plan.name}
												</div>
												<div className="text-sm text-muted-foreground">
													Rp {plan.price.toLocaleString("id-ID")}/
													{plan.billing_cycle}
												</div>
											</div>
											<div className="flex items-center space-x-2">
												{getChangeType(currentPlanId, plan.id) === "upgrade" ? (
													<TrendingUp className="h-4 w-4 text-green-500" />
												) : (
													<TrendingDown className="h-4 w-4 text-blue-500" />
												)}
												<span className="text-xs">
													{getChangeType(currentPlanId, plan.id)}
												</span>
											</div>
										</div>
									</div>
								))}
						</div>
					</div>

					{/* Change Preview */}
					{selectedPlan && canChange && (
						<div className="space-y-3">
							<h4 className="font-semibold">Change Preview</h4>
							<div className="p-4 bg-muted/50 rounded-lg space-y-3">
								<div className="flex items-center justify-between">
									<span>From:</span>
									<span>{currentPlan?.display_name || currentPlan?.name}</span>
								</div>
								<div className="flex items-center justify-between">
									<span>To:</span>
									<span>{selectedPlan.display_name || selectedPlan.name}</span>
								</div>
								<div className="flex items-center justify-between">
									<span>Change Type:</span>
									<Badge
										variant={
											getChangeType(currentPlanId, selectedPlanId) === "upgrade"
												? "default"
												: "secondary"
										}>
										{getChangeType(currentPlanId, selectedPlanId)}
									</Badge>
								</div>
								{canChange.proration_amount !== 0 && (
									<div className="flex items-center justify-between">
										<span>Proration Amount:</span>
										<span
											className={
												canChange.proration_amount > 0
													? "text-green-600"
													: "text-red-600"
											}>
											{canChange.proration_amount > 0 ? "+" : ""}Rp{" "}
											{Math.abs(canChange.proration_amount).toLocaleString(
												"id-ID"
											)}
										</span>
									</div>
								)}
								<div className="flex items-center justify-between">
									<span>Effective Date:</span>
									<span>
										{canChange.effective_date
											? new Date(canChange.effective_date).toLocaleDateString(
													"id-ID"
											  )
											: "Next billing cycle"}
									</span>
								</div>
							</div>
						</div>
					)}

					{/* Reason */}
					<div className="space-y-2">
						<h4 className="font-semibold">Reason for Change (Optional)</h4>
						<textarea
							className="w-full p-3 border rounded-lg resize-none"
							rows={3}
							placeholder="Tell us why you want to change your plan..."
							value={reason}
							onChange={(e) => setReason(e.target.value)}
						/>
					</div>

					{/* Error Display */}
					{error && (
						<div className="p-3 bg-red-50 border border-red-200 rounded-md">
							<div className="flex items-center space-x-2">
								<AlertTriangle className="h-4 w-4 text-red-500" />
								<p className="text-red-600 text-sm">{error}</p>
							</div>
						</div>
					)}

					{/* Checking Status */}
					{checking && (
						<div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
							<div className="flex items-center space-x-2">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
								<p className="text-blue-600 text-sm">
									Checking plan change eligibility...
								</p>
							</div>
						</div>
					)}

					{/* Cannot Change Message */}
					{canChange && !canChange.can_change && (
						<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
							<div className="flex items-center space-x-2">
								<AlertTriangle className="h-4 w-4 text-yellow-500" />
								<p className="text-yellow-600 text-sm">{canChange.reason}</p>
							</div>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button
						onClick={handleSubmitRequest}
						disabled={!selectedPlanId || !canChange?.can_change || loading}>
						{loading ? "Submitting..." : "Submit Request"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function PlanChangeRequestsList() {
	const [requests, setRequests] = useState<PlanChangeRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchRequests();
	}, []);

	const fetchRequests = async () => {
		try {
			// Mock data for demonstration
			const mockRequests: PlanChangeRequest[] = [
				{
					id: "req_001",
					from_plan_id: "plan_001",
					to_plan_id: "plan_002",
					change_type: "upgrade",
					status: "pending",
					effective_date: "2024-02-01T00:00:00Z",
					proration_amount: 50000,
					credit_amount: 0,
					reason: "Need more features for growing business",
					created_at: "2024-01-15T10:30:00Z",
					from_plan: {
						name: "Basic Plan",
						display_name: "Basic",
						price: 199000,
					},
					to_plan: {
						name: "Professional Plan",
						display_name: "Professional",
						price: 299000,
					},
				},
				{
					id: "req_002",
					from_plan_id: "plan_002",
					to_plan_id: "plan_001",
					change_type: "downgrade",
					status: "completed",
					effective_date: "2024-01-01T00:00:00Z",
					proration_amount: -25000,
					credit_amount: 25000,
					reason: "Downgrading due to budget constraints",
					created_at: "2023-12-20T14:15:00Z",
					processed_at: "2023-12-25T09:00:00Z",
					from_plan: {
						name: "Professional Plan",
						display_name: "Professional",
						price: 299000,
					},
					to_plan: {
						name: "Basic Plan",
						display_name: "Basic",
						price: 199000,
					},
				},
			];

			setRequests(mockRequests);
		} catch (error) {
			console.error("Error fetching requests:", error);
			setError("Failed to load requests");
		} finally {
			setLoading(false);
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "pending":
				return <Clock className="h-4 w-4 text-yellow-500" />;
			case "approved":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "rejected":
				return <XCircle className="h-4 w-4 text-red-500" />;
			case "completed":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "cancelled":
				return <XCircle className="h-4 w-4 text-gray-500" />;
			default:
				return <Clock className="h-4 w-4 text-gray-500" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "approved":
				return "bg-green-100 text-green-800";
			case "rejected":
				return "bg-red-100 text-red-800";
			case "completed":
				return "bg-green-100 text-green-800";
			case "cancelled":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("id-ID", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	if (loading) {
		return (
			<div className="space-y-4">
				<div className="animate-pulse">
					<div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
					<div className="space-y-3">
						{[1, 2].map((i) => (
							<div key={i} className="h-16 bg-gray-200 rounded"></div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<Card>
				<CardContent className="p-6 text-center">
					<AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
					<h3 className="text-lg font-semibold mb-2">Error Loading Requests</h3>
					<p className="text-muted-foreground mb-4">{error}</p>
					<Button onClick={fetchRequests}>Try Again</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center space-x-2">
					<Calendar className="h-5 w-5" />
					<span>Plan Change Requests</span>
				</CardTitle>
			</CardHeader>
			<CardContent>
				{requests.length === 0 ? (
					<div className="text-center py-8">
						<Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">No Requests</h3>
						<p className="text-muted-foreground">
							You haven't submitted any plan change requests yet.
						</p>
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Request</TableHead>
								<TableHead>Change Type</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Effective Date</TableHead>
								<TableHead>Amount</TableHead>
								<TableHead>Created</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{requests.map((request) => (
								<TableRow key={request.id}>
									<TableCell>
										<div className="space-y-1">
											<div className="font-medium">
												{request.from_plan.display_name} →{" "}
												{request.to_plan.display_name}
											</div>
											{request.reason && (
												<div className="text-sm text-muted-foreground">
													{request.reason}
												</div>
											)}
										</div>
									</TableCell>
									<TableCell>
										<Badge
											variant={
												request.change_type === "upgrade"
													? "default"
													: "secondary"
											}>
											{request.change_type === "upgrade" ? (
												<TrendingUp className="h-3 w-3 mr-1" />
											) : (
												<TrendingDown className="h-3 w-3 mr-1" />
											)}
											{request.change_type}
										</Badge>
									</TableCell>
									<TableCell>
										<div className="flex items-center space-x-2">
											{getStatusIcon(request.status)}
											<Badge className={getStatusColor(request.status)}>
												{request.status.charAt(0).toUpperCase() +
													request.status.slice(1)}
											</Badge>
										</div>
									</TableCell>
									<TableCell>
										{request.effective_date
											? formatDate(request.effective_date)
											: "-"}
									</TableCell>
									<TableCell>
										{request.proration_amount !== 0 && (
											<span
												className={
													request.proration_amount > 0
														? "text-green-600"
														: "text-red-600"
												}>
												{request.proration_amount > 0 ? "+" : ""}Rp{" "}
												{Math.abs(request.proration_amount).toLocaleString(
													"id-ID"
												)}
											</span>
										)}
									</TableCell>
									<TableCell>{formatDate(request.created_at)}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}
