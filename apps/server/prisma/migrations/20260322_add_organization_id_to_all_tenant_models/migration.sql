-- ============================================================================
-- Migration: Add organization_id to ALL tenant-scoped models
-- Date: 2026-03-22
-- Description: Adds nullable organization_id columns, indexes, and converts
--              global unique constraints to per-organization scoped constraints.
-- ============================================================================

-- Helper: idempotent column add
-- Usage: SELECT add_column_if_not_exists('table', 'column', 'TEXT');
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
  _table TEXT, _column TEXT, _type TEXT
) RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = _table AND column_name = _column
  ) THEN
    EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', _table, _column, _type);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CORE MODELS
-- ============================================================================

-- Student
SELECT add_column_if_not_exists('students', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "students_organization_id_idx" ON "students"("organization_id");
-- Convert global unique to per-org unique
ALTER TABLE "students" DROP CONSTRAINT IF EXISTS "students_email_key";
ALTER TABLE "students" DROP CONSTRAINT IF EXISTS "students_admission_number_key";
DROP INDEX IF EXISTS "students_organization_id_email_key";
DROP INDEX IF EXISTS "students_organization_id_admission_number_key";
CREATE UNIQUE INDEX "students_organization_id_email_key" ON "students"("organization_id", "email");
CREATE UNIQUE INDEX "students_organization_id_admission_number_key" ON "students"("organization_id", "admission_number");

-- Staff
SELECT add_column_if_not_exists('staff', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "staff_organization_id_idx" ON "staff"("organization_id");
ALTER TABLE "staff" DROP CONSTRAINT IF EXISTS "staff_email_key";
ALTER TABLE "staff" DROP CONSTRAINT IF EXISTS "staff_employee_id_key";
DROP INDEX IF EXISTS "staff_organization_id_email_key";
DROP INDEX IF EXISTS "staff_organization_id_employee_id_key";
CREATE UNIQUE INDEX "staff_organization_id_email_key" ON "staff"("organization_id", "email");
CREATE UNIQUE INDEX "staff_organization_id_employee_id_key" ON "staff"("organization_id", "employee_id");

-- Class
SELECT add_column_if_not_exists('classes', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "classes_organization_id_idx" ON "classes"("organization_id");

-- Section
SELECT add_column_if_not_exists('sections', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "sections_organization_id_idx" ON "sections"("organization_id");

-- Subject
SELECT add_column_if_not_exists('subjects', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "subjects_organization_id_idx" ON "subjects"("organization_id");
ALTER TABLE "subjects" DROP CONSTRAINT IF EXISTS "subjects_code_key";
DROP INDEX IF EXISTS "subjects_organization_id_code_key";
CREATE UNIQUE INDEX "subjects_organization_id_code_key" ON "subjects"("organization_id", "code");

-- AcademicYear
SELECT add_column_if_not_exists('academic_years', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "academic_years_organization_id_idx" ON "academic_years"("organization_id");

-- Department
SELECT add_column_if_not_exists('departments', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "departments_organization_id_idx" ON "departments"("organization_id");
ALTER TABLE "departments" DROP CONSTRAINT IF EXISTS "departments_name_key";
DROP INDEX IF EXISTS "departments_organization_id_name_key";
CREATE UNIQUE INDEX "departments_organization_id_name_key" ON "departments"("organization_id", "name");

-- Designation
SELECT add_column_if_not_exists('designations', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "designations_organization_id_idx" ON "designations"("organization_id");
ALTER TABLE "designations" DROP CONSTRAINT IF EXISTS "designations_name_key";
DROP INDEX IF EXISTS "designations_organization_id_name_key";
CREATE UNIQUE INDEX "designations_organization_id_name_key" ON "designations"("organization_id", "name");

-- ============================================================================
-- STUDENT SUB-MODELS
-- ============================================================================

SELECT add_column_if_not_exists('student_addresses', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "student_addresses_organization_id_idx" ON "student_addresses"("organization_id");

SELECT add_column_if_not_exists('student_parents', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "student_parents_organization_id_idx" ON "student_parents"("organization_id");

SELECT add_column_if_not_exists('student_health_records', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "student_health_records_organization_id_idx" ON "student_health_records"("organization_id");

SELECT add_column_if_not_exists('student_documents', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "student_documents_organization_id_idx" ON "student_documents"("organization_id");

SELECT add_column_if_not_exists('student_timeline_events', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "student_timeline_events_organization_id_idx" ON "student_timeline_events"("organization_id");

SELECT add_column_if_not_exists('student_siblings', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "student_siblings_organization_id_idx" ON "student_siblings"("organization_id");

-- ============================================================================
-- STAFF SUB-MODELS
-- ============================================================================

SELECT add_column_if_not_exists('staff_addresses', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "staff_addresses_organization_id_idx" ON "staff_addresses"("organization_id");

SELECT add_column_if_not_exists('staff_qualifications', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "staff_qualifications_organization_id_idx" ON "staff_qualifications"("organization_id");

SELECT add_column_if_not_exists('staff_bank_details', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "staff_bank_details_organization_id_idx" ON "staff_bank_details"("organization_id");

-- ============================================================================
-- ATTENDANCE MODELS
-- ============================================================================

SELECT add_column_if_not_exists('student_daily_attendance', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "student_daily_attendance_organization_id_idx" ON "student_daily_attendance"("organization_id");

SELECT add_column_if_not_exists('student_attendance_records', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "student_attendance_records_organization_id_idx" ON "student_attendance_records"("organization_id");

SELECT add_column_if_not_exists('period_attendance', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "period_attendance_organization_id_idx" ON "period_attendance"("organization_id");

SELECT add_column_if_not_exists('staff_daily_attendance', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "staff_daily_attendance_organization_id_idx" ON "staff_daily_attendance"("organization_id");

SELECT add_column_if_not_exists('leave_balances', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "leave_balances_organization_id_idx" ON "leave_balances"("organization_id");

SELECT add_column_if_not_exists('leave_requests', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "leave_requests_organization_id_idx" ON "leave_requests"("organization_id");

-- ============================================================================
-- TIMETABLE MODELS
-- ============================================================================

SELECT add_column_if_not_exists('rooms', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "rooms_organization_id_idx" ON "rooms"("organization_id");
ALTER TABLE "rooms" DROP CONSTRAINT IF EXISTS "rooms_name_key";
DROP INDEX IF EXISTS "rooms_organization_id_name_key";
CREATE UNIQUE INDEX "rooms_organization_id_name_key" ON "rooms"("organization_id", "name");

SELECT add_column_if_not_exists('period_definitions', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "period_definitions_organization_id_idx" ON "period_definitions"("organization_id");
ALTER TABLE "period_definitions" DROP CONSTRAINT IF EXISTS "period_definitions_period_number_key";
DROP INDEX IF EXISTS "period_definitions_organization_id_period_number_key";
CREATE UNIQUE INDEX "period_definitions_organization_id_period_number_key" ON "period_definitions"("organization_id", "period_number");

SELECT add_column_if_not_exists('timetables', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "timetables_organization_id_idx" ON "timetables"("organization_id");

SELECT add_column_if_not_exists('timetable_entries', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "timetable_entries_organization_id_idx" ON "timetable_entries"("organization_id");

SELECT add_column_if_not_exists('substitutions', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "substitutions_organization_id_idx" ON "substitutions"("organization_id");

-- ============================================================================
-- EXAM MODELS
-- ============================================================================

SELECT add_column_if_not_exists('exams', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "exams_organization_id_idx" ON "exams"("organization_id");

SELECT add_column_if_not_exists('student_marks', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "student_marks_organization_id_idx" ON "student_marks"("organization_id");

SELECT add_column_if_not_exists('grade_scales', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "grade_scales_organization_id_idx" ON "grade_scales"("organization_id");

SELECT add_column_if_not_exists('report_cards', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "report_cards_organization_id_idx" ON "report_cards"("organization_id");

SELECT add_column_if_not_exists('bank_questions', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "bank_questions_organization_id_idx" ON "bank_questions"("organization_id");

SELECT add_column_if_not_exists('online_exams', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "online_exams_organization_id_idx" ON "online_exams"("organization_id");

-- ============================================================================
-- CALENDAR, ADMISSIONS, SETTINGS
-- ============================================================================

SELECT add_column_if_not_exists('calendar_events', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "calendar_events_organization_id_idx" ON "calendar_events"("organization_id");

SELECT add_column_if_not_exists('admission_applications', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "admission_applications_organization_id_idx" ON "admission_applications"("organization_id");

SELECT add_column_if_not_exists('admission_documents', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "admission_documents_organization_id_idx" ON "admission_documents"("organization_id");

SELECT add_column_if_not_exists('notification_preferences', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "notification_preferences_organization_id_idx" ON "notification_preferences"("organization_id");

SELECT add_column_if_not_exists('backup_configs', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "backup_configs_organization_id_idx" ON "backup_configs"("organization_id");

SELECT add_column_if_not_exists('theme_configs', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "theme_configs_organization_id_idx" ON "theme_configs"("organization_id");

SELECT add_column_if_not_exists('email_templates', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "email_templates_organization_id_idx" ON "email_templates"("organization_id");

-- ============================================================================
-- PERMISSIONS & WEBSITE
-- ============================================================================

SELECT add_column_if_not_exists('permissions', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "permissions_organization_id_idx" ON "permissions"("organization_id");

SELECT add_column_if_not_exists('role_permissions', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "role_permissions_organization_id_idx" ON "role_permissions"("organization_id");

SELECT add_column_if_not_exists('website_pages', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "website_pages_organization_id_idx" ON "website_pages"("organization_id");
ALTER TABLE "website_pages" DROP CONSTRAINT IF EXISTS "website_pages_slug_key";
DROP INDEX IF EXISTS "website_pages_organization_id_slug_key";
CREATE UNIQUE INDEX "website_pages_organization_id_slug_key" ON "website_pages"("organization_id", "slug");

SELECT add_column_if_not_exists('website_sections', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "website_sections_organization_id_idx" ON "website_sections"("organization_id");

SELECT add_column_if_not_exists('website_settings', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "website_settings_organization_id_idx" ON "website_settings"("organization_id");

SELECT add_column_if_not_exists('website_media', 'organization_id', 'TEXT');
CREATE INDEX IF NOT EXISTS "website_media_organization_id_idx" ON "website_media"("organization_id");

-- Cleanup helper function
DROP FUNCTION IF EXISTS add_column_if_not_exists(TEXT, TEXT, TEXT);
