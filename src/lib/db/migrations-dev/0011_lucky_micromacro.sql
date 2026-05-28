CREATE TABLE "zoom_api_participant_record" (
	"id" text PRIMARY KEY NOT NULL,
	"sync_job_id" text NOT NULL,
	"event_id" text NOT NULL,
	"zoom_meeting_id" text NOT NULL,
	"participant_email" text,
	"participant_name" text,
	"join_time" timestamp,
	"leave_time" timestamp,
	"duration" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "zoom_meeting_sync_job" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"zoom_meeting_id" text NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"triggered_by" text NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"participants_processed" integer,
	"new_records_created" integer,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "zoom_api_participant_record" ADD CONSTRAINT "zoom_api_participant_record_sync_job_id_zoom_meeting_sync_job_id_fk" FOREIGN KEY ("sync_job_id") REFERENCES "public"."zoom_meeting_sync_job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zoom_api_participant_record" ADD CONSTRAINT "zoom_api_participant_record_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zoom_meeting_sync_job" ADD CONSTRAINT "zoom_meeting_sync_job_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zoom_meeting_sync_job" ADD CONSTRAINT "zoom_meeting_sync_job_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "zoom_api_participant_event_id_idx" ON "zoom_api_participant_record" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "zoom_api_participant_event_email_idx" ON "zoom_api_participant_record" USING btree ("event_id","participant_email");--> statement-breakpoint
CREATE UNIQUE INDEX "zoom_api_participant_sync_email_join_uidx" ON "zoom_api_participant_record" USING btree ("sync_job_id","participant_email","join_time");--> statement-breakpoint
CREATE INDEX "zoom_sync_job_status_scheduled_idx" ON "zoom_meeting_sync_job" USING btree ("status","scheduled_for");--> statement-breakpoint
CREATE INDEX "zoom_sync_job_event_id_idx" ON "zoom_meeting_sync_job" USING btree ("event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "zoom_sync_job_event_auto_pending_uidx" ON "zoom_meeting_sync_job" USING btree ("event_id","triggered_by");