CREATE TABLE `runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`alias` text NOT NULL,
	`score` integer NOT NULL,
	`accuracy` integer NOT NULL,
	`cues_caught` integer NOT NULL,
	`cues_total` integer NOT NULL,
	`rank` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scenarios` (
	`id` text PRIMARY KEY NOT NULL,
	`subject` text NOT NULL,
	`is_phishing` integer NOT NULL,
	`difficulty` integer NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`data` text NOT NULL
);
