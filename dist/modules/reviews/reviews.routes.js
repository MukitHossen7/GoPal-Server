"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkAuth_1 = require("../../middlewares/checkAuth");
const client_1 = require("@prisma/client");
const reviews_controller_1 = require("./reviews.controller");
const zodValidateRequest_1 = require("../../middlewares/zodValidateRequest");
const reviews_zod_validation_1 = require("./reviews.zod.validation");
const reviewRoute = express_1.default.Router();
reviewRoute.post("/", (0, checkAuth_1.checkAuth)(client_1.UserRole.TRAVELER), (0, zodValidateRequest_1.zodValidateRequest)(reviews_zod_validation_1.createReviewZodSchema), reviews_controller_1.ReviewController.addReview);
reviewRoute.get("/:planId", reviews_controller_1.ReviewController.getReviewsForPlan);
// Admin can see all reviews (Optional: Remove checkAuth if public)
reviewRoute.get("/", 
// checkAuth(UserRole.ADMIN), // Uncomment if only admin should see ALL reviews list
reviews_controller_1.ReviewController.getAllReviews);
reviewRoute.patch("/:reviewId", (0, checkAuth_1.checkAuth)(client_1.UserRole.TRAVELER), // Only traveler can edit their own
(0, zodValidateRequest_1.zodValidateRequest)(reviews_zod_validation_1.updateReviewZodSchema), reviews_controller_1.ReviewController.updateReview);
reviewRoute.delete("/:reviewId", (0, checkAuth_1.checkAuth)(client_1.UserRole.ADMIN, client_1.UserRole.TRAVELER), // Admin OR Traveler can delete
reviews_controller_1.ReviewController.deleteReview);
exports.default = reviewRoute;
