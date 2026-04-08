CREATE TABLE "event_qr_code" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"code" text NOT NULL,
	"expires_at" timestamp,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "zoom_participant_session" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"zoom_meeting_id" text NOT NULL,
	"participant_user_id" text,
	"participant_email" text,
	"joined_at" timestamp NOT NULL,
	"left_at" timestamp,
	"duration" integer
);
--> statement-breakpoint
CREATE TABLE "organization_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"min_attendance_duration_minutes" integer DEFAULT 0 NOT NULL,
	"zoom_auto_mark_present" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "zoom_meeting_id" text;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "zoom_join_url" text;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "zoom_start_url" text;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "attendance_methods" text[] DEFAULT '{"manual"}' NOT NULL;--> statement-breakpoint
ALTER TABLE "event_attendance" ADD COLUMN "zoom_duration" integer;--> statement-breakpoint
ALTER TABLE "event_attendance" ADD COLUMN "zoom_first_joined_at" timestamp;--> statement-breakpoint
ALTER TABLE "event_attendance" ADD COLUMN "online_present_via_zoom" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "event_attendance" ADD COLUMN "qr_checked_in_at" timestamp;--> statement-breakpoint
ALTER TABLE "event_attendance" ADD COLUMN "in_person_present" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "event_attendance" ADD COLUMN "sources" text[];--> statement-breakpoint
ALTER TABLE "event_qr_code" ADD CONSTRAINT "event_qr_code_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_qr_code" ADD CONSTRAINT "event_qr_code_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zoom_participant_session" ADD CONSTRAINT "zoom_participant_session_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD CONSTRAINT "organization_settings_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_qr_code_event_id_idx" ON "event_qr_code" USING btree ("event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "event_qr_code_code_uidx" ON "event_qr_code" USING btree ("code");--> statement-breakpoint
CREATE INDEX "zoom_participant_session_event_id_idx" ON "zoom_participant_session" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "zoom_participant_session_meeting_id_idx" ON "zoom_participant_session" USING btree ("zoom_meeting_id");--> statement-breakpoint
CREATE UNIQUE INDEX "org_settings_organization_id_uidx" ON "organization_settings" USING btree ("organization_id");