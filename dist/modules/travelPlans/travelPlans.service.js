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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TravelService = void 0;
const client_1 = require("@prisma/client");
const db_1 = require("../../config/db");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const pagenationHelpers_1 = require("../../utils/pagenationHelpers");
const http_status_1 = __importDefault(require("http-status"));
//create travel plan
const createTravelPlan = (plan, travelerEmail) => __awaiter(void 0, void 0, void 0, function* () {
    // Step 1: find the traveler using email
    const traveler = yield db_1.prisma.traveler.findUnique({
        where: { email: travelerEmail },
    });
    if (!traveler) {
        throw new AppError_1.default(404, "Traveler profile not found");
    }
    // Step 2: Check profile completeness
    const isProfileComplete = traveler.contactNumber &&
        traveler.address &&
        traveler.profileImage &&
        traveler.bio &&
        traveler.currentLocation &&
        traveler.travelInterests.length > 0 &&
        traveler.visitedCountries.length > 0;
    if (!isProfileComplete) {
        throw new AppError_1.default(400, "Please complete your traveler profile before creating a travel plan");
    }
    // Step 3: Create the travel plan
    const result = yield db_1.prisma.travelPlan.create({
        data: Object.assign(Object.assign({}, plan), { travelerId: traveler.id }),
    });
    return result;
});
const getMyTravelPlans = (user, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = (0, pagenationHelpers_1.calculatePagination)(options);
    const traveler = yield db_1.prisma.traveler.findUnique({
        where: {
            email: user.email,
        },
    });
    if (!traveler) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Traveler profile not found");
    }
    const whereConditions = {
        travelerId: traveler.id, // Relation Field
    };
    const result = yield db_1.prisma.travelPlan.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
    });
    const total = yield db_1.prisma.travelPlan.count({ where: whereConditions });
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: result,
    };
});
const getTravelPlanMatches = (user) => __awaiter(void 0, void 0, void 0, function* () {
    // 1.find current user profile and interest findOut
    const currentUser = yield db_1.prisma.traveler.findUnique({
        where: { email: user.email },
    });
    if (!currentUser) {
        throw new AppError_1.default(404, "User profile not found");
    }
    const myInterests = currentUser.travelInterests || [];
    if (myInterests.length === 0) {
        return yield db_1.prisma.travelPlan.findMany({
            where: {
                travelerId: { not: currentUser.id },
            },
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
                traveler: {
                    select: {
                        name: true,
                        email: true,
                        profileImage: true,
                        averageRating: true,
                        travelInterests: true,
                    },
                },
            },
        });
    }
    const matchedPlans = yield db_1.prisma.travelPlan.findMany({
        where: {
            travelerId: { not: currentUser.id },
            traveler: {
                travelInterests: {
                    hasSome: myInterests,
                },
            },
        },
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
            traveler: {
                select: {
                    name: true,
                    email: true,
                    profileImage: true,
                    averageRating: true,
                    travelInterests: true,
                },
            },
        },
    });
    return matchedPlans;
});
//Get all Travel plans
const getAllTravelPlans = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = (0, pagenationHelpers_1.calculatePagination)(options);
    const { searchTerm, startDate, endDate } = filters, filterData = __rest(filters, ["searchTerm", "startDate", "endDate"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: [
                { destination: { contains: searchTerm, mode: "insensitive" } },
                { title: { contains: searchTerm, mode: "insensitive" } },
            ],
        });
    }
    // 2. Exact Match Filters (Like travelType, budgetRange)
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: filterData[key],
                },
            })),
        });
    }
    // 3. Date Range Search logic (NEW ADDITION)
    if (startDate && endDate) {
        andConditions.push({
            AND: [
                {
                    startDate: {
                        lte: new Date(startDate),
                    },
                },
                {
                    endDate: {
                        gte: new Date(endDate),
                    },
                },
            ],
        });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield db_1.prisma.travelPlan.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            traveler: {
                select: {
                    name: true,
                    email: true,
                    profileImage: true,
                    averageRating: true,
                },
            },
        },
    });
    const total = yield db_1.prisma.travelPlan.count({ where: whereConditions });
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: result,
    };
});
const getTravelPlanById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield db_1.prisma.travelPlan.findUniqueOrThrow({
        where: { id },
        include: {
            traveler: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    averageRating: true,
                },
            },
        },
    });
    return result;
});
const updateTravelPlan = (id, payload, travelerData) => __awaiter(void 0, void 0, void 0, function* () {
    const traveler = yield db_1.prisma.traveler.findUnique({
        where: {
            email: travelerData.email,
        },
    });
    if (!traveler) {
        throw new AppError_1.default(404, "Traveler not found");
    }
    const travelPlan = yield db_1.prisma.travelPlan.findUnique({
        where: {
            id: id,
        },
    });
    if (!travelPlan)
        throw new AppError_1.default(404, "Travel Plan not found");
    // Check ownership
    if (travelPlan.travelerId !== traveler.id) {
        throw new AppError_1.default(403, "You are not allowed to update this travel plan");
    }
    // Update plan
    const updatedPlan = yield db_1.prisma.travelPlan.update({
        where: { id: id },
        data: payload,
    });
    return updatedPlan;
});
const deleteTravelPlan = (id, travelerData) => __awaiter(void 0, void 0, void 0, function* () {
    let traveler = null;
    // If not admin → fetch traveler info
    if (travelerData.role !== client_1.UserRole.ADMIN) {
        traveler = yield db_1.prisma.traveler.findUnique({
            where: { email: travelerData.email },
        });
        if (!traveler) {
            throw new AppError_1.default(404, "Traveler not found");
        }
    }
    // Check if travel plan exists
    const travelPlan = yield db_1.prisma.travelPlan.findUnique({
        where: { id },
    });
    if (!travelPlan) {
        throw new AppError_1.default(404, "Travel Plan not found");
    }
    // Permission check
    if (travelerData.role !== client_1.UserRole.ADMIN &&
        travelPlan.travelerId !== (traveler === null || traveler === void 0 ? void 0 : traveler.id)) {
        throw new AppError_1.default(403, "You are not allowed to delete this travel plan");
    }
    // Admin OR owner traveler → delete
    const deletedPlan = yield db_1.prisma.travelPlan.delete({
        where: { id },
    });
    return deletedPlan;
});
exports.TravelService = {
    createTravelPlan,
    getMyTravelPlans,
    getTravelPlanById,
    getAllTravelPlans,
    updateTravelPlan,
    deleteTravelPlan,
    getTravelPlanMatches,
};
