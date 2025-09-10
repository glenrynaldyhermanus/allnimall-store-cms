import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, AlertTriangle } from "lucide-react";
import { RestrictionMessage, UpgradeButton } from "./restriction-components";
import { useFeatureAccess } from "@/middleware/feature-restriction";

interface Product {
	id: string;
	name: string;
	price: number;
	stock: number;
	category: string;
}

interface ProductManagementProps {
	userId: string;
	storeId: string;
}

export function ProductManagement({ userId, storeId }: ProductManagementProps) {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const {
		hasAccess,
		loading: accessLoading,
		featureAccess,
	} = useFeatureAccess("product_management", userId);

	useEffect(() => {
		if (!accessLoading && hasAccess) {
			fetchProducts();
		}
	}, [accessLoading, hasAccess]);

	const fetchProducts = async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`/api/products?userId=${userId}&storeId=${storeId}`
			);

			if (response.status === 403) {
				const errorData = await response.json();
				setError(errorData.error);
				return;
			}

			if (response.status === 429) {
				const errorData = await response.json();
				setError(errorData.error);
				return;
			}

			if (!response.ok) {
				throw new Error("Failed to fetch products");
			}

			const data = await response.json();
			setProducts(data.products || []);
		} catch (err) {
			console.error("Error fetching products:", err);
			setError("Failed to load products");
		} finally {
			setLoading(false);
		}
	};

	const handleCreateProduct = async () => {
		try {
			const productData = {
				name: "New Product",
				price: 100000,
				stock: 0,
				category: "General",
			};

			const response = await fetch("/api/products", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId,
					storeId,
					productData,
				}),
			});

			if (response.status === 403) {
				const errorData = await response.json();
				setError(errorData.error);
				return;
			}

			if (response.status === 429) {
				const errorData = await response.json();
				setError(errorData.error);
				return;
			}

			if (!response.ok) {
				throw new Error("Failed to create product");
			}

			const data = await response.json();
			setProducts([...products, data.product]);
		} catch (err) {
			console.error("Error creating product:", err);
			setError("Failed to create product");
		}
	};

	if (accessLoading) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="flex items-center justify-center">
						<div className="text-gray-500">Loading...</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!hasAccess) {
		return (
			<RestrictionMessage
				featureName="Product Management"
				reason={
					featureAccess?.reason ||
					"This feature is not available in your current plan"
				}
				currentPlan="Free"
				requiredPlan="Premium"
				onUpgrade={(planId) => {
					window.location.href = `/pricing?upgrade=${planId}`;
				}}
				variant="warning"
			/>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<Package className="h-5 w-5" />
						<CardTitle>Product Management</CardTitle>
					</div>
					<div className="flex items-center space-x-2">
						{featureAccess?.usageCount !== undefined && (
							<Badge variant="outline">
								{featureAccess.usageCount}/{featureAccess.usageLimit} used
							</Badge>
						)}
						<Button onClick={handleCreateProduct} size="sm">
							<Plus className="h-4 w-4 mr-1" />
							Add Product
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{error && (
					<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
						<div className="flex items-center space-x-2">
							<AlertTriangle className="h-4 w-4 text-red-600" />
							<span className="text-red-800 text-sm">{error}</span>
						</div>
					</div>
				)}

				{loading ? (
					<div className="flex items-center justify-center py-8">
						<div className="text-gray-500">Loading products...</div>
					</div>
				) : (
					<div className="space-y-4">
						{products.length === 0 ? (
							<div className="text-center py-8 text-gray-500">
								No products found. Create your first product!
							</div>
						) : (
							products.map((product) => (
								<div
									key={product.id}
									className="flex items-center justify-between p-4 border rounded-lg">
									<div>
										<h3 className="font-medium">{product.name}</h3>
										<p className="text-sm text-gray-600">
											{product.category} • Stock: {product.stock}
										</p>
									</div>
									<div className="text-right">
										<p className="font-medium">
											Rp {product.price.toLocaleString()}
										</p>
									</div>
								</div>
							))
						)}
					</div>
				)}

				{featureAccess?.usageCount !== undefined &&
					featureAccess.usageLimit !== undefined && (
						<div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
							<div className="flex items-center justify-between text-sm">
								<span className="text-blue-800">
									Usage: {featureAccess.usageCount}/{featureAccess.usageLimit}
								</span>
								<span className="text-blue-600">
									Remaining: {featureAccess.remaining}
								</span>
							</div>
							<div className="w-full bg-blue-200 rounded-full h-2 mt-2">
								<div
									className="bg-blue-600 h-2 rounded-full"
									style={{
										width: `${
											(featureAccess.usageCount / featureAccess.usageLimit) *
											100
										}%`,
									}}
								/>
							</div>
						</div>
					)}
			</CardContent>
		</Card>
	);
}
