import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { StatsController } from "./stats.controller";

const statsRoute = express.Router();

statsRoute.get(
  "/dashboard/traveler",
  checkAuth(UserRole.TRAVELER),
  StatsController.getTravelerDashboardData
);

// Admin Dashboard (New Route)
statsRoute.get(
  "/dashboard/admin",
  checkAuth(UserRole.ADMIN),
  StatsController.getAdminDashboardData
);
export default statsRoute;
