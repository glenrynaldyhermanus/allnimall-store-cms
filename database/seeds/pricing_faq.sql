-- Pricing FAQ Seed Data
-- Frequently asked questions for the pricing page

INSERT INTO pricing_faq (question, answer, category, sort_order) VALUES
-- Billing Questions
('What payment methods do you accept?', 'We accept all major credit cards, bank transfers, and e-wallets through Midtrans payment gateway.', 'billing', 1),
('Can I change my plan anytime?', 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.', 'billing', 2),
('Is there a setup fee?', 'No setup fees for any of our plans. You only pay the monthly or yearly subscription fee.', 'billing', 3),
('Do you offer refunds?', 'We offer a 30-day money-back guarantee for all paid plans. Contact support for refund requests.', 'billing', 4),
('Can I cancel anytime?', 'Yes, you can cancel your subscription anytime. Your access continues until the end of your billing period.', 'billing', 5),
('How does billing work?', 'We bill monthly or yearly in advance. You can choose your billing cycle when subscribing.', 'billing', 6),
('Do you offer discounts for annual plans?', 'Yes, annual plans come with a 20% discount compared to monthly billing.', 'billing', 7),

-- Trial Questions
('How does the trial work?', 'All plans come with a 14-day free trial. No credit card required to start.', 'trial', 1),
('What happens after the trial ends?', 'After the trial, you can choose to subscribe to a paid plan or continue with the free plan.', 'trial', 2),
('Can I extend my trial?', 'Trial extensions are available for Enterprise customers. Contact our sales team for more information.', 'trial', 3),

-- Limits Questions
('What happens if I exceed my limits?', 'We will notify you when you approach your limits. You can upgrade your plan or purchase additional capacity.', 'limits', 1),
('Can I increase my limits?', 'Yes, you can upgrade your plan or purchase add-ons to increase your limits.', 'limits', 2),
('Are there overage fees?', 'No overage fees. We will notify you to upgrade your plan before you reach your limits.', 'limits', 3),

-- Support Questions
('What support do you provide?', 'Free plan gets community support, paid plans get email support, and Enterprise gets dedicated support.', 'support', 1),
('How quickly do you respond to support requests?', 'Free plan: 48-72 hours, Paid plans: 24 hours, Enterprise: 4 hours.', 'support', 2),
('Do you offer phone support?', 'Phone support is available for Professional and Enterprise plans.', 'support', 3),

-- Security Questions
('Is my data secure?', 'Yes, we use enterprise-grade security with SSL encryption and regular backups.', 'security', 1),
('Where is my data stored?', 'Your data is stored in secure data centers with 99.9% uptime guarantee.', 'security', 2),
('Do you comply with data protection regulations?', 'Yes, we comply with GDPR and other data protection regulations.', 'security', 3),

-- Enterprise Questions
('Do you offer custom plans?', 'Yes, we offer custom plans for Enterprise customers with specific requirements.', 'enterprise', 1),
('What is included in Enterprise support?', 'Enterprise support includes dedicated account manager, priority support, and custom integrations.', 'enterprise', 2),
('Can I get a custom contract?', 'Yes, Enterprise customers can get custom contracts with specific terms and conditions.', 'enterprise', 3),

-- Features Questions
('What features are included in each plan?', 'Each plan includes different features and limits. Check our pricing page for detailed comparison.', 'features', 1),
('Can I use the API?', 'API access is available in Professional and Enterprise plans with different rate limits.', 'features', 2),
('Do you offer integrations?', 'Yes, we offer integrations with popular e-commerce platforms and tools.', 'features', 3),

-- Migration Questions
('Can I migrate from another platform?', 'Yes, we offer free migration assistance for Professional and Enterprise customers.', 'migration', 1),
('How long does migration take?', 'Migration typically takes 1-2 weeks depending on your data size and complexity.', 'migration', 2),
('Is there downtime during migration?', 'We minimize downtime by using our migration tools and best practices.', 'migration', 3)
ON CONFLICT DO NOTHING;
