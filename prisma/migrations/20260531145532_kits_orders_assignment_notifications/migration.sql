-- DropForeignKey
ALTER TABLE `order_items` DROP FOREIGN KEY `order_items_courseId_fkey`;

-- AlterTable
ALTER TABLE `notifications` MODIFY `type` ENUM('REPLY_ON_POST', 'LIKE_ON_POST', 'NEW_ENROLLMENT', 'COURSE_COMPLETE', 'CERTIFICATE_ISSUED', 'ASSIGNMENT_SUBMITTED', 'ASSIGNMENT_GRADED', 'ASSIGNMENT_REVISION_REQUESTED', 'SYSTEM') NOT NULL;

-- AlterTable
ALTER TABLE `order_items` ADD COLUMN `kitId` VARCHAR(191) NULL,
    MODIFY `courseId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `kit_purchases` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `kitId` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NULL,
    `purchasedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `kit_purchases_userId_kitId_key`(`userId`, `kitId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_kitId_fkey` FOREIGN KEY (`kitId`) REFERENCES `kits`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kit_purchases` ADD CONSTRAINT `kit_purchases_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kit_purchases` ADD CONSTRAINT `kit_purchases_kitId_fkey` FOREIGN KEY (`kitId`) REFERENCES `kits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
