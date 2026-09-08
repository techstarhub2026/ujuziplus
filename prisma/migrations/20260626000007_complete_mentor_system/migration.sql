-- CreateTable mentor_profiles
CREATE TABLE IF NOT EXISTS `mentor_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `mentorType` ENUM('ACADEMIC', 'INDUSTRY', 'INNOVATION', 'GENERAL') NOT NULL DEFAULT 'GENERAL',
    `displayName` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NULL,
    `company` VARCHAR(255) NULL,
    `companyLogoUrl` VARCHAR(191) NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `bio` LONGTEXT NULL,
    `hook` VARCHAR(280) NULL,
    `quote` VARCHAR(500) NULL,
    `videoIntroUrl` VARCHAR(191) NULL,
    `city` VARCHAR(100) NULL,
    `country` VARCHAR(100) NULL,
    `expertiseTags` JSON NOT NULL,
    `tracks` JSON NOT NULL,
    `languages` JSON NOT NULL,
    `yearsExperience` INT NOT NULL DEFAULT 0,
    `linkedin` VARCHAR(191) NULL,
    `github` VARCHAR(191) NULL,
    `learningPath` JSON NOT NULL,
    `recommendedCourseIds` JSON NOT NULL,
    `recommendedKitSlugs` JSON NOT NULL,
    `officeHoursNote` LONGTEXT NULL,
    `bookingUrl` VARCHAR(191) NULL,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isAcceptingRequests` BOOLEAN NOT NULL DEFAULT true,
    `agreedToCodeOfConduct` BOOLEAN NOT NULL DEFAULT false,
    `studentsHelped` INT NOT NULL DEFAULT 0,
    `averageRating` DOUBLE NULL,
    `ratingCount` INT NOT NULL DEFAULT 0,
    `sortOrder` INT NOT NULL DEFAULT 0,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `mentor_profiles_slug_key`(`slug`),
    UNIQUE INDEX `mentor_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable mentor_requests
CREATE TABLE IF NOT EXISTS `mentor_requests` (
    `id` VARCHAR(191) NOT NULL,
    `learnerId` VARCHAR(191) NOT NULL,
    `mentorId` VARCHAR(191) NOT NULL,
    `goal` VARCHAR(500) NOT NULL,
    `message` LONGTEXT NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'CLOSED') NOT NULL DEFAULT 'PENDING',
    `mentorReply` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `mentor_requests_learnerId_idx`(`learnerId`),
    INDEX `mentor_requests_mentorId_idx`(`mentorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable mentor_sessions
