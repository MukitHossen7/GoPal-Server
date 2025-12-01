import { RequestStatus } from "@prisma/client";
import { prisma } from "../../config/db";
import AppError from "../../errorHelpers/AppError";
import { IJwtPayload } from "../../types/common";

const requestToJoin = async (user: IJwtPayload, travelPlanId: string) => {
  const traveler = await prisma.traveler.findUnique({
    where: { email: user.email },
  });
  if (!traveler) throw new AppError(404, "Traveler profile not found");

  // Subscription Check
  if (!traveler.isVerifiedTraveler) {
    throw new AppError(
      402, // Payment Required
      "You need a premium subscription to request joining a trip."
    );
  }

  if (traveler.subscriptionEndDate) {
    const currentDate = new Date();
    if (traveler.subscriptionEndDate < currentDate) {
      await prisma.traveler.update({
        where: { id: traveler.id },
        data: { isVerifiedTraveler: false },
      });

      throw new AppError(
        402,
        "Your subscription has expired. Please renew to join trips."
      );
    }
  }

  const trip = await prisma.travelPlan.findUnique({
    where: { id: travelPlanId },
  });
  if (!trip) throw new AppError(404, "Trip not found");

  // Check if own trip
  if (trip.travelerId === traveler.id) {
    throw new AppError(400, "You cannot join your own trip");
  }

  // Check duplicate request
  const existingRequest = await prisma.tripRequest.findUnique({
    where: {
      travelPlanId_travelerId: {
        travelPlanId: travelPlanId,
        travelerId: traveler.id,
      },
    },
  });

  if (existingRequest) throw new AppError(400, "Request already sent");

  const result = await prisma.tripRequest.create({
    data: {
      travelPlanId: travelPlanId,
      travelerId: traveler.id,
    },
  });

  return result;
};

// For Trip Owner to see who wants to join
const getIncomingRequests = async (user: IJwtPayload) => {
  const traveler = await prisma.traveler.findUnique({
    where: { email: user.email },
  });
  if (!traveler) throw new AppError(404, "Traveler not found");

  // Find trips created by this user
  const myTrips = await prisma.travelPlan.findMany({
    where: { travelerId: traveler.id },
    select: { id: true },
  });

  const myTripIds = myTrips.map((t) => t.id);

  const requests = await prisma.tripRequest.findMany({
    where: { travelPlanId: { in: myTripIds } },
    include: {
      traveler: {
        select: { id: true, name: true, email: true, profileImage: true },
      },
      travelPlan: { select: { id: true, destination: true, title: true } },
    },
  });

  return requests;
};

const respondToRequest = async (
  user: IJwtPayload,
  requestId: string,
  status: RequestStatus
) => {
  const traveler = await prisma.traveler.findUnique({
    where: { email: user.email },
  });

  const tripRequest = await prisma.tripRequest.findUnique({
    where: { id: requestId },
    include: { travelPlan: true },
  });

  if (!tripRequest) throw new AppError(404, "Request not found");

  // Verify ownership
  if (tripRequest.travelPlan.travelerId !== traveler?.id) {
    throw new AppError(403, "This is not your trip request to manage");
  }

  const updatedRequest = await prisma.tripRequest.update({
    where: { id: requestId },
    data: { status },
  });

  return updatedRequest;
};

export const TripRequestService = {
  requestToJoin,
  getIncomingRequests,
  respondToRequest,
};
