"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const client_1 = require("@prisma/client");
const db_1 = require("../../config/db");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const calculateAverageRating_1 = require("../../utils/calculateAverageRating");
const pagenationHelpers_1 = require("../../utils/pagenationHelpers");
const addReview = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check if the traveler exists
    const traveler = yield db_1.prisma.traveler.findUnique({
        where: { email: user.email },
    });
    if (!traveler)
        throw new AppError_1.default(404, "Traveler not found");
    // 2. Check if the trip exists
    const trip = yield db_1.prisma.travelPlan.findUnique({
        where: { id: payload.travelPlanId },
    });
    if (!trip)
        throw new AppError_1.default(404, "Trip not found");
    // 3. Create Review
    const review = yield db_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const newReview = yield tx.review.create({
            data: {
                travelerId: traveler.id,
                travelPlanId: payload.travelPlanId,
                rating: payload.rating,
                comment: payload.comment,
            },
        });
        // 4. Update Trip Host's Average Rating
        const travelerData = yield tx.traveler.findUnique({
            where: { id: trip.travelerId },
        });
        // Find all travel plans by this host
        const travelPlans = yield tx.travelPlan.findMany({
            where: { travelerId: trip.travelerId },
            select: { id: true },
        });
        const travelPlanIds = travelPlans.map((p) => p.id);
        const aggregations = yield tx.review.aggregate({
            where: { travelPlanId: { in: travelPlanIds } },
            _avg: { rating: true },
        });
        if (travelerData) {
            yield tx.traveler.update({
                where: { id: travelerData.id },
                data: { averageRating: aggregations._avg.rating || 0 },
            });
        }
        return newReview;
    }));
    return review;
});
const getReviewsForTravelPlan = (travelPlanId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield db_1.prisma.review.findMany({
        where: { travelPlanId },
        include: {
            traveler: {
                select: { name: true, profileImage: true },
            },
        },
    });
});
// --- 1. Get ALL Reviews (For Admin or General View) ---
const getAllReviews = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = (0, pagenationHelpers_1.calculatePagination)(options);
    const reviewData = yield db_1.prisma.review.findMany({
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
    const total = yield db_1.prisma.review.count();
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: reviewData,
    };
});
// --- 2. Update Review ---
const updateReview = (user, reviewId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if review exists
    const review = yield db_1.prisma.review.findUnique({
        where: { id: reviewId },
    });
    if (!review)
        throw new AppError_1.default(404, "Review not found");
    // Find the traveler trying to update
    const traveler = yield db_1.prisma.traveler.findUnique({
        where: { email: user.email },
    });
    if (!traveler)
        throw new AppError_1.default(404, "User profile not found");
    // Ownership Check: Only the creator can edit
    if (review.travelerId !== traveler.id) {
        throw new AppError_1.default(403, "You are not authorized to edit this review");
    }
    // Update
    const updatedReview = yield db_1.prisma.review.update({
        where: { id: reviewId },
        data: payload,
    });
    // Recalculate Host Rating if rating changed
    if (payload.rating) {
        yield (0, calculateAverageRating_1.calculateAverageRating)(review.travelPlanId);
    }
    return updatedReview;
});
// --- 3. Delete Review ---
const deleteReview = (user, reviewId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if review exists
    const review = yield db_1.prisma.review.findUnique({
        where: { id: reviewId },
    });
    if (!review)
        throw new AppError_1.default(404, "Review not found");
    // Find the traveler attempting delete (if not admin)
    const traveler = yield db_1.prisma.traveler.findUnique({
        where: { email: user.email },
    });
    // Authorization Check:
    // Admin can delete ANY review.
    // Traveler can ONLY delete their OWN review.
    const isAdmin = user.role === client_1.UserRole.ADMIN;
    const isOwner = traveler && review.travelerId === traveler.id;
    if (!isAdmin && !isOwner) {
        throw new AppError_1.default(403, "You are not authorized to delete this review");
    }
    // Delete
    yield db_1.prisma.review.delete({
        where: { id: reviewId },
    });
    // Recalculate Host Rating
    yield (0, calculateAverageRating_1.calculateAverageRating)(review.travelPlanId);
    return { message: "Review deleted successfully" };
});
exports.ReviewService = {
    addReview,
    getReviewsForTravelPlan,
    getAllReviews,
    updateReview,
    deleteReview,
};
