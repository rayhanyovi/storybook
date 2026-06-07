-- CreateTable
CREATE TABLE "BookPage" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "imageSlot" TEXT,
    "text" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookPage_bookId_idx" ON "BookPage"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "BookPage_bookId_index_key" ON "BookPage"("bookId", "index");

-- AddForeignKey
ALTER TABLE "BookPage" ADD CONSTRAINT "BookPage_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
