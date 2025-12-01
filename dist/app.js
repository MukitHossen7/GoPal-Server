"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const config_1 = __importDefault(require("./config"));
const routes_1 = __importDefault(require("./routes/routes"));
const globalErrorHandler_1 = __importDefault(require("./middlewares/globalErrorHandler"));
const notFound_1 = __importDefault(require("./middlewares/notFound"));
const payment_controller_1 = require("./modules/payments/payment.controller");
// import { PaymentController } from "./modules/payments/payment.controller";
const app = (0, express_1.default)();
app.post("/webhook", express_1.default.raw({ type: "application/json" }), payment_controller_1.PaymentController.stripeWebhook);
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true,
}));
// routes
app.use("/api/v1", routes_1.default);
app.get("/", (req, res) => {
    res.send({
        success: true,
        message: "Welcome to PrismaX Server",
        environment: config_1.default.NODE_ENV,
    });
});
app.use(globalErrorHandler_1.default);
app.use(notFound_1.default);
exports.default = app;
