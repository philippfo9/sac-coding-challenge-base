-- CreateIndex
CREATE FULLTEXT INDEX `Project_communityName_platformName_publicId_idx` ON `Project`(`communityName`, `platformName`, `publicId`);
