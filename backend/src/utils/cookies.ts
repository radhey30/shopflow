import { Response } from "express";

export const setTokenCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
): void => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearTokenCookies = (res: Response): void => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
};
