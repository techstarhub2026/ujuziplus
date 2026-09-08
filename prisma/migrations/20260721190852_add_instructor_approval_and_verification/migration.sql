-- Instructor approval gate
ALTER TABLE `users`
  ADD COLUMN `instructorStatus` ENUM('PENDING', 'APPROVED', 'REJECTED') NULL;

-- Auto-approve every existing instructor so nobody currently teaching is locked out
UPDATE `users` SET `instructorStatus` = 'APPROVED' WHERE `role` = 'INSTRUCTOR';

-- Instructor credentials (certifications shown on public profile / reviewed by admin)
CREATE TABLE IF NOT EXISTS `instructor_credentials` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `issuer` VARCHAR(191) NULL,
  `issueDate` DATETIME(3) NULL,
  `credentialUrl` VARCHAR(191) NULL,
  `fileUrl` VARCHAR(191) NULL,
  `orderIndex` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `instructor_credentials_userId_idx` (`userId`),
  CONSTRAINT `instructor_credentials_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email verification tokens
CREATE TABLE IF NOT EXISTS `email_verification_tokens` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `token` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `usedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_verification_tokens_token_key` (`token`),
  INDEX `email_verification_tokens_userId_idx` (`userId`),
  CONSTRAINT `email_verification_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
