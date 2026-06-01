import { Response, NextFunction } from "express";
import Order from "../models/Order";
import Product from "../models/Product";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest, ApiResponse } from "../types";
import { IOrderDocument } from "../models/Order";

export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      throw new AppError("No items in order", 400);
    }

    let totalPrice = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product || !product.isActive) {
        throw new AppError(`Product ${item.name} is no longer available.`, 400);
      }
      if (product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${product.name}.`, 400);
      }

      validatedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0] || "",
      });

      totalPrice += product.price * item.quantity;
    }

    const order = await Order.create({
      user: req.user?.id,
      items: validatedItems,
      totalPrice,
      shippingAddress,
      isPaid: true,
      paidAt: new Date(),
    });

    await Promise.all(
      validatedItems.map((item) =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        }),
      ),
    );

    const response: ApiResponse<IOrderDocument> = {
      success: true,
      message: "Order placed successfully.",
      data: order,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const orders = await Order.find({ user: req.user?.id })
      .sort({ createdAt: -1 })
      .populate("items.product", "name images");

    res.status(200).json({
      success: true,
      message: "Orders fetched.",
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "items.product",
      "name images price",
    );

    if (!order) throw new AppError("Order not found.", 404);

    if (order.user.toString() !== req.user?.id && req.user?.role === "admin") {
      throw new AppError("Not authorized to view this order.", 403);
    }

    res.status(200).json({
      success: true,
      nessage: "Order fetched.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { status, page = "1", limit = "10" } = req.query;

    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate("user", "name email"),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: "Orders fetched.",
      data: {
        orders,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError("Order not found.", 404);

    if (order.status === "cancelled") {
      throw new AppError("Cannot update a cancelled order.", 400);
    }

    if (status === "cancelled") {
      await Promise.all(
        order.items.map((item) =>
          Product.findByIdAndDelete(item.product, {
            $inc: { stock: item.quantity },
          }),
        ),
      );
    }

    if (status === "delivered") {
      order.deliveredAt = new Date();
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
