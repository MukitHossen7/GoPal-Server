import { Router } from "express";
import authRoute from "../modules/auth/auth.routes";
import userRoute from "../modules/user/user.routes";
import travelPlanRoute from "../modules/travelPlans/travelPlans.routes";
import paymentRoute from "../modules/payments/payments.routes";

const routes = Router();

routes.use("/auth", authRoute);
routes.use("/users", userRoute);
routes.use("/travel-plans", travelPlanRoute);
routes.use("/payments", paymentRoute);

export default routes;
