CREATE TABLE `assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text NOT NULL,
	`dueAt` timestamp,
	`maxScore` int NOT NULL DEFAULT 100,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(180) NOT NULL,
	`summary` text,
	`content` text,
	`durationMinutes` int NOT NULL DEFAULT 30,
	`published` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderId` int NOT NULL,
	`recipientId` int NOT NULL,
	`body` text NOT NULL,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assignmentId` int NOT NULL,
	`studentId` int NOT NULL,
	`answerText` text NOT NULL,
	`attachmentUrl` text,
	`attachmentName` varchar(255),
	`status` enum('submitted','graded','returned') NOT NULL DEFAULT 'submitted',
	`score` int,
	`feedback` text,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `submissions_id` PRIMARY KEY(`id`)
);
