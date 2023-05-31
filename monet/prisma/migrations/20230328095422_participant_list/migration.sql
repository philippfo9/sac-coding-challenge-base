-- CreateTable
CREATE TABLE `Participant` (
    `userId` VARCHAR(191) NOT NULL,
    `raffleId` VARCHAR(191) NOT NULL,
    `volumeInSol` DOUBLE NOT NULL,

    PRIMARY KEY (`userId`, `raffleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
