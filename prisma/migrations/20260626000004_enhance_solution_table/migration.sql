-- AlterTable
ALTER TABLE `solutions` ADD COLUMN `thumbnailUrl` VARCHAR(191) NULL,
ADD COLUMN `tags` JSON NULL,
ADD COLUMN `authorId` VARCHAR(191) NULL,
ADD COLUMN `orgId` VARCHAR(191) NULL,
ADD COLUMN `rejectionReason` TEXT NULL,
ADD COLUMN `viewCount` INT NOT NULL DEFAULT 0;

-- Update SolutionStatus enum
ALTER TABLE `solutions` MODIFY `status` ENUM('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT';

-- Add foreign keys
ALTER TABLE `solutions` ADD CONSTRAINT `solutions_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `solutions` ADD CONSTRAINT `solutions_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `organizations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Add indexes
CREATE INDEX `solutions_authorId_idx` ON `solutions`(`authorId`);
CREATE INDEX `solutions_orgId_idx` ON `solutions`(`orgId`);
