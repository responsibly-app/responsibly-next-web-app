ALTER TABLE "user" ADD COLUMN "timezone" text DEFAULT 'UTC';--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "timezone" text DEFAULT 'UTC' NOT NULL;