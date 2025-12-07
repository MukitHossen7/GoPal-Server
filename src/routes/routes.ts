import { Router } from "express";
import authRoute from "../modules/auth/auth.routes";
import userRoute from "../modules/user/user.routes";
import travelPlanRoute from "../modules/travelPlans/travelPlans.routes";
import paymentRoute from "../modules/payments/payments.routes";
import reviewRoute from "../modules/reviews/reviews.routes";
import tripRequestRoute from "../modules/tripRequest/tripRequest.routes";
import statsRoute from "../modules/stats/stats.routes";
import activityRoute from "../modules/activity/activity.routes";

const routes = Router();

routes.use("/auth", authRoute);
routes.use("/users", userRoute);
routes.use("/travel-plans", travelPlanRoute);
routes.use("/payments", paymentRoute);
routes.use("/reviews", reviewRoute);
routes.use("/trip-requests", tripRequestRoute);
routes.use("/stats", statsRoute);
routes.use("/activities", activityRoute);

export default routes;
