"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkAuth_1 = require("../../middlewares/checkAuth");
const client_1 = require("@prisma/client");
const payment_controller_1 = require("./payment.controller");
const paymentRoute = express_1.default.Router();
// Create Payment Session
paymentRoute.post("/subscribe", 
// auth(UserRole.TRAVELER), // আপনার auth middleware থাকলে ইউজ করবেন
(0, checkAuth_1.checkAuth)(client_1.UserRole.TRAVELER), payment_controller_1.PaymentController.createSubscription);
// Webhook Route
// নোট: Webhook রাউটটি সাধারণত app.ts এ আলাদাভাবে হ্যান্ডল করা ভালো,
// তবে এখানে রাখলে app.ts এ কনফিগারেশন চেঞ্জ করতে হবে।
// paymentRoute.post(
//   "/webhook",
//   express.raw({ type: "application/json" }), // এই রাউটের জন্য Raw parsing
//   PaymentController.stripeWebhook
// );
exports.default = paymentRoute;
