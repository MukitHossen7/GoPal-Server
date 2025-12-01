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
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const cloudinary_config_1 = require("../config/cloudinary.config");
const globalErrorHandler = (err, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    if (req.file) {
        yield (0, cloudinary_config_1.deleteImageFromCLoudinary)(req.file.path);
    }
    let statusCode = err.statusCode || http_status_1.default.INTERNAL_SERVER_ERROR;
    let success = false;
    let message = err.message || "Something went wrong!";
    let error = err;
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            statusCode = http_status_1.default.BAD_REQUEST;
            message = `Unique constraint failed on the field: ${(_a = err.meta) === null || _a === void 0 ? void 0 : _a.target}`;
            error = {
                code: err.code,
                meta: err.meta,
            };
        }
        if (err.code === "P2025") {
            statusCode = http_status_1.default.NOT_FOUND;
            message = `Record not found: ${((_b = err.meta) === null || _b === void 0 ? void 0 : _b.cause) || ""}`;
            error = {
                code: err.code,
                meta: err.meta,
            };
        }
        if (err.code === "P2003") {
            statusCode = http_status_1.default.BAD_REQUEST;
            message = `Foreign key constraint failed on the field: ${(_c = err.meta) === null || _c === void 0 ? void 0 : _c.field_name}`;
            error = {
                code: err.code,
                meta: err.meta,
            };
        }
        if (err.code === "P2004") {
            statusCode = http_status_1.default.BAD_REQUEST;
            message = `A constraint failed: ${(_d = err.meta) === null || _d === void 0 ? void 0 : _d.constraint_name}`;
            error = {
                code: err.code,
                meta: err.meta,
            };
        }
        if (err.code === "P2001") {
            statusCode = http_status_1.default.NOT_FOUND;
            message = `The record searched for in the where condition does not exist: ${(_e = err.meta) === null || _e === void 0 ? void 0 : _e.model_name}`;
            error = {
                code: err.code,
                meta: err.meta,
            };
        }
        if (err.code === "P1000") {
            statusCode = http_status_1.default.INTERNAL_SERVER_ERROR;
            message = `Authentication failed against database: ${(_f = err.meta) === null || _f === void 0 ? void 0 : _f.database_name}`;
            error = {
                code: err.code,
                meta: err.meta,
            };
        }
    }
    else if (err instanceof client_1.Prisma.PrismaClientValidationError) {
        statusCode = http_status_1.default.BAD_REQUEST;
        message = "Prisma Client Validation Error";
        error = {
            message: err.message,
            // stack: err.stack,
        };
    }
    else if (err instanceof client_1.Prisma.PrismaClientUnknownRequestError) {
        statusCode = http_status_1.default.INTERNAL_SERVER_ERROR;
        message = "An unknown error occurred in Prisma Client";
        error = {
            message: err.message,
            // stack: err.stack,
        };
    }
    else if (err instanceof client_1.Prisma.PrismaClientInitializationError) {
        statusCode = http_status_1.default.INTERNAL_SERVER_ERROR;
        message = "Prisma Client Initialization Error";
        error = {
            message: err.message,
            // stack: err.stack,
        };
    }
    res.status(statusCode).json({
        success,
        message,
        error,
    });
});
exports.default = globalErrorHandler;
