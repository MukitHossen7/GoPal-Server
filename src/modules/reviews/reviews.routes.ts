import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { ReviewController } from "./reviews.controller";

const reviewRoute = express.Router();
reviewRoute.post("/", checkAuth(UserRole.TRAVELER), ReviewController.addReview);

reviewRoute.get("/:planId", ReviewController.getReviewsForPlan);
export default reviewRoute;
