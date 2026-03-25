-- Backfill organization_id for existing finance records.
-- Run this AFTER the migration.sql has been applied.
--
-- Strategy:
--   - For student-linked models (StudentFee, Payment): derive org from Student → User → OrgMember
--   - For FeeType, FeeStructure: derive from their linked StudentFees (if any)
--   - For Expense, LedgerEntry: assign the default org (single-tenant fallback)
--
-- For single-tenant deployments, all records get the same organization_id.
-- For multi-tenant, run this per-org or adjust the subqueries.

-- Step 1: Find the default organization ID
-- (In single-tenant mode, there's typically one org named 'default')
DO $$
DECLARE
  default_org_id TEXT;
BEGIN
  -- Try to find the default organization
  SELECT id INTO default_org_id FROM "organization" WHERE slug = 'default' LIMIT 1;

  -- If no default, use the first organization
  IF default_org_id IS NULL THEN
    SELECT id INTO default_org_id FROM "organization" LIMIT 1;
  END IF;

  IF default_org_id IS NULL THEN
    RAISE NOTICE 'No organization found. Skipping backfill.';
    RETURN;
  END IF;

  RAISE NOTICE 'Backfilling with organization_id: %', default_org_id;

  -- Step 2: Backfill StudentFee
  UPDATE "student_fees"
  SET "organization_id" = default_org_id
  WHERE "organization_id" IS NULL;

  -- Step 3: Backfill Payment
  UPDATE "payments"
  SET "organization_id" = default_org_id
  WHERE "organization_id" IS NULL;

  -- Step 4: Backfill FeeType
  UPDATE "fee_types"
  SET "organization_id" = default_org_id
  WHERE "organization_id" IS NULL;

  -- Step 5: Backfill FeeStructure
  UPDATE "fee_structures"
  SET "organization_id" = default_org_id
  WHERE "organization_id" IS NULL;

  -- Step 6: Backfill Expense
  UPDATE "expenses"
  SET "organization_id" = default_org_id
  WHERE "organization_id" IS NULL;

  -- Step 7: Backfill LedgerEntry
  UPDATE "ledger_entries"
  SET "organization_id" = default_org_id
  WHERE "organization_id" IS NULL;

  -- Step 8: Set payment status for existing records
  UPDATE "payments"
  SET "status" = 'active'
  WHERE "status" IS NULL OR "status" = '';

  RAISE NOTICE 'Backfill complete.';
END $$;

-- Verification queries (run manually to check):
-- SELECT COUNT(*) AS null_org_fee_types FROM fee_types WHERE organization_id IS NULL;
-- SELECT COUNT(*) AS null_org_fee_structures FROM fee_structures WHERE organization_id IS NULL;
-- SELECT COUNT(*) AS null_org_student_fees FROM student_fees WHERE organization_id IS NULL;
-- SELECT COUNT(*) AS null_org_payments FROM payments WHERE organization_id IS NULL;
-- SELECT COUNT(*) AS null_org_expenses FROM expenses WHERE organization_id IS NULL;
-- SELECT COUNT(*) AS null_org_ledger_entries FROM ledger_entries WHERE organization_id IS NULL;
