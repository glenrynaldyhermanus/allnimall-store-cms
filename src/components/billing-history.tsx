"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Download,
	Eye,
	Calendar,
	CreditCard,
	FileText,
	AlertCircle,
	CheckCircle,
	Clock,
	XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Invoice {
	id: string;
	invoice_number: string;
	amount: number;
	currency: string;
	status: string;
	due_date: string;
	paid_at?: string;
	invoice_url?: string;
	pdf_url?: string;
	created_at: string;
	subscription_id: string;
}

interface Payment {
	id: string;
	invoice_id: string;
	amount: number;
	currency: string;
	payment_method: string;
	status: string;
	payment_date?: string;
	gateway_transaction_id?: string;
	receipt_url?: string;
	created_at: string;
}

export function BillingHistory() {
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [payments, setPayments] = useState<Payment[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchBillingData();
	}, []);

	const fetchBillingData = async () => {
		try {
			// Mock data for demonstration
			const mockInvoices: Invoice[] = [
				{
					id: "inv_001",
					invoice_number: "INV-2024-001",
					amount: 299000,
					currency: "IDR",
					status: "paid",
					due_date: "2024-01-15T00:00:00Z",
					paid_at: "2024-01-14T10:30:00Z",
					invoice_url: "/invoices/inv_001",
					pdf_url: "/invoices/inv_001.pdf",
					created_at: "2024-01-01T00:00:00Z",
					subscription_id: "sub_123",
				},
				{
					id: "inv_002",
					invoice_number: "INV-2024-002",
					amount: 299000,
					currency: "IDR",
					status: "pending",
					due_date: "2024-02-15T00:00:00Z",
					invoice_url: "/invoices/inv_002",
					pdf_url: "/invoices/inv_002.pdf",
					created_at: "2024-02-01T00:00:00Z",
					subscription_id: "sub_123",
				},
				{
					id: "inv_003",
					invoice_number: "INV-2024-003",
					amount: 299000,
					currency: "IDR",
					status: "failed",
					due_date: "2024-03-15T00:00:00Z",
					invoice_url: "/invoices/inv_003",
					pdf_url: "/invoices/inv_003.pdf",
					created_at: "2024-03-01T00:00:00Z",
					subscription_id: "sub_123",
				},
			];

			const mockPayments: Payment[] = [
				{
					id: "pay_001",
					invoice_id: "inv_001",
					amount: 299000,
					currency: "IDR",
					payment_method: "credit_card",
					status: "succeeded",
					payment_date: "2024-01-14T10:30:00Z",
					gateway_transaction_id: "txn_midtrans_001",
					receipt_url: "/receipts/pay_001.pdf",
					created_at: "2024-01-14T10:30:00Z",
				},
				{
					id: "pay_002",
					invoice_id: "inv_003",
					amount: 299000,
					currency: "IDR",
					payment_method: "bank_transfer",
					status: "failed",
					gateway_transaction_id: "txn_midtrans_002",
					created_at: "2024-03-15T09:15:00Z",
				},
			];

			setInvoices(mockInvoices);
			setPayments(mockPayments);
		} catch (error) {
			console.error("Error fetching billing data:", error);
			setError("Failed to load billing history");
		} finally {
			setLoading(false);
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "paid":
			case "succeeded":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "pending":
				return <Clock className="h-4 w-4 text-yellow-500" />;
			case "failed":
				return <XCircle className="h-4 w-4 text-red-500" />;
			case "cancelled":
				return <AlertCircle className="h-4 w-4 text-gray-500" />;
			default:
				return <Clock className="h-4 w-4 text-gray-500" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "paid":
			case "succeeded":
				return "bg-green-100 text-green-800";
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "failed":
				return "bg-red-100 text-red-800";
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

	const formatCurrency = (amount: number, currency: string = "IDR") => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: currency,
		}).format(amount);
	};

	const handleDownloadInvoice = (invoice: Invoice) => {
		if (invoice.pdf_url) {
			window.open(invoice.pdf_url, "_blank");
		} else {
			// Generate PDF or redirect to invoice page
			window.open(invoice.invoice_url, "_blank");
		}
	};

	const handleViewInvoice = (invoice: Invoice) => {
		window.open(invoice.invoice_url, "_blank");
	};

	const handleDownloadReceipt = (payment: Payment) => {
		if (payment.receipt_url) {
			window.open(payment.receipt_url, "_blank");
		}
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="h-20 bg-gray-200 rounded"></div>
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
					<AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
					<h3 className="text-lg font-semibold mb-2">
						Error Loading Billing History
					</h3>
					<p className="text-muted-foreground mb-4">{error}</p>
					<Button onClick={fetchBillingData}>Try Again</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Billing History</h1>
					<p className="text-muted-foreground">
						View and manage your invoices and payments
					</p>
				</div>
				<div className="flex items-center space-x-2">
					<Calendar className="h-5 w-5 text-muted-foreground" />
					<span className="text-sm text-muted-foreground">
						{invoices.length} invoices
					</span>
				</div>
			</div>

			{/* Invoices Table */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<FileText className="h-5 w-5" />
						<span>Invoices</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Invoice</TableHead>
								<TableHead>Amount</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Due Date</TableHead>
								<TableHead>Paid Date</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{invoices.map((invoice) => (
								<TableRow key={invoice.id}>
									<TableCell className="font-medium">
										{invoice.invoice_number}
									</TableCell>
									<TableCell>
										{formatCurrency(invoice.amount, invoice.currency)}
									</TableCell>
									<TableCell>
										<div className="flex items-center space-x-2">
											{getStatusIcon(invoice.status)}
											<Badge className={getStatusColor(invoice.status)}>
												{invoice.status.charAt(0).toUpperCase() +
													invoice.status.slice(1)}
											</Badge>
										</div>
									</TableCell>
									<TableCell>{formatDate(invoice.due_date)}</TableCell>
									<TableCell>
										{invoice.paid_at ? formatDate(invoice.paid_at) : "-"}
									</TableCell>
									<TableCell className="text-right">
										<div className="flex items-center justify-end space-x-2">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleViewInvoice(invoice)}>
												<Eye className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDownloadInvoice(invoice)}>
												<Download className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Payments Table */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<CreditCard className="h-5 w-5" />
						<span>Payment History</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Transaction ID</TableHead>
								<TableHead>Amount</TableHead>
								<TableHead>Method</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Date</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{payments.map((payment) => (
								<TableRow key={payment.id}>
									<TableCell className="font-mono text-sm">
										{payment.gateway_transaction_id || payment.id}
									</TableCell>
									<TableCell>
										{formatCurrency(payment.amount, payment.currency)}
									</TableCell>
									<TableCell>
										<Badge variant="outline">
											{payment.payment_method.replace("_", " ")}
										</Badge>
									</TableCell>
									<TableCell>
										<div className="flex items-center space-x-2">
											{getStatusIcon(payment.status)}
											<Badge className={getStatusColor(payment.status)}>
												{payment.status.charAt(0).toUpperCase() +
													payment.status.slice(1)}
											</Badge>
										</div>
									</TableCell>
									<TableCell>{formatDate(payment.created_at)}</TableCell>
									<TableCell className="text-right">
										{payment.receipt_url && (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDownloadReceipt(payment)}>
												<Download className="h-4 w-4" />
											</Button>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Summary Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Paid</CardTitle>
						<CheckCircle className="h-4 w-4 text-green-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(
								payments
									.filter((p) => p.status === "succeeded")
									.reduce((sum, p) => sum + p.amount, 0)
							)}
						</div>
						<p className="text-xs text-muted-foreground">
							{payments.filter((p) => p.status === "succeeded").length}{" "}
							successful payments
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Pending</CardTitle>
						<Clock className="h-4 w-4 text-yellow-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(
								invoices
									.filter((i) => i.status === "pending")
									.reduce((sum, i) => sum + i.amount, 0)
							)}
						</div>
						<p className="text-xs text-muted-foreground">
							{invoices.filter((i) => i.status === "pending").length} pending
							invoices
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Failed</CardTitle>
						<XCircle className="h-4 w-4 text-red-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(
								invoices
									.filter((i) => i.status === "failed")
									.reduce((sum, i) => sum + i.amount, 0)
							)}
						</div>
						<p className="text-xs text-muted-foreground">
							{invoices.filter((i) => i.status === "failed").length} failed
							payments
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
