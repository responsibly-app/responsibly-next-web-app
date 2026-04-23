CREATE TABLE "ama_item" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"recruit_name" text NOT NULL,
	"agent_code" text,
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ama_item" ADD CONSTRAINT "ama_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;