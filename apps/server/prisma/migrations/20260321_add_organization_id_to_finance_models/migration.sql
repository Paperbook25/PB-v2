-- AddOrganizationId to finance models for multi-tenant data isolation
-- This migration adds nullable organization_id columns and indexes.
-- Run the backfill script AFTER this migration to populate existing records.

-- FeeType
ALTER TABLE "fee_types" ADD COLUMN "organization_id" TEXT;
CREATE INDEX "fee_types_organization_id_idx" ON "fee_types"("organization_id");
-- Replace the old unique constraint with a tenant-scoped one
ALTER TABLE "fee_types" DROP CONSTRAINT IF EXISTS "fee_types_name_category_key";
CREATE UNIQUE INDEX "fee_types_organization_id_name_category_key" ON "fee_types"("organization_id", "name", "category");

-- FeeStructure
ALTER TABLE "fee_structures" ADD COLUMN "organization_id" TEXT;
CREATE INDEX "fee_structures_organization_id_idx" ON "fee_structures"("organization_id");

-- StudentFee
ALTER TABLE "student_fees" ADD COLUMN "organization_id" TEXT;
CREATE INDEX "student_fees_organization_id_idx" ON "student_fees"("organization_id");

-- Payment
ALTER TABLE "payments" ADD COLUMN "organization_id" TEXT;
CREATE INDEX "payments_organization_id_idx" ON "payments"("organization_id");

-- Expense
ALTER TABLE "expenses" ADD COLUMN "organization_id" TEXT;
CREATE INDEX "expenses_organization_id_idx" ON "expenses"("organization_id");

-- LedgerEntry
ALTER TABLE "ledger_entries" ADD COLUMN "organization_id" TEXT;
CREATE INDEX "ledger_entries_organization_id_idx" ON "ledger_entries"("organization_id");

-- Payment: Add status column for soft-delete (used by cancelPayment)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'status'
  ) THEN
    ALTER TABLE "payments" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';
    ALTER TABLE "payments" ADD COLUMN "cancelled_at" TIMESTAMP;
    ALTER TABLE "payments" ADD COLUMN "cancelled_by" TEXT;
    CREATE INDEX "payments_status_idx" ON "payments"("status");
  END IF;
END $$;
