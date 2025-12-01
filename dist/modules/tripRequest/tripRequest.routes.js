"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkAuth_1 = require("../../middlewares/checkAuth");
const client_1 = require("@prisma/client");
const tripRequest_controller_1 = require("./tripRequest.controller");
const tripRequestRoute = express_1.default.Router();
// Send a request to join a trip
tripRequestRoute.post("/request", (0, checkAuth_1.checkAuth)(client_1.UserRole.TRAVELER), tripRequest_controller_1.TripRequestController.sendTripRequest);
// Get requests for my trips (As a host)
tripRequestRoute.get("/incoming", (0, checkAuth_1.checkAuth)(client_1.UserRole.TRAVELER), tripRequest_controller_1.TripRequestController.getIncomingRequests);
// Accept or Reject request
tripRequestRoute.patch("/respond", (0, checkAuth_1.checkAuth)(client_1.UserRole.TRAVELER), tripRequest_controller_1.TripRequestController.respondToRequest);
exports.default = tripRequestRoute;
