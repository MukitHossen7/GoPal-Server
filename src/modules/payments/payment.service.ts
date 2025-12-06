import { PaymentStatus } from "@prisma/client";
import config from "../../config";
import { prisma } from "../../config/db";
import { stripe } from "../../config/stripe.config";
import { IJwtPayload } from "../../types/common";
import Stripe from "stripe";

// 1. Create Checkout Session for Subscription
const createSubscriptionSession = async (
  payload: any,
  travelerData: IJwtPayload
) => {
  const { amount, subscriptionType } = payload;

  // Traveler valid kina check kora uchit
  const traveler = await prisma.traveler.findUniqueOrThrow({
    where: { email: travelerData.email },
  });

  // Stripe Session Create
  const session = await stripe.checkout.sessions.create({
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
    success_url: `${config.STRIPE.success_url}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: config.STRIPE.cancel_url as string,
    customer_email: traveler.email,
    metadata: {
      travelerId: traveler.id,
      subscriptionType: subscriptionType,
    },
  });

  // Save Initial Payment Record to DB (PENDING)
  await prisma.payment.create({
    data: {
      amount: amount,
      status: PaymentStatus.PENDING,
      subscription: subscriptionType,
      transactionId: session.id, // Creating transaction ID from session ID
      travelerId: traveler.id,
    },
  });

  return {
    // sessionId: session.id,
    paymentUrl: session.url,
  };
};

// 2. Handle Stripe Webhook
const handleWebhook = async (event: Stripe.Event) => {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      // Transaction ID holo Session ID
      const transactionId = session.id;

      // Metadata subscriptionType
      const subscriptionType =
        session.metadata?.subscriptionType?.toLowerCase();

      const currentDate = new Date();
      let newEndDate = new Date(currentDate);

      if (subscriptionType === "yearly") {
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);
      } else {
        newEndDate.setDate(newEndDate.getDate() + 30);
      }

      // Database Transaction: Update Payment AND Update Traveler Status
      await prisma.$transaction(async (tx) => {
        // Update Payment Status
        const payment = await tx.payment.update({
          where: { transactionId: transactionId },
          data: {
            status: PaymentStatus.COMPLETED,
            paymentGatewayData: session as any, // Storing full stripe response
          },
        });

        // Update Traveler Verification Status
        if (payment.travelerId) {
          await tx.traveler.update({
            where: { id: payment.travelerId },
            data: {
              isVerifiedTraveler: true,
              subscriptionEndDate: newEndDate,
            },
          });
        }
      });
      break;
    }

    // Handle Failed Payment (Optional but good practice)
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await prisma.payment.update({
        where: { transactionId: session.id },
        data: {
          status: PaymentStatus.FAILED,
          paymentGatewayData: session as any,
        },
      });
      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }
};

export const PaymentService = {
  createSubscriptionSession,
  handleWebhook,
};
