import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "../controllers/productController";
import { protect, restrict } from "../middleware/auth";
import {
  getCategoryBreakdown,
  getMonthlyRevenue,
  getSalesSummary,
  getTopProducts,
} from "../controllers/analyticsController";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProduct);

router.post("/", protect, restrict("admin"), createProduct);
router.put("/:id", protect, restrict("admin"), updateProduct);
router.delete("/:id", protect, restrict("admin"), deleteProduct);

router.get("/analytics/summary", protect, restrict("admin"), getSalesSummary);
router.get("/analytics/monthly", protect, restrict("admin"), getMonthlyRevenue);
router.get(
  "/analytics/top-products",
  protect,
  restrict("admin"),
  getTopProducts,
);
router.get(
  "/analytics/categories",
  protect,
  restrict("admin"),
  getCategoryBreakdown,
);

export default router;
