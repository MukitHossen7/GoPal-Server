import { prisma } from "../config/db";

export const calculateAverageRating = async (travelPlanId: string) => {
  // 1. Get the Travel Plan to find the Host (Traveler)
  const travelPlan = await prisma.travelPlan.findUnique({
    where: { id: travelPlanId },
  });

  if (!travelPlan) return;

  // 2. Find all travel plans created by this Host
  const hostTravelPlans = await prisma.travelPlan.findMany({
    where: { travelerId: travelPlan.travelerId },
    select: { id: true },
  });

  const travelPlanIds = hostTravelPlans.map((p) => p.id);

  // 3. Aggregate ratings for all plans of this host
  const aggregations = await prisma.review.aggregate({
    where: { travelPlanId: { in: travelPlanIds } },
    _avg: { rating: true },
  });

  // 4. Update Host Profile
  await prisma.traveler.update({
    where: { id: travelPlan.travelerId },
    data: { averageRating: aggregations._avg.rating || 0 },
  });
};
