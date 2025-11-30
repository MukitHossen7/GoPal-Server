import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { TravelController } from "./travelPlans.controller";

const travelPlanRoute = express.Router();

travelPlanRoute.post(
  "/",
  checkAuth(UserRole.TRAVELER),
  TravelController.createTravelPlan
);

travelPlanRoute.get("/", TravelController.getAllTravelPlans);
travelPlanRoute.get(
  "/:id",
  checkAuth(UserRole.TRAVELER, UserRole.ADMIN),
  TravelController.getTravelPlanById
);

travelPlanRoute.patch(
  "/:id",
  checkAuth(UserRole.TRAVELER),
  TravelController.updateTravelPlan
);

travelPlanRoute.delete(
  "/:id",
  checkAuth(UserRole.TRAVELER, UserRole.ADMIN),
  TravelController.deleteTravelPlan
);

export default travelPlanRoute;
