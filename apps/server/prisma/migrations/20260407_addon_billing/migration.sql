-- Phase 1: Addon Billing Infrastructure + Pricing Sync + Platform Integrations

-- Addon: add monthly_price
ALTER TABLE "addons" ADD COLUMN IF NOT EXISTS "monthly_price" DECIMAL(12,2);

-- SchoolAddon: add billing tracking fields
ALTER TABLE "school_addons" ADD COLUMN IF NOT EXISTS "billing_status" TEXT NOT NULL DEFAULT 'free';
ALTER TABLE "school_addons" ADD COLUMN IF NOT EXISTS "trial_started_at" TIMESTAMP(3);
ALTER TABLE "school_addons" ADD COLUMN IF NOT EXISTS "trial_ends_at" TIMESTAMP(3);
ALTER TABLE "school_addons" ADD COLUMN IF NOT EXISTS "billing_started_at" TIMESTAMP(3);
ALTER TABLE "school_addons" ADD COLUMN IF NOT EXISTS "monthly_price" DECIMAL(12,2);

-- PricingPlan: add plan_tier for pricing sync
ALTER TABLE "pricing_plans" ADD COLUMN IF NOT EXISTS "plan_tier" TEXT;

-- BillingCycle enum: add multi_year
DO $$ BEGIN
  ALTER TYPE "BillingCycle" ADD VALUE IF NOT EXISTS 'multi_year';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- SchoolAddon: add billing_status index
CREATE INDEX IF NOT EXISTS "school_addons_billing_status_idx" ON "school_addons"("billing_status");

-- PlatformIntegration: new table for PaperBook's own API keys
CREATE TABLE IF NOT EXISTS "platform_integrations" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "credentials" JSONB NOT NULL,
  "settings" JSONB,
  "status" TEXT NOT NULL DEFAULT 'inactive',
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "last_tested_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "platform_integrations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "platform_integrations_type_idx" ON "platform_integrations"("type");
CREATE INDEX IF NOT EXISTS "platform_integrations_provider_idx" ON "platform_integrations"("provider");
