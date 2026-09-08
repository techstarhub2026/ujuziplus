-- Rich community posts + author follows
ALTER TABLE `discussions` ADD COLUMN `excerpt` TEXT NULL;
ALTER TABLE `discussions` ADD COLUMN `coverImageUrl` VARCHAR(191) NULL;

CREATE TABLE `user_follows` (
    `id` VARCHAR(191) NOT NULL,
    `followerId` VARCHAR(191) NOT NULL,
    `followingId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_follows_followerId_followingId_key`(`followerId`, `followingId`),
    INDEX `user_follows_followingId_idx`(`followingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `user_follows` ADD CONSTRAINT `user_follows_followerId_fkey` FOREIGN KEY (`followerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `user_follows` ADD CONSTRAINT `user_follows_followingId_fkey` FOREIGN KEY (`followingId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
