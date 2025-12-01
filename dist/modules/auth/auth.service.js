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
exports.AuthService = void 0;
const config_1 = __importDefault(require("../../config"));
const db_1 = require("../../config/db");
const jwt_1 = require("../../utils/jwt");
const client_1 = require("@prisma/client");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userToken_1 = require("../../utils/userToken");
const http_status_1 = __importDefault(require("http-status"));
const getMe = (session) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = session.accessToken;
    const decodedData = (0, jwt_1.verifyToken)(accessToken, config_1.default.JWT.ACCESS_TOKEN_SECRET);
    const userData = yield db_1.prisma.user.findUniqueOrThrow({
        where: {
            email: decodedData.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const { id, email, role, status } = userData;
    return {
        id,
        email,
        role,
        status,
    };
});
const login = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield db_1.prisma.user.findUnique({
        where: {
            email: payload.email,
        },
    });
    if (!user) {
        throw new AppError_1.default(404, "User not found");
    }
    if (user.status !== client_1.UserStatus.ACTIVE) {
        throw new AppError_1.default(403, "User is not active");
    }
    if (user.isDeleted) {
        throw new AppError_1.default(410, "User has been deleted");
    }
    // if (!user.isVerified) {
    //   throw new AppError(401, "User email is not verified");
    // }
    const isCorrectPassword = yield bcryptjs_1.default.compare(payload.password, user.password);
    if (!isCorrectPassword) {
        throw new AppError_1.default(401, "Incorrect password");
    }
    const tokenPayload = {
        email: user.email,
        role: user.role,
        id: user.id,
    };
    const userTokens = (0, userToken_1.createUserTokens)(tokenPayload);
    return {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        needPasswordChange: user.needPasswordChange,
    };
});
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    let decodedData;
    try {
        decodedData = (0, jwt_1.verifyToken)(token, config_1.default.JWT.REFRESH_TOKEN_SECRET);
    }
    catch (error) {
        throw new Error("You are not authorized!");
    }
    const userData = yield db_1.prisma.user.findUniqueOrThrow({
        where: {
            email: decodedData.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    if (userData.isDeleted === true) {
        throw new AppError_1.default(404, "Your account is deleted");
    }
    // if (userData.isVerified === false) {
    //   throw new AppError(404, "Your account is not verified");
    // }
    const tokenPayload = {
        email: userData.email,
        role: userData.role,
        id: userData.id,
    };
    const accessToken = (0, jwt_1.generateToken)(tokenPayload, config_1.default.JWT.ACCESS_TOKEN_SECRET, config_1.default.JWT.ACCESS_TOKEN_EXPIRATION);
    return {
        accessToken,
    };
});
const changePassword = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield db_1.prisma.user.findUniqueOrThrow({
        where: {
            email: user.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const isCorrectPassword = yield bcryptjs_1.default.compare(payload.oldPassword, userData.password);
    if (!isCorrectPassword) {
        throw new Error("Password incorrect!");
    }
    const hashedPassword = yield bcryptjs_1.default.hash(payload.newPassword, Number(config_1.default.BCRYPTSALTROUND));
    yield db_1.prisma.user.update({
        where: {
            email: userData.email,
        },
        data: {
            password: hashedPassword,
            // needPasswordChange: false
        },
    });
    return {
        message: "Password changed successfully!",
    };
});
//forgot password kaj korta hoba pora
const forgotPassword = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield db_1.prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
});
const resetPassword = (token, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield db_1.prisma.user.findUniqueOrThrow({
        where: {
            id: payload.id,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const isValidToken = (0, jwt_1.verifyToken)(token, config_1.default.JWT.RESET_PASS_SECRET);
    if (!isValidToken) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Forbidden!");
    }
    // hash password
    const hashPassword = yield bcryptjs_1.default.hash(payload.password, Number(config_1.default.BCRYPTSALTROUND));
    // update into database
    yield db_1.prisma.user.update({
        where: {
            email: userData.email,
        },
        data: {
            password: hashPassword,
        },
    });
});
exports.AuthService = {
    getMe,
    login,
    refreshToken,
    changePassword,
    forgotPassword,
    resetPassword,
};
