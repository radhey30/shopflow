import { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: "customer" | "admin";
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
