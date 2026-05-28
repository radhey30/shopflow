import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/index";

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || "Internal Server Error";

  const response: ApiResponse<null> = {
    success: false,
    message,
    error: process.env.NODE_ENV === "developement" ? err.stack : message,
  };

  res.status(statusCode).json(response);
};
