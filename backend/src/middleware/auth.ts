import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "./errorHandler";
import { AuthRequest } from "../types";

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new AppError("Not authenticated. Please log in.", 401);
    }

    const decoded = verifyAccessToken(token);

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError("Invalid or Expired token", 401));
    }
  }
};

export const restrict = (...roles: Array<"customer" | "admin">) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError(
        `Role '${req.user?.role}' is not allowed to access this route`,
        403,
      );
    }
    next();
  };
};
