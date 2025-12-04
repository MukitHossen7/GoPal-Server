"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkAuth_1 = require("../../middlewares/checkAuth");
const client_1 = require("@prisma/client");
const travelPlans_controller_1 = require("./travelPlans.controller");
const zodValidateRequest_1 = require("../../middlewares/zodValidateRequest");
const travelPlans_zod_validation_1 = require("./travelPlans.zod.validation");
const travelPlanRoute = express_1.default.Router();
travelPlanRoute.post("/", (0, checkAuth_1.checkAuth)(client_1.UserRole.TRAVELER), (0, zodValidateRequest_1.zodValidateRequest)(travelPlans_zod_validation_1.createTravelPlanZodSchema), travelPlans_controller_1.TravelController.createTravelPlan);
// 2. Get Matches
travelPlanRoute.get("/matches", (0, checkAuth_1.checkAuth)(client_1.UserRole.TRAVELER), travelPlans_controller_1.TravelController.getTravelPlanMatches);
travelPlanRoute.get("/", (0, checkAuth_1.checkAuth)(client_1.UserRole.TRAVELER, client_1.UserRole.ADMIN), travelPlans_controller_1.TravelController.getAllTravelPlans);
travelPlanRoute.get("/:id", (0, checkAuth_1.checkAuth)(client_1.UserRole.TRAVELER, client_1.UserRole.ADMIN), travelPlans_controller_1.TravelController.getTravelPlanById);
travelPlanRoute.patch("/:id", (0, checkAuth_1.checkAuth)(client_1.UserRole.TRAVELER), (0, zodValidateRequest_1.zodValidateRequest)(travelPlans_zod_validation_1.updateTravelPlanZodSchema), travelPlans_controller_1.TravelController.updateTravelPlan);
travelPlanRoute.delete("/:id", (0, checkAuth_1.checkAuth)(client_1.UserRole.TRAVELER, client_1.UserRole.ADMIN), travelPlans_controller_1.TravelController.deleteTravelPlan);
exports.default = travelPlanRoute;
