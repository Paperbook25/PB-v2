-- Gravity Portal CRM: Leads & Lead Activities
-- Idempotent migration (safe to run multiple times)

-- Enums (create if they don't exist)
DO $$ BEGIN
  CREATE TYPE "LeadStatus" AS ENUM (
    'lead_new', 'lead_contacted', 'lead_qualified', 'lead_demo',
    'lead_proposal', 'lead_negotiation', 'lead_won', 'lead_lost'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "LeadSource" AS ENUM (
    'website', 'referral', 'social_media', 'cold_call', 'event', 'partner', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Leads table
CREATE TABLE IF NOT EXISTS "leads" (
  "id"                  TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "school_name"         TEXT        NOT NULL,
  "contact_name"        TEXT        NOT NULL,
  "contact_email"       TEXT        NOT NULL,
  "contact_phone"       TEXT,
  "city"                TEXT,
  "state"               TEXT,
  "status"              "LeadStatus" NOT NULL DEFAULT 'lead_new',
  "source"              "LeadSource" NOT NULL DEFAULT 'website',
  "expected_revenue"    DECIMAL(12,2),
  "expected_plan"       TEXT,
  "assigned_to"         TEXT,
  "notes"               TEXT,
  "lost_reason"         TEXT,
  "converted_school_id" TEXT,
  "next_follow_up"      TIMESTAMP(3),
  "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- Lead Activities table
CREATE TABLE IF NOT EXISTS "lead_activities" (
  "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "lead_id"     TEXT        NOT NULL,
  "type"        TEXT        NOT NULL,
  "content"     TEXT        NOT NULL,
  "created_by"  TEXT,
  "metadata"    JSONB,
  "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lead_activities_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "lead_activities_lead_id_fkey" FOREIGN KEY ("lead_id")
    REFERENCES "leads" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS "leads_status_idx"       ON "leads" ("status");
CREATE INDEX IF NOT EXISTS "leads_source_idx"       ON "leads" ("source");
CREATE INDEX IF NOT EXISTS "leads_assigned_to_idx"  ON "leads" ("assigned_to");
CREATE INDEX IF NOT EXISTS "leads_next_follow_up_idx" ON "leads" ("next_follow_up");
CREATE INDEX IF NOT EXISTS "lead_activities_lead_id_idx"  ON "lead_activities" ("lead_id");
CREATE INDEX IF NOT EXISTS "lead_activities_created_at_idx" ON "lead_activities" ("created_at");
