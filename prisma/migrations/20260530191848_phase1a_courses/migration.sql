-- CreateTable
CREATE TABLE `courses` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `thumbnailUrl` VARCHAR(191) NULL,
    `instructorId` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NULL,
    `level` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NOT NULL DEFAULT 'BEGINNER',
    `language` VARCHAR(191) NOT NULL DEFAULT 'English',
    `price` DECIMAL(10, 2) NULL,
    `discountPrice` DECIMAL(10, 2) NULL,
    `isFree` BOOLEAN NOT NULL DEFAULT false,
    `durationHours` DOUBLE NOT NULL DEFAULT 0,
    `status` ENUM('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `whatYouLearn` JSON NULL,
    `prerequisites` TEXT NULL,
    `targetAudience` VARCHAR(191) NULL,
    `linkedKitSlugs` JSON NULL,
    `metaTitle` VARCHAR(191) NULL,
    `metaDesc` VARCHAR(191) NULL,
    `enableCert` BOOLEAN NOT NULL DEFAULT true,
    `reviewNote` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `courses_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_modules` (
    `id` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lessons` (
    `id` VARCHAR(191) NOT NULL,
    `moduleId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `type` ENUM('VIDEO', 'ARTICLE', 'QUIZ', 'ASSIGNMENT') NOT NULL DEFAULT 'VIDEO',
    `videoUrl` VARCHAR(191) NULL,
    `articleBody` MEDIUMTEXT NULL,
    `durationSeconds` INTEGER NULL,
    `isFreePreview` BOOLEAN NOT NULL DEFAULT false,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_modules` ADD CONSTRAINT `course_modules_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lessons` ADD CONSTRAINT `lessons_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `course_modules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
