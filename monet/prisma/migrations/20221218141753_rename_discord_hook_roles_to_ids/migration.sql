/*
  Warnings:

  - You are about to drop the column `discordNewRafflesRole` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `discordWinnersRole` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Project` DROP COLUMN `discordNewRafflesRole`,
    DROP COLUMN `discordWinnersRole`,
    ADD COLUMN `discordNewRafflesRoleId` VARCHAR(191) NULL,
    ADD COLUMN `discordWinnersRoleId` VARCHAR(191) NULL;