CREATE TABLE IF NOT EXISTS `mentor_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `mentorId` VARCHAR(191) NOT NULL,
    `learnerId` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(191) NULL,
    `type` ENUM('INTRO_CALL', 'GUIDANCE', 'OFFICE_HOURS', 'GROUP_SESSION') NOT NULL DEFAULT 'GUIDANCE',
    `status` ENUM('REQUESTED', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW') NOT NULL DEFAULT 'REQUESTED',
    `topic` VARCHAR(500) NULL,
    `notes` LONGTEXT NULL,
    `scheduledAt` DATETIME(3) NULL,
    `durationMins` INT NOT NULL DEFAULT 30,
    `meetingUrl` VARCHAR(191) NULL,
    `smsReminderSent` BOOLEAN NOT NULL DEFAULT false,
    `rating` INT NULL,
    `learnerFeedback` VARCHAR(1000) NULL,
    `ratedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `mentor_sessions_mentorId_idx`(`mentorId`),
    INDEX `mentor_sessions_learnerId_idx`(`learnerId`),
    INDEX `mentor_sessions_scheduledAt_idx`(`scheduledAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable mentor_office_hours
CREATE TABLE IF NOT EXISTS `mentor_office_hours` (
    `id` VARCHAR(191) NOT NULL,
    `mentorId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` LONGTEXT NULL,
    `dayOfWeek` INT NOT NULL,
    `startTime` VARCHAR(10) NOT NULL,
    `endTime` VARCHAR(10) NOT NULL,
    `timezone` VARCHAR(50) NOT NULL DEFAULT 'Africa/Dar_es_Salaam',
    `meetingUrl` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `mentor_office_hours_mentorId_idx`(`mentorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable mentor_cohorts (before group_sessions — group_sessions FK references it)
CREATE TABLE IF NOT EXISTS `mentor_cohorts` (
    `id` VARCHAR(191) NOT NULL,
    `mentorId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` LONGTEXT NULL,
    `track` VARCHAR(100) NOT NULL,
    `startsAt` DATETIME(3) NOT NULL,
    `endsAt` DATETIME(3) NULL,
    `maxMembers` INT NOT NULL DEFAULT 20,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `mentor_cohorts_mentorId_idx`(`mentorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable mentor_group_sessions
CREATE TABLE IF NOT EXISTS `mentor_group_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `mentorId` VARCHAR(191) NOT NULL,
    `cohortId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` LONGTEXT NULL,
    `sessionMode` ENUM('VIRTUAL', 'PHYSICAL', 'HYBRID') NOT NULL DEFAULT 'VIRTUAL',
    `venue` VARCHAR(500) NULL,
    `scheduledAt` DATETIME(3) NOT NULL,
    `durationMins` INT NOT NULL DEFAULT 60,
    `maxAttendees` INT NOT NULL DEFAULT 20,
    `meetingUrl` VARCHAR(191) NULL,
    `recordingUrl` VARCHAR(191) NULL,
    `channelSlug` VARCHAR(50) NOT NULL DEFAULT 'mentorship',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `mentor_group_sessions_mentorId_idx`(`mentorId`),
    INDEX `mentor_group_sessions_cohortId_idx`(`cohortId`),
    INDEX `mentor_group_sessions_scheduledAt_idx`(`scheduledAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable mentor_group_session_attendees
CREATE TABLE IF NOT EXISTS `mentor_group_session_attendees` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `mentor_group_session_attendees_sessionId_userId_key`(`sessionId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable mentor_cohort_members
CREATE TABLE IF NOT EXISTS `mentor_cohort_members` (
    `id` VARCHAR(191) NOT NULL,
    `cohortId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `mentor_cohort_members_cohortId_userId_key`(`cohortId`, `userId`),
    INDEX `mentor_cohort_members_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `mentor_profiles` ADD CONSTRAINT `mentor_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `mentor_requests` ADD CONSTRAINT `mentor_requests_learnerId_fkey` FOREIGN KEY (`learnerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `mentor_requests` ADD CONSTRAINT `mentor_requests_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `mentor_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `mentor_sessions` ADD CONSTRAINT `mentor_sessions_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `mentor_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `mentor_sessions` ADD CONSTRAINT `mentor_sessions_learnerId_fkey` FOREIGN KEY (`learnerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `mentor_sessions` ADD CONSTRAINT `mentor_sessions_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `mentor_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `mentor_office_hours` ADD CONSTRAINT `mentor_office_hours_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `mentor_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `mentor_cohorts` ADD CONSTRAINT `mentor_cohorts_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `mentor_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `mentor_group_sessions` ADD CONSTRAINT `mentor_group_sessions_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `mentor_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `mentor_group_sessions` ADD CONSTRAINT `mentor_group_sessions_cohortId_fkey` FOREIGN KEY (`cohortId`) REFERENCES `mentor_cohorts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `mentor_group_session_attendees` ADD CONSTRAINT `mentor_group_session_attendees_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `mentor_group_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `mentor_group_session_attendees` ADD CONSTRAINT `mentor_group_session_attendees_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `mentor_cohort_members` ADD CONSTRAINT `mentor_cohort_members_cohortId_fkey` FOREIGN KEY (`cohortId`) REFERENCES `mentor_cohorts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `mentor_cohort_members` ADD CONSTRAINT `mentor_cohort_members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
