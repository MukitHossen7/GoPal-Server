import { JwtPayload } from "jsonwebtoken";
import config from "../../config";
import { prisma } from "../../config/db";
import { generateToken, verifyToken } from "../../utils/jwt";
import { UserStatus } from "@prisma/client";
import AppError from "../../errorHelpers/AppError";
import bcrypt from "bcryptjs";
import { createUserTokens } from "../../utils/userToken";
import { IJwtPayload } from "../../types/common";
import httpStatus from "http-status";

const getMe = async (session: any) => {
  const accessToken = session.accessToken;
  const decodedData = verifyToken(
    accessToken,
    config.JWT.ACCESS_TOKEN_SECRET
  ) as JwtPayload;

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  const { id, email, role, status } = userData;
  return {
    id,
    email,
    role,
    status,
  };
};

const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new AppError(403, "User is not active");
  }

  if (user.isDeleted) {
    throw new AppError(410, "User has been deleted");
  }
  // if (!user.isVerified) {
  //   throw new AppError(401, "User email is not verified");
  // }

  const isCorrectPassword = await bcrypt.compare(
    payload.password,
    user.password as string
  );
  if (!isCorrectPassword) {
    throw new AppError(401, "Incorrect password");
  }

  const tokenPayload = {
    email: user.email,
    role: user.role,
    id: user.id,
  };

  const userTokens = createUserTokens(tokenPayload);

  return {
    accessToken: userTokens.accessToken,
    refreshToken: userTokens.refreshToken,
    needPasswordChange: user.needPasswordChange,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = verifyToken(
      token,
      config.JWT.REFRESH_TOKEN_SECRET
    ) as JwtPayload;
  } catch (error) {
    throw new Error("You are not authorized!");
  }
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  if (userData.isDeleted === true) {
    throw new AppError(404, "Your account is deleted");
  }

  // if (userData.isVerified === false) {
  //   throw new AppError(404, "Your account is not verified");
  // }

  const tokenPayload = {
    email: userData.email,
    role: userData.role,
    id: userData.id,
  };
  const accessToken = generateToken(
    tokenPayload,
    config.JWT.ACCESS_TOKEN_SECRET,
    config.JWT.ACCESS_TOKEN_EXPIRATION
  );

  return {
    accessToken,
  };
};

const changePassword = async (
  user: IJwtPayload,
  payload: { oldPassword: string; newPassword: string }
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password as string
  );

  if (!isCorrectPassword) {
    throw new Error("Password incorrect!");
  }

  const hashedPassword: string = await bcrypt.hash(
    payload.newPassword,
    Number(config.BCRYPTSALTROUND)
  );

  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashedPassword,
      // needPasswordChange: false
    },
  });

  return {
    message: "Password changed successfully!",
  };
};

//forgot password kaj korta hoba pora
const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });
};

const resetPassword = async (
  token: string,
  payload: { id: string; password: string }
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: payload.id,
      status: UserStatus.ACTIVE,
    },
  });

  const isValidToken = verifyToken(token, config.JWT.RESET_PASS_SECRET);

  if (!isValidToken) {
    throw new AppError(httpStatus.FORBIDDEN, "Forbidden!");
  }
  // hash password
  const hashPassword = await bcrypt.hash(
    payload.password,
    Number(config.BCRYPTSALTROUND)
  );

  // update into database
  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashPassword,
    },
  });
};

export const AuthService = {
  getMe,
  login,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
