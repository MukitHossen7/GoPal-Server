"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTravelPlanZodSchema = exports.createTravelPlanZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createTravelPlanZodSchema = zod_1.default
    .object({
    title: zod_1.default.string().min(3, "Title must be at least 3 characters"),
    description: zod_1.default.string().optional(),
    destination: zod_1.default.string().min(2, "Destination must be at least 2 characters"),
    startDate: zod_1.default.preprocess((arg) => {
        if (typeof arg === "string" || arg instanceof Date)
            return new Date(arg);
    }, zod_1.default.date({ error: "Invalid start date" })),
    endDate: zod_1.default.preprocess((arg) => {
        if (typeof arg === "string" || arg instanceof Date)
            return new Date(arg);
    }, zod_1.default.date({ error: "Invalid end date" })),
    budgetRange: zod_1.default.string().min(1, "Budget range is required"),
    travelType: zod_1.default.enum(["GROUP", "COUPLE", "FRIENDS", "FAMILY", "SOLO"], {
        error: "Travel type  is required",
    }),
})
    .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
});
exports.updateTravelPlanZodSchema = zod_1.default
    .object({
    title: zod_1.default.string().min(3, "Title must be at least 3 characters").optional(),
    description: zod_1.default.string().optional(),
    destination: zod_1.default
        .string()
        .min(2, "Destination must be at least 2 characters")
        .optional(),
    startDate: zod_1.default.preprocess((arg) => {
        if (!arg)
            return undefined;
        if (typeof arg === "string" || arg instanceof Date)
            return new Date(arg);
    }, zod_1.default.date({ error: "Invalid start date" }).optional()),
    endDate: zod_1.default.preprocess((arg) => {
        if (!arg)
            return undefined;
        if (typeof arg === "string" || arg instanceof Date)
            return new Date(arg);
    }, zod_1.default.date({ error: "Invalid end date" }).optional()),
    budgetRange: zod_1.default.string().optional(),
    travelType: zod_1.default
        .enum(["GROUP", "COUPLE", "FRIENDS", "FAMILY", "SOLO"], {
        error: "Travel type  is required",
    })
        .optional(),
})
    .refine((data) => {
    if (data.startDate && data.endDate)
        return data.endDate >= data.startDate;
    return true;
}, {
    message: "End date must be after start date",
    path: ["endDate"],
});
