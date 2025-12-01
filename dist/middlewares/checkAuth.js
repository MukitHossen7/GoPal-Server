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
exports.checkAuth = void 0;
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const config_1 = __importDefault(require("../config"));
const jwt_1 = require("../utils/jwt");
const db_1 = require("../config/db");
const client_1 = require("@prisma/client");
const checkAuth = (...roles) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.headers.authorization || req.cookies.accessToken;
        if (!token) {
            throw new AppError_1.default(401, "Access token is missing");
        }
        const verify_Token = (0, jwt_1.verifyToken)(token, config_1.default.JWT.ACCESS_TOKEN_SECRET);
        if (!verify_Token) {
            throw new AppError_1.default(403, "Invalid access token");
        }
        const user = yield db_1.prisma.user.findUnique({
            where: {
                email: verify_Token.email,
            },
        });
        if (!user) {
            throw new AppError_1.default(404, "Email does not exist");
        }
        if (user.status === client_1.UserStatus.BLOCKED ||
            user.status === client_1.UserStatus.INACTIVE) {
            throw new AppError_1.default(403, `Your account is ${user.status}`);
        }
        if (user.isDeleted === true) {
            throw new AppError_1.default(404, "Your account is deleted");
        }
        // if (user.isVerified === false) {
        //   throw new AppError(404, "Your account is not verified");
        // }
        if (roles.length > 0 && !roles.includes(verify_Token.role)) {
            throw new AppError_1.default(403, "You are not authorized to access this route");
        }
        req.user = verify_Token;
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.checkAuth = checkAuth;
