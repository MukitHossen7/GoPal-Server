"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("./auth.controller");
const checkAuth_1 = require("../../middlewares/checkAuth");
const client_1 = require("@prisma/client");
const authRoute = express_1.default.Router();
authRoute.get("/me", auth_controller_1.AuthController.getMe);
authRoute.post("/login", auth_controller_1.AuthController.login);
authRoute.post("/refresh-token", auth_controller_1.AuthController.refreshToken);
authRoute.post("/change-password", (0, checkAuth_1.checkAuth)(client_1.UserRole.ADMIN), auth_controller_1.AuthController.changePassword);
//forgot password kaj korta hoba pora
authRoute.post("/forgot-password", auth_controller_1.AuthController.forgotPassword);
authRoute.post("/reset-password", auth_controller_1.AuthController.resetPassword);
exports.default = authRoute;
