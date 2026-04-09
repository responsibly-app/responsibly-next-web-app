ALTER TABLE "event_attendance" ADD COLUMN "online_zoom" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "event_attendance" ADD COLUMN "in_person_qr" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "event_attendance" ADD COLUMN "in_person_manual" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "event_attendance" ADD COLUMN "online_manual" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "event_attendance" DROP COLUMN "online_present_via_zoom";--> statement-breakpoint
ALTER TABLE "event_attendance" DROP COLUMN "in_person_present";--> statement-breakpoint
ALTER TABLE "event_attendance" DROP COLUMN "sources";