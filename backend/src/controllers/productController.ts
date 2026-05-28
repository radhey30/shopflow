import { Request, Response, NextFunction } from "express";
import Product, { IProductDocument } from "../models/Product";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest, ApiResponse } from "../types";

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort = "-createdAt",
      page = "1",
      limit = "10",
    } = req.query;

    const queryObj: Record<string, unknown> = { isActive: true };

    if (search) {
      queryObj.$text = { $search: search as string };
    }

    if (category) {
      queryObj.category = category;
    }

    if (minPrice || maxPrice) {
      queryObj.price = {
        ...(minPrice && { $gte: Number(minPrice) }),
        ...(maxPrice && { $lte: Number(maxPrice) }),
      };
    }

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, parseInt(limit as string));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(queryObj)
        .sort(sort as string)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(queryObj),
    ]);

    const response: ApiResponse<{
      products: IProductDocument[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
      };
    }> = {
      success: true,
      message: "Products fetched successfully",
      data: {
        products,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
          limit: limitNum,
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      throw new AppError("Product not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const product = Product.create(req.body);

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) throw new AppError("Product not found", 404);

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!product) throw new AppError("Product not found", 404);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
