-- DropIndex
DROP INDEX `User_name_wallet_idx` ON `User`;

-- CreateIndex
CREATE FULLTEXT INDEX `User_name_wallet_twitterUsername_discordUsername_idx` ON `User`(`name`, `wallet`, `twitterUsername`, `discordUsername`);
