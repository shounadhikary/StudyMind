-- CreateTable
CREATE TABLE "flashcard_reviews" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "card_id" TEXT,
    "rating" TEXT NOT NULL,
    "reviewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flashcard_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "flashcard_reviews_user_id_reviewed_at_idx" ON "flashcard_reviews"("user_id", "reviewed_at");

-- AddForeignKey
ALTER TABLE "flashcard_reviews" ADD CONSTRAINT "flashcard_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
