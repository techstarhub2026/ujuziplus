ALTER TABLE `order_items` ADD COLUMN `programId` VARCHAR(191) NULL;
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `programs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
