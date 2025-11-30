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
