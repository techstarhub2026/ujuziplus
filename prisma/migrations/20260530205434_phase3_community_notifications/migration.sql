-- CreateTable
CREATE TABLE `discussions` (
    `id` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NULL,
    `channel` VARCHAR(100) NOT NULL DEFAULT 'general',
    `title` VARCHAR(255) NOT NULL,
    `body` TEXT NOT NULL,
    `isPinned` BOOLEAN NOT NULL DEFAULT false,
    `isResolved` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `discussions_channel_idx`(`channel`),
    INDEX `discussions_courseId_idx`(`courseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `discussion_replies` (
    `id` VARCHAR(191) NOT NULL,
    `discussionId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `isAccepted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `discussion_likes` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `discussionId` VARCHAR(191) NULL,
    `replyId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `discussion_likes_userId_discussionId_key`(`userId`, `discussionId`),
    UNIQUE INDEX `discussion_likes_userId_replyId_key`(`userId`, `replyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('REPLY_ON_POST', 'LIKE_ON_POST', 'NEW_ENROLLMENT', 'COURSE_COMPLETE', 'CERTIFICATE_ISSUED', 'SYSTEM') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `href` VARCHAR(500) NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_userId_isRead_idx`(`userId`, `isRead`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `discussions` ADD CONSTRAINT `discussions_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `discussions` ADD CONSTRAINT `discussions_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `discussion_replies` ADD CONSTRAINT `discussion_replies_discussionId_fkey` FOREIGN KEY (`discussionId`) REFERENCES `discussions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `discussion_replies` ADD CONSTRAINT `discussion_replies_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `discussion_likes` ADD CONSTRAINT `discussion_likes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `discussion_likes` ADD CONSTRAINT `discussion_likes_discussionId_fkey` FOREIGN KEY (`discussionId`) REFERENCES `discussions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `discussion_likes` ADD CONSTRAINT `discussion_likes_replyId_fkey` FOREIGN KEY (`replyId`) REFERENCES `discussion_replies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
