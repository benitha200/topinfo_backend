/*
  Warnings:

  - You are about to drop the column `clientId` on the `request` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `request` DROP FOREIGN KEY `Request_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `request` DROP FOREIGN KEY `Request_client_id_fkey`;

-- AlterTable
ALTER TABLE `request` DROP COLUMN `clientId`;

-- AddForeignKey
ALTER TABLE `Request` ADD CONSTRAINT `Request_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
