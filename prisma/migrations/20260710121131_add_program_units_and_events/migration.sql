CREATE TABLE `program_units` (
  `id` VARCHAR(191) NOT NULL,
  `programId` VARCHAR(191) NOT NULL,
  `courseId` VARCHAR(191) NOT NULL,
  `orderIndex` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `program_units_programId_courseId_key`(`programId`, `courseId`),
  INDEX `program_units_courseId_idx`(`courseId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `program_events` (
  `id` VARCHAR(191) NOT NULL,
  `programId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `type` ENUM('WORKSHOP', 'ONLINE_SESSION', 'OTHER') NOT NULL DEFAULT 'WORKSHOP',
  `startAt` DATETIME(3) NOT NULL,
  `endAt` DATETIME(3) NULL,
  `location` VARCHAR(191) NULL,
  `agenda` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `program_events_programId_startAt_idx`(`programId`, `startAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `program_units` ADD CONSTRAINT `program_units_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `programs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `program_units` ADD CONSTRAINT `program_units_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `program_events` ADD CONSTRAINT `program_events_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `programs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
