-- Add explicit per-source presence columns
ALTER TABLE "event_attendance" ADD COLUMN "online_zoom" boolean DEFAULT false;
ALTER TABLE "event_attendance" ADD COLUMN "in_person_qr" boolean DEFAULT false;
ALTER TABLE "event_attendance" ADD COLUMN "in_person_manual" boolean DEFAULT false;
ALTER TABLE "event_attendance" ADD COLUMN "online_manual" boolean DEFAULT false;

-- Backfill from legacy columns
UPDATE "event_attendance" SET "online_zoom" = true WHERE "online_present_via_zoom" = true;
UPDATE "event_attendance" SET "in_person_qr" = true WHERE "qr_checked_in_at" IS NOT NULL;
UPDATE "event_attendance" SET "in_person_manual" = true
  WHERE "sources" @> ARRAY['manual']::text[] AND "in_person_present" = true;
UPDATE "event_attendance" SET "online_manual" = true
  WHERE "sources" @> ARRAY['manual']::text[]
    AND ("in_person_present" IS NULL OR "in_person_present" = false)
    AND ("online_present_via_zoom" IS NULL OR "online_present_via_zoom" = false)
    AND "status" = 'present';

-- Drop legacy columns
ALTER TABLE "event_attendance" DROP COLUMN "online_present_via_zoom";
ALTER TABLE "event_attendance" DROP COLUMN "in_person_present";
ALTER TABLE "event_attendance" DROP COLUMN "sources";
