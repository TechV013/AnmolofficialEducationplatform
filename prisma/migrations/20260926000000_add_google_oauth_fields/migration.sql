-- Add Google OAuth linking fields to User
ALTER TABLE "User" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'credentials';
ALTER TABLE "User" ADD COLUMN "providerAccountId" TEXT;
CREATE UNIQUE INDEX "User_providerAccountId_key" ON "User"("providerAccountId");