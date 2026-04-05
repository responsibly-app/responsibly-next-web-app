CREATE TABLE "user_telegram" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"telegram_id" text NOT NULL,
	"telegram_username" text,
	"telegram_first_name" text,
	"telegram_last_name" text,
	"telegram_photo_url" text,
	"connected_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_telegram_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "user_telegram_telegram_id_unique" UNIQUE("telegram_id")
);
--> statement-breakpoint
ALTER TABLE "user_telegram" ADD CONSTRAINT "user_telegram_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;