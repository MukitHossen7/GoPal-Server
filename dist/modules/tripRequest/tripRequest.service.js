"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripRequestService = void 0;
const db_1 = require("../../config/db");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const requestToJoin = (user, travelPlanId) => __awaiter(void 0, void 0, void 0, function* () {
    const traveler = yield db_1.prisma.traveler.findUnique({
        where: { email: user.email },
    });
    if (!traveler)
        throw new AppError_1.default(404, "Traveler profile not found");
    // Subscription Check
    if (!traveler.isVerifiedTraveler) {
        throw new AppError_1.default(402, // Payment Required
        "You need a premium subscription to request joining a trip.");
    }
    if (traveler.subscriptionEndDate) {
        const currentDate = new Date();
        if (traveler.subscriptionEndDate < currentDate) {
            yield db_1.prisma.traveler.update({
                where: { id: traveler.id },
                data: { isVerifiedTraveler: false },
            });
            throw new AppError_1.default(402, "Your subscription has expired. Please renew to join trips.");
        }
    }
    const trip = yield db_1.prisma.travelPlan.findUnique({
        where: { id: travelPlanId },
    });
    if (!trip)
        throw new AppError_1.default(404, "Trip not found");
    // Check if own trip
    if (trip.travelerId === traveler.id) {
        throw new AppError_1.default(400, "You cannot join your own trip");
    }
    // Check duplicate request
    const existingRequest = yield db_1.prisma.tripRequest.findUnique({
        where: {
            travelPlanId_travelerId: {
                travelPlanId: travelPlanId,
                travelerId: traveler.id,
            },
        },
    });
    if (existingRequest)
        throw new AppError_1.default(400, "Request already sent");
    const result = yield db_1.prisma.tripRequest.create({
        data: {
            travelPlanId: travelPlanId,
            travelerId: traveler.id,
        },
    });
    return result;
});
// For Trip Owner to see who wants to join
const getIncomingRequests = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const traveler = yield db_1.prisma.traveler.findUnique({
        where: { email: user.email },
    });
    if (!traveler)
        throw new AppError_1.default(404, "Traveler not found");
    // Find trips created by this user
    const myTrips = yield db_1.prisma.travelPlan.findMany({
        where: { travelerId: traveler.id },
        select: { id: true },
    });
    const myTripIds = myTrips.map((t) => t.id);
    const requests = yield db_1.prisma.tripRequest.findMany({
        where: { travelPlanId: { in: myTripIds } },
        include: {
            traveler: {
                select: { id: true, name: true, email: true, profileImage: true },
            },
            travelPlan: { select: { id: true, destination: true, title: true } },
        },
    });
    return requests;
});
const respondToRequest = (user, requestId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const traveler = yield db_1.prisma.traveler.findUnique({
        where: { email: user.email },
    });
    const tripRequest = yield db_1.prisma.tripRequest.findUnique({
        where: { id: requestId },
        include: { travelPlan: true },
    });
    if (!tripRequest)
        throw new AppError_1.default(404, "Request not found");
    // Verify ownership
    if (tripRequest.travelPlan.travelerId !== (traveler === null || traveler === void 0 ? void 0 : traveler.id)) {
        throw new AppError_1.default(403, "This is not your trip request to manage");
    }
    const updatedRequest = yield db_1.prisma.tripRequest.update({
        where: { id: requestId },
        data: { status },
    });
    return updatedRequest;
});
exports.TripRequestService = {
    requestToJoin,
    getIncomingRequests,
    respondToRequest,
};
