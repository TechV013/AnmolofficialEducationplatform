-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "priceOld" DECIMAL(10,2),
ADD COLUMN     "promoVideoUrl" TEXT,
ADD COLUMN     "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "whatYouWillLearn" TEXT[] DEFAULT ARRAY[]::TEXT[];