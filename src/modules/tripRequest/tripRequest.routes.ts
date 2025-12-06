import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { TripRequestController } from "./tripRequest.controller";

const tripRequestRoute = express.Router();

tripRequestRoute.get(
  "/my-request",
  checkAuth(UserRole.TRAVELER),
  TripRequestController.getMyTripRequest
);

// Send a request to join a trip
tripRequestRoute.post(
  "/request",
  checkAuth(UserRole.TRAVELER),
  TripRequestController.sendTripRequest
);

// Get requests for my trips (As a host)
tripRequestRoute.get(
  "/incoming",
  checkAuth(UserRole.TRAVELER),
  TripRequestController.getIncomingRequests
);

// Accept or Reject request
tripRequestRoute.patch(
  "/respond",
  checkAuth(UserRole.TRAVELER),
  TripRequestController.respondToRequest
);

export default tripRequestRoute;
