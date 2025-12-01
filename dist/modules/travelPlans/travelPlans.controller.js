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
exports.TravelController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const travelPlans_service_1 = require("./travelPlans.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const pick_1 = require("../../utils/pick");
const createTravelPlan = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const payload = req.body;
    const travelerEmail = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.email;
    const result = yield travelPlans_service_1.TravelService.createTravelPlan(payload, travelerEmail);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Create Travel Plane successfully",
        data: result,
    });
}));
const getTravelPlanMatches = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield travelPlans_service_1.TravelService.getTravelPlanMatches(user);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Matched travel plans retrieved successfully",
        data: result,
    });
}));
const getTravelPlanById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const travelPlanId = req.params.id;
    const result = yield travelPlans_service_1.TravelService.getTravelPlanById(travelPlanId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Travel Plan retrieved successfully",
        data: result,
    });
}));
const getAllTravelPlans = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.pick)(req.query, ["searchTerm", "destination", "travelType"]);
    const options = (0, pick_1.pick)(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const result = yield travelPlans_service_1.TravelService.getAllTravelPlans(filters, options);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Travel Plans retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
}));
const updateTravelPlan = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const travelPlanId = req.params.id;
    const payload = req.body;
    const travelerData = req.user;
    const result = yield travelPlans_service_1.TravelService.updateTravelPlan(travelPlanId, payload, travelerData);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Travel Plan updated successfully",
        data: result,
    });
}));
const deleteTravelPlan = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const travelPlanId = req.params.id;
    const travelerData = req.user;
    const result = yield travelPlans_service_1.TravelService.deleteTravelPlan(travelPlanId, travelerData);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Travel Plan deleted successfully",
        data: result,
    });
}));
exports.TravelController = {
    createTravelPlan,
    getTravelPlanById,
    getAllTravelPlans,
    updateTravelPlan,
    deleteTravelPlan,
    getTravelPlanMatches,
};
