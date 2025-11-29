import express from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";

const authRoute = express.Router();

authRoute.get("/me", AuthController.getMe);

authRoute.post("/login", AuthController.login);

authRoute.post("/refresh-token", AuthController.refreshToken);

authRoute.post(
  "/change-password",
  checkAuth(UserRole.ADMIN),
  AuthController.changePassword
);

//forgot password kaj korta hoba pora
authRoute.post("/forgot-password", AuthController.forgotPassword);

authRoute.post("/reset-password", AuthController.resetPassword);

export default authRoute;
