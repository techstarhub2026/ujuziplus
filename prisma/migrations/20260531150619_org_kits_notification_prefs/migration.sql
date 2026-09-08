-- CreateTable
CREATE TABLE `notification_preferences` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `emailEnabled` BOOLEAN NOT NULL DEFAULT true,
    `inAppEnabled` BOOLEAN NOT NULL DEFAULT true,
    `pushEnabled` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `notification_preferences_userId_category_key`(`userId`, `category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `organizations` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('UNIVERSITY', 'HUB', 'SCHOOL', 'OTHER') NOT NULL DEFAULT 'UNIVERSITY',
    `logoUrl` VARCHAR(191) NULL,
    `memberCount` INTEGER NOT NULL DEFAULT 0,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `organizations_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `organization_members` (
    `id` VARCHAR(191) NOT NULL,
    `orgId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'INSTRUCTOR', 'MEMBER') NOT NULL DEFAULT 'MEMBER',

    UNIQUE INDEX `organization_members_orgId_userId_key`(`orgId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `org_kit_inventory` (
    `id` VARCHAR(191) NOT NULL,
    `orgId` VARCHAR(191) NOT NULL,
    `kitId` VARCHAR(191) NOT NULL,
    `quantityOnHand` INTEGER NOT NULL DEFAULT 0,
    `quantityAllocated` INTEGER NOT NULL DEFAULT 0,
    `reorderLevel` INTEGER NOT NULL DEFAULT 5,

    UNIQUE INDEX `org_kit_inventory_orgId_kitId_key`(`orgId`, `kitId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `org_kit_requests` (
    `id` VARCHAR(191) NOT NULL,
    `orgId` VARCHAR(191) NOT NULL,
    `kitId` VARCHAR(191) NOT NULL,
    `requesterId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('PENDING', 'APPROVED', 'FULFILLED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `organization_members` ADD CONSTRAINT `organization_members_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `organization_members` ADD CONSTRAINT `organization_members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `org_kit_inventory` ADD CONSTRAINT `org_kit_inventory_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `org_kit_inventory` ADD CONSTRAINT `org_kit_inventory_kitId_fkey` FOREIGN KEY (`kitId`) REFERENCES `kits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `org_kit_requests` ADD CONSTRAINT `org_kit_requests_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `org_kit_requests` ADD CONSTRAINT `org_kit_requests_kitId_fkey` FOREIGN KEY (`kitId`) REFERENCES `kits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `org_kit_requests` ADD CONSTRAINT `org_kit_requests_requesterId_fkey` FOREIGN KEY (`requesterId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
