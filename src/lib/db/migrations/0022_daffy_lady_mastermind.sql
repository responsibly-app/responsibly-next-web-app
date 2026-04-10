ALTER TABLE "zoom_participant_session" ADD COLUMN "participant_uuid" text;--> statement-breakpoint
ALTER TABLE "zoom_participant_session" DROP COLUMN "participant_user_id";