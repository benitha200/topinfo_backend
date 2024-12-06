/*
  Warnings:

  - You are about to drop the column `description` on the `request` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `request` DROP COLUMN `description`,
    ADD COLUMN `fields` JSON NULL;
