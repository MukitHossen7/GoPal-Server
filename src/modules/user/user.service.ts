import { UserRole } from "@prisma/client";
import config from "../../config";
import { prisma } from "../../config/db";
import AppError from "../../errorHelpers/AppError";
import { IJwtPayload } from "../../types/common";
import { ITraveler } from "./user.interface";
import bcrypt from "bcryptjs";
import httpStatus from "http-status";

const getAllUsers = async () => {};

const getMyProfile = async (user: IJwtPayload) => {};

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
  getAllUsers,
  register,
  updateMyProfile,
};
