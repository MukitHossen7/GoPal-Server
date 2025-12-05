import { prisma } from "../../config/db";
import AppError from "../../errorHelpers/AppError";
import { IJwtPayload } from "../../types/common";

const getTravelerDashboardData = async (user: IJwtPayload) => {
  const traveler = await prisma.traveler.findUnique({
    where: { email: user.email },
    include: {
      travelPlans: {
        orderBy: { startDate: "asc" },
      },
      tripRequests: true,
    },
  });

  if (!traveler) {
    throw new AppError(404, "Traveler profile not found");
  }

  const totalTrips = traveler.travelPlans.length;

  const totalMatches = await prisma.traveler.count({
    where: {
      id: { not: traveler.id },
      travelInterests: {
        hasSome: traveler.travelInterests,
      },
    },
  });

  const completedTrips = traveler.travelPlans.filter(
    (plan) => new Date(plan.endDate) < new Date()
  ).length;

  const upcomingTripData = traveler.travelPlans.find(
    (plan) => new Date(plan.startDate) > new Date()
  );

  let upcomingTrip = null;

  if (upcomingTripData) {
    const today = new Date();
    const startDate = new Date(upcomingTripData.startDate);

    const diffTime = Math.abs(startDate.getTime() - today.getTime());
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    upcomingTrip = {
      id: upcomingTripData.id,
      destination: upcomingTripData.destination,
      startDate: upcomingTripData.startDate.toISOString().split("T")[0], // YYYY-MM-DD
      image: upcomingTripData.imageUrl,
      daysLeft: daysLeft,
    };
  }

  return {
    user: {
      name: traveler.name,
      image: traveler.profileImage,
      isVerified: traveler.isVerifiedTraveler,
      location: traveler.currentLocation || "Location not set",
    },
    stats: {
      totalTrips,
      totalMatches,
      completedTrips,
      averageRating: traveler.averageRating,
      isVerified: traveler.isVerifiedTraveler,
    },
    upcomingTrip,
  };
};

export const StatsService = {
  getTravelerDashboardData,
};
