-- AlterTable
ALTER TABLE `lab_resources` ADD COLUMN `content` LONGTEXT NULL,
ADD COLUMN `pdfUrls` JSON NULL,
ADD COLUMN `imageUrls` JSON NULL;
