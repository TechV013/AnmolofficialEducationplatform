-- AlterTable
ALTER TABLE "User" ADD COLUMN     "state" TEXT;
ALTER TABLE "User" ADD COLUMN     "district" TEXT;
ALTER TABLE "User" ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN     "marketingOptIn" BOOLEAN NOT NULL DEFAULT false;
