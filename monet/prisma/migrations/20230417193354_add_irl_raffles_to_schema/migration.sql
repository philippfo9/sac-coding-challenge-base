-- AlterTable
ALTER TABLE `Raffle` ADD COLUMN `winnerSpots` INTEGER NULL,
    MODIFY `type` ENUM('WHITELIST', 'IRL', 'NFT') NOT NULL DEFAULT 'NFT';
