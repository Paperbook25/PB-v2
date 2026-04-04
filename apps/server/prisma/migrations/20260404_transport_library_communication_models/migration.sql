-- Transport Vehicles
CREATE TABLE IF NOT EXISTS "transport_vehicles" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "vehicle_number" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'bus',
    "capacity" INTEGER NOT NULL DEFAULT 40,
    "make" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "registration_number" TEXT,
    "insurance_number" TEXT,
    "insurance_expiry" TIMESTAMP(3),
    "fitness_expiry" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "transport_vehicles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "transport_vehicles_organization_id_vehicle_number_key" ON "transport_vehicles"("organization_id", "vehicle_number");
CREATE INDEX IF NOT EXISTS "transport_vehicles_organization_id_idx" ON "transport_vehicles"("organization_id");

-- Transport Drivers
CREATE TABLE IF NOT EXISTS "transport_drivers" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "license_number" TEXT,
    "license_expiry" TIMESTAMP(3),
    "address" TEXT,
    "experience" INTEGER,
    "photo_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "transport_drivers_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "transport_drivers_organization_id_idx" ON "transport_drivers"("organization_id");

-- Transport Assignments
CREATE TABLE IF NOT EXISTS "transport_assignments" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "stop_id" TEXT,
    "pickup_type" TEXT NOT NULL DEFAULT 'both',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "transport_assignments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "transport_assignments_organization_id_student_id_key" ON "transport_assignments"("organization_id", "student_id");
CREATE INDEX IF NOT EXISTS "transport_assignments_route_id_idx" ON "transport_assignments"("route_id");

-- Library Fines
CREATE TABLE IF NOT EXISTS "library_fines" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "issue_id" TEXT NOT NULL,
    "borrower_id" TEXT,
    "borrower_name" TEXT,
    "amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "reason" TEXT NOT NULL DEFAULT 'overdue',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "library_fines_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "library_fines_organization_id_status_idx" ON "library_fines"("organization_id", "status");
CREATE INDEX IF NOT EXISTS "library_fines_issue_id_idx" ON "library_fines"("issue_id");

-- Library Reservations
CREATE TABLE IF NOT EXISTS "library_reservations" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "student_id" TEXT,
    "student_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "reserved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "library_reservations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "library_reservations_organization_id_status_idx" ON "library_reservations"("organization_id", "status");
CREATE INDEX IF NOT EXISTS "library_reservations_book_id_idx" ON "library_reservations"("book_id");

-- Surveys
CREATE TABLE IF NOT EXISTS "surveys" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "target_audience" TEXT NOT NULL DEFAULT 'all',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "questions" JSONB,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "surveys_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "surveys_organization_id_status_idx" ON "surveys"("organization_id", "status");

-- Survey Responses
CREATE TABLE IF NOT EXISTS "survey_responses" (
    "id" TEXT NOT NULL,
    "survey_id" TEXT NOT NULL,
    "respondent_id" TEXT,
    "respondent_name" TEXT,
    "answers" JSONB NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "survey_responses_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "survey_responses_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "survey_responses_survey_id_idx" ON "survey_responses"("survey_id");

-- School Events
CREATE TABLE IF NOT EXISTS "school_events" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_type" TEXT NOT NULL DEFAULT 'general',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "location" TEXT,
    "is_all_day" BOOLEAN NOT NULL DEFAULT false,
    "target_audience" TEXT NOT NULL DEFAULT 'all',
    "max_attendees" INTEGER,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "school_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "school_events_organization_id_start_date_idx" ON "school_events"("organization_id", "start_date");

-- Event Registrations
CREATE TABLE IF NOT EXISTS "event_registrations" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'registered',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "event_registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "school_events"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "event_registrations_event_id_user_id_key" ON "event_registrations"("event_id", "user_id");
