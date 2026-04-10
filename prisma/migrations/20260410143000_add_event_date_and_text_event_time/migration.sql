-- Add eventDate for event scheduling
ALTER TABLE "Event"
ADD COLUMN IF NOT EXISTS "eventDate" TIMESTAMP(3);

-- Backfill existing rows so the column can be made required
UPDATE "Event"
SET "eventDate" = COALESCE("eventDate", "createdAt")
WHERE "eventDate" IS NULL;

ALTER TABLE "Event"
ALTER COLUMN "eventDate" SET NOT NULL;

-- Align eventTime with the API, which stores time as a simple string like "10:00"
ALTER TABLE "Event"
ALTER COLUMN "eventTime" TYPE TEXT USING "eventTime"::TEXT;
