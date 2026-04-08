-- ==================== Finance Extras ====================

CREATE TABLE IF NOT EXISTS "concession_requests" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "student_id" TEXT NOT NULL,
  "student_name" TEXT NOT NULL,
  "fee_structure_id" TEXT,
  "reason" TEXT NOT NULL,
  "concession_type" TEXT NOT NULL DEFAULT 'fixed',
  "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "percentage" DOUBLE PRECISION,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "approved_by" TEXT,
  "approved_by_name" TEXT,
  "remarks" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "discount_rules" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "discount_type" TEXT NOT NULL DEFAULT 'fixed',
  "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "percentage" DOUBLE PRECISION,
  "applicable_to" TEXT NOT NULL DEFAULT 'all',
  "class_id" TEXT,
  "fee_type_id" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "installment_plans" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "number_of_installments" INTEGER NOT NULL DEFAULT 2,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "installment_schedules" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "installment_plan_id" TEXT NOT NULL,
  "installment_number" INTEGER NOT NULL,
  "percentage" DOUBLE PRECISION NOT NULL,
  "due_month" INTEGER NOT NULL,
  "due_day" INTEGER NOT NULL DEFAULT 10,
  CONSTRAINT "installment_schedules_installment_plan_id_fkey"
    FOREIGN KEY ("installment_plan_id") REFERENCES "installment_plans"("id") ON DELETE CASCADE
);

-- ==================== Hostel Extras ====================

CREATE TABLE IF NOT EXISTS "hostels" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'boys',
  "total_rooms" INTEGER NOT NULL DEFAULT 0,
  "capacity" INTEGER NOT NULL DEFAULT 0,
  "warden_name" TEXT,
  "warden_phone" TEXT,
  "address" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "mess_menus" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "hostel_id" TEXT,
  "week_day" TEXT NOT NULL,
  "meal_type" TEXT NOT NULL,
  "items" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "hostel_attendance_records" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "hostel_id" TEXT NOT NULL,
  "student_id" TEXT NOT NULL,
  "student_name" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'present',
  "remarks" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "hostel_fees" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "student_id" TEXT NOT NULL,
  "student_name" TEXT NOT NULL,
  "hostel_id" TEXT NOT NULL,
  "fee_type" TEXT NOT NULL DEFAULT 'monthly',
  "amount" DOUBLE PRECISION NOT NULL,
  "month" INTEGER,
  "year" INTEGER,
  "due_date" TIMESTAMP(3),
  "paid_date" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'pending',
  "payment_ref" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==================== Inventory Extras ====================

CREATE TABLE IF NOT EXISTS "assets" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "asset_code" TEXT,
  "category" TEXT NOT NULL DEFAULT 'furniture',
  "purchase_date" DATE,
  "purchase_price" DOUBLE PRECISION,
  "current_value" DOUBLE PRECISION,
  "depreciation" DOUBLE PRECISION,
  "location" TEXT,
  "assigned_to" TEXT,
  "condition" TEXT NOT NULL DEFAULT 'good',
  "warranty_expiry" DATE,
  "notes" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "vendors" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "contact_person" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "gstin" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "purchase_orders" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "po_number" TEXT NOT NULL,
  "vendor_id" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "notes" TEXT,
  "ordered_date" TIMESTAMP(3),
  "received_date" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "purchase_orders_vendor_id_fkey"
    FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id")
);

CREATE TABLE IF NOT EXISTS "purchase_order_items" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "purchase_order_id" TEXT NOT NULL,
  "item_name" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unit_price" DOUBLE PRECISION NOT NULL,
  "total_price" DOUBLE PRECISION NOT NULL,
  "received_qty" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "purchase_order_items_purchase_order_id_fkey"
    FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE
);

-- ==================== Salary Management ====================

CREATE TABLE IF NOT EXISTS "salary_structures" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "staff_id" TEXT NOT NULL UNIQUE,
  "basic_salary" DOUBLE PRECISION NOT NULL,
  "hra" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "da" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "ta" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "other_allowances" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "gross_salary" DOUBLE PRECISION NOT NULL,
  "pf_employee" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "pf_employer" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "esi" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "tds" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "net_salary" DOUBLE PRECISION NOT NULL,
  "effective_from" DATE NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "salary_slips" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "staff_id" TEXT NOT NULL,
  "staff_name" TEXT NOT NULL,
  "month" INTEGER NOT NULL,
  "year" INTEGER NOT NULL,
  "gross_salary" DOUBLE PRECISION NOT NULL,
  "total_deductions" DOUBLE PRECISION NOT NULL,
  "net_salary" DOUBLE PRECISION NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "paid_date" TIMESTAMP(3),
  "payment_ref" TEXT,
  "breakdown" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("organization_id", "staff_id", "month", "year")
);

CREATE TABLE IF NOT EXISTS "payroll_deductions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "staff_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "description" TEXT,
  "month" INTEGER NOT NULL,
  "year" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==================== Alumni Extras ====================

CREATE TABLE IF NOT EXISTS "alumni_contributions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "alumni_id" TEXT,
  "alumni_name" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'donation',
  "amount" DOUBLE PRECISION,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "received_date" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "alumni_events" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "type" TEXT NOT NULL DEFAULT 'reunion',
  "date" TIMESTAMP(3) NOT NULL,
  "venue" TEXT,
  "is_online" BOOLEAN NOT NULL DEFAULT false,
  "meet_link" TEXT,
  "status" TEXT NOT NULL DEFAULT 'upcoming',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "alumni_event_registrations" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "event_id" TEXT NOT NULL,
  "alumni_id" TEXT NOT NULL,
  "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("event_id", "alumni_id"),
  CONSTRAINT "alumni_event_registrations_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "alumni_events"("id") ON DELETE CASCADE
);

-- ==================== Behavior Extras ====================

CREATE TABLE IF NOT EXISTS "detentions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "student_id" TEXT NOT NULL,
  "student_name" TEXT NOT NULL,
  "class_name" TEXT,
  "reason" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "start_time" TEXT,
  "end_time" TEXT,
  "supervisor_name" TEXT,
  "status" TEXT NOT NULL DEFAULT 'scheduled',
  "parent_notified" BOOLEAN NOT NULL DEFAULT false,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "disciplinary_actions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "student_id" TEXT NOT NULL,
  "student_name" TEXT NOT NULL,
  "incident_id" TEXT,
  "action_type" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "issued_by_name" TEXT,
  "issued_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "appeal_text" TEXT,
  "appeal_status" TEXT NOT NULL DEFAULT 'none',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "behavior_points" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "student_id" TEXT NOT NULL,
  "student_name" TEXT NOT NULL,
  "class_name" TEXT,
  "type" TEXT NOT NULL,
  "points" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "awarded_by_name" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
