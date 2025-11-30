import { Prisma, UserRole } from "@prisma/client";
import config from "../../config";
import { prisma } from "../../config/db";
import AppError from "../../errorHelpers/AppError";
import { IJwtPayload } from "../../types/common";
import { ITraveler } from "./user.interface";
import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { calculatePagination, TOptions } from "../../utils/pagenationHelpers";

const getAllTravelers = async (filters: any, options: TOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  const { searchTerm, ...filterData } = filters;
  const andConditions: Prisma.TravelerWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { bio: { contains: searchTerm, mode: "insensitive" } },
        { currentLocation: { contains: searchTerm, mode: "insensitive" } },
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

  const whereConditions: Prisma.TravelerWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.traveler.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.traveler.count({ where: whereConditions });

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

const getMyProfile = async (user: IJwtPayload) => {
  if (!user?.email || !user?.role) {
    throw new Error("Invalid user token");
  }

  let profileData;

  switch (user.role) {
    case UserRole.ADMIN:
      profileData = await prisma.admin.findUnique({
        where: { email: user.email },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              needPasswordChange: true,
              role: true,
              status: true,
            },
          },
        },
      });
      break;

    case UserRole.TRAVELER:
      profileData = await prisma.traveler.findUnique({
        where: { email: user.email },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              needPasswordChange: true,
              role: true,
              status: true,
            },
          },
        },
      });
      break;

    default:
      throw new Error("Unauthorized user role");
  }

  if (!profileData) {
    throw new Error("Profile not found");
  }

  return profileData;
};

const register = async (payload: ITraveler) => {
  const hashPassword = await bcrypt.hash(
    payload.password,
    Number(config.BCRYPTSALTROUND)
  );

  const createTraveler = await prisma.$transaction(async (tnx) => {
    await tnx.user.create({
      data: {
        email: payload.email,
        password: hashPassword,
        role: UserRole.TRAVELER,
      },
    });
    const travelerData = await tnx.traveler.create({
      data: {
        name: payload.name,
        email: payload.email,
      },
    });

    return travelerData;
  });

  return createTraveler;
};

const updateMyProfile = async (
  user: IJwtPayload,
  payload: Partial<ITraveler>
) => {
  const email = user?.email;
  const role = user?.role;

  if (!email) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized user");
  }

  // Email should never be updated
  if (payload.email) {
    delete payload.email;
  }

  let updatedProfile;

  // If user is TRAVELER
  if (role === UserRole.TRAVELER) {
    const traveler = await prisma.traveler.findUnique({ where: { email } });

    if (!traveler) {
      throw new AppError(404, "Traveler profile not found");
    }

    updatedProfile = await prisma.traveler.update({
      where: { email },
      data: {
        ...payload,
        updatedAt: new Date(),
      },
    });

    return updatedProfile;
  }

  // If user is ADMIN
  if (role === UserRole.ADMIN) {
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      throw new AppError(404, "Admin profile not found");
    }

    updatedProfile = await prisma.admin.update({
      where: { email },
      data: {
        ...payload,
        updatedAt: new Date(),
      },
    });

    return updatedProfile;
  }

  return updatedProfile;
};

export const UserService = {
  getMyProfile,
  getAllTravelers,
  register,
  updateMyProfile,
};
