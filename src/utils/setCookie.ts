import { Response } from "express";

type AuthToken = {
  accessToken?: string;
  refreshToken?: string;
};

export const setAuthCookie = (res: Response, authToken: AuthToken) => {
  if (authToken.accessToken) {
    res.cookie("accessToken", authToken.accessToken, {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24,
    });
  }

  if (authToken.refreshToken) {
    res.cookie("refreshToken", authToken.refreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 90,
    });
  }
};
