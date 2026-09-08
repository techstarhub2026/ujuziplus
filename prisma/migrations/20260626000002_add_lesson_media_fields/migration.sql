-- AlterTable
ALTER TABLE `lessons` ADD COLUMN `audioUrl` VARCHAR(191) NULL,
ADD COLUMN `attachments` JSON NULL;

-- Update LessonType enum to include AUDIO
ALTER TABLE `lessons` MODIFY `type` ENUM('VIDEO', 'ARTICLE', 'AUDIO', 'QUIZ', 'ASSIGNMENT') NOT NULL DEFAULT 'ARTICLE';
