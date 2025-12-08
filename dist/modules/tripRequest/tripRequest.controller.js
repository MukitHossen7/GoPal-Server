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
exports.TripRequestController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const tripRequest_service_1 = require("./tripRequest.service");
const sendTripRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { travelPlanId } = req.body;
    const result = yield tripRequest_service_1.TripRequestService.requestToJoin(user, travelPlanId);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Request sent successfully",
        data: result,
    });
}));
const getMyTripRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield tripRequest_service_1.TripRequestService.getMyTripRequests(user);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "My trip requests retrieved successfully",
        data: result,
    });
}));
const getIncomingRequests = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield tripRequest_service_1.TripRequestService.getIncomingRequests(user);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Incoming requests retrieved",
        data: result,
    });
}));
const respondToRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { requestId, status } = req.body; // status: APPROVED | REJECTED
    const result = yield tripRequest_service_1.TripRequestService.respondToRequest(user, requestId, status);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Request ${status.toLowerCase()} successfully`,
        data: result,
    });
}));
exports.TripRequestController = {
    sendTripRequest,
    getMyTripRequest,
    getIncomingRequests,
    respondToRequest,
};
