import { Request, Response, NextFunction } from "express";
import User, { IUserDocument } from "../models/User";
import { AppError } from "../middleware/errorHandler";
import { generateTokens, verifyRefreshToken } from "../utils/jwt";
import { clearTokenCookies, setTokenCookies } from "../utils/cookies";
import { ApiResponse, AuthRequest } from "../types";

type SafeUser = Pick<IUserDocument, "name" | "email" | "role" | "createdAt">;

const sanitizeUser = (user: IUserDocument): SafeUser => ({
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("Email already registered", 400);
    }

    const user = await User.create({ name, email, password });

    const { accessToken, refreshToken } = generateTokens({
      id: user._id.toString(),
      role: user.role,
    });

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setTokenCookies(res, accessToken, refreshToken);

    const response: ApiResponse<SafeUser> = {
      success: true,
      message: "Registration successful.",
      data: sanitizeUser(user),
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const { accessToken, refreshToken } = generateTokens({
      id: user._id.toString(),
      role: user.role,
    });

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setTokenCookies(res, accessToken, refreshToken);

    const response: ApiResponse<SafeUser> = {
      success: true,
      message: "Login successful.",
      data: sanitizeUser(user),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      throw new AppError("No refresh token", 401);
    }

    const decoded = verifyRefreshToken(token);

    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== token) {
      if (user) {
        user.refreshToken = undefined;
        await user.save({ validateBeforeSave: false });
      }
      throw new AppError("Invalid refresh token", 401);
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      id: user._id.toString(),
      role: user.role,
    });

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    setTokenCookies(res, accessToken, newRefreshToken);

    res.status(200).json({ success: true, message: "Token refreshed." });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user.id, { refreshToken: undefined });
    }

    clearTokenCookies(res);

    res
      .status(200)
      .json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) throw new AppError("User not found", 404);

    const response: ApiResponse<SafeUser> = {
      success: true,
      message: "User fetched successfully.",
      data: sanitizeUser(user),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
