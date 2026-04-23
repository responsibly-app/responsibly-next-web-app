CREATE TABLE "daily_invite" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "point_item" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"description" text NOT NULL,
	"amount" integer NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_invite" ADD CONSTRAINT "daily_invite_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_item" ADD CONSTRAINT "point_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "daily_invite_user_date_uidx" ON "daily_invite" USING btree ("user_id","date");