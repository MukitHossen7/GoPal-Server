-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "travelers" ADD COLUMN     "isVerifiedTraveler" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "subscription" TEXT NOT NULL,
    "stripeSessionId" TEXT,
    "travelerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_travelerId_fkey" FOREIGN KEY ("travelerId") REFERENCES "travelers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
