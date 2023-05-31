-- AlterTable
ALTER TABLE `User` ADD COLUMN `hasBeenBanned` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `hasBeenFlagged` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isTrustedRaffler` BOOLEAN NOT NULL DEFAULT false;
