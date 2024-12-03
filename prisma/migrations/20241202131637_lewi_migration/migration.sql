/*
  Warnings:

  - The values [SERVICE_SEEKER] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('AGENT', 'ADMIN') NOT NULL DEFAULT 'AGENT';
