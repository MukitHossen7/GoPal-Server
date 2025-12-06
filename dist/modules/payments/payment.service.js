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
exports.PaymentService = void 0;
const client_1 = require("@prisma/client");
const config_1 = __importDefault(require("../../config"));
const db_1 = require("../../config/db");
const stripe_config_1 = require("../../config/stripe.config");
// 1. Create Checkout Session for Subscription
const createSubscriptionSession = (payload, travelerData) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, subscriptionType } = payload;
    // Traveler valid kina check kora uchit
    const traveler = yield db_1.prisma.traveler.findUniqueOrThrow({
        where: { email: travelerData.email },
    });
    // Stripe Session Create
    const session = yield stripe_config_1.stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: `Travel Buddy ${subscriptionType} Subscription`,
                        description: `Get verified badge and unlock ${subscriptionType} features.`,
                    },
                    unit_amount: Math.round(amount * 100), // Amount in cents
                },
                quantity: 1,
            },
        ],
        mode: "payment", // Subscription model holeo one-time payment hisebe Verified badge deya hoche
        success_url: `${config_1.default.STRIPE.success_url}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: config_1.default.STRIPE.cancel_url,
        customer_email: traveler.email,
        metadata: {
            travelerId: traveler.id,
            subscriptionType: subscriptionType,
        },
    });
    // Save Initial Payment Record to DB (PENDING)
    yield db_1.prisma.payment.create({
        data: {
            amount: amount,
            status: client_1.PaymentStatus.PENDING,
            subscription: subscriptionType,
            transactionId: session.id, // Creating transaction ID from session ID
            travelerId: traveler.id,
        },
    });
    return {
        // sessionId: session.id,
        paymentUrl: session.url,
    };
});
// 2. Handle Stripe Webhook
const handleWebhook = (event) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object;
            // Transaction ID holo Session ID
            const transactionId = session.id;
            // Metadata subscriptionType
            const subscriptionType = (_b = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.subscriptionType) === null || _b === void 0 ? void 0 : _b.toLowerCase();
            const currentDate = new Date();
            let newEndDate = new Date(currentDate);
            if (subscriptionType === "yearly") {
                newEndDate.setFullYear(newEndDate.getFullYear() + 1);
            }
            else {
                newEndDate.setDate(newEndDate.getDate() + 30);
            }
            // Database Transaction: Update Payment AND Update Traveler Status
            yield db_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                // Update Payment Status
                const payment = yield tx.payment.update({
                    where: { transactionId: transactionId },
                    data: {
                        status: client_1.PaymentStatus.COMPLETED,
                        paymentGatewayData: session, // Storing full stripe response
                    },
                });
                // Update Traveler Verification Status
                if (payment.travelerId) {
                    yield tx.traveler.update({
                        where: { id: payment.travelerId },
                        data: {
                            isVerifiedTraveler: true,
                            subscriptionEndDate: newEndDate,
                        },
                    });
                }
            }));
            break;
        }
        // Handle Failed Payment (Optional but good practice)
        case "checkout.session.expired":
        case "checkout.session.async_payment_failed": {
            const session = event.data.object;
            yield db_1.prisma.payment.update({
                where: { transactionId: session.id },
                data: {
                    status: client_1.PaymentStatus.FAILED,
                    paymentGatewayData: session,
                },
            });
            break;
        }
        default:
            console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }
});
exports.PaymentService = {
    createSubscriptionSession,
    handleWebhook,
};
