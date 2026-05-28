import { Request, Response, NextFunction } from "express";
import Order from "../models/Order";
import Product from "../models/Product";

export const getSalesSummary = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const summary = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$totalPrice" },
          maxOrder: { $max: "$totalPrice" },
          minOrder: { $min: "$totalPrice" },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: { $round: ["$totalRevenue", 2] },
          totalOrders: 1,
          avgOrderValue: { $round: ["$avgOrderValue", 2] },
          maxOrder: 1,
          minOrder: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Sales summary fetched.",
      data: summary[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 },
    });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyRevenue = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const currentYear = new Date().getFullYear();

    const monthly = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          status: { $ne: "cancelled" },
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          month: "$_id",
          revenue: { $round: ["$revenue", 2] },
          orders: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Montly revenue fetched.",
      data: monthly,
    });
  } catch (error) {
    next(error);
  }
};

export const getTopProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { isPaid: true } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          name: 1,
          totalSold: 1,
          totalRevenue: { $round: ["$totalRevenue", 2] },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Top products fetched.",
      data: topProducts,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBreakdown = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const breakdown = await Order.aggregate([
      { $match: { isPaid: true } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.category",
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
          totalItemsSold: { $sum: "$items.quantity" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalRevenue: { $round: ["$totalRevenue", 2] },
          totalItemsSold: 1,
          orderCount: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Category breakdown fetched.",
      data: breakdown,
    });
  } catch (error) {
    next(error);
  }
};
