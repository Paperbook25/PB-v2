-- CreateTable
CREATE TABLE `fee_types` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` ENUM('fee_tuition', 'fee_development', 'fee_lab', 'fee_library', 'fee_sports', 'fee_computer', 'fee_transport', 'fee_examination', 'fee_other') NOT NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `fee_types_category_idx`(`category`),
    INDEX `fee_types_is_active_idx`(`is_active`),
    UNIQUE INDEX `fee_types_name_category_key`(`name`, `category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fee_structures` (
    `id` VARCHAR(191) NOT NULL,
    `fee_type_id` VARCHAR(191) NOT NULL,
    `academic_year` VARCHAR(191) NOT NULL,
    `applicable_classes` JSON NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `frequency` ENUM('freq_monthly', 'freq_quarterly', 'freq_half_yearly', 'freq_annual', 'freq_one_time') NOT NULL,
    `due_day` INTEGER NOT NULL DEFAULT 10,
    `is_optional` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `fee_structures_fee_type_id_idx`(`fee_type_id`),
    INDEX `fee_structures_academic_year_idx`(`academic_year`),
    INDEX `fee_structures_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_fees` (
    `id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `fee_structure_id` VARCHAR(191) NOT NULL,
    `fee_type_id` VARCHAR(191) NOT NULL,
    `academic_year` VARCHAR(191) NOT NULL,
    `total_amount` DECIMAL(12, 2) NOT NULL,
    `paid_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `discount_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `due_date` DATE NOT NULL,
    `status` ENUM('fps_pending', 'fps_partial', 'fps_paid', 'fps_overdue', 'fps_waived') NOT NULL DEFAULT 'fps_pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `student_fees_student_id_idx`(`student_id`),
    INDEX `student_fees_fee_structure_id_idx`(`fee_structure_id`),
    INDEX `student_fees_status_idx`(`status`),
    INDEX `student_fees_due_date_idx`(`due_date`),
    INDEX `student_fees_academic_year_idx`(`academic_year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `receipt_number` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `student_fee_id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `payment_mode` ENUM('pm_cash', 'pm_upi', 'pm_bank_transfer', 'pm_cheque', 'pm_dd', 'pm_online') NOT NULL,
    `transaction_ref` VARCHAR(191) NULL,
    `remarks` TEXT NULL,
    `collected_by` VARCHAR(191) NULL,
    `collected_by_id` VARCHAR(191) NULL,
    `collected_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payments_receipt_number_key`(`receipt_number`),
    INDEX `payments_student_id_idx`(`student_id`),
    INDEX `payments_student_fee_id_idx`(`student_fee_id`),
    INDEX `payments_receipt_number_idx`(`receipt_number`),
    INDEX `payments_collected_at_idx`(`collected_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expenses` (
    `id` VARCHAR(191) NOT NULL,
    `expense_number` VARCHAR(191) NOT NULL,
    `category` ENUM('exp_salary', 'exp_utilities', 'exp_maintenance', 'exp_supplies', 'exp_infrastructure', 'exp_events', 'exp_other') NOT NULL,
    `description` TEXT NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `vendor_name` VARCHAR(191) NULL,
    `invoice_number` VARCHAR(191) NULL,
    `invoice_date` DATE NULL,
    `status` ENUM('es_pending_approval', 'es_approved', 'es_rejected', 'es_paid') NOT NULL DEFAULT 'es_pending_approval',
    `requested_by` VARCHAR(191) NULL,
    `requested_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `approved_by` VARCHAR(191) NULL,
    `approved_at` DATETIME(3) NULL,
    `rejected_by` VARCHAR(191) NULL,
    `rejected_at` DATETIME(3) NULL,
    `rejected_reason` TEXT NULL,
    `paid_at` DATETIME(3) NULL,
    `paid_by` VARCHAR(191) NULL,
    `paid_ref` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `expenses_expense_number_key`(`expense_number`),
    INDEX `expenses_category_idx`(`category`),
    INDEX `expenses_status_idx`(`status`),
    INDEX `expenses_requested_at_idx`(`requested_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ledger_entries` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `type` ENUM('ledger_credit', 'ledger_debit') NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `reference_id` VARCHAR(191) NULL,
    `reference_number` VARCHAR(191) NULL,
    `description` TEXT NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `balance` DECIMAL(14, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ledger_entries_date_idx`(`date`),
    INDEX `ledger_entries_type_idx`(`type`),
    INDEX `ledger_entries_category_idx`(`category`),
    INDEX `ledger_entries_reference_id_idx`(`reference_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `fee_structures` ADD CONSTRAINT `fee_structures_fee_type_id_fkey` FOREIGN KEY (`fee_type_id`) REFERENCES `fee_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_fees` ADD CONSTRAINT `student_fees_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_fees` ADD CONSTRAINT `student_fees_fee_structure_id_fkey` FOREIGN KEY (`fee_structure_id`) REFERENCES `fee_structures`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_student_fee_id_fkey` FOREIGN KEY (`student_fee_id`) REFERENCES `student_fees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
