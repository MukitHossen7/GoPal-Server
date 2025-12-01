import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { ReviewController } from "./reviews.controller";
import { zodValidateRequest } from "../../middlewares/zodValidateRequest";
import {
  createReviewZodSchema,
  updateReviewZodSchema,
} from "./reviews.zod.validation";

const reviewRoute = express.Router();

reviewRoute.post(
  "/",
  checkAuth(UserRole.TRAVELER),
  zodValidateRequest(createReviewZodSchema),
  ReviewController.addReview
);

reviewRoute.get("/:planId", ReviewController.getReviewsForPlan);

// Admin can see all reviews (Optional: Remove checkAuth if public)
reviewRoute.get(
  "/",
  // checkAuth(UserRole.ADMIN), // Uncomment if only admin should see ALL reviews list
  ReviewController.getAllReviews
);

reviewRoute.patch(
  "/:reviewId",
  checkAuth(UserRole.TRAVELER), // Only traveler can edit their own
  zodValidateRequest(updateReviewZodSchema),
  ReviewController.updateReview
);

reviewRoute.delete(
  "/:reviewId",
  checkAuth(UserRole.ADMIN, UserRole.TRAVELER), // Admin OR Traveler can delete
  ReviewController.deleteReview
);

export default reviewRoute;
