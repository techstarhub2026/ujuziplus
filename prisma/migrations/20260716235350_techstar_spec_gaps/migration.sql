-- AlterTable
ALTER TABLE `mentor_cohorts` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `mentor_group_sessions` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `mentor_office_hours` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `mentor_profiles` MODIFY `bio` TEXT NULL,
    MODIFY `officeHoursNote` TEXT NULL;

-- AlterTable
ALTER TABLE `mentor_requests` MODIFY `message` TEXT NOT NULL,
    MODIFY `mentorReply` TEXT NULL;

-- AlterTable
ALTER TABLE `mentor_sessions` MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `organizations` MODIFY `type` ENUM('UNIVERSITY', 'HUB', 'SCHOOL', 'NGO', 'GOVERNMENT', 'TECH_COMPANY', 'STARTUP', 'COMMUNITY_ORG', 'WOMEN_YOUTH_GROUP', 'OTHER') NOT NULL DEFAULT 'UNIVERSITY';

-- AlterTable
ALTER TABLE `program_registrations` ADD COLUMN `certVerifyCode` VARCHAR(191) NULL,
    ADD COLUMN `certificateIssued` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `completedAt` DATETIME(3) NULL,
    ADD COLUMN `progressPct` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `programs` MODIFY `format` ENUM('ONLINE', 'IN_PERSON', 'HYBRID', 'BOOTCAMP', 'HACKATHON') NOT NULL DEFAULT 'HYBRID';

-- AlterTable
ALTER TABLE `projects` ADD COLUMN `documentation` TEXT NULL,
    ADD COLUMN `impact` TEXT NULL,
    ADD COLUMN `mediaGallery` JSON NULL,
    ADD COLUMN `objectives` TEXT NULL,
    ADD COLUMN `organizationId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `showcase_projects` MODIFY `description` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `solutions` ADD COLUMN `category` ENUM('SMART_AGRICULTURE', 'SMART_EDUCATION', 'SMART_ENVIRONMENT', 'SMART_HEALTH', 'STARTUP_GARAGE') NOT NULL DEFAULT 'SMART_AGRICULTURE',
    MODIFY `rejectionReason` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `project_members` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('LEAD', 'CONTRIBUTOR', 'MENTOR') NOT NULL DEFAULT 'CONTRIBUTOR',
    `orderIndex` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `open_knowledge_resources` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `category` ENUM('CODING_TUTORIALS', 'AI_IOT_RESOURCES', 'STEM_TEACHING_MATERIALS', 'OPEN_SOURCE_PROJECTS', 'INNOVATION_TOOLKITS', 'ENTREPRENEURSHIP_GUIDES', 'RESEARCH_PUBLICATIONS', 'DIGITAL_LEARNING_MANUALS') NOT NULL DEFAULT 'CODING_TUTORIALS',
    `authorName` VARCHAR(191) NULL,
    `fileUrl` VARCHAR(500) NULL,
    `externalUrl` VARCHAR(500) NULL,
    `thumbnailUrl` VARCHAR(191) NULL,
    `tags` JSON NULL,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `open_knowledge_resources_slug_key`(`slug`),
    INDEX `open_knowledge_resources_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `program_registrations_certVerifyCode_key` ON `program_registrations`(`certVerifyCode`);

-- CreateIndex
CREATE INDEX `projects_organizationId_idx` ON `projects`(`organizationId`);

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_members` ADD CONSTRAINT `project_members_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_members` ADD CONSTRAINT `project_members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

