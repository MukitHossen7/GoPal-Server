import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { UserController } from "./user.controller";
import { zodValidateRequest } from "../../middlewares/zodValidateRequest";
import { createTravelerZodSchema } from "./user.zod.validation";

const userRoute = express.Router();

userRoute.get("/", checkAuth(UserRole.ADMIN), UserController.getAllUsers);

userRoute.get(
  "/me",
  checkAuth(UserRole.ADMIN, UserRole.TRAVELER),
  UserController.getMyProfile
);

userRoute.post(
  "/register",
  zodValidateRequest(createTravelerZodSchema),
  UserController.register
);

export default userRoute;
