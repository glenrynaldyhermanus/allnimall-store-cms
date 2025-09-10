"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface FAQItem {
	id: string;
	question: string;
	answer: string;
	category: string;
}

interface PricingFAQProps {
	faqs: FAQItem[];
}

export function PricingFAQ({ faqs }: PricingFAQProps) {
	const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
	const [selectedCategory, setSelectedCategory] = useState<string>("all");

	const categories = [
		"all",
		...Array.from(new Set(faqs.map((faq) => faq.category))),
	];

	const filteredFAQs =
		selectedCategory === "all"
			? faqs
			: faqs.filter((faq) => faq.category === selectedCategory);

	const toggleExpanded = (id: string) => {
		const newExpanded = new Set(expandedItems);
		if (newExpanded.has(id)) {
			newExpanded.delete(id);
		} else {
			newExpanded.add(id);
		}
		setExpandedItems(newExpanded);
	};

	const categoryLabels = {
		all: "All Questions",
		billing: "Billing",
		trial: "Trial",
		limits: "Limits",
		support: "Support",
		security: "Security",
		enterprise: "Enterprise",
		features: "Features",
		migration: "Migration",
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-center text-2xl">
					Frequently Asked Questions
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Category Filter */}
				<div className="flex flex-wrap gap-2 justify-center">
					{categories.map((category) => (
						<Button
							key={category}
							variant={selectedCategory === category ? "default" : "outline"}
							size="sm"
							onClick={() => setSelectedCategory(category)}>
							{categoryLabels[category as keyof typeof categoryLabels] ||
								category}
						</Button>
					))}
				</div>

				{/* FAQ Items */}
				<div className="space-y-4">
					{filteredFAQs.map((faq) => {
						const isExpanded = expandedItems.has(faq.id);

						return (
							<div key={faq.id} className="border rounded-lg overflow-hidden">
								<button
									className="w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-center justify-between"
									onClick={() => toggleExpanded(faq.id)}>
									<span className="font-medium">{faq.question}</span>
									{isExpanded ? (
										<ChevronUp className="h-5 w-5 text-muted-foreground" />
									) : (
										<ChevronDown className="h-5 w-5 text-muted-foreground" />
									)}
								</button>

								{isExpanded && (
									<div className="px-4 pb-4 text-muted-foreground">
										{faq.answer}
									</div>
								)}
							</div>
						);
					})}
				</div>

				{/* Contact Support */}
				<div className="text-center pt-6 border-t">
					<p className="text-muted-foreground mb-4">
						Still have questions? We&apos;re here to help!
					</p>
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Button variant="outline" asChild>
							<a href="mailto:support@allnimall.com">Contact Support</a>
						</Button>
						<Button variant="outline" asChild>
							<a href="/docs">View Documentation</a>
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
