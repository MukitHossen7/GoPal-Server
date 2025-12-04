import z from "zod";

export const createTravelerZodSchema = z.object({
  password: z.string({
    error: "Password is required",
  }),
  name: z.string({
    error: "Name is required",
  }),
  email: z.email(),
});

export const updateTravelerProfileZodSchema = z.object({
  name: z.string().optional(),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
  profileImage: z.string().url().optional(),
  bio: z.string().optional(),
  travelInterests: z.array(z.string()).optional(),
  visitedCountries: z.array(z.string()).optional(),
  currentLocation: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
});
