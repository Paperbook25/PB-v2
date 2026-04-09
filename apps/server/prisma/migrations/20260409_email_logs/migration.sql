-- Email Logs table for tracking all sent/failed/skipped emails
CREATE TABLE IF NOT EXISTS "email_logs" (
  "id"         TEXT        NOT NULL,
  "to"         TEXT        NOT NULL,
  "subject"    TEXT        NOT NULL,
  "template"   TEXT        NOT NULL,
  "status"     TEXT        NOT NULL DEFAULT 'sent',
  "message_id" TEXT,
  "error"      TEXT,
  "metadata"   JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "email_logs_template_idx" ON "email_logs"("template");
CREATE INDEX IF NOT EXISTS "email_logs_status_idx"   ON "email_logs"("status");
CREATE INDEX IF NOT EXISTS "email_logs_created_at_idx" ON "email_logs"("created_at");
