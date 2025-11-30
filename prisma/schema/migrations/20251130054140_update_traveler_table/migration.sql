/*
  Warnings:

  - You are about to drop the column `profilePhoto` on the `admins` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "admins" DROP COLUMN "profilePhoto",
ADD COLUMN     "profileImage" TEXT;
