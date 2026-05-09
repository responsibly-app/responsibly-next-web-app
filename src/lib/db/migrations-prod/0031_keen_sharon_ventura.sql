ALTER TABLE "chat_token_usage" RENAME COLUMN "month" TO "date";--> statement-breakpoint
DROP INDEX "chat_token_usage_user_month_uidx";--> statement-breakpoint
ALTER TABLE "chat_token_usage" ADD COLUMN "model_tier" text DEFAULT 'primary' NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_token_usage" ADD COLUMN "total_tokens" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_token_usage" ADD COLUMN "reasoning_tokens" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_token_usage" ADD COLUMN "cache_read_tokens" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_token_usage" ADD COLUMN "cache_write_tokens" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_token_usage" ADD COLUMN "no_cache_input_tokens" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_token_usage" ADD COLUMN "text_output_tokens" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "chat_token_usage_user_date_tier_uidx" ON "chat_token_usage" USING btree ("user_id","date","model_tier");