/*
  Warnings:

  - A unique constraint covering the columns `[transaction_id]` on the table `ServiceProvider` will be added. If there are existing duplicate values, this will fail.
  - Made the column `transaction_id` on table `ServiceProvider` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `ServiceProvider` MODIFY `transaction_id` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ServiceProvider_transaction_id_key` ON `ServiceProvider`(`transaction_id`);
