"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReviewZodSchema = exports.createReviewZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createReviewZodSchema = zod_1.default.object({
    travelPlanId: zod_1.default.string().uuid("Invalid travel plan ID"),
    rating: zod_1.default
        .number()
        .min(1, "Rating must be at least 1")
        .max(5, "Rating must be at most 5"),
    comment: zod_1.default
        .string()
        .min(3, "Comment must be at least 3 characters long")
        .optional(),
});
exports.updateReviewZodSchema = zod_1.default.object({
    rating: zod_1.default.number().min(1).max(5).optional(),
    comment: zod_1.default.string().optional(),
});
