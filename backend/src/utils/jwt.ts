import jwt from "jsonwebtoken";

export interface TokenPayload {
  id: string;
  role: "customer" | "admin";
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const generateTokens = (payload: TokenPayload): TokenPair => {
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET as string,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "7d" },
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(
    token,
    process.env.JWT_ACCESS_SECRET as string,
  ) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET as string,
  ) as TokenPayload;
};
