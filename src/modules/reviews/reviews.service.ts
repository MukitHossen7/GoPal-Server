import { UserRole } from "@prisma/client";
import { prisma } from "../../config/db";
import AppError from "../../errorHelpers/AppError";
import { IJwtPayload } from "../../types/common";
import { calculateAverageRating } from "../../utils/calculateAverageRating";
import { calculatePagination, TOptions } from "../../utils/pagenationHelpers";

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

  // 3. Check if the reviewer is the owner of the trip
  if (traveler.id === trip.travelerId) {
    throw new AppError(403, "You cannot review your own travel plan");
  }

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
    const travelerData = await tx.traveler.findUnique({
      where: { id: trip.travelerId },
    });

    // Find all travel plans by this host
    const travelPlans = await tx.travelPlan.findMany({
      where: { travelerId: trip.travelerId },
      select: { id: true },
    });

    const travelPlanIds = travelPlans.map((p) => p.id);

    const aggregations = await tx.review.aggregate({
      where: { travelPlanId: { in: travelPlanIds } },
      _avg: { rating: true },
    });

    if (travelerData) {
      await tx.traveler.update({
        where: { id: travelerData.id },
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

// --- 1. Get ALL Reviews (For Admin or General View) ---
const getAllReviews = async (options: TOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

  const reviewData = await prisma.review.findMany({
    include: {
      traveler: { select: { name: true, email: true } },
      travelPlan: { select: { title: true, destination: true } },
    },
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.review.count();

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: reviewData,
  };
};

// --- 2. Update Review ---
const updateReview = async (
  user: IJwtPayload,
  reviewId: string,
  payload: { rating?: number; comment?: string }
) => {
  // Check if review exists
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) throw new AppError(404, "Review not found");

  // Find the traveler trying to update
  const traveler = await prisma.traveler.findUnique({
    where: { email: user.email },
  });

  if (!traveler) throw new AppError(404, "User profile not found");

  // Ownership Check: Only the creator can edit
  if (review.travelerId !== traveler.id) {
    throw new AppError(403, "You are not authorized to edit this review");
  }

  // Update
  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: payload,
  });

  // Recalculate Host Rating if rating changed
  if (payload.rating) {
    await calculateAverageRating(review.travelPlanId);
  }

  return updatedReview;
};

// --- 3. Delete Review ---
const deleteReview = async (user: IJwtPayload, reviewId: string) => {
  // Check if review exists
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) throw new AppError(404, "Review not found");

  // Find the traveler attempting delete (if not admin)
  const traveler = await prisma.traveler.findUnique({
    where: { email: user.email },
  });

  // Authorization Check:
  // Admin can delete ANY review.
  // Traveler can ONLY delete their OWN review.
  const isAdmin = user.role === UserRole.ADMIN;
  const isOwner = traveler && review.travelerId === traveler.id;

  if (!isAdmin && !isOwner) {
    throw new AppError(403, "You are not authorized to delete this review");
  }

  // Delete
  await prisma.review.delete({
    where: { id: reviewId },
  });

  // Recalculate Host Rating
  await calculateAverageRating(review.travelPlanId);

  return { message: "Review deleted successfully" };
};

export const ReviewService = {
  addReview,
  getReviewsForTravelPlan,
  getAllReviews,
  updateReview,
  deleteReview,
};
