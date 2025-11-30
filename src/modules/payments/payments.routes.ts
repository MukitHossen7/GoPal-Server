import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { PaymentController } from "./payment.controller";

const paymentRoute = express.Router();

// Create Payment Session
paymentRoute.post(
  "/subscribe",
  // auth(UserRole.TRAVELER), // আপনার auth middleware থাকলে ইউজ করবেন
  checkAuth(UserRole.TRAVELER),
  PaymentController.createSubscription
);

// Webhook Route
// নোট: Webhook রাউটটি সাধারণত app.ts এ আলাদাভাবে হ্যান্ডল করা ভালো,
// তবে এখানে রাখলে app.ts এ কনফিগারেশন চেঞ্জ করতে হবে।
// paymentRoute.post(
//   "/webhook",
//   express.raw({ type: "application/json" }), // এই রাউটের জন্য Raw parsing
//   PaymentController.stripeWebhook
// );

export default paymentRoute;
