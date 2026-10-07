CREATE TABLE `cloud_accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text DEFAULT 'Гость' NOT NULL,
	`birth_date` text,
	`email` text,
	`password` text,
	`focus` text DEFAULT 'Ясность' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cloud_accounts_email` ON `cloud_accounts` (`email`);--> statement-breakpoint
CREATE TABLE `cloud_rates` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`until` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cloud_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner` integer NOT NULL,
	`kind` text NOT NULL,
	`key` text NOT NULL,
	`data` text NOT NULL,
	FOREIGN KEY (`owner`) REFERENCES `cloud_accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cloud_records_owner_kind_key` ON `cloud_records` (`owner`,`kind`,`key`);--> statement-breakpoint
CREATE TABLE `cloud_sessions` (
	`key` text PRIMARY KEY NOT NULL,
	`owner` integer NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`owner`) REFERENCES `cloud_accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `cloud_sessions_owner` ON `cloud_sessions` (`owner`);