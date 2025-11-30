import config from "../../config";
import { prisma } from "../../config/db";
import { IJwtPayload } from "../../types/common";
import { ITraveler } from "./user.interface";
import bcrypt from "bcryptjs";

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

export const UserService = {
  getMyProfile,
  getAllUsers,
  register,
};
