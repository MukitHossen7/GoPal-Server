import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { UserController } from "./user.controller";

const userRoute = express.Router();

userRoute.get("/", checkAuth(UserRole.ADMIN), UserController.getAllUsers);

userRoute.get("/me", checkAuth(UserRole.ADMIN), UserController.getMyProfile);

export default userRoute;
