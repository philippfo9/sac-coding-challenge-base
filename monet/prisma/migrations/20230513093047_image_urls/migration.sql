-- CreateTable
CREATE TABLE `AdditionalRaffleImage` (
    `raffleId` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`raffleId`, `imageUrl`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
