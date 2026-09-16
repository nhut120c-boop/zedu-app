ALTER TABLE `assignments` MODIFY COLUMN `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `submissions` ADD COLUMN IF NOT EXISTS `attachmentKey` text;
