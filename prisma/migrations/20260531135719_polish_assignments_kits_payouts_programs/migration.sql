-- CreateTable
CREATE TABLE `assignments` (
    `id` VARCHAR(191) NOT NULL,
    `lessonId` VARCHAR(191) NOT NULL,
    `instructions` TEXT NULL,
    `rubric` JSON NULL,
    `maxScore` INTEGER NOT NULL DEFAULT 100,
    `dueAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `assignments_lessonId_key`(`lessonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assignment_submissions` (
    `id` VARCHAR(191) NOT NULL,
    `assignmentId` VARCHAR(191) NOT NULL,
    `enrollmentId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'REVISION_REQUESTED', 'GRADED') NOT NULL DEFAULT 'DRAFT',
    `textResponse` TEXT NULL,
    `githubUrl` VARCHAR(500) NULL,
    `score` INTEGER NULL,
    `feedback` TEXT NULL,
    `submittedAt` DATETIME(3) NULL,
    `gradedAt` DATETIME(3) NULL,
    `gradedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `assignment_submissions_assignmentId_enrollmentId_key`(`assignmentId`, `enrollmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assignment_submission_files` (
    `id` VARCHAR(191) NOT NULL,
    `submissionId` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(255) NOT NULL,
    `filePath` VARCHAR(500) NOT NULL,
    `mimeType` VARCHAR(100) NULL,
    `sizeBytes` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instructor_payout_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `preferredMethod` ENUM('MPESA', 'BANK_TRANSFER') NOT NULL DEFAULT 'MPESA',
    `mpesaPhone` VARCHAR(20) NULL,
    `bankName` VARCHAR(100) NULL,
    `bankAccountName` VARCHAR(100) NULL,
    `bankAccountNumber` VARCHAR(50) NULL,
    `bankSwift` VARCHAR(20) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `instructor_payout_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instructor_payouts` (
    `id` VARCHAR(191) NOT NULL,
    `instructorId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `method` ENUM('MPESA', 'BANK_TRANSFER') NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `note` TEXT NULL,
    `processedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `instructor_payouts_instructorId_idx`(`instructorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kits` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `thumbnailUrl` VARCHAR(191) NULL,
    `category` VARCHAR(100) NULL,
    `difficulty` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NOT NULL DEFAULT 'BEGINNER',
    `ageRange` VARCHAR(50) NULL,
    `price` DECIMAL(10, 2) NULL,
    `isFree` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `learningOutcomes` JSON NULL,
    `projectIdeas` JSON NULL,
    `relatedCourseSlugs` JSON NULL,
    `inventoryCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `kits_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kit_components` (
    `id` VARCHAR(191) NOT NULL,
    `kitId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `description` TEXT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kit_materials` (
    `id` VARCHAR(191) NOT NULL,
    `kitId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `type` ENUM('GUIDE', 'VIDEO', 'PDF', 'WORKSHEET', 'PROJECT') NOT NULL DEFAULT 'GUIDE',
    `description` TEXT NULL,
    `url` VARCHAR(191) NULL,
    `durationMinutes` INTEGER NULL,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kit_gallery_images` (
    `id` VARCHAR(191) NOT NULL,
    `kitId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `caption` VARCHAR(255) NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wishlist_items` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `wishlist_items_userId_courseId_key`(`userId`, `courseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `programs` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `format` ENUM('ONLINE', 'IN_PERSON', 'HYBRID') NOT NULL DEFAULT 'HYBRID',
    `seats` INTEGER NOT NULL DEFAULT 50,
    `enrolledCount` INTEGER NOT NULL DEFAULT 0,
    `price` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `status` ENUM('DRAFT', 'OPEN', 'FULL', 'CLOSED', 'ARCHIVED') NOT NULL DEFAULT 'OPEN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `programs_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `program_registrations` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `programId` VARCHAR(191) NOT NULL,
    `registeredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `program_registrations_userId_programId_key`(`userId`, `programId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `competitions` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `prize` VARCHAR(255) NULL,
    `teamsCount` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('UPCOMING', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'UPCOMING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `competitions_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `competition_registrations` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `competitionId` VARCHAR(191) NOT NULL,
    `teamName` VARCHAR(100) NULL,
    `registeredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `competition_registrations_userId_competitionId_key`(`userId`, `competitionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `lessons`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignment_submissions` ADD CONSTRAINT `assignment_submissions_assignmentId_fkey` FOREIGN KEY (`assignmentId`) REFERENCES `assignments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignment_submissions` ADD CONSTRAINT `assignment_submissions_enrollmentId_fkey` FOREIGN KEY (`enrollmentId`) REFERENCES `enrollments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignment_submissions` ADD CONSTRAINT `assignment_submissions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignment_submissions` ADD CONSTRAINT `assignment_submissions_gradedById_fkey` FOREIGN KEY (`gradedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignment_submission_files` ADD CONSTRAINT `assignment_submission_files_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `assignment_submissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instructor_payout_profiles` ADD CONSTRAINT `instructor_payout_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instructor_payouts` ADD CONSTRAINT `instructor_payouts_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kit_components` ADD CONSTRAINT `kit_components_kitId_fkey` FOREIGN KEY (`kitId`) REFERENCES `kits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kit_materials` ADD CONSTRAINT `kit_materials_kitId_fkey` FOREIGN KEY (`kitId`) REFERENCES `kits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kit_gallery_images` ADD CONSTRAINT `kit_gallery_images_kitId_fkey` FOREIGN KEY (`kitId`) REFERENCES `kits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wishlist_items` ADD CONSTRAINT `wishlist_items_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wishlist_items` ADD CONSTRAINT `wishlist_items_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `program_registrations` ADD CONSTRAINT `program_registrations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `program_registrations` ADD CONSTRAINT `program_registrations_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `programs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `competition_registrations` ADD CONSTRAINT `competition_registrations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `competition_registrations` ADD CONSTRAINT `competition_registrations_competitionId_fkey` FOREIGN KEY (`competitionId`) REFERENCES `competitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
