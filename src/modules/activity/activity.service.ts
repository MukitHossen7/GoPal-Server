import { prisma } from "../../config/db";
import { calculatePagination, TOptions } from "../../utils/pagenationHelpers";

// টাইপ ফিল্টারের জন্য ইন্টারফেস
interface IActivityFilter {
  type?: string; // 'ALL' | 'USER_REGISTER' | 'TRIP_CREATE' | 'PAYMENT' | 'REVIEW'
}

const getSystemActivities = async (
  filters: IActivityFilter,
  options: TOptions
) => {
  const { page, limit } = calculatePagination(options);
  const { type } = filters;

  const fetchLimit = limit * 2; // সেফটির জন্য একটু বেশি ডাটা ফেচ করা হয় সর্টিং এর জন্য
  let activities: any[] = [];

  // ১. ইউজার জয়েন অ্যাক্টিভিটি
  if (!type || type === "ALL" || type === "USER_REGISTER") {
    const newTravelers = await prisma.traveler.findMany({
      take: fetchLimit,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, createdAt: true },
    });
    activities.push(
      ...newTravelers.map((u) => ({
        id: u.id,
        type: "USER_REGISTER",
        message: `${u.name} joined the platform.`,
        createdAt: u.createdAt,
      }))
    );
  }

  // ২. ট্রিপ ক্রিয়েট অ্যাক্টিভিটি
  if (!type || type === "ALL" || type === "TRIP_CREATE") {
    const newTrips = await prisma.travelPlan.findMany({
      take: fetchLimit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        destination: true,
        title: true,
        createdAt: true,
        traveler: { select: { name: true } },
      },
    });
    activities.push(
      ...newTrips.map((t) => ({
        id: t.id,
        type: "TRIP_CREATE",
        message: `${t.traveler.name} created a trip to ${t.destination}.`,
        createdAt: t.createdAt,
      }))
    );
  }

  // ৩. পেমেন্ট অ্যাক্টিভিটি
  if (!type || type === "ALL" || type === "PAYMENT") {
    const newPayments = await prisma.payment.findMany({
      take: fetchLimit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        amount: true,
        createdAt: true,
        traveler: { select: { name: true } },
      },
    });
    activities.push(
      ...newPayments.map((p) => ({
        id: p.id,
        type: "PAYMENT",
        message: `${p.traveler.name} made a payment of $${p.amount}.`,
        createdAt: p.createdAt,
      }))
    );
  }

  // ৪. রিভিউ অ্যাক্টিভিটি
  if (!type || type === "ALL" || type === "REVIEW") {
    const newReviews = await prisma.review.findMany({
      take: fetchLimit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        createdAt: true,
        traveler: { select: { name: true } },
      },
    });
    activities.push(
      ...newReviews.map((r) => ({
        id: r.id,
        type: "REVIEW",
        message: `${r.traveler.name} gave a ${r.rating} star review.`,
        createdAt: r.createdAt,
      }))
    );
  }

  // ৫. সর্টিং এবং পেজিনেশন
  // যেহেতু আমরা মাল্টিপল টেবিল থেকে ডাটা এনেছি, তাই JS দিয়ে সর্ট করছি
  activities.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // ম্যানুয়াল পেজিনেশন স্লাইস
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = activities.slice(startIndex, endIndex);

  return {
    meta: {
      page,
      limit,
      total: activities.length,
      totalPages: Math.ceil(activities.length / limit),
    },
    data: paginatedData,
  };
};

export const ActivityService = {
  getSystemActivities,
};
