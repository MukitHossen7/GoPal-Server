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
exports.createNewAccessTokenUseRefreshToken = exports.createUserTokens = void 0;
const config_1 = __importDefault(require("../config"));
const jwt_1 = require("./jwt");
const db_1 = require("../config/db");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const client_1 = require("@prisma/client");
const createUserTokens = (tokenPayload) => {
    const accessToken = (0, jwt_1.generateToken)(tokenPayload, config_1.default.JWT.ACCESS_TOKEN_SECRET, config_1.default.JWT.ACCESS_TOKEN_EXPIRATION);
    const refreshToken = (0, jwt_1.generateToken)(tokenPayload, config_1.default.JWT.REFRESH_TOKEN_SECRET, config_1.default.JWT.REFRESH_TOKEN_EXPIRATION);
    return {
        accessToken,
        refreshToken,
    };
};
exports.createUserTokens = createUserTokens;
const createNewAccessTokenUseRefreshToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const verifiedRefreshToken = (0, jwt_1.verifyToken)(refreshToken, config_1.default.JWT.REFRESH_TOKEN_SECRET);
    const isUser = yield db_1.prisma.user.findUnique({
        where: {
            email: verifiedRefreshToken.email,
        },
    });
    if (!isUser) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Email does not exist");
    }
    if (isUser.status === client_1.UserStatus.BLOCKED ||
        isUser.status === client_1.UserStatus.INACTIVE) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Your account is blocked or inactive");
    }
    if (isUser.isDeleted === true) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Your account is deleted");
    }
    const tokenPayload = {
        email: isUser.email,
        role: isUser.role,
        id: isUser.id,
    };
    const accessToken = (0, jwt_1.generateToken)(tokenPayload, config_1.default.JWT.ACCESS_TOKEN_SECRET, config_1.default.JWT.ACCESS_TOKEN_EXPIRATION);
    return {
        accessToken,
    };
});
exports.createNewAccessTokenUseRefreshToken = createNewAccessTokenUseRefreshToken;
