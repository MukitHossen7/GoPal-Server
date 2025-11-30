-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "tripRequests" (
    "id" TEXT NOT NULL,
    "travelPlanId" TEXT NOT NULL,
    "travelerId" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tripRequests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tripRequests_travelPlanId_travelerId_key" ON "tripRequests"("travelPlanId", "travelerId");

-- AddForeignKey
ALTER TABLE "tripRequests" ADD CONSTRAINT "tripRequests_travelPlanId_fkey" FOREIGN KEY ("travelPlanId") REFERENCES "travelPlans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tripRequests" ADD CONSTRAINT "tripRequests_travelerId_fkey" FOREIGN KEY ("travelerId") REFERENCES "travelers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
