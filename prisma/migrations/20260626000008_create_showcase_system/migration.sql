-- CreateTable showcase_projects
CREATE TABLE IF NOT EXISTS `showcase_projects` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `tagline` VARCHAR(280) NULL,
    `description` LONGTEXT NOT NULL,
    `thumbnailUrl` VARCHAR(191) NULL,
    `demoUrl` VARCHAR(191) NULL,
    `repoUrl` VARCHAR(191) NULL,
    `videoUrl` VARCHAR(191) NULL,
    `techStack` JSON NOT NULL,
    `track` VARCHAR(100) NULL,
    `status` ENUM('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `viewCount` INT NOT NULL DEFAULT 0,
    `likeCount` INT NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `showcase_projects_userId_idx`(`userId`),
    INDEX `showcase_projects_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable showcase_likes
CREATE TABLE IF NOT EXISTS `showcase_likes` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `showcase_likes_projectId_userId_key`(`projectId`, `userId`),
    INDEX `showcase_likes_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `showcase_projects` ADD CONSTRAINT `showcase_projects_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `showcase_likes` ADD CONSTRAINT `showcase_likes_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `showcase_projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `showcase_likes` ADD CONSTRAINT `showcase_likes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
