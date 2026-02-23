-- CreateTable
CREATE TABLE `student_daily_attendance` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `class_id` VARCHAR(191) NOT NULL,
    `section_id` VARCHAR(191) NOT NULL,
    `marked_by` VARCHAR(191) NULL,
    `total_students` INTEGER NOT NULL DEFAULT 0,
    `present_count` INTEGER NOT NULL DEFAULT 0,
    `absent_count` INTEGER NOT NULL DEFAULT 0,
    `late_count` INTEGER NOT NULL DEFAULT 0,
    `half_day_count` INTEGER NOT NULL DEFAULT 0,
    `excused_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `student_daily_attendance_class_id_idx`(`class_id`),
    INDEX `student_daily_attendance_section_id_idx`(`section_id`),
    INDEX `student_daily_attendance_date_idx`(`date`),
    UNIQUE INDEX `student_daily_attendance_date_class_id_section_id_key`(`date`, `class_id`, `section_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_attendance_records` (
    `id` VARCHAR(191) NOT NULL,
    `daily_attendance_id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `status` ENUM('att_present', 'att_absent', 'att_late', 'att_half_day', 'att_excused') NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `student_attendance_records_daily_attendance_id_idx`(`daily_attendance_id`),
    INDEX `student_attendance_records_student_id_idx`(`student_id`),
    UNIQUE INDEX `student_attendance_records_daily_attendance_id_student_id_key`(`daily_attendance_id`, `student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `period_definitions` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `period_number` INTEGER NOT NULL,
    `start_time` VARCHAR(10) NOT NULL,
    `end_time` VARCHAR(10) NOT NULL,
    `type` ENUM('period_class', 'period_break', 'period_lunch', 'period_assembly', 'period_activity') NOT NULL DEFAULT 'period_class',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `period_definitions_period_number_key`(`period_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `period_attendance` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `class_id` VARCHAR(191) NOT NULL,
    `section_id` VARCHAR(191) NOT NULL,
    `period_id` VARCHAR(191) NOT NULL,
    `subject_id` VARCHAR(191) NULL,
    `teacher_id` VARCHAR(191) NULL,
    `records` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `period_attendance_class_id_idx`(`class_id`),
    INDEX `period_attendance_section_id_idx`(`section_id`),
    INDEX `period_attendance_period_id_idx`(`period_id`),
    INDEX `period_attendance_date_idx`(`date`),
    UNIQUE INDEX `period_attendance_date_class_id_section_id_period_id_key`(`date`, `class_id`, `section_id`, `period_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staff_daily_attendance` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `staff_id` VARCHAR(191) NOT NULL,
    `status` ENUM('staff_present', 'staff_absent', 'staff_half_day', 'staff_on_leave') NOT NULL,
    `check_in_time` VARCHAR(10) NULL,
    `check_out_time` VARCHAR(10) NULL,
    `remarks` VARCHAR(191) NULL,
    `marked_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `staff_daily_attendance_staff_id_idx`(`staff_id`),
    INDEX `staff_daily_attendance_date_idx`(`date`),
    UNIQUE INDEX `staff_daily_attendance_date_staff_id_key`(`date`, `staff_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leave_balances` (
    `id` VARCHAR(191) NOT NULL,
    `staff_id` VARCHAR(191) NOT NULL,
    `type` ENUM('EL', 'CL', 'SL', 'PL') NOT NULL,
    `academic_year_id` VARCHAR(191) NOT NULL,
    `total` INTEGER NOT NULL DEFAULT 0,
    `used` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `leave_balances_staff_id_idx`(`staff_id`),
    INDEX `leave_balances_academic_year_id_idx`(`academic_year_id`),
    UNIQUE INDEX `leave_balances_staff_id_type_academic_year_id_key`(`staff_id`, `type`, `academic_year_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leave_requests` (
    `id` VARCHAR(191) NOT NULL,
    `staff_id` VARCHAR(191) NOT NULL,
    `type` ENUM('EL', 'CL', 'SL', 'PL') NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `days` DOUBLE NOT NULL,
    `reason` TEXT NULL,
    `status` ENUM('leave_pending', 'leave_approved', 'leave_rejected', 'leave_cancelled') NOT NULL DEFAULT 'leave_pending',
    `reviewed_by` VARCHAR(191) NULL,
    `review_remarks` TEXT NULL,
    `reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `leave_requests_staff_id_idx`(`staff_id`),
    INDEX `leave_requests_status_idx`(`status`),
    INDEX `leave_requests_start_date_end_date_idx`(`start_date`, `end_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rooms` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('room_classroom', 'room_lab', 'room_library', 'room_auditorium', 'room_sports') NOT NULL DEFAULT 'room_classroom',
    `capacity` INTEGER NULL,
    `building` VARCHAR(191) NULL,
    `floor` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `rooms_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `timetables` (
    `id` VARCHAR(191) NOT NULL,
    `class_id` VARCHAR(191) NOT NULL,
    `section_id` VARCHAR(191) NOT NULL,
    `academic_year_id` VARCHAR(191) NOT NULL,
    `effective_from` DATE NULL,
    `status` ENUM('tt_draft', 'tt_published', 'tt_archived') NOT NULL DEFAULT 'tt_draft',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `timetables_class_id_idx`(`class_id`),
    INDEX `timetables_section_id_idx`(`section_id`),
    INDEX `timetables_academic_year_id_idx`(`academic_year_id`),
    INDEX `timetables_status_idx`(`status`),
    UNIQUE INDEX `timetables_class_id_section_id_academic_year_id_key`(`class_id`, `section_id`, `academic_year_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `timetable_entries` (
    `id` VARCHAR(191) NOT NULL,
    `timetable_id` VARCHAR(191) NOT NULL,
    `day_of_week` ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday') NOT NULL,
    `period_id` VARCHAR(191) NOT NULL,
    `subject_id` VARCHAR(191) NULL,
    `teacher_id` VARCHAR(191) NULL,
    `room_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `timetable_entries_timetable_id_idx`(`timetable_id`),
    INDEX `timetable_entries_period_id_idx`(`period_id`),
    INDEX `timetable_entries_subject_id_idx`(`subject_id`),
    INDEX `timetable_entries_teacher_id_idx`(`teacher_id`),
    INDEX `timetable_entries_room_id_idx`(`room_id`),
    UNIQUE INDEX `timetable_entries_timetable_id_day_of_week_period_id_key`(`timetable_id`, `day_of_week`, `period_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `substitutions` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `timetable_entry_id` VARCHAR(191) NOT NULL,
    `original_teacher_id` VARCHAR(191) NULL,
    `substitute_teacher_id` VARCHAR(191) NULL,
    `reason` VARCHAR(191) NULL,
    `status` ENUM('sub_pending', 'sub_approved', 'sub_rejected', 'sub_completed') NOT NULL DEFAULT 'sub_pending',
    `approved_by` VARCHAR(191) NULL,
    `approved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `substitutions_timetable_entry_id_idx`(`timetable_entry_id`),
    INDEX `substitutions_date_idx`(`date`),
    INDEX `substitutions_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `student_daily_attendance` ADD CONSTRAINT `student_daily_attendance_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_daily_attendance` ADD CONSTRAINT `student_daily_attendance_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_attendance_records` ADD CONSTRAINT `student_attendance_records_daily_attendance_id_fkey` FOREIGN KEY (`daily_attendance_id`) REFERENCES `student_daily_attendance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_attendance_records` ADD CONSTRAINT `student_attendance_records_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `period_attendance` ADD CONSTRAINT `period_attendance_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `period_attendance` ADD CONSTRAINT `period_attendance_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `period_attendance` ADD CONSTRAINT `period_attendance_period_id_fkey` FOREIGN KEY (`period_id`) REFERENCES `period_definitions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `period_attendance` ADD CONSTRAINT `period_attendance_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff_daily_attendance` ADD CONSTRAINT `staff_daily_attendance_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_balances` ADD CONSTRAINT `leave_balances_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_balances` ADD CONSTRAINT `leave_balances_academic_year_id_fkey` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_requests` ADD CONSTRAINT `leave_requests_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `timetables` ADD CONSTRAINT `timetables_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `timetables` ADD CONSTRAINT `timetables_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `timetables` ADD CONSTRAINT `timetables_academic_year_id_fkey` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `timetable_entries` ADD CONSTRAINT `timetable_entries_timetable_id_fkey` FOREIGN KEY (`timetable_id`) REFERENCES `timetables`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `timetable_entries` ADD CONSTRAINT `timetable_entries_period_id_fkey` FOREIGN KEY (`period_id`) REFERENCES `period_definitions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `timetable_entries` ADD CONSTRAINT `timetable_entries_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `timetable_entries` ADD CONSTRAINT `timetable_entries_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `substitutions` ADD CONSTRAINT `substitutions_timetable_entry_id_fkey` FOREIGN KEY (`timetable_entry_id`) REFERENCES `timetable_entries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
