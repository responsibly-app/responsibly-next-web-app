DROP INDEX "chat_token_usage_user_date_uidx";--> statement-breakpoint
ALTER TABLE "chat_token_usage" ADD COLUMN "model_tier" text DEFAULT 'primary' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "chat_token_usage_user_date_tier_uidx" ON "chat_token_usage" USING btree ("user_id","date","model_tier");