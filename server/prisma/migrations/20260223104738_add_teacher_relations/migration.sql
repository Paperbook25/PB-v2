-- CreateIndex
CREATE INDEX `substitutions_original_teacher_id_idx` ON `substitutions`(`original_teacher_id`);

-- CreateIndex
CREATE INDEX `substitutions_substitute_teacher_id_idx` ON `substitutions`(`substitute_teacher_id`);

-- AddForeignKey
ALTER TABLE `timetable_entries` ADD CONSTRAINT `timetable_entries_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `staff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `substitutions` ADD CONSTRAINT `substitutions_original_teacher_id_fkey` FOREIGN KEY (`original_teacher_id`) REFERENCES `staff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `substitutions` ADD CONSTRAINT `substitutions_substitute_teacher_id_fkey` FOREIGN KEY (`substitute_teacher_id`) REFERENCES `staff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
