-- AlterTable
ALTER TABLE `payment` ADD COLUMN `phone_number` VARCHAR(191) NULL,
    ADD COLUMN `request_transaction_id` VARCHAR(191) NULL,
    ADD COLUMN `transaction_id` VARCHAR(191) NULL;
