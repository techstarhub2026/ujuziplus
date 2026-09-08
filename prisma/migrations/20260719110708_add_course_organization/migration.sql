ALTER TABLE `courses` ADD COLUMN `organizationId` VARCHAR(191) NULL;

CREATE INDEX `courses_organizationId_idx` ON `courses`(`organizationId`);

ALTER TABLE `courses` ADD CONSTRAINT `courses_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
