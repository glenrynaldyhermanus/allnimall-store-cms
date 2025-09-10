#!/bin/bash

# Database Setup Script for Allnimall Store CMS
# This script sets up the SaaS subscription tables and seed data

set -e

echo "🚀 Setting up Allnimall Store CMS Database..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    print_warning "No Supabase project found. Initializing..."
    supabase init
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_error ".env.local file not found. Please create it with your Supabase credentials."
    exit 1
fi

# Load environment variables
source .env.local

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    print_error "Missing Supabase environment variables in .env.local"
    echo "Required variables:"
    echo "- NEXT_PUBLIC_SUPABASE_URL"
    echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
    exit 1
fi

print_status "Environment variables loaded successfully"

# Start Supabase local development (if not already running)
print_status "Starting Supabase local development..."
supabase start

# Wait for Supabase to be ready
print_status "Waiting for Supabase to be ready..."
sleep 10

# Apply migration
print_status "Applying SaaS subscription tables migration..."
supabase db reset

# Check if migration was successful
if [ $? -eq 0 ]; then
    print_success "Migration applied successfully"
else
    print_error "Migration failed"
    exit 1
fi

# Apply seed data
print_status "Applying seed data..."
supabase db seed

# Check if seeding was successful
if [ $? -eq 0 ]; then
    print_success "Seed data applied successfully"
else
    print_error "Seeding failed"
    exit 1
fi

# Verify tables were created
print_status "Verifying database setup..."

# Check if subscription_plans table exists
if supabase db shell --command "SELECT COUNT(*) FROM subscription_plans;" > /dev/null 2>&1; then
    print_success "subscription_plans table created"
else
    print_error "subscription_plans table not found"
    exit 1
fi

# Check if user_subscriptions table exists
if supabase db shell --command "SELECT COUNT(*) FROM user_subscriptions;" > /dev/null 2>&1; then
    print_success "user_subscriptions table created"
else
    print_error "user_subscriptions table not found"
    exit 1
fi

# Check if feature_usage table exists
if supabase db shell --command "SELECT COUNT(*) FROM feature_usage;" > /dev/null 2>&1; then
    print_success "feature_usage table created"
else
    print_error "feature_usage table not found"
    exit 1
fi

# Check if billing tables exist
if supabase db shell --command "SELECT COUNT(*) FROM billing_invoices;" > /dev/null 2>&1; then
    print_success "billing_invoices table created"
else
    print_error "billing_invoices table not found"
    exit 1
fi

# Check if functions exist
if supabase db shell --command "SELECT routine_name FROM information_schema.routines WHERE routine_name = 'check_user_subscription_status';" > /dev/null 2>&1; then
    print_success "Database functions created"
else
    print_error "Database functions not found"
    exit 1
fi

# Display subscription plans
print_status "Current subscription plans:"
supabase db shell --command "SELECT name, price, billing_cycle FROM subscription_plans ORDER BY sort_order;"

# Display feature flags count
FEATURE_COUNT=$(supabase db shell --command "SELECT COUNT(*) FROM feature_flags;" | tail -n 1)
print_success "Created $FEATURE_COUNT feature flags"

print_success "🎉 Database setup completed successfully!"
print_status "You can now start the development server with: npm run dev"
print_status "Supabase Studio is available at: http://localhost:54323"

echo ""
echo "📋 Next steps:"
echo "1. Start the development server: npm run dev"
echo "2. Open Supabase Studio: http://localhost:54323"
echo "3. Test the subscription system"
echo "4. Implement backend service functions"
echo "5. Create frontend subscription UI"
