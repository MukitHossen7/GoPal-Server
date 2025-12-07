import { PaymentStatus, UserStatus } from "@prisma/client";
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

const getAdminDashboardData = async () => {
  // 1. Basic Counts (Card Data)
  const totalUsers = await prisma.traveler.count({
    where: { user: { status: UserStatus.ACTIVE } },
  });

  const totalTrips = await prisma.travelPlan.count();

  const activeTrips = await prisma.travelPlan.count({
    where: { endDate: { gt: new Date() } },
  });

  const revenueResult = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: PaymentStatus.COMPLETED },
  });
  const revenue = revenueResult._sum.amount || 0;

  // 2. Recent Activity Timeline (Mixed: Users joined & Trips created)
  const last5Travelers = await prisma.traveler.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, profileImage: true, createdAt: true },
  });

  const last5Trips = await prisma.travelPlan.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      destination: true,
      title: true,
      createdAt: true,
      traveler: { select: { name: true } },
    },
  });

  // Combine and sort for a single timeline list
  const recentActivity = [
    ...last5Travelers.map((u) => ({
      id: u.id,
      type: "USER_JOINED",
      message: `${u.name} joined the platform`,
      date: u.createdAt,
    })),
    ...last5Trips.map((t) => ({
      id: t.id,
      type: "TRIP_CREATED",
      message: `${t.traveler.name} posted a trip to ${t.destination}`,
      date: t.createdAt,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

  // 3. Activity Chart Data (Last 30 days: User Registration vs Trip Creation)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newUsers = await prisma.traveler.groupBy({
    by: ["createdAt"],
    where: { createdAt: { gte: thirtyDaysAgo } },
    _count: { id: true },
  });

  const newTrips = await prisma.travelPlan.groupBy({
    by: ["createdAt"],
    where: { createdAt: { gte: thirtyDaysAgo } },
    _count: { id: true },
  });

  // Formatting for Recharts (Date: "YYYY-MM-DD", Users: 0, Trips: 0)
  const activityChartMap = new Map();

  // Initialize last 30 days with 0
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    activityChartMap.set(dateStr, { date: dateStr, users: 0, trips: 0 });
  }

  // Fill real data
  // Note: Since Prisma returns Date objects in groupBy, we need to map them locally or use raw query.
  // JS Loop approach for simplicity:
  const rawUsers = await prisma.traveler.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
  });
  rawUsers.forEach((u) => {
    const dateStr = u.createdAt.toISOString().split("T")[0];
    if (activityChartMap.has(dateStr)) {
      activityChartMap.get(dateStr).users += 1;
    }
  });

  const rawTrips = await prisma.travelPlan.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
  });
  rawTrips.forEach((t) => {
    const dateStr = t.createdAt.toISOString().split("T")[0];
    if (activityChartMap.has(dateStr)) {
      activityChartMap.get(dateStr).trips += 1;
    }
  });

  const activityChart = Array.from(activityChartMap.values()).reverse();

  // 4. Review Graph Data (Last 6 Months Average Rating or Count)
  // Let's show "Review Counts per Month"
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const rawReviews = await prisma.review.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true, rating: true },
  });

  const reviewChartMap = new Map(); // Key: "Month-Year"

  rawReviews.forEach((r) => {
    const monthStr = r.createdAt.toLocaleString("default", { month: "short" }); // "Jan"
    if (!reviewChartMap.has(monthStr)) {
      reviewChartMap.set(monthStr, { month: monthStr, count: 0 });
    }
    reviewChartMap.get(monthStr).count += 1;
  });

  const reviewChart = Array.from(reviewChartMap.values());

  return {
    counts: {
      totalUsers,
      totalTrips,
      activeTrips,
      revenue,
    },
    recentActivity,
    activityChart, // For Area/Line Chart (Users vs Trips)
    reviewChart, // For Bar Chart (Reviews per month)
  };
};

export const StatsService = {
  getTravelerDashboardData,
  getAdminDashboardData,
};
