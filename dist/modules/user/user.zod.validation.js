"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTravelerProfileZodSchema = exports.createTravelerZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createTravelerZodSchema = zod_1.default.object({
    password: zod_1.default.string({
        error: "Password is required",
    }),
    name: zod_1.default.string({
        error: "Name is required",
    }),
    email: zod_1.default.email(),
});
exports.updateTravelerProfileZodSchema = zod_1.default.object({
    name: zod_1.default.string().optional(),
    contactNumber: zod_1.default.string().optional(),
    address: zod_1.default.string().optional(),
    profileImage: zod_1.default.string().url().optional(),
    bio: zod_1.default.string().optional(),
    travelInterests: zod_1.default.array(zod_1.default.string()).optional(),
    visitedCountries: zod_1.default.array(zod_1.default.string()).optional(),
    currentLocation: zod_1.default.string().optional(),
    gender: zod_1.default.enum(["MALE", "FEMALE", "OTHER"]).optional(),
});
