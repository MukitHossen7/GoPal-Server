import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { TravelController } from "./travelPlans.controller";
import { zodValidateRequest } from "../../middlewares/zodValidateRequest";
import {
  createTravelPlanZodSchema,
  updateTravelPlanZodSchema,
} from "./travelPlans.zod.validation";
import { multerUpload } from "../../config/multer.config";

const travelPlanRoute = express.Router();

travelPlanRoute.post(
  "/",
  checkAuth(UserRole.TRAVELER),
  multerUpload.single("file"),
  zodValidateRequest(createTravelPlanZodSchema),
  TravelController.createTravelPlan
);

// 2. Get Matches
travelPlanRoute.get(
  "/matches",
  checkAuth(UserRole.TRAVELER),
  TravelController.getTravelPlanMatches
);

//get my travel plans
travelPlanRoute.get(
  "/my-plans",
  checkAuth(UserRole.TRAVELER),
  TravelController.getMyTravelPlans
);

travelPlanRoute.get("/", TravelController.getAllTravelPlans);
travelPlanRoute.get(
  "/:id",
  // checkAuth(UserRole.TRAVELER, UserRole.ADMIN),
  TravelController.getTravelPlanById
);

travelPlanRoute.patch(
  "/:id",
  checkAuth(UserRole.TRAVELER),
  multerUpload.single("file"),
  zodValidateRequest(updateTravelPlanZodSchema),
  TravelController.updateTravelPlan
);

travelPlanRoute.delete(
  "/:id",
  checkAuth(UserRole.TRAVELER, UserRole.ADMIN),
  TravelController.deleteTravelPlan
);

export default travelPlanRoute;
