-- AlterTable
ALTER TABLE `users` ADD COLUMN `publicProfile` BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN `showCoursesOnProfile` BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN `showCertificatesOnProfile` BOOLEAN NOT NULL DEFAULT true;
