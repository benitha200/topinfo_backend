/*
  Warnings:

  - You are about to drop the column `serviceId` on the `request` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `request` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.
  - You are about to alter the column `role` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(0))`.
  - You are about to drop the `service` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `client_id` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `client_id` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service_category_id` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service_date` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service_location` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `your_location` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `Payment_userId_fkey`;

-- DropForeignKey
ALTER TABLE `request` DROP FOREIGN KEY `Request_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `request` DROP FOREIGN KEY `Request_userId_fkey`;

-- DropForeignKey
ALTER TABLE `service` DROP FOREIGN KEY `Service_userId_fkey`;

-- AlterTable
ALTER TABLE `payment` ADD COLUMN `client_id` INTEGER NOT NULL,
    MODIFY `userId` INTEGER NULL;

-- AlterTable
ALTER TABLE `request` DROP COLUMN `serviceId`,
    DROP COLUMN `userId`,
    ADD COLUMN `agent_id` INTEGER NULL,
    ADD COLUMN `clientId` INTEGER NULL,
    ADD COLUMN `client_id` INTEGER NOT NULL,
    ADD COLUMN `description` VARCHAR(191) NOT NULL,
    ADD COLUMN `service_category_id` INTEGER NOT NULL,
    ADD COLUMN `service_date` VARCHAR(191) NOT NULL,
    ADD COLUMN `service_location` VARCHAR(191) NOT NULL,
    ADD COLUMN `your_location` VARCHAR(191) NOT NULL,
    MODIFY `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'UNPAID') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `user` DROP COLUMN `name`,
    ADD COLUMN `firstname` VARCHAR(191) NULL,
    ADD COLUMN `lastname` VARCHAR(191) NULL,
    ADD COLUMN `location_district` VARCHAR(191) NULL,
    ADD COLUMN `location_province` VARCHAR(191) NULL,
    ADD COLUMN `location_sector` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    MODIFY `role` ENUM('SERVICE_SEEKER', 'AGENT', 'ADMIN') NOT NULL DEFAULT 'SERVICE_SEEKER';

-- DropTable
DROP TABLE `service`;

-- CreateTable
CREATE TABLE `Client` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstname` VARCHAR(191) NOT NULL,
    `lastname` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `location_province` VARCHAR(191) NULL,
    `location_district` VARCHAR(191) NULL,
    `location_sector` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Client_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceProvider` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstname` VARCHAR(191) NOT NULL,
    `lastname` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `work_email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `experience` VARCHAR(191) NULL,
    `location_province` VARCHAR(191) NOT NULL,
    `location_district` VARCHAR(191) NOT NULL,
    `location_sector` VARCHAR(191) NOT NULL,
    `location_serve` VARCHAR(191) NULL,
    `additional_info` VARCHAR(191) NULL,
    `service_category_id` INTEGER NOT NULL,
    `approved` BOOLEAN NOT NULL DEFAULT false,
    `approved_by` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ServiceProvider_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `provider_price` DECIMAL(65, 30) NOT NULL,
    `client_price` DECIMAL(65, 30) NOT NULL,
    `details` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ServiceProvider` ADD CONSTRAINT `ServiceProvider_service_category_id_fkey` FOREIGN KEY (`service_category_id`) REFERENCES `ServiceCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceProvider` ADD CONSTRAINT `ServiceProvider_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Request` ADD CONSTRAINT `Request_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Request` ADD CONSTRAINT `Request_service_category_id_fkey` FOREIGN KEY (`service_category_id`) REFERENCES `ServiceCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Request` ADD CONSTRAINT `Request_agent_id_fkey` FOREIGN KEY (`agent_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Request` ADD CONSTRAINT `Request_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
