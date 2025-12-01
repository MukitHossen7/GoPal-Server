import z from "zod";

export const createReviewZodSchema = z.object({
  travelPlanId: z.string().uuid("Invalid travel plan ID"),
  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: z
    .string()
    .min(3, "Comment must be at least 3 characters long")
    .optional(),
});

export const updateReviewZodSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().optional(),
});
