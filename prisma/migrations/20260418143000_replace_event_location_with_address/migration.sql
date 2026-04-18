-- Add the new address field first so existing rows can be backfilled safely
ALTER TABLE "Event"
ADD COLUMN IF NOT EXISTS "eventAddress" TEXT;

UPDATE "Event"
SET "eventAddress" = COALESCE(
  "eventAddress",
  'Lat: ' || "latitude"::TEXT || ', Lng: ' || "longitude"::TEXT
)
WHERE "eventAddress" IS NULL;

ALTER TABLE "Event"
ALTER COLUMN "eventAddress" SET NOT NULL;

-- Remove the old coordinate columns from the event model
ALTER TABLE "Event"
DROP COLUMN IF EXISTS "latitude";

ALTER TABLE "Event"
DROP COLUMN IF EXISTS "longitude";
