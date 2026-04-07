UPDATE "User"
SET "email" = LOWER("username") || '@example.com'
WHERE "email" IS NULL;

ALTER TABLE "User"
ALTER COLUMN "email" SET NOT NULL;
