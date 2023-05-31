-- CreateTable
CREATE TABLE `Raid2EarnSubmission` (
    `raffleId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tweetId` VARCHAR(191) NOT NULL,
    `txSignature` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`tweetId`, `txSignature`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
