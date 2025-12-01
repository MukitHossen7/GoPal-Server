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
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAverageRating = void 0;
const db_1 = require("../config/db");
const calculateAverageRating = (travelPlanId) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Get the Travel Plan to find the Host (Traveler)
    const travelPlan = yield db_1.prisma.travelPlan.findUnique({
        where: { id: travelPlanId },
    });
    if (!travelPlan)
        return;
    // 2. Find all travel plans created by this Host
    const hostTravelPlans = yield db_1.prisma.travelPlan.findMany({
        where: { travelerId: travelPlan.travelerId },
        select: { id: true },
    });
    const travelPlanIds = hostTravelPlans.map((p) => p.id);
    // 3. Aggregate ratings for all plans of this host
    const aggregations = yield db_1.prisma.review.aggregate({
        where: { travelPlanId: { in: travelPlanIds } },
        _avg: { rating: true },
    });
    // 4. Update Host Profile
    yield db_1.prisma.traveler.update({
        where: { id: travelPlan.travelerId },
        data: { averageRating: aggregations._avg.rating || 0 },
    });
});
exports.calculateAverageRating = calculateAverageRating;
