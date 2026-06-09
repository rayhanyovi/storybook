-- Bookmark means reading position in this product, not saved-for-later.
DROP TABLE IF EXISTS "Bookmark";

ALTER TABLE "ReadingProgress"
ADD COLUMN IF NOT EXISTS "currentPage" INTEGER NOT NULL DEFAULT 1;
