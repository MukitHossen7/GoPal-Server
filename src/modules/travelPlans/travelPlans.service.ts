import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "../../config/db";
import AppError from "../../errorHelpers/AppError";
import { calculatePagination, TOptions } from "../../utils/pagenationHelpers";
import { ITravelPlan } from "./travelPlans.interface";
import { IJwtPayload } from "../../types/common";
import httpStatus from "http-status";

//create travel plan
const createTravelPlan = async (plan: ITravelPlan, travelerEmail: string) => {
  // Step 1: find the traveler using email
  const traveler = await prisma.traveler.findUnique({
    where: { email: travelerEmail },
  });

  if (!traveler) {
    throw new AppError(404, "Traveler profile not found");
  }

  // Step 2: Check profile completeness
  const isProfileComplete =
    traveler.contactNumber &&
    traveler.address &&
    traveler.profileImage &&
    traveler.bio &&
    traveler.currentLocation &&
    traveler.travelInterests.length > 0 &&
    traveler.visitedCountries.length > 0;

  if (!isProfileComplete) {
    throw new AppError(
      400,
      "Please complete your traveler profile before creating a travel plan"
    );
  }

  // Step 3: Create the travel plan
  const result = await prisma.travelPlan.create({
    data: {
      ...plan,
      travelerId: traveler.id,
    },
  });

  return result;
};

const getMyTravelPlans = async (user: IJwtPayload, options: TOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

  const traveler = await prisma.traveler.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!traveler) {
    throw new AppError(httpStatus.NOT_FOUND, "Traveler profile not found");
  }

  const whereConditions: Prisma.TravelPlanWhereInput = {
    travelerId: traveler.id, // Relation Field
  };

  const result = await prisma.travelPlan.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.travelPlan.count({ where: whereConditions });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: result,
  };
};

const getTravelPlanMatches = async (user: IJwtPayload) => {
  // 1.find current user profile and interest findOut
  const currentUser = await prisma.traveler.findUnique({
    where: { email: user.email },
  });

  if (!currentUser) {
    throw new AppError(404, "User profile not found");
  }

  const myInterests = currentUser.travelInterests || [];

  if (myInterests.length === 0) {
    return await prisma.travelPlan.findMany({
      where: {
        travelerId: { not: currentUser.id },
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        traveler: {
          select: {
            name: true,
            email: true,
            profileImage: true,
            averageRating: true,
            travelInterests: true,
          },
        },
      },
    });
  }

  const matchedPlans = await prisma.travelPlan.findMany({
    where: {
      travelerId: { not: currentUser.id },
      traveler: {
        travelInterests: {
          hasSome: myInterests,
        },
      },
    },
    take: 20,
    orderBy: { createdAt: "desc" },
    include: {
      traveler: {
        select: {
          name: true,
          email: true,
          profileImage: true,
          averageRating: true,
          travelInterests: true,
        },
      },
    },
  });

  return matchedPlans;
};

//Get all Travel plans
const getAllTravelPlans = async (filters: any, options: TOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.TravelPlanWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { destination: { contains: searchTerm, mode: "insensitive" } },
        { title: { contains: searchTerm, mode: "insensitive" } },
      ],
    } as any);
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.TravelPlanWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.travelPlan.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      traveler: {
        select: {
          name: true,
          email: true,
          averageRating: true,
        },
      },
    },
  });

  const total = await prisma.travelPlan.count({ where: whereConditions });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: result,
  };
};

const getTravelPlanById = async (id: string) => {
  const result = await prisma.travelPlan.findUniqueOrThrow({
    where: { id },
    include: {
      traveler: {
        select: {
          id: true,
          name: true,
          email: true,
          averageRating: true,
        },
      },
    },
  });
  return result;
};

const updateTravelPlan = async (
  id: string,
  payload: Partial<ITravelPlan>,
  travelerData: IJwtPayload
) => {
  const traveler = await prisma.traveler.findUnique({
    where: {
      email: travelerData.email,
    },
  });

  if (!traveler) {
    throw new AppError(404, "Traveler not found");
  }

  const travelPlan = await prisma.travelPlan.findUnique({
    where: {
      id: id,
    },
  });

  if (!travelPlan) throw new AppError(404, "Travel Plan not found");

  // Check ownership
  if (travelPlan.travelerId !== traveler.id) {
    throw new AppError(403, "You are not allowed to update this travel plan");
  }

  // Update plan
  const updatedPlan = await prisma.travelPlan.update({
    where: { id: id },
    data: payload,
  });

  return updatedPlan;
};

const deleteTravelPlan = async (id: string, travelerData: IJwtPayload) => {
  let traveler = null;

  // If not admin → fetch traveler info
  if (travelerData.role !== UserRole.ADMIN) {
    traveler = await prisma.traveler.findUnique({
      where: { email: travelerData.email },
    });

    if (!traveler) {
      throw new AppError(404, "Traveler not found");
    }
  }

  // Check if travel plan exists
  const travelPlan = await prisma.travelPlan.findUnique({
    where: { id },
  });

  if (!travelPlan) {
    throw new AppError(404, "Travel Plan not found");
  }

  // Permission check
  if (
    travelerData.role !== UserRole.ADMIN &&
    travelPlan.travelerId !== traveler?.id
  ) {
    throw new AppError(403, "You are not allowed to delete this travel plan");
  }

  // Admin OR owner traveler → delete
  const deletedPlan = await prisma.travelPlan.delete({
    where: { id },
  });

  return deletedPlan;
};

export const TravelService = {
  createTravelPlan,
  getMyTravelPlans,
  getTravelPlanById,
  getAllTravelPlans,
  updateTravelPlan,
  deleteTravelPlan,
  getTravelPlanMatches,
};
