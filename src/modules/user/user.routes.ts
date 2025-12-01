import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { UserController } from "./user.controller";
import { zodValidateRequest } from "../../middlewares/zodValidateRequest";
import {
  createTravelerZodSchema,
  updateTravelerProfileZodSchema,
} from "./user.zod.validation";
import { multerUpload } from "../../config/multer.config";

const userRoute = express.Router();

userRoute.get("/", UserController.getAllTravelers);

userRoute.get(
  "/matches",
  checkAuth(UserRole.TRAVELER),
  UserController.getTravelBuddyMatches
);

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

userRoute.patch(
  "/update-my-profile",
  checkAuth(UserRole.TRAVELER, UserRole.ADMIN),
  multerUpload.single("file"),
  zodValidateRequest(updateTravelerProfileZodSchema),
  UserController.updateMyProfile
);

export default userRoute;
