import { Router } from "express";
import authRoute from "../modules/auth/auth.routes";
import userRoute from "../modules/user/user.routes";

const routes = Router();

routes.use("/auth", authRoute);
routes.use("/user", userRoute);

export default routes;
