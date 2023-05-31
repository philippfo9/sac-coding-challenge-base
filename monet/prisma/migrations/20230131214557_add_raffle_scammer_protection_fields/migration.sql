-- AlterTable
ALTER TABLE `Raffle` ADD COLUMN `autodrawDisabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `onlyPickFromVerified` BOOLEAN NOT NULL DEFAULT false;
