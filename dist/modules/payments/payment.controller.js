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
exports.PaymentController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const config_1 = __importDefault(require("../../config"));
const stripe_config_1 = require("../../config/stripe.config");
const payment_service_1 = require("./payment.service");
const createSubscription = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const travelerData = req.user;
    const result = yield payment_service_1.PaymentService.createSubscriptionSession(req.body, travelerData);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Payment session created successfully",
        data: result,
    });
}));
// Webhook
const stripeWebhook = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = config_1.default.STRIPE.webhook_secret;
    let event;
    try {
        // req.body must be RAW buffer here
        event = stripe_config_1.stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    }
    catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        // Webhook error should return 400 to let Stripe know
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    // Service call
    yield payment_service_1.PaymentService.handleWebhook(event);
    // Return 200 to acknowledge receipt of the event
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Webhook received successfully",
        data: null,
    });
}));
exports.PaymentController = {
    createSubscription,
    stripeWebhook,
};
