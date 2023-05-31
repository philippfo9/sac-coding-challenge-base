-- CreateTable
CREATE TABLE `RaffleFee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fee` DOUBLE NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `raffleId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
