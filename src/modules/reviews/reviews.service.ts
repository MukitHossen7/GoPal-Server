import { prisma } from "../../config/db";
import AppError from "../../errorHelpers/AppError";
import { IJwtPayload } from "../../types/common";

const addReview = async (
  user: IJwtPayload,
  payload: { travelPlanId: string; rating: number; comment: string }
) => {
  // 1. Check if the traveler exists
  const traveler = await prisma.traveler.findUnique({
    where: { email: user.email },
  });

  if (!traveler) throw new AppError(404, "Traveler not found");

  // 2. Check if the trip exists
  const trip = await prisma.travelPlan.findUnique({
    where: { id: payload.travelPlanId },
  });
  if (!trip) throw new AppError(404, "Trip not found");

  // 3. Create Review
  const review = await prisma.$transaction(async (tx) => {
    const newReview = await tx.review.create({
      data: {
        travelerId: traveler.id,
        travelPlanId: payload.travelPlanId,
        rating: payload.rating,
        comment: payload.comment,
      },
    });

    // 4. Update Trip Host's Average Rating
    // Host কে খুঁজে বের করা
    const host = await tx.traveler.findUnique({
      where: { id: trip.travelerId },
    });

    // সেই ট্রাভেলারের নামে সব ট্রিপের সব রিভিউ বের করা
    // Note: এটি একটি সিম্পল লজিক। প্রোডাকশনে এগ্রিগেশন ব্যবহার করা ভালো।
    // এখানে আমরা Host এর সব ট্রিপের রিভিউ গড় করছি না, বরং যে ট্রাভেলার রিভিউ দিচ্ছে তার রেটিং নিচ্ছি না।
    // লজিক: Host এর TravelPlan এ রিভিউ পড়লে Host এর রেটিং বাড়বে।

    // Find all travel plans by this host
    const hostPlans = await tx.travelPlan.findMany({
      where: { travelerId: trip.travelerId },
      select: { id: true },
    });

    const hostPlanIds = hostPlans.map((p) => p.id);

    const aggregations = await tx.review.aggregate({
      where: { travelPlanId: { in: hostPlanIds } },
      _avg: { rating: true },
    });

    if (host) {
      await tx.traveler.update({
        where: { id: host.id },
        data: { averageRating: aggregations._avg.rating || 0 },
      });
    }

    return newReview;
  });

  return review;
};

const getReviewsForTravelPlan = async (travelPlanId: string) => {
  return await prisma.review.findMany({
    where: { travelPlanId },
    include: {
      traveler: {
        select: { name: true, profileImage: true },
      },
    },
  });
};

export const ReviewService = {
  addReview,
  getReviewsForTravelPlan,
};
