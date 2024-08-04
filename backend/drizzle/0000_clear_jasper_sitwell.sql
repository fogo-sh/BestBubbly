CREATE TABLE `scopes` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`scope` text NOT NULL,
	`user_uuid` text NOT NULL,
	`token_type` text NOT NULL,
	`expires_in` integer NOT NULL,
	`access_token` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer,
	`created_at` datetime DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_oauth_providers` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`provider` text NOT NULL,
	`provider_user_id` text NOT NULL,
	`created_at` datetime DEFAULT (current_timestamp) NOT NULL,
	`updated_at` datetime DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`email` text,
	`name` text,
	`avatar_url` text,
	`github_username` text,
	`created_at` datetime DEFAULT (current_timestamp) NOT NULL,
	`updated_at` datetime DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `scopes_access_token_unique` ON `scopes` (`access_token`);