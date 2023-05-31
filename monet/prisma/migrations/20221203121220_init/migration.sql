-- CreateTable
CREATE TABLE `Project` (
    `id` VARCHAR(191) NOT NULL,
    `publicId` VARCHAR(191) NOT NULL,
    `fundsWallet` VARCHAR(191) NOT NULL,
    `platformName` VARCHAR(191) NOT NULL,
    `communityName` VARCHAR(191) NOT NULL,
    `gradientStart` VARCHAR(191) NOT NULL,
    `gradientEnd` VARCHAR(191) NOT NULL,
    `profilePictureUrl` VARCHAR(191) NULL,
    `bannerUrl` VARCHAR(191) NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `verifyHoldersBy` ENUM('DISABLED', 'DISCORD', 'WALLET', 'MATRICA') NOT NULL DEFAULT 'DISABLED',
    `discordNewRafflesHook` VARCHAR(191) NULL,
    `discordWinnersHook` VARCHAR(191) NULL,
    `twitterUserHandle` VARCHAR(191) NULL,
    `discordInviteLink` VARCHAR(191) NULL,
    `magicEdenSlug` VARCHAR(191) NULL,
    `websiteUrl` VARCHAR(191) NULL,

    UNIQUE INDEX `Project_publicId_key`(`publicId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectHolderDiscordRoles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `guildId` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectUsers` (
    `projectId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `assignedBy` VARCHAR(191) NOT NULL,
    `admin` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`projectId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `wallet` VARCHAR(191) NOT NULL,
    `fundsWallet` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `profilePictureUrl` VARCHAR(191) NULL,
    `gradientStart` VARCHAR(191) NOT NULL,
    `gradientEnd` VARCHAR(191) NOT NULL,
    `matricaRefreshToken` VARCHAR(191) NULL,
    `twitterId` VARCHAR(191) NULL,
    `twitterRefreshToken` VARCHAR(191) NULL,
    `twitterUsername` VARCHAR(191) NULL,
    `discordId` VARCHAR(191) NULL,
    `discordRefreshToken` VARCHAR(191) NULL,
    `discordUsername` VARCHAR(191) NULL,
    `lastHolderCheck` DATETIME(3) NULL,

    UNIQUE INDEX `User_wallet_key`(`wallet`),
    UNIQUE INDEX `User_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `decimals` INTEGER NOT NULL DEFAULT 9,
    `isSPL` BOOLEAN NOT NULL DEFAULT true,
    `onDEX` BOOLEAN NOT NULL DEFAULT true,
    `lastUsdcPrice` DOUBLE NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Token_name_key`(`name`),
    UNIQUE INDEX `Token_symbol_key`(`symbol`),
    UNIQUE INDEX `Token_address_key`(`address`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AllowedPurchaseToken` (
    `tokenId` INTEGER NOT NULL,
    `raffleId` VARCHAR(191) NOT NULL,
    `totalPayout` DOUBLE NULL,
    `totalFee` DOUBLE NULL,
    `discount` DOUBLE NOT NULL DEFAULT 0,
    `fixedPrice` DOUBLE NULL,

    PRIMARY KEY (`raffleId`, `tokenId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NftCollection` (
    `name` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `twitter` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `discord` VARCHAR(191) NULL,
    `averagePrice24hr` DOUBLE NULL,

    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Raffle` (
    `id` VARCHAR(191) NOT NULL,
    `raffleOnChainAddress` VARCHAR(191) NULL,
    `payoutWallet` VARCHAR(191) NOT NULL,
    `hostWallet` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('WHITELIST', 'NFT') NOT NULL DEFAULT 'NFT',
    `status` ENUM('IN_CREATION', 'SCHEDULED', 'DRAWN', 'FINISHED', 'CANCELLED') NOT NULL DEFAULT 'IN_CREATION',
    `problem` ENUM('NONE', 'DRAWING_FAILED', 'NFT_TRANSFER_FAILED', 'DISCORD_POST_FAILED', 'PAYOUT_FAILED', 'CUSTOM') NOT NULL DEFAULT 'NONE',
    `problemDescription` VARCHAR(1000) NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `feeAmount` DOUBLE NOT NULL DEFAULT 0.04,
    `drawTxHash` VARCHAR(191) NULL,
    `hasBeenPostedToDiscord` BOOLEAN NOT NULL DEFAULT false,
    `wlSpots` INTEGER NULL,
    `wlProjectTwitterLink` VARCHAR(191) NULL,
    `wlProjectWebsiteLink` VARCHAR(191) NULL,
    `wlProjectDiscordLink` VARCHAR(191) NULL,
    `collectSocial` BOOLEAN NOT NULL DEFAULT false,
    `nftMint` VARCHAR(191) NULL,
    `transferTx` VARCHAR(191) NULL,
    `collectionId` VARCHAR(191) NULL,
    `holdersOnly` BOOLEAN NOT NULL DEFAULT false,
    `starts` DATETIME(3) NOT NULL,
    `ends` DATETIME(3) NOT NULL,
    `ticketPrice` DOUBLE NOT NULL,
    `ticketPriceTokenId` INTEGER NOT NULL,
    `maxTickets` INTEGER NULL,
    `isUserRaffle` BOOLEAN NOT NULL DEFAULT false,
    `creatorUserId` VARCHAR(191) NULL,
    `creatorProjectId` VARCHAR(191) NULL,

    UNIQUE INDEX `Raffle_raffleOnChainAddress_key`(`raffleOnChainAddress`),
    FULLTEXT INDEX `Raffle_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RaffleAttribute` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `traitType` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `raffleId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RaffleWinnerImage` (
    `raffleId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `winnerImgUrl` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`raffleId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_benefitingRaffles` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_benefitingRaffles_AB_unique`(`A`, `B`),
    INDEX `_benefitingRaffles_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_holderProject` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_holderProject_AB_unique`(`A`, `B`),
    INDEX `_holderProject_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_likedRaffles` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_likedRaffles_AB_unique`(`A`, `B`),
    INDEX `_likedRaffles_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_wonRaffles` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_wonRaffles_AB_unique`(`A`, `B`),
    INDEX `_wonRaffles_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
