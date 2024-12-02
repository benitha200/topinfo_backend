/*
  Warnings:

  - The values [SERVICE_SEEKER] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `ServiceProvider` ADD COLUMN `districts` VARCHAR(191) NULL,
    ADD COLUMN `provinces` VARCHAR(191) NULL,
    ADD COLUMN `total_district_cost` DECIMAL(65, 30) NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('AGENT', 'ADMIN') NOT NULL DEFAULT 'AGENT';
