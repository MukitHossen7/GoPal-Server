import { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { generateToken, verifyToken } from "./jwt";
import { prisma } from "../config/db";
import AppError from "../errorHelpers/AppError";
import httpStatus from "http-status";
import { UserStatus } from "@prisma/client";

type TokenPayload = {
  email: string;
  role: string;
  id: string;
};

export const createUserTokens = (tokenPayload: TokenPayload) => {
  const accessToken = generateToken(
    tokenPayload,
    config.JWT.ACCESS_TOKEN_SECRET,
    config.JWT.ACCESS_TOKEN_EXPIRATION
  );

  const refreshToken = generateToken(
    tokenPayload,
    config.JWT.REFRESH_TOKEN_SECRET,
    config.JWT.REFRESH_TOKEN_EXPIRATION
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const createNewAccessTokenUseRefreshToken = async (
  refreshToken: string
) => {
  const verifiedRefreshToken = verifyToken(
    refreshToken,
    config.JWT.REFRESH_TOKEN_SECRET
  ) as JwtPayload;

  const isUser = await prisma.user.findUnique({
    where: {
      email: verifiedRefreshToken.email,
    },
  });

  if (!isUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email does not exist");
  }

  if (
    isUser.status === UserStatus.BLOCKED ||
    isUser.status === UserStatus.INACTIVE
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account is blocked or inactive"
    );
  }
  if (isUser.isDeleted === true) {
    throw new AppError(httpStatus.FORBIDDEN, "Your account is deleted");
  }

  const tokenPayload = {
    email: isUser.email,
    role: isUser.role,
    id: isUser.id,
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
