import z from "zod";

export const createTravelPlanZodSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    destination: z.string().min(2, "Destination must be at least 2 characters"),
    startDate: z.preprocess((arg) => {
      if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    }, z.date({ error: "Invalid start date" })),
    endDate: z.preprocess((arg) => {
      if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    }, z.date({ error: "Invalid end date" })),
    budgetRange: z.string().min(1, "Budget range is required"),
    travelType: z.enum(["GROUP", "COUPLE", "FRIENDS", "FAMILY", "SOLO"], {
      error: "Travel type  is required",
    }),
    visibility: z.boolean(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export const updateTravelPlanZodSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").optional(),
    description: z.string().optional(),
    imageUrl: z.string().url("Image URL must be a valid URL").optional(),
    destination: z
      .string()
      .min(2, "Destination must be at least 2 characters")
      .optional(),
    startDate: z.preprocess((arg) => {
      if (!arg) return undefined;
      if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    }, z.date({ error: "Invalid start date" }).optional()),
    endDate: z.preprocess((arg) => {
      if (!arg) return undefined;
      if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    }, z.date({ error: "Invalid end date" }).optional()),
    budgetRange: z.string().optional(),
    travelType: z
      .enum(["GROUP", "COUPLE", "FRIENDS", "FAMILY", "SOLO"], {
        error: "Travel type  is required",
      })
      .optional(),
    visibility: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) return data.endDate >= data.startDate;
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );
