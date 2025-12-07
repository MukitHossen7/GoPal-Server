import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { ActivityController } from "./activity.controller";

const activityRoute = express.Router();

activityRoute.get(
  "/",
  checkAuth(UserRole.ADMIN),
  ActivityController.getSystemActivities
);

export default activityRoute;
