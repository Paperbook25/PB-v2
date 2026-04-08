-- Add new optional fields to facilities table
ALTER TABLE "facilities" ADD COLUMN IF NOT EXISTS "code" VARCHAR;
ALTER TABLE "facilities" ADD COLUMN IF NOT EXISTS "building" VARCHAR;
ALTER TABLE "facilities" ADD COLUMN IF NOT EXISTS "floor" INTEGER;
ALTER TABLE "facilities" ADD COLUMN IF NOT EXISTS "room_number" VARCHAR;

-- Add new fields to scholarships table
ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "code" VARCHAR;
ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "amount_type" VARCHAR NOT NULL DEFAULT 'fixed';
ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "application_deadline" DATE;
