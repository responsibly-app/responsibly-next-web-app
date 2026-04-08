CREATE TABLE "event_join_registration" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"member_id" text NOT NULL,
	"zoom_email" text NOT NULL,
	"registered_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_join_registration" ADD CONSTRAINT "event_join_registration_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_join_registration" ADD CONSTRAINT "event_join_registration_member_id_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_join_reg_event_id_idx" ON "event_join_registration" USING btree ("event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "event_join_reg_event_member_uidx" ON "event_join_registration" USING btree ("event_id","member_id");