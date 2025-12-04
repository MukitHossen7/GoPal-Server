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
exports.UserService = void 0;
const client_1 = require("@prisma/client");
const config_1 = __importDefault(require("../../config"));
const db_1 = require("../../config/db");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_status_1 = __importDefault(require("http-status"));
const pagenationHelpers_1 = require("../../utils/pagenationHelpers");
const getAllTravelers = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = (0, pagenationHelpers_1.calculatePagination)(options);
    const { searchTerm } = filters, filterData = __rest(filters, ["searchTerm"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: [
                { name: { contains: searchTerm, mode: "insensitive" } },
                { bio: { contains: searchTerm, mode: "insensitive" } },
                { currentLocation: { contains: searchTerm, mode: "insensitive" } },
            ],
        });
    }
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: filterData[key],
                },
            })),
        });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield db_1.prisma.traveler.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
    });
    const total = yield db_1.prisma.traveler.count({ where: whereConditions });
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
const getRecommendedTravelers = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const currentUser = yield db_1.prisma.traveler.findUnique({
        where: { email: user.email },
        select: { id: true, travelInterests: true },
    });
    if (!currentUser) {
        throw new AppError_1.default(404, "User profile not found");
    }
    if (!currentUser.travelInterests ||
        currentUser.travelInterests.length === 0) {
        return yield db_1.prisma.traveler.findMany({
            where: {
                id: { not: currentUser.id },
            },
            take: 10,
            select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
                travelInterests: true,
                averageRating: true,
                currentLocation: true,
            },
        });
    }
    const matchedTravelers = yield db_1.prisma.traveler.findMany({
        where: {
            id: { not: currentUser.id },
            travelInterests: {
                hasSome: currentUser.travelInterests,
            },
        },
        take: 20,
        orderBy: {
            averageRating: "desc",
        },
        select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            travelInterests: true,
            averageRating: true,
            currentLocation: true,
        },
    });
    return matchedTravelers;
});
const getMyProfile = (user) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(user === null || user === void 0 ? void 0 : user.email) || !(user === null || user === void 0 ? void 0 : user.role)) {
        throw new Error("Invalid user token");
    }
    let profileData;
    switch (user.role) {
        case client_1.UserRole.ADMIN:
            profileData = yield db_1.prisma.admin.findUnique({
                where: { email: user.email },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            needPasswordChange: true,
                            role: true,
                            status: true,
                            gender: true,
                        },
                    },
                },
            });
            break;
        case client_1.UserRole.TRAVELER:
            profileData = yield db_1.prisma.traveler.findUnique({
                where: { email: user.email },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            needPasswordChange: true,
                            role: true,
                            status: true,
                            gender: true,
                        },
                    },
                },
            });
            break;
        default:
            throw new Error("Unauthorized user role");
    }
    if (!profileData) {
        throw new Error("Profile not found");
    }
    return profileData;
});
const register = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const hashPassword = yield bcryptjs_1.default.hash(payload.password, Number(config_1.default.BCRYPTSALTROUND));
    const createTraveler = yield db_1.prisma.$transaction((tnx) => __awaiter(void 0, void 0, void 0, function* () {
        yield tnx.user.create({
            data: {
                email: payload.email,
                password: hashPassword,
                role: client_1.UserRole.TRAVELER,
            },
        });
        const travelerData = yield tnx.traveler.create({
            data: {
                name: payload.name,
                email: payload.email,
            },
        });
        return travelerData;
    }));
    return createTraveler;
});
const updateMyProfile = (user, payload // Gender payload এ থাকতে পারে তাই টাইপ এক্সটেন্ড করা হলো
) => __awaiter(void 0, void 0, void 0, function* () {
    const email = user === null || user === void 0 ? void 0 : user.email;
    const role = user === null || user === void 0 ? void 0 : user.role;
    if (!email) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized user");
    }
    // Email should never be updated via this route
    if (payload.email) {
        delete payload.email;
    }
    let updatedProfile;
    // =========================================================
    // CASE 1: If user is TRAVELER
    // =========================================================
    if (role === client_1.UserRole.TRAVELER) {
        const { gender } = payload, travelerData = __rest(payload, ["gender"]);
        updatedProfile = yield db_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const traveler = yield tx.traveler.findUnique({ where: { email } });
            if (!traveler) {
                throw new AppError_1.default(404, "Traveler profile not found");
            }
            // ৩. Traveler
            const result = yield tx.traveler.update({
                where: { email },
                data: Object.assign(Object.assign({}, travelerData), { updatedAt: new Date() }),
            });
            if (gender) {
                yield tx.user.update({
                    where: { email },
                    data: { gender: gender },
                });
            }
            return result;
        }));
        return updatedProfile;
    }
    // =========================================================
    // CASE 2: If user is ADMIN
    // =========================================================
    if (role === client_1.UserRole.ADMIN) {
        const admin = yield db_1.prisma.admin.findUnique({ where: { email } });
        if (!admin) {
            throw new AppError_1.default(404, "Admin profile not found");
        }
        updatedProfile = yield db_1.prisma.admin.update({
            where: { email },
            data: Object.assign(Object.assign({}, payload), { updatedAt: new Date() }),
        });
        return updatedProfile;
    }
    return updatedProfile;
});
exports.UserService = {
    getMyProfile,
    getAllTravelers,
    register,
    updateMyProfile,
    getRecommendedTravelers,
};
