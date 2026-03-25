-- ============================================================================
-- Backfill: Populate organization_id for ALL tenant-scoped models
-- Run AFTER migration.sql
-- ============================================================================

DO $$
DECLARE
  default_org_id TEXT;
  affected BIGINT;
BEGIN
  SELECT id INTO default_org_id FROM "organization" WHERE slug = 'default' LIMIT 1;
  IF default_org_id IS NULL THEN
    SELECT id INTO default_org_id FROM "organization" LIMIT 1;
  END IF;
  IF default_org_id IS NULL THEN
    RAISE NOTICE 'No organization found. Skipping backfill.';
    RETURN;
  END IF;

  RAISE NOTICE 'Backfilling all tables with organization_id: %', default_org_id;

  -- Core models
  UPDATE "students" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  GET DIAGNOSTICS affected = ROW_COUNT; RAISE NOTICE '  students: % rows', affected;

  UPDATE "staff" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  GET DIAGNOSTICS affected = ROW_COUNT; RAISE NOTICE '  staff: % rows', affected;

  UPDATE "classes" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  GET DIAGNOSTICS affected = ROW_COUNT; RAISE NOTICE '  classes: % rows', affected;

  UPDATE "sections" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  GET DIAGNOSTICS affected = ROW_COUNT; RAISE NOTICE '  sections: % rows', affected;

  UPDATE "subjects" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  GET DIAGNOSTICS affected = ROW_COUNT; RAISE NOTICE '  subjects: % rows', affected;

  UPDATE "academic_years" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  GET DIAGNOSTICS affected = ROW_COUNT; RAISE NOTICE '  academic_years: % rows', affected;

  UPDATE "departments" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  GET DIAGNOSTICS affected = ROW_COUNT; RAISE NOTICE '  departments: % rows', affected;

  UPDATE "designations" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  GET DIAGNOSTICS affected = ROW_COUNT; RAISE NOTICE '  designations: % rows', affected;

  -- Student sub-models
  UPDATE "student_addresses" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "student_parents" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "student_health_records" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "student_documents" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "student_timeline_events" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "student_siblings" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;

  -- Staff sub-models
  UPDATE "staff_addresses" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "staff_qualifications" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "staff_bank_details" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;

  -- Attendance
  UPDATE "student_daily_attendance" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "student_attendance_records" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "period_attendance" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "staff_daily_attendance" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "leave_balances" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "leave_requests" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;

  -- Timetable
  UPDATE "rooms" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "period_definitions" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "timetables" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "timetable_entries" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "substitutions" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;

  -- Exams
  UPDATE "exams" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "student_marks" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "grade_scales" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "report_cards" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "bank_questions" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "online_exams" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;

  -- Calendar, Admissions, Settings
  UPDATE "calendar_events" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "admission_applications" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "admission_documents" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "notification_preferences" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "backup_configs" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "theme_configs" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "email_templates" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;

  -- Permissions & Website
  UPDATE "permissions" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "role_permissions" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "website_pages" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "website_sections" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "website_settings" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;
  UPDATE "website_media" SET "organization_id" = default_org_id WHERE "organization_id" IS NULL;

  RAISE NOTICE 'Backfill complete for all tenant-scoped models.';
END $$;
