-- AlterTable
ALTER TABLE `programs` ADD COLUMN `organizationId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `programs` ADD CONSTRAINT `programs_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX `programs_organizationId_idx` ON `programs`(`organizationId`);
