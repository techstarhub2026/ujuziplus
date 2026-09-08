ALTER TABLE `platform_settings`
  ADD COLUMN `particlesEnabled` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `particlesColors` VARCHAR(191) NOT NULL DEFAULT '#f39223,#00004D,#1a1a6b,#e0831a',
  ADD COLUMN `particlesRainbowMode` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `particlesSpeed` DOUBLE NOT NULL DEFAULT 1,
  ADD COLUMN `particlesConnectDistance` INTEGER NOT NULL DEFAULT 140,
  ADD COLUMN `particlesLineThickness` DOUBLE NOT NULL DEFAULT 1,
  ADD COLUMN `particlesInteraction` VARCHAR(191) NOT NULL DEFAULT 'repel';
