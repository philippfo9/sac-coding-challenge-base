/*
  Warnings:

  - You are about to drop the column `guildId` on the `ProjectHolderDiscordRoles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Project` ADD COLUMN `discordGuildId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ProjectHolderDiscordRoles` DROP COLUMN `guildId`;
