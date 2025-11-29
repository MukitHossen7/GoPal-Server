import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

import { AuthService } from "./auth.service";
import { setAuthCookie } from "../../utils/setCookie";
import { IJwtPayload } from "../../types/common";

const getMe = catchAsync(async (req: Request, res: Response) => {
  const userSession = req.cookies;
  const result = await AuthService.getMe(userSession);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User retrieve successfully!",
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await AuthService.login(payload);
  const { accessToken, refreshToken, needPasswordChange } = result;

  const userTokens = {
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
  setAuthCookie(res, userTokens);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Your login is successfully",
    data: {
      needPasswordChange,
    },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  const result = await AuthService.refreshToken(refreshToken);
  const userToken = {
    accessToken: result.accessToken,
  };

  setAuthCookie(res, userToken);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token generated successfully!",
    data: {
      message: "Access token generated successfully!",
    },
  });
});

const changePassword = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const user = req.user as IJwtPayload;
    const result = await AuthService.changePassword(user, req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password Changed successfully",
      data: result,
    });
  }
);

//forgot password kaj korta hoba pora
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Check your email!",
    data: null,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";

  await AuthService.resetPassword(token, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password Reset!",
    data: null,
  });
});

export const AuthController = {
  getMe,
  login,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
